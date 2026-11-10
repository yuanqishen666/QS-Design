import { access, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { clone, sha256 } from '../engine/shared/utils.mjs';
import { createPortableSession, validatePortableSession } from '../engine/context/portable-session.mjs';
import { validateTaskCapsule } from '../engine/context/task-capsule.mjs';
import { validateCandidate, validateCandidateGraph } from '../engine/context/candidates.mjs';

function safeName(value, label) {
  const name = String(value ?? '');
  if (!/^[a-z0-9][a-z0-9-]{1,127}$/i.test(name)) throw new Error(`Invalid ${label}: ${value}`);
  return name;
}

function assertArtifactRead(ref, policy) {
  const allowed = policy?.allowed ?? [];
  if (!Array.isArray(allowed) || (!allowed.includes(ref) && !allowed.includes(`artifact:${ref}`))) throw new Error(`Artifact ${ref} is not authorized by the read policy.`);
  if ((policy?.excluded ?? []).includes(ref) || (policy?.excluded ?? []).includes(`artifact:${ref}`)) throw new Error(`Artifact ${ref} is excluded by the read policy.`);
}

function orderedCandidates(candidates) {
  const pending = new Map(candidates.map(candidate => [candidate.candidate_id, candidate]));
  const output = [];
  while (pending.size) {
    const ready = [...pending.values()].filter(candidate => (candidate.parents ?? []).every(parent => !pending.has(parent)));
    if (!ready.length) throw new Error('Candidate graph cannot be imported in dependency order.');
    for (const candidate of ready) { output.push(candidate); pending.delete(candidate.candidate_id); }
  }
  return output;
}

export class FileStore {
  constructor(root, { mode = 'portable' } = {}) {
    this.root = resolve(root);
    this.mode = mode;
  }
  taskRoot(taskId) { return join(this.root, safeName(taskId, 'task id')); }
  async saveTask(task) {
    const errors = validateTaskCapsule(task);
    if (errors.length) throw new Error(`Invalid task capsule: ${errors.join(' ')}`);
    const root = this.taskRoot(task.task_id); await mkdir(root, { recursive: true });
    await writeFile(join(root, 'task.json'), `${JSON.stringify(task, null, 2)}\n`, 'utf8');
  }
  async loadTask(taskId) {
    try { return JSON.parse(await readFile(join(this.taskRoot(taskId), 'task.json'), 'utf8')); }
    catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  }
  async saveCandidate(candidate) {
    const task = await this.loadTask(candidate.task_id);
    if (!task) throw new Error(`Unknown task: ${candidate.task_id}.`);
    const candidateErrors = validateCandidate(candidate);
    if (candidateErrors.length) throw new Error(`Invalid candidate: ${candidateErrors.join(' ')}`);
    const nextCandidates = (await this.listCandidates(candidate.task_id)).filter(item => item.candidate_id !== candidate.candidate_id).concat(candidate);
    const graphErrors = validateCandidateGraph(nextCandidates, candidate.task_id);
    if (graphErrors.length) throw new Error(`Invalid candidate graph: ${graphErrors.join(' ')}`);
    const root = join(this.taskRoot(candidate.task_id), 'candidates'); await mkdir(root, { recursive: true });
    await writeFile(join(root, `${safeName(candidate.candidate_id, 'candidate id')}.json`), `${JSON.stringify(candidate, null, 2)}\n`, 'utf8');
    if (!(task.candidate_refs ?? []).includes(candidate.candidate_id)) await this.saveTask({ ...task, candidate_refs: [...(task.candidate_refs ?? []), candidate.candidate_id], updated_at: new Date().toISOString() });
  }
  async listCandidates(taskId) {
    const root = join(this.taskRoot(taskId), 'candidates');
    let names; try { names = await readdir(root); } catch (error) { if (error.code === 'ENOENT') return []; throw error; }
    const output = [];
    for (const name of names.filter(name => name.endsWith('.json')).sort()) output.push(JSON.parse(await readFile(join(root, name), 'utf8')));
    return output;
  }
  artifactPath(taskId, ref) {
    return join(this.taskRoot(taskId), 'artifacts', `${sha256(String(ref))}.json`);
  }
  async saveArtifact(taskId, ref, value) {
    if (!await this.loadTask(taskId)) throw new Error(`Unknown task: ${taskId}.`);
    if (!String(ref ?? '').trim()) throw new Error('Artifact reference must be non-empty.');
    const root = join(this.taskRoot(taskId), 'artifacts'); await mkdir(root, { recursive: true });
    const record = { schema: 1, ref: String(ref), value: clone(value) };
    await writeFile(this.artifactPath(taskId, ref), `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  }
  async listArtifacts(taskId) {
    const root = join(this.taskRoot(taskId), 'artifacts');
    let names; try { names = await readdir(root); } catch (error) { if (error.code === 'ENOENT') return []; throw error; }
    const output = [];
    for (const name of names.filter(name => /^[a-f0-9]{64}\.json$/.test(name)).sort()) {
      const record = JSON.parse(await readFile(join(root, name), 'utf8'));
      if (record?.schema !== 1 || typeof record.ref !== 'string' || !Object.hasOwn(record, 'value')) throw new Error(`Invalid artifact record: ${name}.`);
      output.push({ ref: record.ref, value: record.value });
    }
    return output;
  }
  async readArtifact(taskId, ref, policy) {
    assertArtifactRead(ref, policy);
    const record = JSON.parse(await readFile(this.artifactPath(taskId, ref), 'utf8'));
    if (record?.ref !== String(ref)) throw new Error(`Artifact reference mismatch for ${ref}.`);
    return record.value;
  }
  async deleteArtifact(taskId, ref) {
    const path = this.artifactPath(taskId, ref);
    try { await access(path); await rm(path); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; }
  }
  async saveGovernance(taskId, kind, record) {
    if (!await this.loadTask(taskId)) throw new Error(`Unknown task: ${taskId}.`);
    if (!['decisions', 'exceptions', 'approvals', 'verification_reports'].includes(kind)) throw new Error(`Unknown governance kind: ${kind}.`);
    if (kind === 'approvals' && record?.task_id !== taskId) throw new Error('Approval belongs to a different task.');
    const id = record?.decision_id ?? record?.exception_id ?? record?.approval_id ?? `report-${sha256(record).slice(0, 20)}`;
    const root = join(this.taskRoot(taskId), 'governance', kind); await mkdir(root, { recursive: true });
    await writeFile(join(root, `${safeName(id, 'governance record id')}.json`), `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  }
  async listGovernance(taskId) {
    const output = { decisions: [], exceptions: [], approvals: [], verification_reports: [] };
    for (const kind of Object.keys(output)) {
      const root = join(this.taskRoot(taskId), 'governance', kind);
      let names; try { names = await readdir(root); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
      for (const name of names.filter(name => name.endsWith('.json')).sort()) output[kind].push(JSON.parse(await readFile(join(root, name), 'utf8')));
    }
    return output;
  }
  async exportSession(taskId) {
    const task = await this.loadTask(taskId);
    if (!task) throw new Error(`Unknown task: ${taskId}.`);
    return createPortableSession({ mode: this.mode, task, candidates: await this.listCandidates(taskId), artifacts: await this.listArtifacts(taskId), governance: await this.listGovernance(taskId) });
  }
  async importSession(bundle) {
    const errors = validatePortableSession(bundle);
    if (errors.length) throw new Error(`Invalid portable QS Design session: ${errors.join(' ')}`);
    if (await this.loadTask(bundle.task.task_id)) throw new Error(`Task ${bundle.task.task_id} already exists; import into an empty store to avoid mixing context.`);
    await this.saveTask(clone(bundle.task));
    for (const candidate of orderedCandidates(bundle.candidates ?? [])) await this.saveCandidate(clone(candidate));
    for (const artifact of bundle.artifacts ?? []) await this.saveArtifact(bundle.task.task_id, artifact.ref, clone(artifact.value));
    for (const [kind, records] of Object.entries(bundle.governance ?? {})) for (const record of records) await this.saveGovernance(bundle.task.task_id, kind, clone(record));
    return bundle.task.task_id;
  }
  describe() { return { root: this.root, mode: this.mode, name: basename(this.root) }; }
}

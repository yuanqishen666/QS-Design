import { clone, sha256 } from '../engine/shared/utils.mjs';
import { createPortableSession, validatePortableSession } from '../engine/context/portable-session.mjs';
import { validateTaskCapsule } from '../engine/context/task-capsule.mjs';
import { validateCandidate, validateCandidateGraph } from '../engine/context/candidates.mjs';

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

const governanceId = record => record?.decision_id ?? record?.exception_id ?? record?.approval_id ?? `report-${sha256(record).slice(0, 20)}`;

export class MemoryStore {
  #tasks = new Map();
  #candidates = new Map();
  #artifacts = new Map();
  #governance = new Map();

  async loadTask(taskId) { return clone(this.#tasks.get(taskId) ?? null); }
  async saveTask(task) {
    const errors = validateTaskCapsule(task);
    if (errors.length) throw new Error(`Invalid task capsule: ${errors.join(' ')}`);
    this.#tasks.set(task.task_id, clone(task));
  }
  async listCandidates(taskId) { return clone([...(this.#candidates.get(taskId) ?? new Map()).values()]); }
  async saveCandidate(candidate) {
    const task = this.#tasks.get(candidate.task_id);
    if (!task) throw new Error(`Unknown task: ${candidate.task_id}.`);
    const candidateErrors = validateCandidate(candidate);
    if (candidateErrors.length) throw new Error(`Invalid candidate: ${candidateErrors.join(' ')}`);
    if (!this.#candidates.has(candidate.task_id)) this.#candidates.set(candidate.task_id, new Map());
    const nextCandidates = [...this.#candidates.get(candidate.task_id).values()].filter(item => item.candidate_id !== candidate.candidate_id).concat(candidate);
    const graphErrors = validateCandidateGraph(nextCandidates, candidate.task_id);
    if (graphErrors.length) throw new Error(`Invalid candidate graph: ${graphErrors.join(' ')}`);
    this.#candidates.get(candidate.task_id).set(candidate.candidate_id, clone(candidate));
    if (!(task.candidate_refs ?? []).includes(candidate.candidate_id)) this.#tasks.set(candidate.task_id, { ...task, candidate_refs: [...(task.candidate_refs ?? []), candidate.candidate_id], updated_at: new Date().toISOString() });
  }
  async saveArtifact(taskId, ref, value) {
    if (!this.#tasks.has(taskId)) throw new Error(`Unknown task: ${taskId}.`);
    if (!String(ref ?? '').trim()) throw new Error('Artifact reference must be non-empty.');
    if (!this.#artifacts.has(taskId)) this.#artifacts.set(taskId, new Map());
    this.#artifacts.get(taskId).set(ref, clone(value));
  }
  async listArtifacts(taskId) {
    return clone([...(this.#artifacts.get(taskId) ?? new Map()).entries()].map(([ref, value]) => ({ ref, value })));
  }
  async readArtifact(taskId, ref, policy) {
    assertArtifactRead(ref, policy);
    const artifacts = this.#artifacts.get(taskId);
    if (!artifacts?.has(ref)) throw new Error(`Unknown artifact: ${ref}.`);
    return clone(artifacts.get(ref));
  }
  async deleteArtifact(taskId, ref) { return this.#artifacts.get(taskId)?.delete(ref) ?? false; }
  async saveGovernance(taskId, kind, record) {
    if (!this.#tasks.has(taskId)) throw new Error(`Unknown task: ${taskId}.`);
    if (!['decisions', 'exceptions', 'approvals', 'verification_reports'].includes(kind)) throw new Error(`Unknown governance kind: ${kind}.`);
    if (kind === 'approvals' && record?.task_id !== taskId) throw new Error('Approval belongs to a different task.');
    if (!this.#governance.has(taskId)) this.#governance.set(taskId, { decisions: [], exceptions: [], approvals: [], verification_reports: [] });
    const id = governanceId(record);
    const records = this.#governance.get(taskId)[kind].filter(item => governanceId(item) !== id);
    records.push(clone(record));
    this.#governance.get(taskId)[kind] = records;
  }
  async listGovernance(taskId) {
    return clone(this.#governance.get(taskId) ?? { decisions: [], exceptions: [], approvals: [], verification_reports: [] });
  }
  async exportSession(taskId) {
    const task = await this.loadTask(taskId);
    if (!task) throw new Error(`Unknown task: ${taskId}.`);
    return createPortableSession({ mode: 'ephemeral', task, candidates: await this.listCandidates(taskId), artifacts: await this.listArtifacts(taskId), governance: await this.listGovernance(taskId) });
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
}

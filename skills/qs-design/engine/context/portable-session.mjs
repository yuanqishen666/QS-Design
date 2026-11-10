import { clone, sha256 } from '../shared/utils.mjs';
import { validateTaskCapsule } from './task-capsule.mjs';
import { validateCandidate, validateCandidateGraph } from './candidates.mjs';

const EMPTY_GOVERNANCE = Object.freeze({ decisions: [], exceptions: [], approvals: [], verification_reports: [] });

export function createPortableSession({ mode = 'portable', task, candidates = [], artifacts = [], governance = EMPTY_GOVERNANCE } = {}) {
  const normalizedGovernance = Object.fromEntries(Object.keys(EMPTY_GOVERNANCE).map(key => [key, clone(governance?.[key] ?? [])]));
  const base = { schema: 1, mode, task: clone(task), candidates: clone(candidates), artifacts: clone(artifacts), governance: normalizedGovernance };
  const errors = validatePortableSession(base, { requireHash: false });
  if (errors.length) throw new Error(`Invalid portable QS Design session: ${errors.join(' ')}`);
  return { ...base, bundle_hash: sha256(base) };
}

export function validatePortableSession(bundle, { requireHash = true } = {}) {
  const errors = [];
  if (bundle?.schema !== 1 || !bundle.task) return ['Portable session requires schema 1 and a task.'];
  if (!['ephemeral', 'chat', 'portable', 'project'].includes(bundle.mode)) errors.push('Portable session has an invalid mode.');
  errors.push(...validateTaskCapsule(bundle.task));
  if (!Array.isArray(bundle.candidates)) errors.push('Portable candidates must be an array.');
  if (!Array.isArray(bundle.artifacts)) errors.push('Portable artifacts must be an array.');
  if (!bundle.governance || typeof bundle.governance !== 'object' || Array.isArray(bundle.governance)) errors.push('Portable governance must be an object.');
  for (const key of Object.keys(EMPTY_GOVERNANCE)) if (!Array.isArray(bundle.governance?.[key])) errors.push(`Portable governance.${key} must be an array.`);
  for (const key of Object.keys(bundle.governance ?? {})) if (!Object.hasOwn(EMPTY_GOVERNANCE, key)) errors.push(`Portable governance has unknown collection ${key}.`);
  for (const candidate of bundle.candidates ?? []) {
    errors.push(...validateCandidate(candidate));
    if (candidate.task_id !== bundle.task.task_id) errors.push(`Candidate ${candidate.candidate_id} belongs to a different task.`);
  }
  errors.push(...validateCandidateGraph(bundle.candidates ?? [], bundle.task.task_id));
  const candidateIds = new Set((bundle.candidates ?? []).map(candidate => candidate.candidate_id));
  const taskCandidateRefs = new Set(bundle.task.candidate_refs ?? []);
  for (const id of candidateIds) if (!taskCandidateRefs.has(id)) errors.push(`Task capsule does not reference candidate ${id}.`);
  for (const id of taskCandidateRefs) if (!candidateIds.has(id)) errors.push(`Task capsule references missing candidate ${id}.`);
  const artifactRefs = new Set();
  for (const artifact of bundle.artifacts ?? []) {
    if (typeof artifact?.ref !== 'string' || !artifact.ref.trim() || !Object.hasOwn(artifact, 'value')) errors.push('Portable artifacts require a non-empty ref and value.');
    if (artifactRefs.has(artifact?.ref)) errors.push(`Portable session contains duplicate artifact ref ${artifact?.ref}.`);
    artifactRefs.add(artifact?.ref);
  }
  for (const [kind, records] of Object.entries(bundle.governance ?? {})) {
    if (!Array.isArray(records)) continue;
    const ids = records.map(record => record?.decision_id ?? record?.exception_id ?? record?.approval_id ?? `report-${sha256(record).slice(0, 20)}`);
    if (new Set(ids).size !== ids.length) errors.push(`Portable governance.${kind} contains duplicate record ids.`);
  }
  for (const approval of bundle.governance?.approvals ?? []) {
    if (approval?.task_id !== bundle.task.task_id) errors.push(`Approval ${approval?.approval_id ?? 'unknown'} belongs to a different task.`);
    if (!candidateIds.has(approval?.candidate_id)) errors.push(`Approval ${approval?.approval_id ?? 'unknown'} references missing candidate ${approval?.candidate_id ?? 'unknown'}.`);
  }
  if (requireHash) {
    const comparable = { schema: bundle.schema, mode: bundle.mode, task: bundle.task, candidates: bundle.candidates, artifacts: bundle.artifacts, governance: bundle.governance };
    if (bundle.bundle_hash !== sha256(comparable)) errors.push('Portable bundle_hash is invalid.');
  }
  return errors;
}

export { EMPTY_GOVERNANCE };

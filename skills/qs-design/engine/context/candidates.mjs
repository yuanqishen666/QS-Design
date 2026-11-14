import { assertEnum, clone, identifier, timestamp, unique } from '../shared/utils.mjs';
import { createFeedbackDelta, validateFeedbackDelta } from '../contracts/feedback-delta.mjs';

export const CANDIDATE_STATUSES = ['draft', 'shown', 'selected', 'rejected', 'superseded', 'archived', 'implemented'];
export const RUN_RELATIONS = ['fresh-root', 'continue-parent', 'aspect-inheritance', 'explicit-merge', 'soft-reset', 'hard-reset'];

const transitions = {
  draft: ['shown', 'rejected', 'archived'],
  shown: ['selected', 'rejected', 'superseded', 'archived'],
  selected: ['superseded', 'rejected', 'implemented', 'archived'],
  rejected: ['archived'],
  superseded: ['archived', 'selected'],
  archived: [],
  implemented: ['superseded', 'archived']
};

export function createCandidate({
  candidateId,
  taskId,
  status = 'draft',
  parents = [],
  contextDigest = '',
  artifactRefs = [],
  aspectRefs = {},
  acceptedAspects = [],
  rejectedAspects = [],
  feedback = [],
  now = new Date()
} = {}) {
  assertEnum(status, CANDIDATE_STATUSES, 'Candidate status');
  if (!taskId) throw new Error('Candidate requires taskId.');
  if (!/^task-[a-z0-9-]+$/.test(taskId)) throw new Error('Candidate taskId must match task-[a-z0-9-]+.');
  if (candidateId != null && !/^candidate-[a-z0-9-]+$/.test(candidateId)) throw new Error('Candidate id must match candidate-[a-z0-9-]+.');
  const normalizedCandidateId = candidateId ?? identifier('candidate');
  return {
    schema: 1,
    candidate_id: normalizedCandidateId,
    task_id: taskId,
    status,
    parents: unique(parents),
    context_digest: String(contextDigest),
    artifact_refs: unique(artifactRefs),
    aspect_refs: Object.fromEntries(Object.entries(aspectRefs ?? {}).map(([aspect, refs]) => [aspect, unique(refs)])),
    accepted_aspects: unique(acceptedAspects),
    rejected_aspects: unique(rejectedAspects),
    feedback: (feedback ?? []).map(item => normalizeFeedback({
      verbatim: item.verbatim,
      candidateId: item.candidate_id ?? item.candidateId ?? normalizedCandidateId,
      targetAspect: item.target_aspect ?? item.targetAspect,
      polarity: item.polarity,
      scope: item.scope,
      carryForward: item.carry_forward ?? item.carryForward,
      explicitConsent: item.explicit_consent ?? item.explicitConsent,
      interpretation: item.interpretation,
      origin: item.origin,
      delta: item.delta ?? item.feedback_delta
    })),
    created_at: timestamp(now),
    updated_at: timestamp(now)
  };
}

export function transitionCandidate(candidate, status, now = new Date()) {
  assertEnum(status, CANDIDATE_STATUSES, 'Candidate status');
  if (!transitions[candidate.status]?.includes(status)) throw new Error(`Cannot transition candidate from ${candidate.status} to ${status}.`);
  return { ...clone(candidate), status, updated_at: timestamp(now) };
}

export function validateCandidate(candidate) {
  const errors = [];
  if (candidate?.schema !== 1) errors.push('Candidate must use schema 1.');
  if (!/^candidate-[a-z0-9-]+$/.test(candidate?.candidate_id ?? '')) errors.push('Candidate has an invalid candidate_id.');
  if (!/^task-[a-z0-9-]+$/.test(candidate?.task_id ?? '')) errors.push('Candidate has an invalid task_id.');
  if (!CANDIDATE_STATUSES.includes(candidate?.status)) errors.push('Candidate has an invalid status.');
  for (const field of ['parents', 'artifact_refs', 'accepted_aspects', 'rejected_aspects', 'feedback']) {
    if (!Array.isArray(candidate?.[field])) errors.push(`Candidate ${field} must be an array.`);
    else if (field !== 'feedback' && new Set(candidate[field]).size !== candidate[field].length) errors.push(`Candidate ${field} must be unique.`);
  }
  for (const parent of candidate?.parents ?? []) if (!/^candidate-[a-z0-9-]+$/.test(parent)) errors.push(`Candidate parent id is invalid: ${parent}.`);
  if (!candidate?.aspect_refs || typeof candidate.aspect_refs !== 'object' || Array.isArray(candidate.aspect_refs)) errors.push('Candidate aspect_refs must be an object.');
  else for (const [aspect, refs] of Object.entries(candidate.aspect_refs)) {
    if (!aspect || !Array.isArray(refs)) errors.push(`Candidate aspect_refs.${aspect || 'unknown'} must be an array.`);
    else {
      if (new Set(refs).size !== refs.length) errors.push(`Candidate aspect_refs.${aspect} must be unique.`);
      if (refs.some(ref => typeof ref !== 'string' || !ref.trim())) errors.push(`Candidate aspect_refs.${aspect} contains an invalid artifact reference.`);
    }
  }
  for (const feedback of candidate?.feedback ?? []) {
    if (!String(feedback?.verbatim ?? '').trim()) errors.push('Candidate feedback requires verbatim source text.');
    if (!['accept', 'reject', 'adjust', 'observe'].includes(feedback?.polarity)) errors.push('Candidate feedback has an invalid polarity.');
    if (!['candidate', 'task', 'session', 'project', 'profile'].includes(feedback?.scope)) errors.push('Candidate feedback has an invalid scope.');
    if (feedback?.scope === 'candidate' && feedback?.candidate_id !== candidate.candidate_id) errors.push('Candidate-scoped feedback must identify its owning candidate.');
    if (feedback?.scope === 'profile' && feedback?.explicit_consent !== true) errors.push('Profile feedback lacks explicit consent.');
    if (feedback?.origin === 'model' && ['project', 'profile'].includes(feedback?.scope)) errors.push('Model feedback cannot become a persistent project or profile preference.');
    if (feedback?.delta) for (const error of validateFeedbackDelta(feedback.delta).errors) errors.push(`Candidate feedback delta: ${error}`);
  }
  return errors;
}

export function validateCandidateGraph(candidates, taskId = null) {
  const errors = [];
  const index = new Map((candidates ?? []).map(candidate => [candidate.candidate_id, candidate]));
  if (index.size !== (candidates ?? []).length) errors.push('Candidate graph contains duplicate candidate ids.');
  for (const candidate of candidates ?? []) {
    if (taskId && candidate.task_id !== taskId) errors.push(`Candidate ${candidate.candidate_id} belongs to a different task.`);
    for (const parent of candidate.parents ?? []) if (!index.has(parent)) errors.push(`Candidate ${candidate.candidate_id} references unknown parent ${parent}.`);
  }
  const visiting = new Set();
  const visited = new Set();
  const visit = id => {
    if (visiting.has(id)) { errors.push(`Candidate graph contains a cycle at ${id}.`); return; }
    if (visited.has(id) || !index.has(id)) return;
    visiting.add(id);
    for (const parent of index.get(id).parents ?? []) visit(parent);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of index.keys()) visit(id);
  return [...new Set(errors)];
}

export function readableCandidate(candidate, { explicitlyNamed = false } = {}) {
  if (!candidate) return false;
  if (candidate.status === 'rejected' || candidate.status === 'archived') return false;
  if (candidate.status === 'selected' || candidate.status === 'implemented') return explicitlyNamed;
  return explicitlyNamed && ['shown', 'superseded'].includes(candidate.status);
}

export function normalizeFeedback({
  verbatim,
  candidateId,
  targetAspect = 'unspecified',
  polarity = 'observe',
  scope = 'candidate',
  carryForward = false,
  explicitConsent = false,
  interpretation = null,
  origin = 'user',
  delta = null
} = {}) {
  const scopes = ['candidate', 'task', 'session', 'project', 'profile'];
  const polarities = ['accept', 'reject', 'adjust', 'observe'];
  assertEnum(scope, scopes, 'Feedback scope');
  assertEnum(polarity, polarities, 'Feedback polarity');
  assertEnum(origin, ['user', 'model'], 'Feedback origin');
  if (!String(verbatim ?? '').trim()) throw new Error('Feedback requires the user verbatim or source statement.');
  if (scope === 'candidate' && !/^candidate-[a-z0-9-]+$/.test(String(candidateId ?? ''))) throw new Error('Candidate-scoped feedback requires a valid candidate id.');
  if (scope === 'profile' && !explicitConsent) throw new Error('Profile feedback requires explicit user consent.');
  if (origin === 'model' && ['project', 'profile'].includes(scope)) throw new Error('Model interpretation cannot become a persistent project or profile preference.');
  const normalizedDelta = delta == null ? null : delta.schema === 1 ? clone(delta) : createFeedbackDelta({
    deltaId: delta.delta_id ?? delta.deltaId,
    sourceVerbatim: delta.source_verbatim ?? delta.sourceVerbatim ?? verbatim,
    observedProblem: delta.observed_problem ?? delta.observedProblem,
    userGoal: delta.user_goal ?? delta.userGoal,
    diagnosedCause: delta.diagnosed_cause ?? delta.diagnosedCause,
    diagnosisConfidence: delta.diagnosis_confidence ?? delta.diagnosisConfidence,
    preserve: delta.preserve,
    change: delta.change,
    doNotInfer: delta.do_not_infer ?? delta.doNotInfer,
    nextExperiment: delta.next_experiment ?? delta.nextExperiment,
    recommendedRelation: delta.recommended_relation ?? delta.recommendedRelation,
    scope: delta.scope ?? scope,
    explicitConsent: delta.explicit_consent ?? delta.explicitConsent ?? explicitConsent,
    resetAuthority: delta.reset_authority ?? delta.resetAuthority
  });
  return {
    verbatim: String(verbatim ?? '').trim(),
    interpretation: interpretation == null ? null : String(interpretation).trim(),
    origin,
    candidate_id: candidateId ?? null,
    target_aspect: targetAspect,
    polarity,
    scope,
    carry_forward: scope === 'candidate' ? false : Boolean(carryForward),
    explicit_consent: Boolean(explicitConsent),
    delta: normalizedDelta
  };
}

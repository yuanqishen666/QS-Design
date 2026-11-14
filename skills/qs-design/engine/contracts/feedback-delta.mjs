import { assertEnum, clone, identifier, requiredText, unique } from '../shared/utils.mjs';
import { normalizeTextList } from './shared.mjs';

export const FEEDBACK_DIAGNOSIS_CONFIDENCE = ['high', 'medium', 'low', 'unknown'];
export const FEEDBACK_CHANGE_SCOPES = ['targeted', 'representative-flow', 'full-product'];
export const FEEDBACK_RELATIONS = ['continue-parent', 'aspect-inheritance', 'explicit-merge', 'soft-reset', 'hard-reset'];
export const FEEDBACK_SCOPES = ['candidate', 'task', 'session', 'project', 'profile'];

export function createFeedbackDelta({
  deltaId,
  sourceVerbatim,
  observedProblem,
  userGoal,
  diagnosedCause,
  diagnosisConfidence = 'unknown',
  preserve = [],
  change = [],
  doNotInfer = [],
  nextExperiment = {},
  recommendedRelation = 'continue-parent',
  scope = 'candidate',
  explicitConsent = false,
  resetAuthority = null
} = {}) {
  assertEnum(diagnosisConfidence, FEEDBACK_DIAGNOSIS_CONFIDENCE, 'Feedback diagnosis confidence');
  assertEnum(recommendedRelation, FEEDBACK_RELATIONS, 'Feedback recommended relation');
  assertEnum(scope, FEEDBACK_SCOPES, 'Feedback delta scope');
  if (scope === 'profile' && explicitConsent !== true) throw new Error('Profile feedback delta requires explicit consent.');
  const result = {
    schema: 1,
    delta_id: deltaId ?? identifier('feedback-delta'),
    source_verbatim: requiredText(sourceVerbatim, 'Feedback source verbatim'),
    observed_problem: requiredText(observedProblem, 'Observed feedback problem'),
    user_goal: requiredText(userGoal, 'Feedback user goal'),
    diagnosed_cause: requiredText(diagnosedCause, 'Feedback diagnosed cause'),
    diagnosis_confidence: diagnosisConfidence,
    preserve: normalizeTextList(preserve),
    change: normalizeTextList(change),
    do_not_infer: normalizeTextList(doNotInfer),
    next_experiment: {
      hypothesis: requiredText(nextExperiment.hypothesis, 'Feedback experiment hypothesis'),
      change_scope: FEEDBACK_CHANGE_SCOPES.includes(nextExperiment.change_scope ?? nextExperiment.changeScope) ? nextExperiment.change_scope ?? nextExperiment.changeScope : 'targeted',
      expected_observation: requiredText(nextExperiment.expected_observation ?? nextExperiment.expectedObservation, 'Feedback experiment expected observation'),
      required_evidence: normalizeTextList(nextExperiment.required_evidence ?? nextExperiment.requiredEvidence)
    },
    recommended_relation: recommendedRelation,
    scope,
    explicit_consent: Boolean(explicitConsent),
    reset_authority: resetAuthority == null ? null : String(resetAuthority)
  };
  const errors = validateFeedbackDelta(result).errors;
  if (errors.length) throw new Error(`Invalid Feedback Delta: ${errors.join(' ')}`);
  return result;
}

export function validateFeedbackDelta(delta) {
  const errors = [];
  const advisories = [];
  if (delta?.schema !== 1) errors.push('Feedback Delta must use schema 1.');
  for (const field of ['delta_id', 'source_verbatim', 'observed_problem', 'user_goal', 'diagnosed_cause']) if (!String(delta?.[field] ?? '').trim()) errors.push(`Feedback Delta requires ${field}.`);
  if (!FEEDBACK_DIAGNOSIS_CONFIDENCE.includes(delta?.diagnosis_confidence)) errors.push('Feedback Delta has an invalid diagnosis_confidence.');
  for (const field of ['preserve', 'change', 'do_not_infer']) if (!Array.isArray(delta?.[field])) errors.push(`Feedback Delta ${field} must be an array.`);
  if (!(delta?.preserve ?? []).length) advisories.push('Feedback Delta does not say what must be preserved.');
  if (!(delta?.change ?? []).length) errors.push('Feedback Delta requires at least one bounded change.');
  const overlap = (delta?.preserve ?? []).filter(item => (delta?.change ?? []).includes(item));
  if (overlap.length) errors.push(`Feedback Delta puts the same item in preserve and change: ${overlap.join(', ')}.`);
  if (!FEEDBACK_RELATIONS.includes(delta?.recommended_relation)) errors.push('Feedback Delta has an invalid recommended_relation.');
  if (!FEEDBACK_SCOPES.includes(delta?.scope)) errors.push('Feedback Delta has an invalid scope.');
  if (delta?.scope === 'profile' && delta?.explicit_consent !== true) errors.push('Profile Feedback Delta lacks explicit consent.');
  if (['soft-reset', 'hard-reset'].includes(delta?.recommended_relation) && delta?.reset_authority !== 'explicit-user') errors.push(`${delta.recommended_relation} requires explicit-user reset authority.`);
  if (!delta?.next_experiment || typeof delta.next_experiment !== 'object' || Array.isArray(delta.next_experiment)) errors.push('Feedback Delta requires next_experiment.');
  else {
    if (!String(delta.next_experiment.hypothesis ?? '').trim()) errors.push('Feedback experiment requires a hypothesis.');
    if (!String(delta.next_experiment.expected_observation ?? '').trim()) errors.push('Feedback experiment requires an expected observation.');
    if (!FEEDBACK_CHANGE_SCOPES.includes(delta.next_experiment.change_scope)) errors.push('Feedback experiment has an invalid change_scope.');
  }
  if (['low', 'unknown'].includes(delta?.diagnosis_confidence)) {
    if (!(delta?.do_not_infer ?? []).length) errors.push('Low-confidence feedback diagnosis must state what not to infer.');
    if (delta?.next_experiment?.change_scope === 'full-product' && delta?.reset_authority !== 'explicit-user') errors.push('Low-confidence feedback cannot trigger a full-product change without explicit user authority.');
  }
  return { errors: unique(errors), advisories: unique(advisories), normalized: clone(delta) };
}

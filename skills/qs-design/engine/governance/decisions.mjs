import { assertEnum, clone, identifier, requiredText, timestamp, unique } from '../shared/utils.mjs';

export const DECISION_SCOPES = ['candidate', 'task', 'session', 'project', 'profile'];
export const DECISION_STATUSES = ['active', 'superseded', 'expired', 'revoked'];
export const EXCEPTION_SCOPES = ['module', 'page', 'flow', 'platform', 'candidate', 'task'];

export function createDecision({
  decision,
  scope = 'task',
  owner = 'user',
  userEvidence = '',
  supportingEvidence = [],
  counterarguments = [],
  successMeasure = '',
  expiresAt = null,
  reviewTrigger = '',
  status = 'active',
  explicitConsent = false,
  now = new Date()
} = {}) {
  assertEnum(scope, DECISION_SCOPES, 'Decision scope');
  assertEnum(status, DECISION_STATUSES, 'Decision status');
  if (expiresAt && Number.isNaN(new Date(expiresAt).getTime())) throw new Error('Decision expiresAt must be a valid date-time.');
  if (scope === 'profile' && explicitConsent !== true) throw new Error('Profile decisions require explicit user consent.');
  if (scope === 'profile' && owner !== 'user') throw new Error('Profile decisions must be owned directly by the user.');
  if (owner === 'model' && ['project', 'profile'].includes(scope)) throw new Error('Model decisions cannot become persistent project or profile preferences.');
  if (owner === 'user' && !String(userEvidence).trim()) throw new Error('User-owned decisions require direct user evidence.');
  return {
    schema: 1,
    decision_id: identifier('decision'),
    decision: requiredText(decision, 'Decision'),
    scope,
    owner: requiredText(owner, 'Decision owner'),
    user_evidence: String(userEvidence).trim(),
    supporting_evidence: clone(supportingEvidence),
    counterarguments: clone(counterarguments),
    success_measure: String(successMeasure).trim(),
    expires_at: expiresAt,
    review_trigger: String(reviewTrigger).trim(),
    status,
    explicit_consent: Boolean(explicitConsent),
    created_at: timestamp(now)
  };
}

export function createException({ findingId, scope = 'module', reason, owner, evidence = [], expiresAt, reviewTrigger, now = new Date() } = {}) {
  assertEnum(scope, EXCEPTION_SCOPES, 'Exception scope');
  if (!expiresAt && !reviewTrigger) throw new Error('Exceptions require an expiry or review trigger.');
  if (/^(never|none|永不|永久)$/i.test(String(reviewTrigger ?? '').trim())) throw new Error('Exception review trigger cannot make an exception permanent.');
  if (expiresAt && Number.isNaN(new Date(expiresAt).getTime())) throw new Error('Exception expiresAt must be a valid date-time.');
  return {
    schema: 1,
    exception_id: identifier('exception'),
    finding_id: requiredText(findingId, 'Finding id'),
    scope: requiredText(scope, 'Exception scope'),
    reason: requiredText(reason, 'Exception reason'),
    owner: requiredText(owner, 'Exception owner'),
    evidence: clone(evidence),
    expires_at: expiresAt ?? null,
    review_trigger: String(reviewTrigger ?? '').trim(),
    created_at: timestamp(now)
  };
}

export function validateException(exception, now = new Date()) {
  const errors = [];
  if (!exception?.finding_id) errors.push('Exception requires finding_id.');
  if (!exception?.reason) errors.push('Exception requires a reason.');
  if (!exception?.owner) errors.push('Exception requires an owner.');
  if (!EXCEPTION_SCOPES.includes(exception?.scope)) errors.push('Exception has an invalid or overly broad scope.');
  if (!exception?.expires_at && !exception?.review_trigger) errors.push('Exception requires an expiry or review trigger.');
  if (/^(never|none|永不|永久)$/i.test(String(exception?.review_trigger ?? '').trim())) errors.push('Exception review trigger cannot be permanent.');
  if (exception?.expires_at && new Date(exception.expires_at).getTime() <= now.getTime()) errors.push('Exception has expired.');
  return errors;
}

export function activeDecisions(decisions, { scopes = DECISION_SCOPES, now = new Date() } = {}) {
  return clone((decisions ?? []).filter(item => item.status === 'active' && scopes.includes(item.scope) && (!item.expires_at || new Date(item.expires_at).getTime() > now.getTime())));
}

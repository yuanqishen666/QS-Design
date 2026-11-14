import { assertEnum, clone, identifier, requiredText, timestamp, unique } from '../shared/utils.mjs';
import { validateProductTruth } from '../contracts/product-truth.mjs';
import { validateAttentionContract } from '../contracts/attention.mjs';
import { validateTerminologyContract } from '../contracts/terminology.mjs';
import { validatePrototypeContract } from '../contracts/prototype.mjs';
import { validateReferenceSynthesis } from '../contracts/reference-synthesis.mjs';

export const PERSISTENCE_MODES = ['ephemeral', 'chat', 'portable', 'project'];
export const CONTEXT_KINDS = ['fact', 'decision', 'inference', 'hypothesis', 'unknown'];
export const CONTEXT_SCOPES = ['candidate', 'task', 'session', 'project', 'profile'];
export const CONFIDENCE_LEVELS = ['high', 'medium', 'low', 'unknown'];
export const PLATFORMS = ['web', 'ios', 'android', 'wechat', 'alipay'];
export const DESIGN_CONTRACT_KEYS = ['product_truth', 'attention', 'terminology', 'prototype', 'reference_synthesis'];

export function contextItem(value, {
  id,
  kind = 'fact',
  source = 'user',
  confidence = 'high',
  scope = 'task',
  verifiedAt = null,
  reviewTrigger = null,
  explicitConsent = false
} = {}) {
  assertEnum(kind, CONTEXT_KINDS, 'Context kind');
  assertEnum(confidence, CONFIDENCE_LEVELS, 'Context confidence');
  assertEnum(scope, CONTEXT_SCOPES, 'Context scope');
  if (scope === 'profile' && explicitConsent !== true) throw new Error('Profile context requires explicit user consent.');
  return {
    id: id ?? identifier('context'),
    value: clone(value),
    kind,
    source: requiredText(source, 'Context source'),
    confidence,
    scope,
    verified_at: verifiedAt,
    review_trigger: reviewTrigger,
    explicit_consent: Boolean(explicitConsent)
  };
}

const normalizeItems = (values, defaultKind = 'fact') => (values ?? []).map(item => {
  if (item && typeof item === 'object' && 'value' in item) return contextItem(item.value, {
    id: item.id,
    kind: item.kind ?? defaultKind,
    source: item.source ?? 'user',
    confidence: item.confidence ?? 'high',
    scope: item.scope ?? 'task',
    verifiedAt: item.verified_at ?? null,
    reviewTrigger: item.review_trigger ?? null,
    explicitConsent: item.explicit_consent ?? false
  });
  return contextItem(item, { kind: defaultKind });
});

export function createTaskCapsule({
  taskId,
  persistence = 'ephemeral',
  businessFacts = [],
  currentRequirements = [],
  assumptions = [],
  officialConstraints = [],
  semanticIntent = null,
  continuityContract = null,
  designContracts = {},
  design_contracts: serializedDesignContracts = null,
  productTruth = null,
  attentionContract = null,
  terminologyContract = null,
  prototypeContract = null,
  referenceSynthesis = null,
  readPolicy = {},
  platformTargets = [],
  candidateRefs = [],
  now = new Date()
} = {}) {
  assertEnum(persistence, PERSISTENCE_MODES, 'Persistence');
  if (taskId != null && !/^task-[a-z0-9-]+$/.test(taskId)) throw new Error('Task id must match task-[a-z0-9-]+.');
  for (const platform of platformTargets) assertEnum(platform, PLATFORMS, 'Platform');
  return {
    schema: 1,
    task_id: taskId ?? identifier('task'),
    persistence,
    business_facts: normalizeItems(businessFacts, 'fact'),
    current_requirements: normalizeItems(currentRequirements, 'decision'),
    assumptions: normalizeItems(assumptions, 'hypothesis'),
    official_constraints: normalizeItems(officialConstraints, 'fact'),
    semantic_intent: semanticIntent ? clone(semanticIntent) : null,
    continuity_contract: continuityContract ? clone(continuityContract) : null,
    design_contracts: {
      product_truth: clone(productTruth ?? serializedDesignContracts?.product_truth ?? designContracts?.product_truth ?? null),
      attention: clone(attentionContract ?? serializedDesignContracts?.attention ?? designContracts?.attention ?? null),
      terminology: clone(terminologyContract ?? serializedDesignContracts?.terminology ?? designContracts?.terminology ?? null),
      prototype: clone(prototypeContract ?? serializedDesignContracts?.prototype ?? designContracts?.prototype ?? null),
      reference_synthesis: clone(referenceSynthesis ?? serializedDesignContracts?.reference_synthesis ?? designContracts?.reference_synthesis ?? null)
    },
    read_policy: clone(readPolicy),
    platform_targets: unique(platformTargets),
    candidate_refs: unique(candidateRefs),
    created_at: timestamp(now),
    updated_at: timestamp(now)
  };
}

export function addTaskContext(task, section, item, now = new Date()) {
  const allowed = ['business_facts', 'current_requirements', 'assumptions', 'official_constraints'];
  assertEnum(section, allowed, 'Task context section');
  const next = clone(task);
  const normalized = item && typeof item === 'object' && 'value' in item ? contextItem(item.value, {
    id: item.id,
    kind: item.kind,
    source: item.source,
    confidence: item.confidence,
    scope: item.scope,
    verifiedAt: item.verified_at ?? item.verifiedAt,
    reviewTrigger: item.review_trigger ?? item.reviewTrigger,
    explicitConsent: item.explicit_consent ?? item.explicitConsent
  }) : contextItem(item);
  next[section] = [...(next[section] ?? []), normalized];
  next.updated_at = timestamp(now);
  return next;
}

export function validateTaskCapsule(task) {
  const errors = [];
  if (task?.schema !== 1) errors.push('Task capsule must use schema 1.');
  if (!/^task-[a-z0-9-]+$/.test(task?.task_id ?? '')) errors.push('Task capsule has an invalid task_id.');
  if (!PERSISTENCE_MODES.includes(task?.persistence)) errors.push('Task capsule has an invalid persistence mode.');
  for (const field of ['business_facts', 'current_requirements', 'assumptions', 'official_constraints', 'platform_targets', 'candidate_refs']) {
    if (!Array.isArray(task?.[field])) errors.push(`Task capsule ${field} must be an array.`);
  }
  if (!task?.read_policy || typeof task.read_policy !== 'object' || Array.isArray(task.read_policy)) errors.push('Task capsule read_policy must be an object.');
  for (const field of ['denied_context', 'denied_candidates', 'allowed_profile_context']) {
    if (task?.read_policy?.[field] != null && !Array.isArray(task.read_policy[field])) errors.push(`Task capsule read_policy.${field} must be an array.`);
  }
  const contextIds = new Set();
  for (const item of [...(task?.business_facts ?? []), ...(task?.current_requirements ?? []), ...(task?.assumptions ?? []), ...(task?.official_constraints ?? [])]) {
    if (!item.id || !('value' in item)) errors.push('Context items require id and value.');
    if (contextIds.has(item.id)) errors.push(`Duplicate context item id: ${item.id}.`);
    contextIds.add(item.id);
    if (!CONTEXT_KINDS.includes(item.kind)) errors.push(`${item.id ?? 'context'} has an invalid kind.`);
    if (!CONTEXT_SCOPES.includes(item.scope)) errors.push(`${item.id ?? 'context'} has an invalid scope.`);
    if (!CONFIDENCE_LEVELS.includes(item.confidence)) errors.push(`${item.id ?? 'context'} has an invalid confidence.`);
    if (!String(item.source ?? '').trim()) errors.push(`${item.id ?? 'context'} requires a source.`);
    if (item.scope === 'profile' && item.explicit_consent !== true) errors.push(`${item.id ?? 'context'} profile scope lacks explicit consent.`);
  }
  for (const platform of task?.platform_targets ?? []) if (!PLATFORMS.includes(platform)) errors.push(`Task capsule has an invalid platform target: ${platform}.`);
  if (new Set(task?.platform_targets ?? []).size !== (task?.platform_targets ?? []).length) errors.push('Task capsule platform_targets must be unique.');
  for (const candidate of task?.candidate_refs ?? []) if (!/^candidate-[a-z0-9-]+$/.test(candidate)) errors.push(`Task capsule has an invalid candidate ref: ${candidate}.`);
  if (new Set(task?.candidate_refs ?? []).size !== (task?.candidate_refs ?? []).length) errors.push('Task capsule candidate_refs must be unique.');
  const profileItems = new Map([...contextIds].map(id => [id, [...(task?.business_facts ?? []), ...(task?.current_requirements ?? []), ...(task?.assumptions ?? []), ...(task?.official_constraints ?? [])].find(item => item.id === id)]).filter(([, item]) => item?.scope === 'profile'));
  for (const id of task?.read_policy?.allowed_profile_context ?? []) if (!profileItems.has(id)) errors.push(`Task capsule read_policy authorizes unknown or non-profile context ${id}.`);
  if (task?.design_contracts != null) {
    if (typeof task.design_contracts !== 'object' || Array.isArray(task.design_contracts)) errors.push('Task capsule design_contracts must be an object.');
    else {
      for (const key of Object.keys(task.design_contracts)) if (!DESIGN_CONTRACT_KEYS.includes(key)) errors.push(`Task capsule has unknown design contract ${key}.`);
      const productTruth = task.design_contracts.product_truth ?? null;
      const validators = [
        ['product_truth', value => validateProductTruth(value)],
        ['attention', value => validateAttentionContract(value, { productTruth })],
        ['terminology', value => validateTerminologyContract(value, { productTruth })],
        ['prototype', value => validatePrototypeContract(value, { productTruth })],
        ['reference_synthesis', value => validateReferenceSynthesis(value)]
      ];
      for (const [key, validate] of validators) {
        const value = task.design_contracts[key];
        if (value == null) continue;
        if (value.task_id !== task.task_id) errors.push(`Task capsule design contract ${key} belongs to a different task.`);
        for (const error of validate(value).errors) errors.push(`design_contracts.${key}: ${error}`);
      }
      if (!productTruth && DESIGN_CONTRACT_KEYS.some(key => key !== 'product_truth' && task.design_contracts[key] != null)) errors.push('Task capsule requires Product Truth before attention, terminology, prototype or reference contracts.');
    }
  }
  return errors;
}

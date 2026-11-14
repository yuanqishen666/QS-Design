import { clone, identifier, requiredText, unique } from '../shared/utils.mjs';

export const ELEMENT_FACETS = ['copy', 'layout', 'visual', 'behavior', 'visibility', 'children', 'data-binding', 'accessibility'];
export const MUTATION_CONFLICT_POLICIES = ['report-and-stop', 'report-and-request'];

function normalizeElement(item) {
  const id = item.id ?? identifier('qs');
  if (!/^qs-[a-z0-9-]+$/.test(id)) throw new Error('Stable element ids must match qs-[a-z0-9-]+.');
  return {
    id,
    kind: requiredText(item.kind, 'Element kind'),
    semantic_role: requiredText(item.semantic_role ?? item.semanticRole, 'Element semantic role'),
    parent_id: item.parent_id ?? item.parentId ?? null,
    properties: clone(item.properties ?? {}),
    source: requiredText(item.source ?? 'candidate', 'Element source')
  };
}

export function createElementRegistry({ candidateId, elements = [] } = {}) {
  if (!/^candidate-[a-z0-9-]+$/.test(String(candidateId ?? ''))) throw new Error('Element Registry candidateId must match candidate-[a-z0-9-]+.');
  return { schema: 1, candidate_id: candidateId, elements: elements.map(normalizeElement) };
}

export function validateElementRegistry(registry) {
  const errors = [];
  if (registry?.schema !== 1) errors.push('Element Registry must use schema 1.');
  if (!/^candidate-[a-z0-9-]+$/.test(registry?.candidate_id ?? '')) errors.push('Element Registry has an invalid candidate_id.');
  if (!Array.isArray(registry?.elements)) errors.push('Element Registry elements must be an array.');
  const index = new Map();
  for (const item of registry?.elements ?? []) {
    if (!/^qs-[a-z0-9-]+$/.test(item?.id ?? '')) errors.push(`Element Registry has invalid id ${item?.id ?? 'unknown'}.`);
    if (index.has(item.id)) errors.push(`Element Registry has duplicate id ${item.id}.`);
    index.set(item.id, item);
    if (!String(item.kind ?? '').trim() || !String(item.semantic_role ?? '').trim() || !String(item.source ?? '').trim()) errors.push(`Element ${item.id ?? 'unknown'} requires kind, semantic_role and source.`);
    if (!item.properties || typeof item.properties !== 'object' || Array.isArray(item.properties)) errors.push(`Element ${item.id ?? 'unknown'} properties must be an object.`);
    for (const facet of Object.keys(item.properties ?? {})) if (!ELEMENT_FACETS.includes(facet)) errors.push(`Element ${item.id} has unknown property facet ${facet}.`);
  }
  for (const item of registry?.elements ?? []) if (item.parent_id && !index.has(item.parent_id)) errors.push(`Element ${item.id} references unknown parent ${item.parent_id}.`);
  const visiting = new Set();
  const visited = new Set();
  const visit = id => {
    if (visiting.has(id)) { errors.push(`Element Registry contains a parent cycle at ${id}.`); return; }
    if (visited.has(id) || !index.has(id)) return;
    visiting.add(id);
    const parent = index.get(id).parent_id;
    if (parent) visit(parent);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of index.keys()) visit(id);
  return unique(errors);
}

export function createMutationScope({
  candidateId,
  userEvidence,
  operations = [],
  allowAdditionsUnder = [],
  allowRemovals = [],
  locked = [],
  conflictPolicy = 'report-and-stop'
} = {}) {
  if (!/^candidate-[a-z0-9-]+$/.test(String(candidateId ?? ''))) throw new Error('Mutation Scope candidateId must match candidate-[a-z0-9-]+.');
  if (!MUTATION_CONFLICT_POLICIES.includes(conflictPolicy)) throw new Error('Mutation Scope has an invalid conflict policy.');
  return {
    schema: 1,
    candidate_id: candidateId,
    user_evidence: requiredText(userEvidence, 'Mutation Scope user evidence'),
    operations: operations.map(item => ({
      element_id: requiredText(item.element_id ?? item.elementId, 'Mutation operation element_id'),
      allow_facets: unique(item.allow_facets ?? item.allowFacets),
      reason: requiredText(item.reason, 'Mutation operation reason')
    })),
    allow_additions_under: unique(allowAdditionsUnder),
    allow_removals: unique(allowRemovals),
    locked: locked.map(item => ({ element_id: requiredText(item.element_id ?? item.elementId, 'Locked element_id'), facets: unique(item.facets) })),
    conflict_policy: conflictPolicy
  };
}

export function validateMutationScope(scope, { registry = null } = {}) {
  const errors = [];
  if (scope?.schema !== 1) errors.push('Mutation Scope must use schema 1.');
  if (!/^candidate-[a-z0-9-]+$/.test(scope?.candidate_id ?? '')) errors.push('Mutation Scope has an invalid candidate_id.');
  if (!String(scope?.user_evidence ?? '').trim()) errors.push('Mutation Scope requires direct user evidence.');
  for (const field of ['operations', 'allow_additions_under', 'allow_removals', 'locked']) if (!Array.isArray(scope?.[field])) errors.push(`Mutation Scope ${field} must be an array.`);
  if (!MUTATION_CONFLICT_POLICIES.includes(scope?.conflict_policy)) errors.push('Mutation Scope has an invalid conflict_policy.');
  const known = new Set(registry?.elements?.map(item => item.id) ?? []);
  const operationIds = (scope?.operations ?? []).map(item => item.element_id);
  const lockIds = (scope?.locked ?? []).map(item => item.element_id);
  if (new Set(operationIds).size !== operationIds.length) errors.push('Mutation Scope operations must be unique per element.');
  if (new Set(lockIds).size !== lockIds.length) errors.push('Mutation Scope locks must be unique per element.');
  if (registry && registry.candidate_id !== scope?.candidate_id) errors.push('Mutation Scope and Element Registry belong to different candidates.');
  for (const operation of scope?.operations ?? []) {
    if (registry && !known.has(operation.element_id)) errors.push(`Mutation operation references unknown element ${operation.element_id}.`);
    if (!(operation.allow_facets ?? []).length) errors.push(`Mutation operation ${operation.element_id} requires at least one allowed facet.`);
    for (const facet of operation.allow_facets ?? []) if (!ELEMENT_FACETS.includes(facet)) errors.push(`Mutation operation ${operation.element_id} has unknown facet ${facet}.`);
  }
  for (const id of [...(scope?.allow_additions_under ?? []), ...(scope?.allow_removals ?? []), ...(scope?.locked ?? []).map(item => item.element_id)]) if (registry && !known.has(id)) errors.push(`Mutation Scope references unknown element ${id}.`);
  for (const lock of scope?.locked ?? []) for (const facet of lock.facets ?? []) if (!ELEMENT_FACETS.includes(facet)) errors.push(`Mutation lock ${lock.element_id} has unknown facet ${facet}.`);
  return unique(errors);
}

const comparable = value => JSON.stringify(value ?? null);

export function auditElementMutation({ before, after, scope } = {}) {
  const errors = [...validateElementRegistry(before), ...validateElementRegistry(after), ...validateMutationScope(scope, { registry: before })];
  if (errors.length) return { errors: unique(errors), changes: [], conflicts: [], clean: false };
  if (before.candidate_id !== after.candidate_id) errors.push('Before and after Element Registries must retain the same candidate_id during scoped mutation.');
  const beforeIndex = new Map(before.elements.map(item => [item.id, item]));
  const afterIndex = new Map(after.elements.map(item => [item.id, item]));
  const operations = new Map(scope.operations.map(item => [item.element_id, new Set(item.allow_facets)]));
  const locks = new Map(scope.locked.map(item => [item.element_id, new Set(item.facets)]));
  const additions = new Set(scope.allow_additions_under);
  const removals = new Set(scope.allow_removals);
  const changes = [];
  const conflicts = [];
  for (const [id, oldItem] of beforeIndex) {
    const nextItem = afterIndex.get(id);
    if (!nextItem) {
      const change = { type: 'remove', element_id: id };
      changes.push(change);
      if (!removals.has(id)) conflicts.push({ ...change, reason: 'Element removal is outside the mutation scope.' });
      continue;
    }
    if (oldItem.kind !== nextItem.kind || oldItem.semantic_role !== nextItem.semantic_role || oldItem.parent_id !== nextItem.parent_id) conflicts.push({ type: 'identity', element_id: id, reason: 'Stable identity, semantic role or parent changed.' });
    for (const facet of ELEMENT_FACETS) if (comparable(oldItem.properties?.[facet]) !== comparable(nextItem.properties?.[facet])) {
      const change = { type: 'modify', element_id: id, facet, before: clone(oldItem.properties?.[facet]), after: clone(nextItem.properties?.[facet]) };
      changes.push(change);
      if (locks.get(id)?.has(facet)) conflicts.push({ ...change, reason: 'A locked element facet changed.' });
      else if (!operations.get(id)?.has(facet)) conflicts.push({ ...change, reason: 'The changed facet is outside the mutation scope.' });
    }
  }
  for (const [id, item] of afterIndex) if (!beforeIndex.has(id)) {
    const change = { type: 'add', element_id: id, parent_id: item.parent_id };
    changes.push(change);
    if (!item.parent_id || !additions.has(item.parent_id)) conflicts.push({ ...change, reason: 'Element addition is outside an allowed parent.' });
  }
  return { errors: unique(errors), changes, conflicts, clean: !errors.length && !conflicts.length };
}

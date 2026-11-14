import { clone, identifier, sha256, timestamp, unique } from '../shared/utils.mjs';
import { readableCandidate, RUN_RELATIONS } from './candidates.mjs';
import { DESIGN_CONTRACT_KEYS } from './task-capsule.mjs';
import { validateMutationScope } from '../contracts/element-identity.mjs';
import { validateFeedbackDelta } from '../contracts/feedback-delta.mjs';

function itemRefs(prefix, items) {
  return (Array.isArray(items) ? items : []).map(item => `${prefix}:${item.id}`);
}

function readableTaskItems(task, items) {
  const allowedProfile = new Set(Array.isArray(task?.read_policy?.allowed_profile_context) ? task.read_policy.allowed_profile_context : []);
  return (Array.isArray(items) ? items : []).filter(item => item.scope !== 'profile' || (item.explicit_consent === true && allowedProfile.has(item.id)));
}

export function compileContextManifest({
  task,
  candidates = [],
  relation = 'fresh-root',
  parentIds = [],
  inheritedAspects = [],
  inheritanceMap = {},
  constraintIds = [],
  softResetRequirementIds = [],
  softResetConstraintIds = [],
  retainContinuity = false,
  hardResetFactIds = [],
  hardResetRequirementIds = [],
  hardResetConstraintIds = [],
  softResetContractKinds = [],
  hardResetContractKinds = [],
  retainSemanticIntent = false,
  mutationScope = null,
  feedbackDelta = null,
  runId,
  now = new Date()
} = {}) {
  if (!task?.task_id) throw new Error('Context manifest requires a task capsule.');
  if (runId != null && !/^run-[a-z0-9-]+$/.test(runId)) throw new Error('Context manifest runId must match run-[a-z0-9-]+.');
  if (!RUN_RELATIONS.includes(relation)) throw new Error(`Unknown run relation: ${relation}.`);
  const index = new Map(candidates.map(candidate => [candidate.candidate_id, candidate]));
  const parents = unique(parentIds);
  const taskDeniedContext = new Set(Array.isArray(task.read_policy?.denied_context) ? task.read_policy.denied_context : []);
  const taskDeniedCandidates = new Set(Array.isArray(task.read_policy?.denied_candidates) ? task.read_policy.denied_candidates : []);
  const normalizedInheritanceMap = Object.fromEntries(Object.entries(inheritanceMap ?? {}).map(([id, aspects]) => [id, unique(aspects)]));
  for (const key of [...softResetContractKinds, ...hardResetContractKinds]) if (!DESIGN_CONTRACT_KEYS.includes(key)) throw new Error(`Unknown design contract kind: ${key}.`);
  for (const key of [...softResetContractKinds, ...hardResetContractKinds]) if (!task.design_contracts?.[key]) throw new Error(`Cannot retain missing design contract ${key}.`);
  if (relation === 'aspect-inheritance' && parents.length === 1 && !Object.keys(normalizedInheritanceMap).length && inheritedAspects.length) {
    normalizedInheritanceMap[parents[0]] = unique(inheritedAspects);
  }

  if (['fresh-root', 'soft-reset', 'hard-reset'].includes(relation) && parents.length) throw new Error(`${relation} cannot have parent candidates.`);
  if (relation === 'continue-parent' && parents.length !== 1) throw new Error('continue-parent requires exactly one parent.');
  if (relation === 'aspect-inheritance' && (parents.length !== 1 || parents.some(id => !(normalizedInheritanceMap[id] ?? []).length))) throw new Error('aspect-inheritance requires exactly one parent with named aspects.');
  if (relation === 'explicit-merge' && (parents.length < 2 || parents.some(id => !(normalizedInheritanceMap[id] ?? []).length))) throw new Error('explicit-merge requires at least two parents and named aspects for each parent.');
  for (const id of Object.keys(normalizedInheritanceMap)) if (!parents.includes(id)) throw new Error(`Inheritance map references non-parent candidate ${id}.`);

  for (const id of parents) {
    if (taskDeniedCandidates.has(id)) throw new Error(`Task read policy denies candidate ${id}.`);
    const candidate = index.get(id);
    if (!candidate) throw new Error(`Unknown parent candidate: ${id}.`);
    if (!readableCandidate(candidate, { explicitlyNamed: true })) throw new Error(`Candidate ${id} with status ${candidate.status} cannot be read.`);
    if (candidate.task_id !== task.task_id) throw new Error(`Candidate ${id} belongs to a different task.`);
    for (const aspect of normalizedInheritanceMap[id] ?? []) {
      if (!(candidate.accepted_aspects ?? []).includes(aspect) && !(candidate.aspect_refs?.[aspect] ?? []).length) throw new Error(`Candidate ${id} does not expose inherited aspect ${aspect}.`);
    }
  }
  if (mutationScope) {
    const mutationErrors = validateMutationScope(mutationScope);
    if (mutationErrors.length) throw new Error(`Invalid mutation scope: ${mutationErrors.join(' ')}`);
    if (!parents.includes(mutationScope.candidate_id)) throw new Error('Mutation scope must target an explicitly authorized parent candidate.');
  }
  if (feedbackDelta) {
    const feedbackErrors = validateFeedbackDelta(feedbackDelta).errors;
    if (feedbackErrors.length) throw new Error(`Invalid feedback delta: ${feedbackErrors.join(' ')}`);
    if (feedbackDelta.recommended_relation !== relation) throw new Error(`Feedback Delta recommends ${feedbackDelta.recommended_relation}, but the manifest relation is ${relation}.`);
  }

  let included = [];
  const readableFacts = readableTaskItems(task, task.business_facts);
  const readableRequirements = readableTaskItems(task, task.current_requirements);
  const readableOfficialConstraints = readableTaskItems(task, task.official_constraints);
  if (relation === 'hard-reset') {
    const allowedFacts = new Set(hardResetFactIds);
    const allowedRequirements = new Set(hardResetRequirementIds);
    const allowedConstraints = new Set(hardResetConstraintIds);
    included.push(...itemRefs('business-fact', readableFacts.filter(item => allowedFacts.has(item.id))));
    included.push(...itemRefs('requirement', readableRequirements.filter(item => allowedRequirements.has(item.id))));
    included.push(...itemRefs('official-constraint', readableOfficialConstraints.filter(item => allowedConstraints.has(item.id))));
    for (const key of hardResetContractKinds) if (task.design_contracts?.[key]) included.push(`design-contract:${key}`);
  } else if (relation === 'soft-reset') {
    const allowedRequirements = new Set(softResetRequirementIds);
    const allowedConstraints = new Set(softResetConstraintIds);
    included.push(...itemRefs('business-fact', readableFacts));
    included.push(...itemRefs('requirement', readableRequirements.filter(item => allowedRequirements.has(item.id))));
    included.push(...itemRefs('official-constraint', readableOfficialConstraints.filter(item => allowedConstraints.has(item.id))));
    if (task.semantic_intent && retainSemanticIntent) included.push('semantic-intent');
    if (task.continuity_contract && retainContinuity) included.push('continuity-contract');
    if (task.design_contracts?.product_truth) included.push('design-contract:product_truth');
    for (const key of softResetContractKinds) if (key !== 'product_truth' && task.design_contracts?.[key]) included.push(`design-contract:${key}`);
  } else {
    included.push(...itemRefs('business-fact', readableFacts));
    included.push(...itemRefs('requirement', readableRequirements));
    included.push(...itemRefs('official-constraint', readableOfficialConstraints));
    if (task.semantic_intent) included.push('semantic-intent');
    if (task.continuity_contract) included.push('continuity-contract');
    for (const key of DESIGN_CONTRACT_KEYS) if (task.design_contracts?.[key]) included.push(`design-contract:${key}`);
  }

  if ((task.platform_targets ?? []).length) included.push('platform-targets');
  included = included.filter(ref => !taskDeniedContext.has(ref));
  const includesProductTruth = included.includes('design-contract:product_truth');
  const dependentContracts = DESIGN_CONTRACT_KEYS.filter(key => key !== 'product_truth' && included.includes(`design-contract:${key}`));
  if (dependentContracts.length && !includesProductTruth) throw new Error(`Design contracts ${dependentContracts.join(', ')} cannot be included without Product Truth.`);

  if (['continue-parent', 'aspect-inheritance', 'explicit-merge'].includes(relation)) included.push(...parents.map(id => `candidate:${id}`));
  const includedAsConstraints = relation === 'soft-reset' ? unique(constraintIds) : [];
  const allowed = new Set(parents);
  const excluded = candidates.filter(candidate => !allowed.has(candidate.candidate_id) || candidate.status === 'rejected')
    .map(candidate => `candidate:${candidate.candidate_id}`);
  excluded.push(...taskDeniedContext);
  excluded.push(...[...taskDeniedCandidates].map(id => `candidate:${id}`));
  excluded.push('generated-ui:unselected');

  const base = {
    schema: 1,
    run_id: runId ?? identifier('run'),
    task_id: task.task_id,
    relation,
    included: unique(included),
    included_as_constraints: includedAsConstraints,
    excluded: unique(excluded),
    parents,
    inherited_aspects: unique(Object.values(normalizedInheritanceMap).flat()),
    inheritance_map: normalizedInheritanceMap,
    mutation_scope: clone(mutationScope),
    feedback_delta: clone(feedbackDelta),
    created_at: timestamp(now)
  };
  return { ...base, context_hash: sha256(base) };
}

export function validateContextManifest(manifest, candidates = [], { taskId = null, task = null } = {}) {
  const errors = [];
  const index = new Map(candidates.map(candidate => [candidate.candidate_id, candidate]));
  if (manifest?.schema !== 1) errors.push('Manifest must use schema 1.');
  if (!/^run-[a-z0-9-]+$/.test(manifest?.run_id ?? '')) errors.push('Manifest has an invalid run_id.');
  if (!/^task-[a-z0-9-]+$/.test(manifest?.task_id ?? '')) errors.push('Manifest has an invalid task_id.');
  if (!RUN_RELATIONS.includes(manifest?.relation)) errors.push('Manifest has an invalid relation.');
  if (taskId && manifest?.task_id !== taskId) errors.push(`Manifest belongs to ${manifest?.task_id ?? 'no task'}, not ${taskId}.`);
  for (const field of ['included', 'included_as_constraints', 'excluded', 'parents', 'inherited_aspects']) {
    if (!Array.isArray(manifest?.[field])) errors.push(`Manifest ${field} must be an array.`);
    else if (new Set(manifest[field]).size !== manifest[field].length) errors.push(`Manifest ${field} must contain unique entries.`);
  }
  if (!manifest?.inheritance_map || typeof manifest.inheritance_map !== 'object' || Array.isArray(manifest.inheritance_map)) errors.push('Manifest inheritance_map must be an object.');
  if (manifest?.mutation_scope != null) {
    errors.push(...validateMutationScope(manifest.mutation_scope).map(error => `Manifest mutation_scope: ${error}`));
    if (!(manifest?.parents ?? []).includes(manifest.mutation_scope.candidate_id)) errors.push('Manifest mutation_scope must target an authorized parent candidate.');
  }
  if (manifest?.feedback_delta != null) {
    errors.push(...validateFeedbackDelta(manifest.feedback_delta).errors.map(error => `Manifest feedback_delta: ${error}`));
    if (manifest.feedback_delta.recommended_relation !== manifest?.relation) errors.push('Manifest feedback_delta relation does not match the run relation.');
  }
  const parentList = manifest?.parents ?? [];
  if (['fresh-root', 'soft-reset', 'hard-reset'].includes(manifest?.relation) && parentList.length) errors.push(`${manifest.relation} cannot have parent candidates.`);
  if (manifest?.relation === 'continue-parent' && parentList.length !== 1) errors.push('continue-parent requires exactly one parent.');
  if (manifest?.relation === 'aspect-inheritance' && parentList.length !== 1) errors.push('aspect-inheritance requires exactly one parent.');
  if (manifest?.relation === 'explicit-merge' && parentList.length < 2) errors.push('explicit-merge requires at least two parents.');
  for (const parent of manifest?.parents ?? []) {
    const candidate = index.get(parent);
    if (!candidate) errors.push(`Manifest references unknown parent ${parent}.`);
    else if (candidate.status === 'rejected' || candidate.status === 'archived') errors.push(`Manifest reads forbidden candidate ${parent}.`);
    else if (candidate.task_id !== manifest.task_id) errors.push(`Manifest parent ${parent} belongs to a different task.`);
  }
  for (const candidate of candidates.filter(item => item.status === 'rejected')) {
    if ((manifest?.included ?? []).includes(`candidate:${candidate.candidate_id}`)) errors.push(`Rejected candidate ${candidate.candidate_id} is included.`);
  }
  const parents = new Set(manifest?.parents ?? []);
  const inheritanceMap = manifest?.inheritance_map ?? {};
  if (['aspect-inheritance', 'explicit-merge'].includes(manifest?.relation)) {
    for (const parent of parents) {
      if (!(inheritanceMap[parent] ?? []).length) errors.push(`Parent ${parent} has no authorized inherited aspects.`);
      const candidate = index.get(parent);
      for (const aspect of inheritanceMap[parent] ?? []) {
        if (candidate && !(candidate.accepted_aspects ?? []).includes(aspect) && !(candidate.aspect_refs?.[aspect] ?? []).length) errors.push(`Candidate ${parent} does not expose inherited aspect ${aspect}.`);
      }
    }
    for (const id of Object.keys(inheritanceMap)) if (!parents.has(id)) errors.push(`Inheritance map references non-parent candidate ${id}.`);
  }
  const inheritedUnion = unique(Object.values(inheritanceMap).flat());
  if (JSON.stringify([...(manifest?.inherited_aspects ?? [])].sort()) !== JSON.stringify([...inheritedUnion].sort())) errors.push('Manifest inherited_aspects does not match inheritance_map.');
  for (const item of manifest?.included ?? []) {
    if (item.startsWith('candidate:') && !parents.has(item.slice('candidate:'.length))) errors.push(`Manifest includes unauthorized candidate reference ${item}.`);
  }
  const includedSet = new Set(manifest?.included ?? []);
  const dependentContracts = DESIGN_CONTRACT_KEYS.filter(key => key !== 'product_truth' && includedSet.has(`design-contract:${key}`));
  if (dependentContracts.length && !includedSet.has('design-contract:product_truth')) errors.push(`Manifest includes ${dependentContracts.join(', ')} without Product Truth.`);
  for (const item of manifest?.excluded ?? []) if (includedSet.has(item)) errors.push(`Manifest both includes and excludes ${item}.`);
  if (task) {
    const knownTaskRefs = new Set([
      ...itemRefs('business-fact', readableTaskItems(task, task.business_facts)),
      ...itemRefs('requirement', readableTaskItems(task, task.current_requirements)),
      ...itemRefs('official-constraint', readableTaskItems(task, task.official_constraints)),
      ...(task.semantic_intent ? ['semantic-intent'] : []),
      ...(task.continuity_contract ? ['continuity-contract'] : []),
      ...DESIGN_CONTRACT_KEYS.filter(key => task.design_contracts?.[key]).map(key => `design-contract:${key}`),
      ...((task.platform_targets ?? []).length ? ['platform-targets'] : [])
    ]);
    for (const item of manifest?.included ?? []) if (!item.startsWith('candidate:') && !knownTaskRefs.has(item)) errors.push(`Manifest includes unknown task context ${item}.`);
  }
  for (const candidate of candidates) {
    const ref = `candidate:${candidate.candidate_id}`;
    if ((manifest?.included ?? []).includes(ref) && !parents.has(candidate.candidate_id)) errors.push(`Candidate ${candidate.candidate_id} is included without being an authorized parent.`);
    if (!parents.has(candidate.candidate_id) && !(manifest?.excluded ?? []).includes(ref)) errors.push(`Candidate ${candidate.candidate_id} is neither an authorized parent nor explicitly excluded.`);
    if (parents.has(candidate.candidate_id) && ['rejected', 'archived'].includes(candidate.status)) errors.push(`Manifest reads forbidden candidate ${candidate.candidate_id}.`);
  }
  const comparable = { ...manifest };
  delete comparable.context_hash;
  if (manifest?.context_hash !== sha256(comparable)) errors.push('Manifest context_hash is invalid.');
  return errors;
}

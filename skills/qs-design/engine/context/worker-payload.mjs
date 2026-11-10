import { sha256, stableValue } from '../shared/utils.mjs';
import { validateContextManifest } from './read-policy.mjs';
import { validateTaskCapsule } from './task-capsule.mjs';

function selectItems(prefix, items, included) {
  return (items ?? []).filter(item => included.has(`${prefix}:${item.id}`)).map(stableValue);
}

export function buildWorkerPayload({ task, manifest, candidates = [], artifacts = [] } = {}) {
  const errors = [...validateTaskCapsule(task), ...validateContextManifest(manifest, candidates, { taskId: task?.task_id, task })];
  if (errors.length) throw new Error(`Invalid worker context: ${errors.join(' ')}`);
  const included = new Set(manifest.included);
  const index = new Map(candidates.map(candidate => [candidate.candidate_id, candidate]));
  const artifactIndex = new Map();
  for (const artifact of artifacts ?? []) {
    if (!artifact || typeof artifact.ref !== 'string' || !Object.hasOwn(artifact, 'value')) throw new Error('Worker artifacts require ref and value.');
    if (artifactIndex.has(artifact.ref)) throw new Error(`Worker artifacts contain duplicate ref ${artifact.ref}.`);
    artifactIndex.set(artifact.ref, artifact.value);
  }
  const parents = [];
  for (const id of manifest.parents) {
    const candidate = index.get(id);
    if (!candidate || !included.has(`candidate:${id}`)) continue;
    const inheritedAspects = manifest.inheritance_map?.[id] ?? [];
    const scopedInheritance = ['aspect-inheritance', 'explicit-merge'].includes(manifest.relation);
    const artifactRefs = scopedInheritance
      ? inheritedAspects.flatMap(aspect => candidate.aspect_refs?.[aspect] ?? [])
      : candidate.artifact_refs;
    const uniqueArtifactRefs = [...new Set(artifactRefs)];
    const missingArtifactRefs = uniqueArtifactRefs.filter(ref => !artifactIndex.has(ref));
    if (missingArtifactRefs.length) throw new Error(`Authorized parent ${id} is missing artifact content for: ${missingArtifactRefs.join(', ')}.`);
    parents.push({
      candidate_id: id,
      accepted_aspects: scopedInheritance ? candidate.accepted_aspects.filter(aspect => inheritedAspects.includes(aspect)) : candidate.accepted_aspects,
      artifact_refs: uniqueArtifactRefs,
      artifacts: uniqueArtifactRefs.map(ref => ({ ref, value: stableValue(artifactIndex.get(ref)) })),
      inherited_aspects: inheritedAspects
    });
  }
  const payload = {
    schema: 1,
    task_id: task.task_id,
    relation: manifest.relation,
    business_facts: selectItems('business-fact', task.business_facts, included),
    current_requirements: selectItems('requirement', task.current_requirements, included),
    official_constraints: selectItems('official-constraint', task.official_constraints, included),
    semantic_intent: included.has('semantic-intent') ? stableValue(task.semantic_intent) : null,
    continuity_contract: included.has('continuity-contract') ? stableValue(task.continuity_contract) : null,
    platform_targets: included.has('platform-targets') ? [...task.platform_targets] : [],
    constraints: [...manifest.included_as_constraints],
    parents,
    prohibited_context: [...manifest.excluded]
  };
  return { ...payload, payload_hash: sha256(payload) };
}

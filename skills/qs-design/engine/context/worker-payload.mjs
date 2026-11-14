import { sha256, stableValue } from '../shared/utils.mjs';
import { validateContextManifest } from './read-policy.mjs';
import { DESIGN_CONTRACT_KEYS, validateTaskCapsule } from './task-capsule.mjs';

// Execution policy is process infrastructure, not historical design context. It must
// survive fresh roots and resets so an isolated worker does not lose the rules that
// make its output admissible.
export const WORKER_EXECUTION_POLICY = Object.freeze({
  schema: 1,
  policy_id: 'qs-design-execution-policy-v3',
  product: Object.freeze({
    requirements: Object.freeze([
      'Create or verify Product Truth before formal direction generation. Treat visible affordances as an allowlist: do not invent unlisted features, people, scenarios, data, examples, routes or states.',
      'Keep unknown product facts unknown. A plausible model completion is not product evidence.',
      'Choose the representative task because of user frequency, business risk or a stated learning goal, not because it is visually convenient.'
    ])
  }),
  content: Object.freeze({
    source_priority: Object.freeze(['user', 'confirmed-product', 'business-data', 'minimum-required-copy']),
    requirements: Object.freeze([
      'Every visible string must identify an object or task, communicate a state, rule, constraint or consequence, indicate an action, support recovery, or provide decision data.',
      'Run structure substitution and deletion tests before adding supporting copy.',
      'Do not add decorative English eyebrows, slogans, module introductions, motivational copy or anthropomorphic greetings without explicit user, brand or business support.',
      'Bind final visible copy to a specimen-specific content contract when a contract is used; do not reuse an abstract business-model contract as proof of rendered-copy quality.'
    ])
  }),
  platform: Object.freeze({
    requirements: Object.freeze([
      'Use the adapter for every declared platform target.',
      'Do not represent an HTML prototype as proof of native haptics, notifications or complete system behavior.'
    ])
  }),
  visual: Object.freeze({
    requirements: Object.freeze([
      'For every formal direction, choose one dominant visual carrier from domain objects, typography, imagery, data or diagrams, shape fields, material or texture, color or light, illustration or symbols, spatial composition, or motion and behavior.',
      'Use cards, panels, tiles, borders, filled surfaces and elevation only when they express an independent interaction, state, lifecycle, linked summary, modal boundary or inseparable semantic group; do not use surfaces as the default layout unit.',
      'For multi-direction exploration, keep the representative task, data, information volume, primary action and business outcome fixed while changing at least two of dominant carrier, composition, surface strategy, image or data relationship, and material language.',
      'New formal multi-direction work must use comparison_specimen contract_version 2 with a source-backed representative-task rationale, fixed action order and fixed required paths.',
      'When the task explicitly calls for distinctive visual or brand expression, the representative first viewport must have a dominant content or expressive carrier beyond interface chrome; a typography-led minimal direction must demonstrate real scale and rhythm rather than repeated equal-weight containers.',
      'Honor the Attention Contract: the rank-1 task must dominate the first viewport, secondary entry points must remain available without competing equally, and tertiary context must stay quiet.'
    ])
  }),
  terminology: Object.freeze({
    requirements: Object.freeze([
      'Do not use a compact label whose ordinary user meaning predicts a different next screen. Resolve ambiguity through naming or structure before adding explanatory copy.',
      'Run the label-only prediction check for material product terms and keep unresolved ambiguity visible as unknown.'
    ])
  }),
  research: Object.freeze({
    requirements: Object.freeze([
      'External references contribute observed mechanisms, user effects and constraints only. Record what unique expression will not be copied and derive a local business rule.',
      'Do not let one source control the page skeleton, typography, imagery, material and signature interaction without independent business or platform grounds.'
    ])
  }),
  change: Object.freeze({
    requirements: Object.freeze([
      'Convert rejection or adjustment feedback into a bounded delta that states the observed problem, diagnosis confidence, preserve set, change set, do-not-infer set, next experiment and success observation.',
      'Retain stable qs element identities across iterative edits. Change only authorized element facets; report conflicts instead of silently overwriting approved appearance or behavior.',
      'A vague aesthetic rejection is candidate-scoped by default and cannot become a project or profile blacklist without explicit user authority.'
    ])
  }),
  delivery: Object.freeze({
    requirements: Object.freeze([
      'Route by the requested outcome, not sentence form. Requests to design, optimize, visually improve or refactor remain design work even when phrased as questions; use text-only audit mode only when the user explicitly limits the outcome to inspection, analysis or a report.',
      'Design mode must produce a proportionate directly viewable artifact. Prose, tables, component lists and ASCII wireframes may explain a design but cannot replace its preview.',
      'Creating an isolated prototype does not require approval to modify product source. Keep prototype output separate until the user approves source integration.',
      'A generated or inspected file is not delivered until the final response embeds a preview for every formal direction. Clickable or native work must also provide a runnable experience entry.',
      'If rendering or presentation is blocked, report the blocker and recovery action; do not finish with a text-only design while claiming completion.'
    ])
  }),
  validation: Object.freeze({
    requirements: Object.freeze([
      'Audit the final rendered artifact, not only plans, contracts or source declarations.',
      'Treat missing runtime, rendered-DOM or human-review evidence as unknown rather than clean.',
      'Do not present a formal candidate while it has unresolved blocker or major findings in the tested scope.',
      'Match the Prototype Contract fidelity. A static image cannot prove a clickable path or native behavior.',
      'Use render, inspect, diagnose, targeted correction and rerun; stop for user review when the contract correction limit is reached.',
      'Require a presented Presentation Record before treating formal design work as delivered.'
    ])
  })
});

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
    execution_policy: stableValue(WORKER_EXECUTION_POLICY),
    relation: manifest.relation,
    business_facts: selectItems('business-fact', task.business_facts, included),
    current_requirements: selectItems('requirement', task.current_requirements, included),
    official_constraints: selectItems('official-constraint', task.official_constraints, included),
    semantic_intent: included.has('semantic-intent') ? stableValue(task.semantic_intent) : null,
    continuity_contract: included.has('continuity-contract') ? stableValue(task.continuity_contract) : null,
    design_contracts: Object.fromEntries(DESIGN_CONTRACT_KEYS.map(key => [key, included.has(`design-contract:${key}`) ? stableValue(task.design_contracts?.[key] ?? null) : null])),
    platform_targets: included.has('platform-targets') ? [...task.platform_targets] : [],
    mutation_scope: manifest.mutation_scope == null ? null : stableValue(manifest.mutation_scope),
    feedback_delta: manifest.feedback_delta == null ? null : stableValue(manifest.feedback_delta),
    constraints: [...manifest.included_as_constraints],
    parents,
    prohibited_context: [...manifest.excluded]
  };
  return { ...payload, payload_hash: sha256(payload) };
}

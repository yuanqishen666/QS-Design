import { clone, sha256, timestamp } from '../shared/utils.mjs';
import { validateTaskCapsule } from '../context/task-capsule.mjs';
import { validateCandidate, validateCandidateGraph } from '../context/candidates.mjs';
import { validateContextManifest } from '../context/read-policy.mjs';
import { validateContinuityContract } from '../context/continuity.mjs';
import { validateBusinessModel } from '../business-model/model.mjs';
import { validateSemanticIntent } from '../semantics/intent.mjs';
import { validateDirectionSet } from '../directions/planner.mjs';
import { businessSpecificityChecks, validateArtDirection } from '../art-direction/contract.mjs';
import { validateCraftReview } from '../art-direction/craft-review.mjs';
import { validateGeneralityTests } from '../art-direction/specificity.mjs';
import { runVerificationRules, VERIFICATION_DIMENSIONS } from './rules.mjs';
import { validateException } from '../governance/decisions.mjs';
import { evaluateInteractionProbe } from '../interaction/probe.mjs';
import { validateContentContract } from '../content/contract.mjs';
import { lintHTML } from '../../scripts/design-lint.mjs';
import { validateProductTruth } from '../contracts/product-truth.mjs';
import { validateAttentionContract } from '../contracts/attention.mjs';
import { validateTerminologyContract } from '../contracts/terminology.mjs';
import { validatePrototypeContract } from '../contracts/prototype.mjs';
import { validatePresentationRecord } from '../contracts/presentation.mjs';
import { validateReferenceSynthesis } from '../contracts/reference-synthesis.mjs';
import { validateFeedbackDelta } from '../contracts/feedback-delta.mjs';
import { auditElementMutation, validateElementRegistry, validateMutationScope } from '../contracts/element-identity.mjs';
import { validatePropagationMap } from '../contracts/propagation.mjs';

const majorContentRules = new Set([
  'content-contract-invalid',
  'content-key-missing',
  'content-source-missing',
  'content-owner-missing',
  'content-claim-unverified',
  'content-entry-missing',
  'content-state-missing',
  'content-contract-missing',
  'content-role-mismatch',
  'content-delivery-mismatch',
  'content-decorative-copy',
  'content-decorative-english',
  'content-vague-evaluative-heading'
]);

export function finding({ id = null, status = 'finding', dimension, severity = 'major', target = 'bundle', evidence = [], confidence = 'high', impact = '', correctionDirection, correction_direction = '', exception = null } = {}) {
  const allowedStatuses = ['finding', 'clean', 'unknown', 'not-applicable'];
  const allowedSeverities = ['blocker', 'major', 'advisory'];
  const allowedConfidence = ['high', 'medium', 'low', 'unknown'];
  const normalizedEvidence = (Array.isArray(evidence) ? evidence : [evidence]).filter(item => item != null && item !== '');
  let normalizedStatus = allowedStatuses.includes(status) ? status : 'unknown';
  if (normalizedStatus !== status) normalizedEvidence.push(`Invalid supplied verification status: ${status}.`);
  if (['finding', 'clean', 'not-applicable'].includes(normalizedStatus) && !normalizedEvidence.length) {
    normalizedStatus = 'unknown';
    normalizedEvidence.push('No evidence was supplied for the claimed verification status.');
  }
  const normalizedDimension = VERIFICATION_DIMENSIONS.includes(dimension) ? dimension : 'maintainability';
  if (dimension && normalizedDimension !== dimension) normalizedEvidence.push(`Invalid supplied verification dimension: ${dimension}.`);
  const normalized = { status: normalizedStatus, dimension: normalizedDimension, severity: allowedSeverities.includes(severity) ? severity : 'major', target, evidence: normalizedEvidence, confidence: allowedConfidence.includes(confidence) ? confidence : 'unknown', impact, correction_direction: correctionDirection ?? correction_direction, exception };
  return { id: id ?? `finding-${sha256(normalized).slice(0, 16)}`, ...normalized };
}

function addMessages(output, messages, options) {
  for (const message of messages) output.push(finding({ ...options, evidence: [message] }));
}

function addValidation(output, result, options) {
  const errors = result?.errors ?? [];
  const advisories = result?.advisories ?? [];
  addMessages(output, errors, { ...options, severity: options.errorSeverity ?? 'major' });
  addMessages(output, advisories, { ...options, severity: 'advisory', confidence: 'medium' });
  if (!errors.length && !advisories.length) output.push(finding({ status: 'clean', dimension: options.dimension, severity: 'advisory', target: options.target, evidence: [options.cleanEvidence ?? 'The available deterministic check found no issue.'], confidence: 'high', impact: 'Clean does not prove overall design quality.', correctionDirection: 'Continue with runtime and human review.' }));
}

function appendExternalEvidence(findings, evidenceByDimension) {
  for (const [dimension, entries] of Object.entries(evidenceByDimension ?? {})) {
    for (const entry of Array.isArray(entries) ? entries : [entries]) findings.push(finding({ dimension, ...entry }));
  }
}

function addContractOutcomes(output, outcomes, { dimension, target, impact, correctionDirection, dimensionFor = null } = {}) {
  for (const outcome of outcomes ?? []) {
    const resolvedDimension = typeof dimensionFor === 'function' ? dimensionFor(outcome) : dimension;
    const evidence = (outcome.evidence ?? []).length ? outcome.evidence : [outcome.reason || 'The required check has not run.'];
    output.push(finding({
      status: outcome.status,
      dimension: resolvedDimension,
      severity: outcome.status === 'finding' ? 'major' : outcome.status === 'unknown' ? 'major' : 'advisory',
      target: `${target}:${outcome.concept_id ?? outcome.id ?? 'check'}`,
      evidence,
      confidence: outcome.status === 'unknown' ? 'unknown' : 'high',
      impact: outcome.status === 'finding' ? impact : '',
      correctionDirection: outcome.status === 'finding' || outcome.status === 'unknown' ? correctionDirection : ''
    }));
  }
}

function missingContract(findings, { name, dimension, target, impact, correctionDirection, severity = 'major' }) {
  findings.push(finding({ status: 'finding', dimension, severity, target, evidence: [`Formal candidate is missing ${name}.`], confidence: 'high', impact, correctionDirection }));
}

function finalize(target, findings, now) {
  for (const dimension of VERIFICATION_DIMENSIONS) {
    if (!findings.some(item => item.dimension === dimension)) findings.push(finding({
      status: 'unknown', dimension, severity: 'major', target, evidence: ['No applicable evidence was supplied for this dimension.'], confidence: 'unknown',
      impact: 'This aspect of the design is not verified.', correctionDirection: 'Supply runtime, artifact or human-review evidence.'
    }));
  }
  const summary = Object.fromEntries(['finding', 'clean', 'unknown', 'not-applicable'].map(status => [status, findings.filter(item => item.status === status).length]));
  return { schema: 1, target, findings, summary, created_at: timestamp(now) };
}

export function verifyBundle({
  target = 'design-bundle',
  task,
  candidates = [],
  manifest,
  continuity,
  businessModel,
  contentContract,
  renderedArtifacts = [],
  semanticIntent,
  directionSet,
  productTruth = null,
  attentionContract = null,
  terminologyContract = null,
  prototypeContract = null,
  presentationRecord = null,
  referenceSynthesis = null,
  feedbackDeltas = [],
  elementRegistryBefore = null,
  elementRegistryAfter = null,
  mutationScope = null,
  propagationMap = null,
  interactionProbes = [],
  evidenceByDimension = {},
  platformFindings = [],
  approvalFindings = []
} = {}, now = new Date()) {
  const findings = [];
  const taskContracts = task?.design_contracts ?? {};
  const contractVisible = key => !manifest || (manifest.included ?? []).includes(`design-contract:${key}`);
  const resolveContract = (key, explicit) => contractVisible(key) ? explicit ?? taskContracts[key] ?? null : null;
  const explicitContracts = { product_truth: productTruth, attention: attentionContract, terminology: terminologyContract, prototype: prototypeContract, reference_synthesis: referenceSynthesis };
  for (const [key, value] of Object.entries(explicitContracts)) if (value && !contractVisible(key)) findings.push(finding({ dimension: 'context-compliance', severity: 'blocker', target: `${target}:design-contract:${key}`, evidence: [`Verification received ${key}, but the context manifest did not authorize that contract for this run.`], impact: 'Verification could certify context the isolated worker was not allowed to use.', correctionDirection: 'Authorize the contract in the manifest or remove it from this run.' }));
  const resolvedProductTruth = resolveContract('product_truth', productTruth);
  const resolvedAttention = resolveContract('attention', attentionContract);
  const resolvedTerminology = resolveContract('terminology', terminologyContract);
  const resolvedPrototype = resolveContract('prototype', prototypeContract);
  const resolvedReferenceSynthesis = resolveContract('reference_synthesis', referenceSynthesis);
  const resolvedMutationScope = mutationScope ?? manifest?.mutation_scope ?? null;
  const resolvedFeedbackDeltas = [...(Array.isArray(feedbackDeltas) ? feedbackDeltas : [feedbackDeltas]), manifest?.feedback_delta].filter(Boolean);
  const formalCandidate = Boolean(directionSet);
  const resolvedContentContract = contentContract ?? (Array.isArray(businessModel?.content_graph?.entries) ? {
    schema: businessModel.content_graph.schema ?? 1,
    entries: businessModel.content_graph.entries,
    required_states: businessModel.content_graph.required_states ?? []
  } : null);
  addValidation(findings, { errors: validateTaskCapsule(task), advisories: [] }, { dimension: 'context-compliance', errorSeverity: 'blocker', target, impact: 'The task context cannot be trusted.', correctionDirection: 'Repair the task capsule before design generation.', cleanEvidence: 'Task Capsule passed structural and scope checks.' });
  for (const candidate of candidates) addMessages(findings, validateCandidate(candidate), { dimension: 'context-compliance', severity: 'blocker', target: candidate?.candidate_id ?? target, impact: 'Candidate lineage or artifacts cannot be trusted.', correctionDirection: 'Repair or archive the invalid candidate record.' });
  addMessages(findings, validateCandidateGraph(candidates, task?.task_id), { dimension: 'context-compliance', severity: 'blocker', target, impact: 'Candidate lineage is inconsistent or cyclic.', correctionDirection: 'Repair the candidate parent graph before inheritance.' });
  if (manifest) addValidation(findings, { errors: validateContextManifest(manifest, candidates, { taskId: task?.task_id, task }), advisories: [] }, { dimension: 'context-compliance', errorSeverity: 'blocker', target, impact: 'Rejected or unauthorized design context may contaminate generation.', correctionDirection: 'Compile a clean context manifest.', cleanEvidence: 'Context manifest hash and candidate permissions are valid.' });
  if (continuity) addValidation(findings, { errors: validateContinuityContract(continuity), advisories: [] }, { dimension: 'continuity', target, impact: 'Preservation and redesign boundaries conflict.', correctionDirection: 'Resolve the continuity contract.', cleanEvidence: 'Continuity claims do not conflict.' });

  if (resolvedProductTruth) addValidation(findings, validateProductTruth(resolvedProductTruth), { dimension: 'business-consistency', errorSeverity: 'blocker', target: `${target}:product-truth`, impact: 'The candidate may omit core tasks or invent product behavior.', correctionDirection: 'Repair Product Truth and its source-backed affordance allowlist.', cleanEvidence: 'Product Truth passed source, identity and relationship checks.' });
  else if (formalCandidate) missingContract(findings, { name: 'Product Truth', dimension: 'business-consistency', target, impact: 'The model cannot distinguish product facts from plausible invention.', correctionDirection: 'Create session-scoped Product Truth before generating a formal direction.' });

  if (resolvedAttention) {
    const result = validateAttentionContract(resolvedAttention, { productTruth: resolvedProductTruth });
    addValidation(findings, result, { dimension: 'visual-craft', target: `${target}:attention`, impact: 'Visual hierarchy may not match the user task hierarchy.', correctionDirection: 'Repair the first-viewport attention order and primary-action dominance.', cleanEvidence: 'Attention Contract passed deterministic hierarchy checks.' });
    addContractOutcomes(findings, result.outcomes, {
      dimension: 'visual-craft', target: `${target}:attention-check`, impact: 'The required first-glance hierarchy check failed.', correctionDirection: 'Correct hierarchy and rerun the same check on the final artifact.',
      dimensionFor: outcome => ['focus-order', 'text-scale'].includes(outcome.id) ? 'interaction-accessibility' : 'visual-craft'
    });
  } else if (formalCandidate) missingContract(findings, { name: 'Attention Contract', dimension: 'visual-craft', target, impact: 'Equal-weight modules can hide the primary user task.', correctionDirection: 'Freeze primary, secondary and tertiary attention before rendering directions.' });

  if (resolvedTerminology) {
    const result = validateTerminologyContract(resolvedTerminology, { productTruth: resolvedProductTruth });
    addValidation(findings, result, { dimension: 'content-quality', target: `${target}:terminology`, impact: 'Labels may predict the wrong next screen or require explanatory repair copy.', correctionDirection: 'Resolve the concept through naming or structure, then rerun label-only comprehension.', cleanEvidence: 'Terminology Contract passed structural ambiguity checks.' });
    addContractOutcomes(findings, result.outcomes, { dimension: 'content-quality', target: `${target}:term-check`, impact: 'Users could not predict the labeled action or destination.', correctionDirection: 'Rename or restructure the concept; do not patch ambiguity with generic helper text.' });
  } else if (formalCandidate) missingContract(findings, { name: 'Terminology Contract', dimension: 'content-quality', target, impact: 'Material product labels have not been checked against user meaning.', correctionDirection: 'Record risky terms or explicitly record that terminology was reviewed with no observed risk.' });

  if (resolvedPrototype) {
    const result = validatePrototypeContract(resolvedPrototype, { productTruth: resolvedProductTruth });
    addValidation(findings, result, { dimension: 'prototype-implementation', errorSeverity: 'blocker', target: `${target}:prototype`, impact: 'The delivered artifact may not prove the requested paths or platform behavior.', correctionDirection: 'Repair fidelity, paths, states, viewport targets and evidence requirements.', cleanEvidence: 'Prototype Contract passed deterministic fidelity and path checks.' });
    addContractOutcomes(findings, result.outcomes, { dimension: 'prototype-implementation', target: `${target}:prototype-path`, impact: 'A required product path failed.', correctionDirection: 'Repair and rerun the same path with step evidence.' });
  } else if (formalCandidate) missingContract(findings, { name: 'Prototype Contract', dimension: 'prototype-implementation', target, impact: 'A static artifact may be mistaken for interaction or native proof.', correctionDirection: 'Declare specimen, static, clickable or native fidelity and the paths each candidate must prove.' });

  if (resolvedReferenceSynthesis) addValidation(findings, validateReferenceSynthesis(resolvedReferenceSynthesis), { dimension: 'continuity', target: `${target}:reference-synthesis`, impact: 'Reference use may become imitation or a collage of unrelated mechanisms.', correctionDirection: 'Reduce each source to observed mechanism, business fit, constraints and do-not-copy boundaries.', cleanEvidence: 'Reference Synthesis passed provenance and mechanism checks.' });

  for (const delta of resolvedFeedbackDeltas) addValidation(findings, validateFeedbackDelta(delta), { dimension: 'context-compliance', errorSeverity: 'blocker', target: `${target}:${delta.delta_id ?? 'feedback-delta'}`, impact: 'A symptom may be overgeneralized into unrelated or persistent design changes.', correctionDirection: 'Bound preserve, change, do-not-infer, next experiment and user-authorized reset scope.', cleanEvidence: 'Feedback Delta passed scope and reset-authority checks.' });

  if (propagationMap) addValidation(findings, validatePropagationMap(propagationMap, { productTruth: resolvedProductTruth }), { dimension: 'maintainability', target: `${target}:propagation`, impact: 'An approved representative screen may be mechanically repeated across unrelated pages.', correctionDirection: 'Separate global decisions, page-specific decisions, preserved behavior, route coverage and exceptions.', cleanEvidence: 'Propagation Map covers known routes without treating one page as a universal template.' });
  else if (resolvedPrototype?.coverage_scope === 'full-product') missingContract(findings, { name: 'Propagation Map', dimension: 'maintainability', target, impact: 'Full-product expansion has no explicit route coverage or page-specific exception model.', correctionDirection: 'Create a Propagation Map before expanding the selected representative flow.' });

  if (resolvedMutationScope) {
    addMessages(findings, validateMutationScope(resolvedMutationScope, { registry: elementRegistryBefore }), { dimension: 'context-compliance', severity: 'blocker', target: `${target}:mutation-scope`, impact: 'The requested change boundary cannot be trusted.', correctionDirection: 'Repair stable element references and allowed facets.' });
    if (elementRegistryBefore && elementRegistryAfter) {
      const audit = auditElementMutation({ before: elementRegistryBefore, after: elementRegistryAfter, scope: resolvedMutationScope });
      addMessages(findings, audit.errors, { dimension: 'maintainability', severity: 'blocker', target: `${target}:element-identity`, impact: 'Stable element identity evidence is invalid.', correctionDirection: 'Repair element registries before comparing changes.' });
      for (const conflict of audit.conflicts) findings.push(finding({ dimension: 'maintainability', severity: 'blocker', target: conflict.element_id, evidence: [conflict.reason, conflict], impact: 'An out-of-scope edit could silently overwrite an approved visual or functional decision.', correctionDirection: `Honor ${resolvedMutationScope.conflict_policy}; restore the locked facet or request explicit expansion.` }));
      if (audit.clean) findings.push(finding({ status: 'clean', dimension: 'maintainability', severity: 'advisory', target: `${target}:element-identity`, evidence: [`Compared ${elementRegistryBefore.elements.length} stable elements against the authorized mutation scope.`], impact: 'This proves scope compliance for registered facets only.', correctionDirection: 'Keep the registry aligned with the final rendered artifact.' }));
    } else findings.push(finding({ status: 'unknown', dimension: 'maintainability', severity: 'major', target: `${target}:element-identity`, evidence: ['Mutation Scope exists, but before and after Element Registries were not both supplied.'], confidence: 'unknown', impact: 'Out-of-scope visual drift cannot be detected.', correctionDirection: 'Capture stable element registries before and after the edit.' }));
  } else if (formalCandidate && ['continue-parent', 'aspect-inheritance', 'explicit-merge'].includes(manifest?.relation)) missingContract(findings, { name: 'Mutation Scope', dimension: 'maintainability', target, impact: 'An iterative edit may change approved elements outside the user request.', correctionDirection: 'Register stable element ids and authorize only the requested facets.' });

  if (elementRegistryBefore && !resolvedMutationScope) addMessages(findings, validateElementRegistry(elementRegistryBefore), { dimension: 'maintainability', severity: 'major', target: `${target}:element-registry`, impact: 'Stable element identity is invalid.', correctionDirection: 'Repair the Element Registry.' });

  if (businessModel) {
    const result = validateBusinessModel(businessModel);
    const businessOnly = resolvedContentContract ? {
      errors: result.errors.filter(message => !message.startsWith('content_graph:')),
      advisories: result.advisories.filter(message => !message.startsWith('content_graph:'))
    } : result;
    addValidation(findings, businessOnly, { dimension: 'business-consistency', errorSeverity: 'blocker', target, impact: 'The design lacks reliable business grounding.', correctionDirection: 'Complete the business model.', cleanEvidence: 'Business model contains the required objects, task and state evidence.' });
  } else findings.push(finding({ status: 'unknown', dimension: 'business-consistency', severity: 'major', target, confidence: 'unknown', evidence: ['Business grounding was not provided.'], impact: 'Business grounding was not provided.', correctionDirection: 'Create a business model or state why it is not applicable.' }));

  if (resolvedContentContract) {
    const result = validateContentContract(resolvedContentContract);
    addMessages(findings, result.errors, { dimension: 'content-quality', severity: 'major', target, impact: 'Explanatory copy may be redundant or critical information may be hidden behind disclosure.', correctionDirection: 'Run the structure-substitution test and repair the content visibility contract.' });
    addMessages(findings, result.advisories, { dimension: 'content-quality', severity: 'advisory', target, confidence: 'medium', impact: 'The declared content delivery may add avoidable explanation or disclosure cost.', correctionDirection: 'Review the content visibility contract against the rendered artifact.' });
  }

  const normalizedRenderedArtifacts = (Array.isArray(renderedArtifacts) ? renderedArtifacts : [renderedArtifacts])
    .filter(Boolean)
    .map((artifact, index) => typeof artifact === 'string' ? { id: `rendered-artifact-${index + 1}`, html: artifact } : artifact);
  if (normalizedRenderedArtifacts.length) {
    for (const [index, artifact] of normalizedRenderedArtifacts.entries()) {
      const artifactTarget = artifact.id ?? artifact.path ?? `${target}:rendered-artifact-${index + 1}`;
      if (typeof artifact.html !== 'string' || !artifact.html.trim()) {
        findings.push(finding({ status: 'unknown', dimension: 'content-quality', severity: 'major', target: artifactTarget, confidence: 'unknown', evidence: ['Rendered artifact did not include a non-empty DOM HTML snapshot.'], impact: 'Final visible copy was not inspected.', correctionDirection: 'Capture the final rendered DOM and rerun content verification.' }));
        continue;
      }
      const lint = lintHTML(artifact.html, artifactTarget, { contentManifest: resolvedContentContract, requireStableIds: Boolean(resolvedMutationScope) });
      const artifactWarnings = lint.warnings.filter(item => item.rule.startsWith('content-') && !['content-contract-invalid', 'content-contract-advisory'].includes(item.rule));
      if (!artifactWarnings.length) {
        findings.push(finding({ status: 'clean', dimension: 'content-quality', severity: 'advisory', target: artifactTarget, evidence: ['Static audit inspected the final rendered DOM snapshot and found no deterministic content issue.'], confidence: 'high', impact: 'This does not prove user comprehension or runtime disclosure behavior.', correctionDirection: 'Retain task-trace and runtime evidence for behavioral claims.' }));
      } else {
        for (const warning of artifactWarnings) findings.push(finding({
          dimension: 'content-quality',
          severity: majorContentRules.has(warning.rule) ? 'major' : 'advisory',
          target: artifactTarget,
          evidence: [`${warning.rule}: ${warning.message}`],
          confidence: 'high',
          impact: 'Final rendered copy may be decorative, unsupported, redundant or inconsistent with its content contract.',
          correctionDirection: 'Repair the rendered copy or its specimen-specific contract, then audit the same final artifact again.'
        }));
      }
      const visualLintFindings = [...lint.errors, ...lint.warnings.filter(item => !item.rule.startsWith('content-'))];
      if (!visualLintFindings.length) {
        findings.push(finding({ status: 'clean', dimension: 'visual-craft', severity: 'advisory', target: artifactTarget, evidence: ['Static design audit inspected the final rendered DOM snapshot and found no deterministic document, motion or surface-structure issue.'], confidence: 'high', impact: 'This does not prove visual quality or user preference.', correctionDirection: 'Retain rendered, runtime and human craft review evidence.' }));
      } else {
        for (const item of visualLintFindings) findings.push(finding({
          dimension: 'visual-craft',
          severity: lint.errors.includes(item) ? 'major' : 'advisory',
          target: artifactTarget,
          evidence: [`${item.rule}: ${item.message}`],
          confidence: 'high',
          impact: item.rule.startsWith('surface-') ? 'Repeated or nested containers may be replacing information hierarchy and visual direction.' : 'The rendered artifact has a deterministic document, motion, accessibility or surface-structure issue.',
          correctionDirection: item.rule.startsWith('surface-') ? 'Run the remove-container test and use a list, table, timeline, media relationship or direct-on-canvas composition unless each surface has a semantic role.' : 'Repair the final rendered artifact and rerun design lint.'
        }));
      }
    }
  } else if (resolvedContentContract) {
    findings.push(finding({
      status: 'unknown', dimension: 'content-quality', severity: 'major', target, confidence: 'unknown',
      evidence: ['The content contract was structurally checked, but no final rendered DOM artifact was supplied for content audit.'],
      impact: 'Contract validity cannot prove that final visible copy is necessary, sourced or correctly bound.',
      correctionDirection: 'Supply renderedArtifacts with final DOM HTML and rerun verification.'
    }));
  }
  if (!normalizedRenderedArtifacts.length && resolvedPrototype?.evidence_requirements?.includes('rendered-artifact')) findings.push(finding({
    status: 'unknown', dimension: 'prototype-implementation', severity: 'major', target: `${target}:rendered-artifact`, confidence: 'unknown',
    evidence: ['Prototype Contract requires a rendered artifact, but no final rendered output was supplied.'],
    impact: 'Source declarations cannot prove the final visual or interaction artifact.',
    correctionDirection: 'Render the contracted viewport or device, capture the final artifact and rerun verification.'
  }));

  if (presentationRecord) {
    const result = validatePresentationRecord(presentationRecord, { prototypeContract: resolvedPrototype });
    addValidation(findings, result, {
      dimension: 'prototype-implementation', errorSeverity: 'blocker', target: `${target}:presentation`,
      impact: 'A generated artifact may be mistaken for a design the user has actually seen.',
      correctionDirection: 'Present a directly viewable preview for every formal direction and record the exact surfaced references.',
      cleanEvidence: 'Presentation Record passed structural and reference checks.'
    });
    if (presentationRecord.status === 'blocked') findings.push(finding({
      status: 'finding', dimension: 'prototype-implementation', severity: 'blocker', target: `${target}:presentation`,
      evidence: [presentationRecord.blocker], impact: 'The requested visual design has not been delivered.',
      correctionDirection: 'Resolve the recorded blocker and rerun render, inspection and presentation.'
    }));
    else if (formalCandidate && presentationRecord.status !== 'presented') findings.push(finding({
      status: 'finding', dimension: 'prototype-implementation', severity: 'blocker', target: `${target}:presentation`,
      evidence: [`Formal design is ${presentationRecord.status}; generated or inspected files are not delivered until the final response surfaces them.`],
      impact: 'The user cannot evaluate or select the formal direction.',
      correctionDirection: 'Embed each direction preview in the final response, add runnable entries when required, then mark the record presented.'
    }));
    if (presentationRecord.status === 'presented') {
      const suppliedRefs = new Set(normalizedRenderedArtifacts.flatMap(artifact => [artifact.id, artifact.ref, artifact.path].filter(Boolean)));
      for (const ref of presentationRecord.preview_refs ?? []) if (!suppliedRefs.has(ref)) findings.push(finding({
        status: 'finding', dimension: 'prototype-implementation', severity: 'blocker', target: `${target}:presentation:${ref}`,
        evidence: [`Presented preview ${ref} was not supplied among final rendered artifacts.`],
        impact: 'A presentation record can otherwise claim a preview that was never verified or surfaced.',
        correctionDirection: 'Supply the exact preview artifact to verification and embed that same artifact in the final response.'
      }));
    }
  } else if (formalCandidate) missingContract(findings, {
    name: 'Presentation Record', dimension: 'prototype-implementation', severity: 'blocker', target,
    impact: 'Rendered files may exist without being shown to the user.',
    correctionDirection: 'Record planned, presented or blocked delivery and require an embedded preview before completing design mode.'
  });

  if (semanticIntent) {
    const result = validateSemanticIntent(semanticIntent);
    addValidation(findings, result, { dimension: 'business-specificity', target, impact: 'Fuzzy language may collapse into style clichés.', correctionDirection: 'Translate language into business meaning and observable criteria.', cleanEvidence: 'Fuzzy language has business and observable interpretations.' });
  }

  if (directionSet) {
    const result = validateDirectionSet(directionSet, { productTruth: resolvedProductTruth, attentionContract: resolvedAttention, prototypeContract: resolvedPrototype, requireCurrentContract: true });
    addMessages(findings, result.errors, { dimension: 'business-specificity', severity: 'major', target, impact: 'Directions are missing or only cosmetically different.', correctionDirection: 'Repair direction semantics and comparison.' });
    addMessages(findings, result.advisories, { dimension: 'business-specificity', severity: 'advisory', target, confidence: 'medium', impact: 'A direction may be generic.', correctionDirection: 'Strengthen its non-transferability claim.' });
    for (const direction of directionSet.directions ?? []) {
      const art = validateArtDirection(direction.art_direction ?? {}, { dominantDecisions: direction.dominant_decisions ?? [] });
      addMessages(findings, art.errors, { dimension: 'visual-craft', severity: 'major', target: direction.id, impact: 'The visual direction is incomplete.', correctionDirection: 'Complete the Art Direction Contract.' });
      addMessages(findings, art.advisories, { dimension: 'visual-craft', severity: 'advisory', target: direction.id, confidence: 'medium', impact: 'The design may fall back to generic model priors.', correctionDirection: 'Tie the art direction to business evidence.' });
      addMessages(findings, businessSpecificityChecks({ artDirection: direction.art_direction, nonTransferability: direction.non_transferability, dominantDecisions: direction.dominant_decisions ?? [] }), { dimension: 'business-specificity', severity: 'major', target: direction.id, impact: 'The direction can transfer too easily to unrelated products.', correctionDirection: 'Trace dominant decisions to business and user outcomes.' });
      for (const outcome of validateCraftReview(direction.craft_review).outcomes) findings.push(finding({
        status: outcome.status,
        dimension: 'visual-craft',
        severity: outcome.status === 'finding' ? 'major' : 'advisory',
        target: `${direction.id}:${outcome.id}`,
        evidence: outcome.evidence.length ? outcome.evidence : outcome.reason ? [outcome.reason] : [],
        confidence: outcome.status === 'unknown' ? 'unknown' : 'high',
        impact: outcome.status === 'finding' ? 'The rendered direction failed a required craft stress test.' : '',
        correctionDirection: outcome.status === 'finding' ? 'Repair the direction and rerun this exact craft check.' : ''
      }));
      for (const outcome of validateGeneralityTests(direction.generality_tests).outcomes) findings.push(finding({
        status: outcome.status,
        dimension: 'business-specificity',
        severity: outcome.status === 'finding' ? 'major' : 'advisory',
        target: `${direction.id}:${outcome.id}`,
        evidence: outcome.evidence.length ? outcome.evidence : outcome.reason ? [outcome.reason] : [],
        confidence: outcome.status === 'unknown' ? 'unknown' : 'high',
        impact: outcome.status === 'finding' ? 'The direction remains transferable or unrecognizable without branding.' : '',
        correctionDirection: outcome.status === 'finding' ? 'Change the business object, topology or interaction rationale rather than adding decoration.' : ''
      }));
    }
  }
  for (const probe of interactionProbes) {
    const result = evaluateInteractionProbe(probe);
    const status = result.conclusion === 'suitable' ? 'clean' : result.conclusion === 'unknown' ? 'unknown' : 'finding';
    findings.push(finding({
      status,
      dimension: 'interaction-accessibility',
      severity: result.conclusion === 'not-suitable' ? 'blocker' : result.conclusion === 'suitable' ? 'advisory' : 'major',
      target: probe.probe_id,
      evidence: [...result.findings, ...result.evidence.flatMap(item => item.evidence ?? [])],
      confidence: result.conclusion === 'unknown' ? 'unknown' : 'high',
      impact: status === 'finding' ? `Interaction conclusion: ${result.conclusion}.` : '',
      correctionDirection: status === 'finding' ? 'Repair cancellation, alternative input, reduced motion, performance or repeated-use behavior.' : ''
    }));
  }
  appendExternalEvidence(findings, evidenceByDimension);
  findings.push(...platformFindings.map(item => finding({ target, ...item })));
  findings.push(...approvalFindings.map(item => finding({ target, dimension: 'prototype-implementation', ...item })));
  return finalize(target, findings, now);
}

export async function verifyBundleWithRules(bundle = {}, rules = [], now = new Date()) {
  const report = verifyBundle(bundle, now);
  const ruleFindings = await runVerificationRules(rules, bundle);
  const dimensionsWithOnlyPlaceholderUnknown = new Set(ruleFindings.map(item => item.dimension));
  const retained = report.findings.filter(item => !(dimensionsWithOnlyPlaceholderUnknown.has(item.dimension) && item.status === 'unknown' && item.evidence?.[0] === 'No applicable evidence was supplied for this dimension.'));
  return finalize(report.target, [...retained, ...ruleFindings.map(item => finding(item))], now);
}

export function applyVerificationExceptions(report, exceptions = [], now = new Date()) {
  const next = clone(report);
  for (const exception of exceptions) {
    const errors = validateException(exception, now);
    const target = next.findings.find(item => item.id === exception.finding_id);
    if (errors.length || !target || target.status !== 'finding') {
      next.findings.push(finding({
        dimension: 'maintainability',
        severity: 'major',
        target: exception.exception_id ?? 'exception',
        evidence: errors.length ? errors : !target ? [`Exception references unknown finding ${exception.finding_id}.`] : [`Exception can only govern an active finding, not ${target.status}.`],
        impact: 'An invalid exception cannot govern verification debt.',
        correctionDirection: 'Assign a valid finding, owner, reason and expiry or review trigger.'
      }));
      continue;
    }
    target.exception = clone(exception);
  }
  next.summary = Object.fromEntries(['finding', 'clean', 'unknown', 'not-applicable'].map(status => [status, next.findings.filter(item => item.status === status).length]));
  return next;
}

export { VERIFICATION_DIMENSIONS };

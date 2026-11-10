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

export function verifyBundle({ target = 'design-bundle', task, candidates = [], manifest, continuity, businessModel, contentContract, semanticIntent, directionSet, interactionProbes = [], evidenceByDimension = {}, platformFindings = [], approvalFindings = [] } = {}, now = new Date()) {
  const findings = [];
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
    addValidation(findings, result, { dimension: 'content-quality', errorSeverity: 'major', target, impact: 'Explanatory copy may be redundant or critical information may be hidden behind disclosure.', correctionDirection: 'Run the structure-substitution test and repair the content visibility contract.', cleanEvidence: 'Content visibility entries declare purpose, irreducible meaning, structural attempt and a safe delivery mode.' });
  }

  if (semanticIntent) {
    const result = validateSemanticIntent(semanticIntent);
    addValidation(findings, result, { dimension: 'business-specificity', target, impact: 'Fuzzy language may collapse into style clichés.', correctionDirection: 'Translate language into business meaning and observable criteria.', cleanEvidence: 'Fuzzy language has business and observable interpretations.' });
  }

  if (directionSet) {
    const result = validateDirectionSet(directionSet);
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

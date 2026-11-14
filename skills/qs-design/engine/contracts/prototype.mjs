import { clone, requiredText, unique } from '../shared/utils.mjs';
import { normalizeEvidenceCheck, normalizeTextList, validateEvidenceCheck } from './shared.mjs';

export const PROTOTYPE_FIDELITIES = ['specimen', 'static', 'clickable', 'native'];
export const PROTOTYPE_COVERAGE = ['representative', 'full-product'];
export const PROTOTYPE_EVIDENCE = ['rendered-artifact', 'runtime-flow', 'step-capture', 'assertion-report', 'accessibility-tree', 'native-capture'];

function normalizePath(path) {
  return {
    id: requiredText(path.id, 'Prototype path id'),
    start: requiredText(path.start, 'Prototype path start'),
    steps: (path.steps ?? []).map((step, index) => ({
      index: index + 1,
      action_id: requiredText(step.action_id ?? step.actionId, 'Prototype step action_id'),
      target_id: requiredText(step.target_id ?? step.targetId, 'Prototype step target_id'),
      expected_state: requiredText(step.expected_state ?? step.expectedState, 'Prototype step expected_state')
    })),
    outcome: requiredText(path.outcome, 'Prototype path outcome')
  };
}

function normalizeViewport(viewport, index) {
  return {
    id: requiredText(viewport.id ?? `viewport-${index + 1}`, 'Viewport id'),
    platform: requiredText(viewport.platform ?? 'web', 'Viewport platform'),
    width: viewport.width == null ? null : Number(viewport.width),
    height: viewport.height == null ? null : Number(viewport.height),
    device: viewport.device == null ? null : String(viewport.device)
  };
}

function requiredEvidenceFor(fidelity) {
  if (fidelity === 'native') return ['rendered-artifact', 'runtime-flow', 'step-capture', 'assertion-report', 'native-capture'];
  if (fidelity === 'clickable') return ['rendered-artifact', 'runtime-flow', 'step-capture', 'assertion-report'];
  return ['rendered-artifact'];
}

export function createPrototypeContract({
  taskId,
  fidelity = 'specimen',
  coverageScope = 'representative',
  purpose,
  requiredPaths = [],
  requiredStates = ['default'],
  dataFixture = {},
  fixtureSource,
  viewports = [],
  evidenceRequirements = null,
  pathEvidence = [],
  critiquePolicy = {},
  critiqueCycles = [],
  prohibitedClaims = []
} = {}) {
  if (!/^task-[a-z0-9-]+$/.test(String(taskId ?? ''))) throw new Error('Prototype Contract taskId must match task-[a-z0-9-]+.');
  if (!PROTOTYPE_FIDELITIES.includes(fidelity)) throw new Error(`Prototype fidelity must be one of: ${PROTOTYPE_FIDELITIES.join(', ')}.`);
  if (!PROTOTYPE_COVERAGE.includes(coverageScope)) throw new Error(`Prototype coverageScope must be one of: ${PROTOTYPE_COVERAGE.join(', ')}.`);
  const paths = requiredPaths.map(normalizePath);
  const evidence = paths.map(path => normalizeEvidenceCheck(path.id, pathEvidence.find(item => item.id === path.id) ?? { reason: 'Required prototype path has not run yet.' }));
  return {
    schema: 1,
    task_id: taskId,
    fidelity,
    coverage_scope: coverageScope,
    purpose: requiredText(purpose, 'Prototype purpose'),
    required_paths: paths,
    required_states: normalizeTextList(requiredStates),
    data_fixture: clone(dataFixture),
    fixture_source: requiredText(fixtureSource, 'Prototype fixture source'),
    viewports: viewports.map(normalizeViewport),
    evidence_requirements: unique(evidenceRequirements ?? requiredEvidenceFor(fidelity)),
    path_evidence: evidence,
    critique_policy: {
      require_render_inspect_diagnose_rerun: critiquePolicy.require_render_inspect_diagnose_rerun !== false,
      max_internal_corrections: Number.isInteger(critiquePolicy.max_internal_corrections) ? critiquePolicy.max_internal_corrections : 2,
      stop_for_user_after_limit: critiquePolicy.stop_for_user_after_limit !== false
    },
    critique_cycles: clone(critiqueCycles),
    prohibited_claims: normalizeTextList(prohibitedClaims)
  };
}

export function validatePrototypeContract(contract, { productTruth = null } = {}) {
  const errors = [];
  const advisories = [];
  const outcomes = [];
  if (contract?.schema !== 1) errors.push('Prototype Contract must use schema 1.');
  if (!/^task-[a-z0-9-]+$/.test(contract?.task_id ?? '')) errors.push('Prototype Contract has an invalid task_id.');
  if (!PROTOTYPE_FIDELITIES.includes(contract?.fidelity)) errors.push('Prototype Contract has an invalid fidelity.');
  if (!PROTOTYPE_COVERAGE.includes(contract?.coverage_scope)) errors.push('Prototype Contract has an invalid coverage_scope.');
  if (!String(contract?.purpose ?? '').trim()) errors.push('Prototype Contract requires a purpose.');
  if (!String(contract?.fixture_source ?? '').trim()) errors.push('Prototype Contract requires fixture_source.');
  for (const field of ['required_paths', 'required_states', 'viewports', 'evidence_requirements', 'path_evidence', 'critique_cycles', 'prohibited_claims']) if (!Array.isArray(contract?.[field])) errors.push(`Prototype Contract ${field} must be an array.`);
  if (['clickable', 'native'].includes(contract?.fidelity) && !(contract?.required_paths ?? []).length) errors.push(`${contract.fidelity} prototypes require at least one executable path.`);
  if (!(contract?.required_states ?? []).length) errors.push('Prototype Contract requires at least one state.');
  if (!(contract?.viewports ?? []).length) advisories.push('Prototype Contract has no fixed viewport or device target.');
  const pathIds = new Set();
  const stateIds = new Set(contract?.required_states ?? []);
  const affordanceIds = new Set(productTruth?.visible_affordances?.map(item => item.id) ?? []);
  for (const path of contract?.required_paths ?? []) {
    if (pathIds.has(path.id)) errors.push(`Duplicate prototype path ${path.id}.`);
    pathIds.add(path.id);
    if (!stateIds.has(path.start)) errors.push(`Prototype path ${path.id} starts from undeclared state ${path.start}.`);
    if (['clickable', 'native'].includes(contract?.fidelity) && !(path.steps ?? []).length) errors.push(`Prototype path ${path.id} requires at least one step.`);
    for (const step of path.steps ?? []) {
      if (!stateIds.has(step.expected_state)) errors.push(`Prototype path ${path.id} references undeclared state ${step.expected_state}.`);
      if (productTruth && !affordanceIds.has(step.action_id)) errors.push(`Prototype path ${path.id} uses action ${step.action_id} outside the Product Truth affordance allowlist.`);
    }
  }
  for (const viewport of contract?.viewports ?? []) {
    if (!viewport.device && (!(viewport.width > 0) || !(viewport.height > 0))) errors.push(`Viewport ${viewport.id ?? 'unknown'} requires positive width and height or a named device.`);
  }
  const requiredEvidence = requiredEvidenceFor(contract?.fidelity);
  for (const kind of requiredEvidence) if (!(contract?.evidence_requirements ?? []).includes(kind)) errors.push(`Prototype fidelity ${contract?.fidelity} requires ${kind} evidence.`);
  for (const kind of contract?.evidence_requirements ?? []) if (!PROTOTYPE_EVIDENCE.includes(kind)) errors.push(`Prototype Contract has unknown evidence requirement ${kind}.`);
  for (const id of pathIds) if (!(contract?.path_evidence ?? []).some(item => item.id === id)) errors.push(`Prototype path ${id} has no evidence record.`);
  for (const check of contract?.path_evidence ?? []) {
    errors.push(...validateEvidenceCheck(check, `Prototype path evidence ${check?.id ?? 'unknown'}`));
    outcomes.push(clone(check));
  }
  const policy = contract?.critique_policy;
  if (!policy || typeof policy !== 'object' || Array.isArray(policy)) errors.push('Prototype Contract requires a critique_policy.');
  if (!Number.isInteger(policy?.max_internal_corrections) || policy.max_internal_corrections < 0 || policy.max_internal_corrections > 3) errors.push('Prototype critique max_internal_corrections must be between 0 and 3.');
  if ((contract?.critique_cycles ?? []).length > (policy?.max_internal_corrections ?? 0)) errors.push('Prototype critique cycles exceed the internal correction limit.');
  for (const [index, cycle] of (contract?.critique_cycles ?? []).entries()) {
    for (const field of ['render_ref', 'diagnosis', 'targeted_change', 'rerun_ref']) if (!String(cycle?.[field] ?? '').trim()) errors.push(`Prototype critique cycle ${index + 1} requires ${field}.`);
  }
  if (productTruth && productTruth.task_id !== contract?.task_id) errors.push('Prototype Contract belongs to a different Product Truth task.');
  if (contract?.fidelity === 'static' && (contract?.evidence_requirements ?? []).includes('runtime-flow')) advisories.push('A static prototype cannot itself satisfy runtime-flow evidence; use clickable fidelity or mark the behavior unknown.');
  return { errors: unique(errors), advisories: unique(advisories), outcomes };
}

import { clone, identifier, requiredText, unique } from '../shared/utils.mjs';
import { duplicateIds, normalizeSource, normalizeTextList } from './shared.mjs';

export const PRODUCT_TRUTH_SOURCE_MODES = ['conversation', 'product', 'mixed'];
export const PRODUCT_TRUTH_CONFIDENCE = ['high', 'medium', 'low', 'unknown'];
export const PRODUCT_ITEM_STATUSES = ['existing', 'confirmed', 'required', 'planned', 'proposed', 'unknown'];
export const AFFORDANCE_KINDS = ['action', 'navigation', 'input', 'selection', 'disclosure', 'system'];
export const FIXTURE_MODES = ['none', 'source-backed', 'clearly-labeled-demo'];

function record(value, prefix, fields = {}) {
  const input = typeof value === 'string' ? { statement: value } : value ?? {};
  return {
    ...fields,
    ...clone(input),
    id: input.id ?? identifier(prefix),
    source: normalizeSource(input.source),
    confidence: PRODUCT_TRUTH_CONFIDENCE.includes(input.confidence) ? input.confidence : fields.confidence ?? 'high',
    status: PRODUCT_ITEM_STATUSES.includes(input.status) ? input.status : fields.status ?? 'confirmed'
  };
}

function normalizeJob(value, index) {
  const item = record(value, 'job', { priority: index + 1 });
  return { ...item, statement: requiredText(item.statement ?? item.label, 'Primary job statement'), priority: Number.isInteger(item.priority) && item.priority > 0 ? item.priority : index + 1 };
}

function normalizeJourney(value) {
  const item = record(value, 'journey');
  return {
    ...item,
    job_id: requiredText(item.job_id, 'Critical journey job_id'),
    entry: requiredText(item.entry, 'Critical journey entry'),
    steps: normalizeTextList(item.steps),
    outcome: requiredText(item.outcome, 'Critical journey outcome')
  };
}

function normalizeRoute(value) {
  const item = record(value, 'route');
  return { ...item, label: requiredText(item.label ?? item.id, 'Route label') };
}

function normalizeAffordance(value) {
  const item = record(value, 'affordance', { kind: 'action' });
  return {
    ...item,
    label: requiredText(item.label, 'Affordance label'),
    kind: AFFORDANCE_KINDS.includes(item.kind) ? item.kind : 'action',
    route_id: item.route_id == null ? null : String(item.route_id),
    state_id: item.state_id == null ? null : String(item.state_id)
  };
}

function normalizeState(value) {
  const item = record(value, 'state');
  return { ...item, owner: requiredText(item.owner, 'State owner'), trigger: requiredText(item.trigger, 'State trigger') };
}

function normalizeProhibition(value) {
  const item = record(typeof value === 'string' ? { claim: value } : value, 'prohibition');
  return { ...item, claim: requiredText(item.claim, 'Forbidden invention claim') };
}

function normalizeUnknown(value) {
  const item = record(value, 'unknown', { status: 'unknown', confidence: 'unknown' });
  return { ...item, question: requiredText(item.question, 'Unknown question'), impact: requiredText(item.impact, 'Unknown impact') };
}

export function createProductTruth({
  taskId,
  sourceMode = 'conversation',
  primaryJobs = [],
  criticalJourneys = [],
  routes = [],
  visibleAffordances = [],
  states = [],
  forbiddenInventions = [],
  unknowns = [],
  representativeTask = null,
  fixturePolicy = {},
  terminologyRisks = []
} = {}) {
  if (!/^task-[a-z0-9-]+$/.test(String(taskId ?? ''))) throw new Error('Product Truth taskId must match task-[a-z0-9-]+.');
  if (!PRODUCT_TRUTH_SOURCE_MODES.includes(sourceMode)) throw new Error(`Product Truth sourceMode must be one of: ${PRODUCT_TRUTH_SOURCE_MODES.join(', ')}.`);
  const jobs = primaryJobs.map(normalizeJob);
  const journeys = criticalJourneys.map(normalizeJourney);
  const normalizedRepresentative = representativeTask == null ? null : {
    job_id: requiredText(representativeTask.job_id, 'Representative task job_id'),
    journey_id: representativeTask.journey_id == null ? null : String(representativeTask.journey_id),
    rationale: requiredText(representativeTask.rationale, 'Representative task rationale'),
    frequency: ['high', 'medium', 'low', 'unknown'].includes(representativeTask.frequency) ? representativeTask.frequency : 'unknown',
    risk: ['high', 'medium', 'low', 'unknown'].includes(representativeTask.risk) ? representativeTask.risk : 'unknown',
    source: normalizeSource(representativeTask.source)
  };
  return {
    schema: 1,
    task_id: taskId,
    source_mode: sourceMode,
    affordance_policy: 'allowlist',
    primary_jobs: jobs,
    critical_journeys: journeys,
    routes: routes.map(normalizeRoute),
    visible_affordances: visibleAffordances.map(normalizeAffordance),
    states: states.map(normalizeState),
    forbidden_inventions: forbiddenInventions.map(normalizeProhibition),
    unknowns: unknowns.map(normalizeUnknown),
    terminology_risks: normalizeTextList(terminologyRisks),
    representative_task: normalizedRepresentative,
    fixture_policy: {
      mode: FIXTURE_MODES.includes(fixturePolicy.mode) ? fixturePolicy.mode : 'none',
      shared_across_directions: fixturePolicy.shared_across_directions !== false,
      source: normalizeSource(fixturePolicy.source)
    }
  };
}

export function validateProductTruth(contract) {
  const errors = [];
  const advisories = [];
  if (contract?.schema !== 1) errors.push('Product Truth must use schema 1.');
  if (!/^task-[a-z0-9-]+$/.test(contract?.task_id ?? '')) errors.push('Product Truth has an invalid task_id.');
  if (!PRODUCT_TRUTH_SOURCE_MODES.includes(contract?.source_mode)) errors.push('Product Truth has an invalid source_mode.');
  for (const field of ['primary_jobs', 'critical_journeys', 'routes', 'visible_affordances', 'states', 'forbidden_inventions', 'unknowns', 'terminology_risks']) if (!Array.isArray(contract?.[field])) errors.push(`Product Truth ${field} must be an array.`);
  if (!(contract?.primary_jobs ?? []).length) errors.push('Product Truth requires at least one primary job.');
  const collections = [contract?.primary_jobs ?? [], contract?.critical_journeys ?? [], contract?.routes ?? [], contract?.visible_affordances ?? [], contract?.states ?? [], contract?.forbidden_inventions ?? [], contract?.unknowns ?? []];
  for (const id of duplicateIds(collections)) errors.push(`Product Truth contains duplicate id ${id}.`);
  for (const collection of collections) for (const item of collection) {
    if (!String(item?.id ?? '').trim()) errors.push('Product Truth records require ids.');
    if (!String(item?.source ?? '').trim()) errors.push(`Product Truth record ${item?.id ?? 'unknown'} requires a source.`);
    if (!PRODUCT_TRUTH_CONFIDENCE.includes(item?.confidence)) errors.push(`Product Truth record ${item?.id ?? 'unknown'} has invalid confidence.`);
    if (!PRODUCT_ITEM_STATUSES.includes(item?.status)) errors.push(`Product Truth record ${item?.id ?? 'unknown'} has invalid status.`);
  }
  const jobIds = new Set((contract?.primary_jobs ?? []).map(item => item.id));
  const journeyIds = new Set((contract?.critical_journeys ?? []).map(item => item.id));
  const routeIds = new Set((contract?.routes ?? []).map(item => item.id));
  const stateIds = new Set((contract?.states ?? []).map(item => item.id));
  const priorities = (contract?.primary_jobs ?? []).map(item => item.priority);
  if (new Set(priorities).size !== priorities.length) errors.push('Product Truth primary job priorities must be unique.');
  for (const job of contract?.primary_jobs ?? []) if (!String(job.statement ?? '').trim()) errors.push(`Primary job ${job.id ?? 'unknown'} requires a statement.`);
  for (const journey of contract?.critical_journeys ?? []) {
    if (!jobIds.has(journey.job_id)) errors.push(`Critical journey ${journey.id} references unknown job ${journey.job_id}.`);
    if (!Array.isArray(journey.steps) || !journey.steps.length) errors.push(`Critical journey ${journey.id} requires at least one step.`);
  }
  for (const affordance of contract?.visible_affordances ?? []) {
    if (!AFFORDANCE_KINDS.includes(affordance.kind)) errors.push(`Affordance ${affordance.id} has an invalid kind.`);
    if (!String(affordance.label ?? '').trim()) errors.push(`Affordance ${affordance.id} requires a label.`);
    if (affordance.route_id && !routeIds.has(affordance.route_id)) errors.push(`Affordance ${affordance.id} references unknown route ${affordance.route_id}.`);
    if (affordance.state_id && !stateIds.has(affordance.state_id)) errors.push(`Affordance ${affordance.id} references unknown state ${affordance.state_id}.`);
    if (['proposed', 'unknown'].includes(affordance.status)) errors.push(`Affordance ${affordance.id} cannot enter the visible allowlist with status ${affordance.status}; keep it in unknowns until a user or product source authorizes it.`);
  }
  if (contract?.representative_task) {
    if (!jobIds.has(contract.representative_task.job_id)) errors.push(`Representative task references unknown job ${contract.representative_task.job_id}.`);
    if (contract.representative_task.journey_id && !journeyIds.has(contract.representative_task.journey_id)) errors.push(`Representative task references unknown journey ${contract.representative_task.journey_id}.`);
    if (contract.representative_task.frequency === 'unknown' && contract.representative_task.risk === 'unknown') advisories.push('Representative task selection has neither frequency nor risk evidence.');
  } else advisories.push('Product Truth has no representative task selection rationale.');
  if (contract?.affordance_policy !== 'allowlist') errors.push('Product Truth affordance_policy must remain allowlist.');
  if (!(contract?.visible_affordances ?? []).length) advisories.push('Product Truth contains no visible affordance allowlist; formal UI generation cannot distinguish omission from invention.');
  if (!(contract?.forbidden_inventions ?? []).length) advisories.push('Product Truth has no task-specific forbidden-invention statements.');
  if (!FIXTURE_MODES.includes(contract?.fixture_policy?.mode)) errors.push('Product Truth fixture policy has an invalid mode.');
  if (contract?.fixture_policy?.shared_across_directions !== true) errors.push('Product Truth fixture policy must keep content shared across directions.');
  return { errors, advisories };
}

export function productTruthIds(contract) {
  return unique(['primary_jobs', 'critical_journeys', 'routes', 'visible_affordances', 'states'].flatMap(field => (contract?.[field] ?? []).map(item => item.id)));
}

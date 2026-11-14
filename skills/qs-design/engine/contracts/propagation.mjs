import { clone, identifier, requiredText, unique } from '../shared/utils.mjs';

export const PROPAGATION_COVERAGE_STATUSES = ['covered', 'deferred', 'not-applicable'];

function decision(value, prefix = 'propagation') {
  return {
    id: value.id ?? identifier(prefix),
    decision: requiredText(value.decision, 'Propagation decision'),
    business_basis: requiredText(value.business_basis ?? value.businessBasis, 'Propagation business basis'),
    propagation_rule: requiredText(value.propagation_rule ?? value.propagationRule, 'Propagation rule'),
    source: requiredText(value.source ?? 'approved-candidate', 'Propagation source')
  };
}

export function createPropagationMap({
  taskId,
  candidateId,
  globalDecisions = [],
  pageDecisions = [],
  preservedBehaviors = [],
  routeCoverage = [],
  exceptions = []
} = {}) {
  if (!/^task-[a-z0-9-]+$/.test(String(taskId ?? ''))) throw new Error('Propagation Map taskId must match task-[a-z0-9-]+.');
  if (!/^candidate-[a-z0-9-]+$/.test(String(candidateId ?? ''))) throw new Error('Propagation Map candidateId must match candidate-[a-z0-9-]+.');
  return {
    schema: 1,
    task_id: taskId,
    candidate_id: candidateId,
    global_decisions: globalDecisions.map(item => decision(item, 'global-decision')),
    page_decisions: pageDecisions.map(item => ({
      route_id: requiredText(item.route_id ?? item.routeId, 'Page decision route_id'),
      decisions: (item.decisions ?? []).map(value => decision(value, 'page-decision'))
    })),
    preserved_behaviors: preservedBehaviors.map(item => ({ id: item.id ?? identifier('behavior'), behavior: requiredText(item.behavior, 'Preserved behavior'), source: requiredText(item.source, 'Preserved behavior source') })),
    route_coverage: routeCoverage.map(item => ({
      route_id: requiredText(item.route_id ?? item.routeId, 'Route coverage route_id'),
      states: unique(item.states),
      status: PROPAGATION_COVERAGE_STATUSES.includes(item.status) ? item.status : 'deferred',
      evidence: clone(item.evidence ?? []),
      reason: String(item.reason ?? '').trim()
    })),
    exceptions: exceptions.map(item => ({ id: item.id ?? identifier('propagation-exception'), scope: requiredText(item.scope, 'Propagation exception scope'), reason: requiredText(item.reason, 'Propagation exception reason') }))
  };
}

export function validatePropagationMap(map, { productTruth = null } = {}) {
  const errors = [];
  const advisories = [];
  if (map?.schema !== 1) errors.push('Propagation Map must use schema 1.');
  if (!/^task-[a-z0-9-]+$/.test(map?.task_id ?? '')) errors.push('Propagation Map has an invalid task_id.');
  if (!/^candidate-[a-z0-9-]+$/.test(map?.candidate_id ?? '')) errors.push('Propagation Map has an invalid candidate_id.');
  for (const field of ['global_decisions', 'page_decisions', 'preserved_behaviors', 'route_coverage', 'exceptions']) if (!Array.isArray(map?.[field])) errors.push(`Propagation Map ${field} must be an array.`);
  const decisionIds = new Set();
  if (![...(map?.global_decisions ?? []), ...(map?.page_decisions ?? []).flatMap(page => page.decisions ?? [])].length) errors.push('Propagation Map requires at least one global or page-specific decision.');
  for (const item of [...(map?.global_decisions ?? []), ...(map?.page_decisions ?? []).flatMap(page => page.decisions ?? [])]) {
    if (decisionIds.has(item.id)) errors.push(`Duplicate propagation decision ${item.id}.`);
    decisionIds.add(item.id);
    for (const field of ['decision', 'business_basis', 'propagation_rule', 'source']) if (!String(item?.[field] ?? '').trim()) errors.push(`Propagation decision ${item?.id ?? 'unknown'} requires ${field}.`);
  }
  const coverageIds = (map?.route_coverage ?? []).map(item => item.route_id);
  if (new Set(coverageIds).size !== coverageIds.length) errors.push('Propagation route coverage must be unique per route.');
  for (const item of map?.route_coverage ?? []) {
    if (!PROPAGATION_COVERAGE_STATUSES.includes(item.status)) errors.push(`Route ${item.route_id} has invalid propagation status.`);
    if (item.status === 'covered' && !(item.evidence ?? []).length) errors.push(`Covered route ${item.route_id} requires evidence.`);
    if (item.status !== 'covered' && !String(item.reason ?? '').trim()) errors.push(`Route ${item.route_id} status ${item.status} requires a reason.`);
  }
  if (productTruth) {
    if (productTruth.task_id !== map?.task_id) errors.push('Propagation Map belongs to a different Product Truth task.');
    const knownRoutes = new Set((productTruth.routes ?? []).map(item => item.id));
    const knownStates = new Set((productTruth.states ?? []).map(item => item.id));
    for (const route of coverageIds) if (!knownRoutes.has(route)) errors.push(`Propagation Map covers unknown route ${route}.`);
    for (const route of knownRoutes) if (!coverageIds.includes(route)) errors.push(`Propagation Map omits Product Truth route ${route}.`);
    for (const page of map?.page_decisions ?? []) if (!knownRoutes.has(page.route_id)) errors.push(`Propagation Map has page decisions for unknown route ${page.route_id}.`);
    for (const coverage of map?.route_coverage ?? []) for (const state of coverage.states ?? []) if (!knownStates.has(state)) errors.push(`Propagation route ${coverage.route_id} references unknown state ${state}.`);
  }
  if ((map?.route_coverage ?? []).length > 1 && !(map?.page_decisions ?? []).length) advisories.push('Propagation Map has multiple routes but no page-specific decisions; verify that global decisions are not becoming a repeated template.');
  return { errors: unique(errors), advisories: unique(advisories) };
}

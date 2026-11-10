import { clone } from '../shared/utils.mjs';
import { validateContentContract } from '../content/contract.mjs';

const DNA_FIELDS = ['entities', 'relations', 'flows', 'state_transitions', 'value_moments', 'risk_and_trust', 'temporal_rhythm', 'frequency', 'content_morphology', 'cultural_context'];

export function createBusinessModel({
  businessDna = {},
  taskGraph = {},
  contentGraph = {},
  stateGraph = {},
  actionContracts = [],
  platformRequirements = []
} = {}) {
  const dna = Object.fromEntries(DNA_FIELDS.map(field => [field, field === 'frequency' ? clone(businessDna[field] ?? {}) : clone(businessDna[field] ?? [])]));
  return {
    schema: 1,
    business_dna: dna,
    task_graph: clone(taskGraph),
    content_graph: clone(contentGraph),
    state_graph: clone(stateGraph),
    action_contracts: clone(actionContracts),
    platform_requirements: clone(platformRequirements)
  };
}

export function validateBusinessModel(model) {
  const errors = [];
  const advisories = [];
  if (model?.schema !== 1) errors.push('Business model must use schema 1.');
  for (const field of DNA_FIELDS) {
    const value = model?.business_dna?.[field];
    if (field === 'frequency' ? !value || typeof value !== 'object' || Array.isArray(value) : !Array.isArray(value)) errors.push(`business_dna.${field} has an invalid type.`);
  }
  if (!(model?.business_dna?.entities ?? []).length) errors.push('Business model needs at least one core entity.');
  if (!(model?.business_dna?.value_moments ?? []).length) advisories.push('No value moment is recorded; art direction may drift toward generic styling.');
  if (!(model?.business_dna?.risk_and_trust ?? []).length) advisories.push('No risk or trust condition is recorded; confirm that the task truly has none.');
  if ((model?.business_dna?.entities ?? []).length > 1 && !(model?.business_dna?.relations ?? []).length) advisories.push('Multiple business entities have no recorded relations.');
  if (!(model?.business_dna?.content_morphology ?? []).length) advisories.push('Content morphology is unknown; topology may default to a generic container layout.');
  if (!Object.keys(model?.task_graph ?? {}).length) errors.push('Task graph is empty.');
  if (Array.isArray(model?.content_graph?.entries)) {
    const content = validateContentContract({ schema: model.content_graph.schema ?? 1, entries: model.content_graph.entries, required_states: model.content_graph.required_states ?? [] });
    errors.push(...content.errors.map(message => `content_graph: ${message}`));
    advisories.push(...content.advisories.map(message => `content_graph: ${message}`));
  }
  if (!Object.keys(model?.state_graph ?? {}).length) advisories.push('State graph is empty; interactive results cannot be verified.');
  if (!(model?.action_contracts ?? []).length) advisories.push('No action contracts are recorded.');
  const actionIds = new Set();
  for (const [index, action] of (model?.action_contracts ?? []).entries()) {
    if (!action.id || !action.result) errors.push(`Action contract ${index} requires id and result.`);
    if (actionIds.has(action.id)) errors.push(`Duplicate action contract id: ${action.id}.`);
    actionIds.add(action.id);
    if (action.irreversible && !action.confirmation) advisories.push(`Irreversible action ${action.id} has no confirmation contract.`);
    if (action.retryable && action.idempotent == null) advisories.push(`Retryable action ${action.id} does not declare idempotency.`);
    if (!action.cancel && !action.recovery) advisories.push(`Action ${action.id} has no cancel or recovery contract.`);
  }
  if (new Set(model?.platform_requirements ?? []).size !== (model?.platform_requirements ?? []).length) errors.push('Platform requirements must be unique.');
  return { errors, advisories };
}

export function traceAction(model, actionId) {
  return (model?.action_contracts ?? []).find(action => action.id === actionId) ?? null;
}

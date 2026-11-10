import { clone, unique } from '../shared/utils.mjs';

export const CONTENT_PURPOSES = ['recognition', 'decision', 'action', 'constraint', 'risk', 'recovery'];
export const CONTENT_CRITICALITY = ['critical', 'supporting', 'optional'];
export const CONTENT_AUDIENCES = ['all', 'most', 'some'];
export const CONTENT_TIMINGS = ['persistent', 'before-action', 'on-error', 'first-run', 'on-demand'];
export const CONTENT_DELIVERIES = ['visible', 'inline-hint', 'details', 'popover', 'tooltip', 'contextual-tip'];
export const SUPPLEMENTAL_CONTENT_KINDS = ['helper', 'instruction', 'constraint', 'risk', 'recovery', 'definition', 'onboarding'];

const includes = (values, value) => values.includes(value);
const text = value => String(value ?? '').trim();

export function createContentContract({ entries = [], requiredStates = [], required_states = [] } = {}) {
  return {
    schema: 1,
    entries: clone(entries),
    required_states: unique([...requiredStates, ...required_states])
  };
}

export function validateContentContract(contract) {
  const errors = [];
  const advisories = [];
  if (contract?.schema !== 1) errors.push('Content contract must use schema 1.');
  if (!Array.isArray(contract?.entries)) errors.push('Content contract entries must be an array.');
  if (!Array.isArray(contract?.required_states)) errors.push('Content contract required_states must be an array.');
  if (Array.isArray(contract?.required_states) && new Set(contract.required_states).size !== contract.required_states.length) errors.push('Content contract required_states must be unique.');

  const keys = new Set();
  for (const [index, entry] of (contract?.entries ?? []).entries()) {
    const label = `Content entry ${entry?.key || index}`;
    if (!text(entry?.key)) errors.push(`${label} requires a key.`);
    else if (keys.has(entry.key)) errors.push(`Duplicate content key: ${entry.key}.`);
    else keys.add(entry.key);
    if (!text(entry?.source)) errors.push(`${label} requires a source.`);
    if (!text(entry?.owner)) errors.push(`${label} requires an owner.`);
    if (!text(entry?.kind)) errors.push(`${label} requires a kind.`);
    if (entry?.kind === 'claim' && !(entry?.evidence ?? []).length) errors.push(`${label} is a claim without supporting evidence.`);

    const supplemental = SUPPLEMENTAL_CONTENT_KINDS.includes(entry?.kind) || CONTENT_DELIVERIES.includes(entry?.delivery);
    if (!supplemental) continue;
    if (!includes(CONTENT_PURPOSES, entry?.purpose)) errors.push(`${label} requires a valid purpose.`);
    if (!includes(CONTENT_CRITICALITY, entry?.criticality)) errors.push(`${label} requires a valid criticality.`);
    if (!includes(CONTENT_AUDIENCES, entry?.audience)) errors.push(`${label} requires a valid audience.`);
    if (!includes(CONTENT_TIMINGS, entry?.timing)) errors.push(`${label} requires a valid timing.`);
    if (!includes(CONTENT_DELIVERIES, entry?.delivery)) errors.push(`${label} requires a valid delivery.`);
    if (!text(entry?.irreducible_fact)) errors.push(`${label} must state the irreducible fact that would be lost if removed.`);
    if (!text(entry?.structure_attempt)) errors.push(`${label} must record why structure, hierarchy, state or control affordance cannot carry the meaning alone.`);

    if (entry?.criticality === 'critical' && !['visible', 'inline-hint'].includes(entry?.delivery)) {
      errors.push(`${label} is critical and must remain visible at the decision point.`);
    }
    if (entry?.audience === 'all' && ['details', 'popover', 'tooltip', 'contextual-tip'].includes(entry?.delivery)) {
      errors.push(`${label} is needed by everyone and cannot rely on a hidden or first-run disclosure.`);
    }
    if (entry?.delivery === 'tooltip') {
      if (entry?.criticality !== 'optional') errors.push(`${label} uses a tooltip for information that is not optional.`);
      if (entry?.timing !== 'on-demand') errors.push(`${label} tooltip timing must be on-demand.`);
      if (entry?.interactive === true) errors.push(`${label} tooltip cannot contain interactive content; use details or a popover.`);
    }
    if (entry?.delivery === 'contextual-tip' && entry?.timing !== 'first-run') advisories.push(`${label} contextual tip is not limited to a first-run or newly relevant moment.`);
    if (entry?.delivery === 'visible' && entry?.criticality === 'optional' && entry?.audience === 'some') {
      advisories.push(`${label} is optional for a minority but permanently visible; verify that details or on-demand disclosure would preserve clarity.`);
    }
    if (entry?.purpose === 'risk' && entry?.timing === 'on-error') errors.push(`${label} explains risk only after failure; expose it before the action.`);
  }
  return { errors, advisories };
}

export function allowedContentDeliveries({ criticality, audience, timing, interactive = false, length = 'short', taskRequired = false } = {}) {
  if (taskRequired || criticality === 'critical' || audience === 'all') {
    return { allowed: ['visible', 'inline-hint'], reason: 'Task-required, critical or universal information must be perceivable at the decision point.' };
  }
  if (interactive || length === 'long') {
    return { allowed: ['details', 'popover'], reason: 'Long or interactive supporting content needs a focusable disclosure surface, not a tooltip.' };
  }
  if (criticality === 'optional' && audience === 'some' && timing === 'on-demand') {
    return { allowed: ['details', 'popover', 'tooltip'], reason: 'A tooltip is eligible only because the information is short, optional, minority-needed and on-demand.' };
  }
  if (timing === 'first-run') {
    return { allowed: ['contextual-tip', 'details'], reason: 'Novel behavior may use a contextual tip only at the relevant first-run moment.' };
  }
  return { allowed: ['inline-hint', 'details', 'popover'], reason: 'Supporting information should appear at the point of need or behind an explicit disclosure.' };
}

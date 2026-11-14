import { clone, identifier, requiredText, unique } from '../shared/utils.mjs';
import { normalizeSource, normalizeTextList } from './shared.mjs';

export const REFERENCE_FACETS = ['layout', 'typography', 'imagery', 'data-relationship', 'shape', 'material', 'motion', 'state', 'content-principle', 'interaction-mechanism'];
export const REFERENCE_LICENSE = ['not-required-observation', 'verified', 'restricted', 'unknown'];

function normalizeReference(value) {
  return {
    id: value.id ?? identifier('reference'),
    label: requiredText(value.label ?? value.uri ?? value.ref, 'Reference label'),
    ref: requiredText(value.ref ?? value.uri, 'Reference ref'),
    source: normalizeSource(value.source ?? 'external-reference'),
    license_status: REFERENCE_LICENSE.includes(value.license_status) ? value.license_status : 'unknown',
    notes: String(value.notes ?? '').trim()
  };
}

function normalizeMechanism(value) {
  return {
    id: value.id ?? identifier('mechanism'),
    source_ids: unique(value.source_ids ?? value.sourceIds),
    facets: unique(value.facets),
    observed_mechanism: requiredText(value.observed_mechanism ?? value.observedMechanism, 'Observed reference mechanism'),
    user_effect: requiredText(value.user_effect ?? value.userEffect, 'Reference user effect'),
    business_need: requiredText(value.business_need ?? value.businessNeed, 'Reference business need'),
    local_rule: requiredText(value.local_rule ?? value.localRule, 'Reference local rule'),
    do_not_copy: normalizeTextList(value.do_not_copy ?? value.doNotCopy),
    constraints: normalizeTextList(value.constraints),
    independent_basis: normalizeTextList(value.independent_basis ?? value.independentBasis)
  };
}

export function createReferenceSynthesis({ taskId, researchRequired = false, references = [], mechanisms = [] } = {}) {
  if (!/^task-[a-z0-9-]+$/.test(String(taskId ?? ''))) throw new Error('Reference Synthesis taskId must match task-[a-z0-9-]+.');
  return {
    schema: 1,
    task_id: taskId,
    research_required: Boolean(researchRequired),
    references: references.map(normalizeReference),
    mechanisms: mechanisms.map(normalizeMechanism)
  };
}

export function validateReferenceSynthesis(contract) {
  const errors = [];
  const advisories = [];
  if (contract?.schema !== 1) errors.push('Reference Synthesis must use schema 1.');
  if (!/^task-[a-z0-9-]+$/.test(contract?.task_id ?? '')) errors.push('Reference Synthesis has an invalid task_id.');
  if (!Array.isArray(contract?.references) || !Array.isArray(contract?.mechanisms)) errors.push('Reference Synthesis references and mechanisms must be arrays.');
  if (contract?.research_required && !(contract?.references ?? []).length) errors.push('Reference Synthesis requires at least one source when research_required is true.');
  const referenceIds = new Set();
  for (const source of contract?.references ?? []) {
    if (referenceIds.has(source.id)) errors.push(`Duplicate reference id ${source.id}.`);
    referenceIds.add(source.id);
    if (!String(source.ref ?? '').trim()) errors.push(`Reference ${source.id ?? 'unknown'} requires provenance.`);
    if (!REFERENCE_LICENSE.includes(source.license_status)) errors.push(`Reference ${source.id ?? 'unknown'} has invalid license status.`);
  }
  const mechanismIds = new Set();
  for (const mechanism of contract?.mechanisms ?? []) {
    if (mechanismIds.has(mechanism.id)) errors.push(`Duplicate reference mechanism ${mechanism.id}.`);
    mechanismIds.add(mechanism.id);
    if (!(mechanism.source_ids ?? []).length) errors.push(`Reference mechanism ${mechanism.id} requires at least one source.`);
    for (const sourceId of mechanism.source_ids ?? []) if (!referenceIds.has(sourceId)) errors.push(`Reference mechanism ${mechanism.id} references unknown source ${sourceId}.`);
    for (const facet of mechanism.facets ?? []) if (!REFERENCE_FACETS.includes(facet)) errors.push(`Reference mechanism ${mechanism.id} has unknown facet ${facet}.`);
    if (!(mechanism.facets ?? []).length) errors.push(`Reference mechanism ${mechanism.id} requires at least one observed facet.`);
    if (!(mechanism.do_not_copy ?? []).length) errors.push(`Reference mechanism ${mechanism.id} must state what unique expression will not be copied.`);
    if (!(mechanism.independent_basis ?? []).length) advisories.push(`Reference mechanism ${mechanism.id} has no independent business, platform or second-source basis.`);
    if ((mechanism.facets ?? []).length >= 4 && (mechanism.source_ids ?? []).length === 1) advisories.push(`Reference mechanism ${mechanism.id} draws four or more facets from one source; split or independently derive it to avoid page-level imitation.`);
  }
  return { errors: unique(errors), advisories: unique(advisories) };
}

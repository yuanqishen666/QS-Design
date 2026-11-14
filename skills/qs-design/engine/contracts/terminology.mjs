import { clone, requiredText, unique } from '../shared/utils.mjs';
import { normalizeEvidenceCheck, normalizeSource, normalizeTextList, validateEvidenceCheck } from './shared.mjs';

export const TERMINOLOGY_RISK_STATUSES = ['reviewed-none', 'terms-present', 'unknown'];
export const TERMINOLOGY_ITEM_STATUSES = ['confirmed', 'observed', 'proposed'];
export const TERMINOLOGY_RESOLUTIONS = ['rename', 'structure', 'visible-definition', 'source-term', 'unresolved'];

function normalizeTerm(item) {
  const risk = ['none', 'low', 'medium', 'high'].includes(item.ambiguity_risk) ? item.ambiguity_risk : 'unknown';
  return {
    concept_id: requiredText(item.concept_id ?? item.conceptId, 'Terminology concept_id'),
    intended_meaning: requiredText(item.intended_meaning ?? item.intendedMeaning, 'Terminology intended meaning'),
    label: requiredText(item.label, 'Terminology label'),
    source: normalizeSource(item.source),
    status: TERMINOLOGY_ITEM_STATUSES.includes(item.status) ? item.status : 'proposed',
    ambiguity_risk: risk,
    alternate_interpretations: normalizeTextList(item.alternate_interpretations ?? item.alternateInterpretations),
    disallowed_synonyms: normalizeTextList(item.disallowed_synonyms ?? item.disallowedSynonyms),
    resolution: TERMINOLOGY_RESOLUTIONS.includes(item.resolution) ? item.resolution : 'unresolved',
    label_only_check: normalizeEvidenceCheck('label-only-prediction', item.label_only_check ?? item.labelOnlyCheck ?? { reason: 'Label-only comprehension has not been checked.' })
  };
}

export function createTerminologyContract({ taskId, riskStatus = 'unknown', reviewSource, reviewEvidence = [], entries = [] } = {}) {
  if (!/^task-[a-z0-9-]+$/.test(String(taskId ?? ''))) throw new Error('Terminology Contract taskId must match task-[a-z0-9-]+.');
  if (!TERMINOLOGY_RISK_STATUSES.includes(riskStatus)) throw new Error(`Terminology riskStatus must be one of: ${TERMINOLOGY_RISK_STATUSES.join(', ')}.`);
  return { schema: 1, task_id: taskId, risk_status: riskStatus, review_source: requiredText(reviewSource, 'Terminology review source'), review_evidence: clone(reviewEvidence), entries: entries.map(normalizeTerm) };
}

export function validateTerminologyContract(contract, { productTruth = null } = {}) {
  const errors = [];
  const advisories = [];
  const outcomes = [];
  if (contract?.schema !== 1) errors.push('Terminology Contract must use schema 1.');
  if (!/^task-[a-z0-9-]+$/.test(contract?.task_id ?? '')) errors.push('Terminology Contract has an invalid task_id.');
  if (!TERMINOLOGY_RISK_STATUSES.includes(contract?.risk_status)) errors.push('Terminology Contract has an invalid risk_status.');
  if (!String(contract?.review_source ?? '').trim()) errors.push('Terminology Contract requires review_source.');
  if (!Array.isArray(contract?.review_evidence)) errors.push('Terminology Contract review_evidence must be an array.');
  if (!Array.isArray(contract?.entries)) errors.push('Terminology Contract entries must be an array.');
  if (contract?.risk_status === 'terms-present' && !(contract?.entries ?? []).length) errors.push('Terminology risk_status terms-present requires entries.');
  if (contract?.risk_status === 'reviewed-none' && (contract?.entries ?? []).length) errors.push('Terminology risk_status reviewed-none cannot contain entries.');
  if (contract?.risk_status === 'unknown') outcomes.push({ id: 'terminology-review', status: 'unknown', evidence: [], source: 'not-run', reason: 'Terminology risk review has not been completed.' });
  const concepts = new Set();
  for (const item of contract?.entries ?? []) {
    if (concepts.has(item.concept_id)) errors.push(`Duplicate terminology concept ${item.concept_id}.`);
    concepts.add(item.concept_id);
    if (!TERMINOLOGY_ITEM_STATUSES.includes(item.status)) errors.push(`Terminology concept ${item.concept_id} has an invalid status.`);
    if (!['none', 'low', 'medium', 'high', 'unknown'].includes(item.ambiguity_risk)) errors.push(`Terminology concept ${item.concept_id} has an invalid ambiguity risk.`);
    if (!TERMINOLOGY_RESOLUTIONS.includes(item.resolution)) errors.push(`Terminology concept ${item.concept_id} has an invalid resolution.`);
    if (item.disallowed_synonyms?.includes(item.label)) errors.push(`Terminology label ${item.label} is also listed as a disallowed synonym.`);
    if (['medium', 'high'].includes(item.ambiguity_risk) && item.resolution === 'unresolved') errors.push(`Terminology concept ${item.concept_id} has material ambiguity without a resolution.`);
    if (item.alternate_interpretations?.length && item.resolution === 'visible-definition') advisories.push(`Terminology concept ${item.concept_id} relies on a visible definition; verify that renaming or structure cannot resolve it first.`);
    errors.push(...validateEvidenceCheck(item.label_only_check, `Terminology label-only check ${item.concept_id}`));
    outcomes.push({ concept_id: item.concept_id, label: item.label, ...clone(item.label_only_check) });
  }
  if (productTruth) {
    if (productTruth.task_id !== contract?.task_id) errors.push('Terminology Contract belongs to a different Product Truth task.');
    const expected = new Set(productTruth.terminology_risks ?? []);
    for (const concept of expected) if (!concepts.has(concept) && contract?.risk_status !== 'reviewed-none') advisories.push(`Product Truth terminology risk ${concept} is not represented in the Terminology Contract.`);
  }
  return { errors: unique(errors), advisories: unique(advisories), outcomes };
}

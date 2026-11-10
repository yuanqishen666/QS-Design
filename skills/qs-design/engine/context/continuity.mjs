import { clone, identifier, requiredText } from '../shared/utils.mjs';

export const SOURCE_KINDS = ['internal-product', 'official-brand', 'user-approved-parent', 'external-reference', 'generated-artifact', 'research-evidence'];
export const SOURCE_ROLES = ['business-evidence', 'continuity-evidence', 'problem-evidence', 'brand-authority', 'mechanism-reference', 'generated-output'];
export const CONTINUITY_LEVELS = ['invariants', 'preserve', 'adapt', 'open', 'prohibited'];
const CONFIDENCE_LEVELS = ['high', 'medium', 'low', 'unknown'];

export function continuityItem(claim, { id, source, confidence = 'high', reason = null } = {}) {
  return { id: id ?? identifier('continuity'), claim: requiredText(claim, 'Continuity claim'), source: requiredText(source, 'Continuity source'), confidence, reason };
}

export function createContinuityContract({ invariants = [], preserve = [], adapt = [], open = [], prohibited = [], sources = [] } = {}) {
  const normalize = values => values.map(value => typeof value === 'string' ? continuityItem(value, { source: 'user' }) : clone(value));
  return {
    schema: 1,
    invariants: normalize(invariants),
    preserve: normalize(preserve),
    adapt: normalize(adapt),
    open: normalize(open),
    prohibited: normalize(prohibited),
    sources: clone(sources)
  };
}

export function validateContinuityContract(contract) {
  const errors = [];
  if (contract?.schema !== 1) errors.push('Continuity contract must use schema 1.');
  const seen = new Map();
  for (const level of CONTINUITY_LEVELS) {
    if (!Array.isArray(contract?.[level])) { errors.push(`${level} must be an array.`); continue; }
    for (const item of contract[level]) {
      if (!item.id || !item.claim || !item.source) errors.push(`${level} entries require id, claim and source.`);
      if (!CONFIDENCE_LEVELS.includes(item.confidence)) errors.push(`${level} entry ${item.id ?? 'unknown'} has an invalid confidence.`);
      const normalized = String(item.claim ?? '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
      if (seen.has(normalized) && seen.get(normalized) !== level) errors.push(`Continuity claim appears in both ${seen.get(normalized)} and ${level}: ${item.claim}`);
      seen.set(normalized, level);
    }
  }
  const sourceIds = new Set();
  for (const source of contract?.sources ?? []) {
    if (!source.id) errors.push('Continuity sources require an id.');
    if (sourceIds.has(source.id)) errors.push(`Duplicate continuity source id: ${source.id}.`);
    sourceIds.add(source.id);
    if (!SOURCE_KINDS.includes(source.kind)) errors.push(`Unknown source kind: ${source.kind}.`);
    if (!SOURCE_ROLES.includes(source.role)) errors.push(`Unknown source role: ${source.role}.`);
  }
  return errors;
}

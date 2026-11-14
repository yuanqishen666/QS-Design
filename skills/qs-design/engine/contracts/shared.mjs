import { clone, requiredText, unique } from '../shared/utils.mjs';

export const CONTRACT_EVIDENCE_STATUSES = ['finding', 'clean', 'unknown', 'not-applicable'];
export const CONTRACT_EVIDENCE_SOURCES = ['human-review', 'runtime', 'rendered-artifact', 'accessibility-tree', 'computed-layout', 'assertion-report', 'not-run'];

export function normalizeSource(value, fallback = 'user') {
  return requiredText(value ?? fallback, 'Contract source');
}

export function normalizeTextList(values = []) {
  return unique((values ?? []).map(value => String(value ?? '').trim()).filter(Boolean));
}

export function normalizeEvidenceCheck(id, value = {}) {
  const input = typeof value === 'string' ? { status: value } : value ?? {};
  return {
    id: requiredText(input.id ?? id, 'Evidence check id'),
    status: CONTRACT_EVIDENCE_STATUSES.includes(input.status) ? input.status : 'unknown',
    evidence: clone(Array.isArray(input.evidence) ? input.evidence : input.evidence == null ? [] : [input.evidence]),
    source: CONTRACT_EVIDENCE_SOURCES.includes(input.source) ? input.source : 'not-run',
    reason: String(input.reason ?? '').trim()
  };
}

export function validateEvidenceCheck(check, label = 'Evidence check') {
  const errors = [];
  if (!String(check?.id ?? '').trim()) errors.push(`${label} requires an id.`);
  if (!CONTRACT_EVIDENCE_STATUSES.includes(check?.status)) errors.push(`${label} has an invalid status.`);
  if (!Array.isArray(check?.evidence)) errors.push(`${label} evidence must be an array.`);
  if (!CONTRACT_EVIDENCE_SOURCES.includes(check?.source)) errors.push(`${label} has an invalid evidence source.`);
  if (['finding', 'clean', 'not-applicable'].includes(check?.status) && !(check?.evidence ?? []).length) errors.push(`${label} cannot claim ${check.status} without evidence.`);
  if (check?.status === 'unknown' && !(check?.evidence ?? []).length && !String(check?.reason ?? '').trim()) errors.push(`${label} must explain why it remains unknown.`);
  if (check?.source === 'not-run' && check?.status !== 'unknown') errors.push(`${label} cannot claim ${check.status} with source not-run.`);
  return errors;
}

export function duplicateIds(collections = []) {
  const seen = new Set();
  const duplicates = new Set();
  for (const item of collections.flat()) {
    const id = item?.id;
    if (!id) continue;
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  return [...duplicates];
}

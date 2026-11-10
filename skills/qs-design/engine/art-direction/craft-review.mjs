import { clone } from '../shared/utils.mjs';

export const CRAFT_CHECKS = [
  'composition-25-percent',
  'grayscale-hierarchy',
  'logo-removal-recognition',
  'image-removal-structure',
  'real-content-stress',
  'bilingual-and-font-fallback',
  'crop-light-and-text-placement',
  'surface-edge-and-depth',
  'light-dark-high-contrast',
  'font-scale-and-minimum-window',
  'dynamic-content-states',
  'repeated-use-fatigue'
];

export const EVIDENCE_STATUSES = ['finding', 'clean', 'unknown', 'not-applicable'];

export function createCraftReview({ target = 'direction', checks = {} } = {}) {
  return {
    schema: 1,
    target,
    checks: Object.fromEntries(CRAFT_CHECKS.map(id => [id, clone(checks[id] ?? { status: 'unknown', evidence: [], reason: '' })]))
  };
}

export function validateCraftReview(review) {
  const errors = [];
  const outcomes = [];
  if (review?.schema !== 1) errors.push('Craft review must use schema 1.');
  for (const id of CRAFT_CHECKS) {
    const check = review?.checks?.[id];
    if (!check) { errors.push(`Craft review is missing ${id}.`); continue; }
    if (!EVIDENCE_STATUSES.includes(check.status)) errors.push(`Craft review ${id} has an invalid status.`);
    const evidence = Array.isArray(check.evidence) ? check.evidence.filter(Boolean) : [];
    if (['clean', 'finding'].includes(check.status) && !evidence.length) errors.push(`Craft review ${id} requires evidence for ${check.status}.`);
    if (check.status === 'not-applicable' && !String(check.reason ?? '').trim()) errors.push(`Craft review ${id} requires a not-applicable reason.`);
    outcomes.push({ id, status: check.status, evidence, reason: check.reason ?? '' });
  }
  return { errors, outcomes };
}

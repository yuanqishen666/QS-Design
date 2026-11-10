import { clone } from '../shared/utils.mjs';
import { EVIDENCE_STATUSES } from './craft-review.mjs';

export const GENERALITY_TESTS = ['content-substitution', 'logo-removal-recognition', 'business-non-transferability'];

export function createGeneralityTests(values = {}) {
  return {
    schema: 1,
    tests: Object.fromEntries(GENERALITY_TESTS.map(id => [id, clone(values[id] ?? { status: 'unknown', evidence: [], reason: '' })]))
  };
}

export function validateGeneralityTests(contract) {
  const errors = [];
  const outcomes = [];
  if (contract?.schema !== 1) errors.push('Generality tests must use schema 1.');
  for (const id of GENERALITY_TESTS) {
    const test = contract?.tests?.[id];
    if (!test) { errors.push(`Generality tests are missing ${id}.`); continue; }
    if (!EVIDENCE_STATUSES.includes(test.status)) errors.push(`Generality test ${id} has an invalid status.`);
    const evidence = Array.isArray(test.evidence) ? test.evidence.filter(Boolean) : [];
    if (['clean', 'finding'].includes(test.status) && !evidence.length) errors.push(`Generality test ${id} requires evidence for ${test.status}.`);
    if (test.status === 'not-applicable' && !String(test.reason ?? '').trim()) errors.push(`Generality test ${id} requires a not-applicable reason.`);
    outcomes.push({ id, status: test.status, evidence, reason: test.reason ?? '' });
  }
  return { errors, outcomes };
}

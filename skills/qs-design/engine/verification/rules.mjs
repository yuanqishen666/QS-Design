import { requiredText } from '../shared/utils.mjs';

export const VERIFICATION_DIMENSIONS = [
  'business-consistency',
  'continuity',
  'business-specificity',
  'visual-craft',
  'content-quality',
  'interaction-accessibility',
  'platform-performance',
  'prototype-implementation',
  'maintainability',
  'context-compliance'
];

export function createVerificationRule({ id, dimension, applies = () => true, evaluate } = {}) {
  if (!VERIFICATION_DIMENSIONS.includes(dimension)) throw new Error(`Unknown verification dimension: ${dimension}.`);
  if (typeof applies !== 'function' || typeof evaluate !== 'function') throw new Error('Verification rules require applies and evaluate functions.');
  return Object.freeze({ id: requiredText(id, 'Rule id'), dimension, applies, evaluate });
}

export async function runVerificationRules(rules, input) {
  const findings = [];
  for (const rule of rules ?? []) {
    let applies;
    try { applies = await rule.applies(input); }
    catch (error) {
      findings.push({ status: 'unknown', dimension: rule.dimension, severity: 'major', target: rule.id, evidence: [`Rule applicability failed: ${error.message}`], confidence: 'unknown', impact: 'The check could not determine whether it applies.', correction_direction: 'Repair the rule input or run the check manually.' });
      continue;
    }
    if (!applies) {
      findings.push({ status: 'not-applicable', dimension: rule.dimension, severity: 'advisory', target: rule.id, evidence: ['Rule declared itself not applicable to this target.'], confidence: 'high', impact: '', correction_direction: '' });
      continue;
    }
    try {
      const result = await rule.evaluate(input);
      findings.push(...(Array.isArray(result) ? result : [result]).filter(Boolean).map(item => ({ ...item, dimension: item.dimension ?? rule.dimension, target: item.target ?? rule.id })));
    } catch (error) {
      findings.push({ status: 'unknown', dimension: rule.dimension, severity: 'major', target: rule.id, evidence: [`Rule evaluation failed: ${error.message}`], confidence: 'unknown', impact: 'The target remains unverified.', correction_direction: 'Repair the runner or verify manually.' });
    }
  }
  return findings;
}

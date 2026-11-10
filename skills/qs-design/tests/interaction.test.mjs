import test from 'node:test';
import assert from 'node:assert/strict';
import { createInteractionProbe, evaluateInteractionProbe } from '../engine/interaction/probe.mjs';

const contract = {
  core_action: 'reconcile', semantic_model: 'transfer', purpose: 'manipulation', motion_class: 'productive', frequency: 'high',
  continuous_mapping: 'pointer distance maps to reconciliation preview', commit: 'release beyond confirmed threshold', cancel: 'return before threshold',
  interruption: 'lost capture cancels', reduced_motion: 'direct state preview', alternate_input: 'buttons and keyboard', platform_fallback: 'standard confirmation', blocks_next_action: false
};

const cleanEvidence = Object.fromEntries(['new_input_takeover', 'reduced_motion', 'alternate_input', 'platform_runtime', 'low_performance', 'fatigue'].map(id => [id, { status: 'clean', source: 'automated-test', evidence: [`${id} verified`] }]));

test('interaction probe requires twenty trials and independent accessibility evidence', () => {
  const incomplete = evaluateInteractionProbe(createInteractionProbe({ id: 'probe-short', contract, trials: Array.from({ length: 3 }, () => ({ completed: true })), evidence: cleanEvidence }));
  assert.equal(incomplete.conclusion, 'unknown');
  const complete = evaluateInteractionProbe(createInteractionProbe({ id: 'probe-complete', contract, trials: Array.from({ length: 20 }, () => ({ completed: true })), evidence: cleanEvidence }));
  assert.equal(complete.conclusion, 'suitable');
  assert.equal('score' in complete, false);
});

test('reduced-motion failure requires degradation rather than a numeric gate', () => {
  const evidence = structuredClone(cleanEvidence);
  evidence.reduced_motion = { status: 'finding', source: 'assistive-tech-session', evidence: ['Outcome cannot be completed without animation.'] };
  const result = evaluateInteractionProbe(createInteractionProbe({ id: 'probe-motion', contract, trials: Array.from({ length: 20 }, () => ({ completed: true })), evidence }));
  assert.equal(result.conclusion, 'needs-degradation');
});

test('interaction probe never accepts unsupported clean evidence', () => {
  const evidence = structuredClone(cleanEvidence);
  evidence.fatigue = { status: 'clean', evidence: ['claimed without a source'] };
  const result = evaluateInteractionProbe(createInteractionProbe({ id: 'probe-unproven', contract, trials: Array.from({ length: 20 }, () => ({ completed: true })), evidence }));
  assert.equal(result.conclusion, 'unknown');
  assert.equal(result.evidence.find(item => item.id === 'fatigue').status, 'unknown');
});

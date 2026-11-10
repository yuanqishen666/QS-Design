import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeEvaluation } from '../evals/run.mjs';

test('evaluation keeps dimensions and reviewer disagreement separate', () => {
  const report = summarizeEvaluation([
    { system: 'qs-v3', system_version: '3.1.0', task_id: 'a', corpus_revision: '1', executed_at: '2026-11-03T00:00:00Z', evidence: ['run-a'], metrics: { task_completion: 1, fatigue: 2 }, reviewer_records: [{ reviewer: 'r1', visual_art_direction: 4 }] },
    { system: 'qs-v3', system_version: '3.1.0', task_id: 'b', corpus_revision: '1', executed_at: '2026-11-03T00:00:00Z', evidence: ['run-b'], metrics: { task_completion: 0, fatigue: 4 }, reviewer_records: [{ reviewer: 'r2', visual_art_direction: 2 }] }
  ]);
  assert.equal(report.systems['qs-v3@3.1.0'].dimensions.task_completion.mean, 0.5);
  assert.equal(report.systems['qs-v3@3.1.0'].reviewer_records.length, 2);
  assert.equal(report.corpus_revision, '1');
  assert.equal(report.comparability.complete_task_overlap, true);
  assert.equal(report.composite_score, null);
});

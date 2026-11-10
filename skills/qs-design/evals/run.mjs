#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function numericSummary(values) {
  const numbers = values.filter(Number.isFinite);
  if (!numbers.length) return null;
  const mean = numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
  const variance = numbers.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / numbers.length;
  return { n: numbers.length, unknown_count: values.length - numbers.length, mean, min: Math.min(...numbers), max: Math.max(...numbers), standard_deviation: Math.sqrt(variance) };
}

export function validateEvaluationRows(rows) {
  const errors = [];
  if (!Array.isArray(rows) || !rows.length) return ['Evaluation rows must be a non-empty array.'];
  const revisions = new Set();
  const records = new Set();
  for (const [index, row] of rows.entries()) {
    if (!row.system || !row.system_version || !row.task_id || !row.corpus_revision || !row.executed_at || !row.metrics || typeof row.metrics !== 'object' || !Array.isArray(row.evidence)) errors.push(`Row ${index} requires system/version, task_id, corpus revision, execution time, metrics and evidence.`);
    if (Number.isNaN(new Date(row.executed_at).getTime())) errors.push(`Row ${index} has an invalid executed_at.`);
    if (!(row.evidence ?? []).length) errors.push(`Row ${index} requires at least one evidence reference.`);
    if (!Object.keys(row.metrics ?? {}).length) errors.push(`Row ${index} has no measured dimensions.`);
    for (const [dimension, value] of Object.entries(row.metrics ?? {})) {
      const explicitUnknown = value && typeof value === 'object' && value.status === 'unknown' && String(value.reason ?? '').trim();
      if (!Number.isFinite(value) && !explicitUnknown) errors.push(`Row ${index} metric ${dimension} must be numeric or an explicit unknown with a reason.`);
    }
    revisions.add(row.corpus_revision);
    const recordKey = `${row.system}@${row.system_version}:${row.task_id}:${row.executed_at}`;
    if (records.has(recordKey)) errors.push(`Duplicate evaluation record: ${recordKey}.`);
    records.add(recordKey);
  }
  if (revisions.size > 1) errors.push('Evaluation rows use different corpus revisions and are not directly comparable.');
  return errors;
}

export function summarizeEvaluation(rows) {
  const errors = validateEvaluationRows(rows);
  if (errors.length) throw new Error(errors.join(' '));
  const systems = {};
  for (const row of rows ?? []) {
    const systemKey = `${row.system}@${row.system_version}`;
    systems[systemKey] ??= { tasks: new Set(), dimensions: {}, reviewer_records: [], evidence_records: [] };
    systems[systemKey].tasks.add(row.task_id);
    for (const [dimension, value] of Object.entries(row.metrics)) {
      systems[systemKey].dimensions[dimension] ??= [];
      systems[systemKey].dimensions[dimension].push(value);
    }
    systems[systemKey].reviewer_records.push(...(row.reviewer_records ?? []).map(record => ({ task_id: row.task_id, ...record })));
    systems[systemKey].evidence_records.push({ task_id: row.task_id, corpus_revision: row.corpus_revision, executed_at: row.executed_at, evidence: row.evidence });
  }
  const taskSets = Object.values(systems).map(data => data.tasks);
  const union = new Set(taskSets.flatMap(set => [...set]));
  const common = [...union].filter(task => taskSets.every(set => set.has(task)));
  return {
    schema: 1,
    corpus_revision: rows[0].corpus_revision,
    systems: Object.fromEntries(Object.entries(systems).map(([name, data]) => [name, {
      task_count: data.tasks.size,
      dimensions: Object.fromEntries(Object.entries(data.dimensions).map(([dimension, values]) => [dimension, numericSummary(values) ?? { n: values.length, values }])),
      reviewer_records: data.reviewer_records,
      evidence_records: data.evidence_records
    }])),
    comparability: {
      common_tasks: common.sort(),
      missing_tasks_by_system: Object.fromEntries(Object.entries(systems).map(([name, data]) => [name, [...union].filter(task => !data.tasks.has(task)).sort()])),
      complete_task_overlap: common.length === union.size
    },
    composite_score: null,
    claim_policy: 'Describe dimension-level evidence only; superiority requires reproducible, uncertainty-aware comparison.'
  };
}

async function main() {
  const index = process.argv.indexOf('--results');
  if (index < 0 || !process.argv[index + 1]) throw new Error('Usage: evals/run.mjs --results results.json');
  const rows = JSON.parse(await readFile(process.argv[index + 1], 'utf8'));
  process.stdout.write(`${JSON.stringify(summarizeEvaluation(rows), null, 2)}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });

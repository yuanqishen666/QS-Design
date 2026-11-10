import { clone, requiredText } from '../shared/utils.mjs';

export const PROBE_CONCLUSIONS = ['suitable', 'limited', 'needs-degradation', 'not-suitable', 'unknown'];
export const PROBE_EVIDENCE_STATUSES = ['finding', 'clean', 'unknown', 'not-applicable'];
export const PROBE_EVIDENCE_SOURCES = ['automated-test', 'runtime-session', 'assistive-tech-session', 'performance-profile', 'manual-session', 'task-trace', 'device-session'];

export function createInteractionProbe({ id, contract = {}, trials = [], evidence = {} } = {}) {
  return { schema: 1, probe_id: requiredText(id, 'Probe id'), contract: clone(contract), trials: clone(trials), evidence: clone(evidence) };
}

export function evaluateInteractionProbe(probe) {
  const findings = [];
  if (probe?.schema !== 1) findings.push('Interaction probe must use schema 1.');
  const contract = probe?.contract ?? {};
  for (const field of ['core_action', 'semantic_model', 'purpose', 'motion_class', 'frequency', 'continuous_mapping', 'commit', 'cancel', 'interruption', 'reduced_motion', 'alternate_input', 'platform_fallback']) {
    if (!contract[field] && contract[field] !== false) findings.push(`Interaction probe requires ${field}.`);
  }
  if (contract.blocks_next_action === true) return { conclusion: 'not-suitable', findings: [...findings, 'The interaction blocks the next business action.'], evidence: [] };
  const trials = probe?.trials ?? [];
  if (trials.length < 20) findings.push(`Only ${trials.length} repeated trials were supplied; 20 are required.`);
  const failed = trials.filter(trial => trial.completed === false && !trial.cancelled && !trial.interrupted).length;
  if (failed) findings.push(`${failed} repeated trials failed without an intentional cancel or interruption.`);
  const checks = ['new_input_takeover', 'reduced_motion', 'alternate_input', 'platform_runtime', 'low_performance', 'fatigue'];
  const normalizedEvidence = Object.fromEntries(checks.map(id => {
    const record = probe?.evidence?.[id];
    if (!record) return [id, { status: 'unknown', evidence: [], source: null }];
    const status = PROBE_EVIDENCE_STATUSES.includes(record.status) ? record.status : 'unknown';
    const evidence = Array.isArray(record.evidence) ? record.evidence.filter(Boolean) : [];
    const source = PROBE_EVIDENCE_SOURCES.includes(record.source) ? record.source : null;
    if (status !== record.status) findings.push(`Evidence ${id} has an invalid status.`);
    if (['clean', 'finding', 'not-applicable'].includes(status) && (!evidence.length || !source)) findings.push(`Evidence ${id} requires observations and a recognized independent source.`);
    if (status === 'not-applicable' && !String(record.reason ?? '').trim()) findings.push(`Evidence ${id} requires a not-applicable reason.`);
    const trustworthy = status === 'unknown' || (evidence.length && source && (status !== 'not-applicable' || String(record.reason ?? '').trim()));
    return [id, { ...clone(record), status: trustworthy ? status : 'unknown', evidence, source }];
  }));
  const missing = checks.filter(id => !probe?.evidence?.[id]);
  if (missing.length) findings.push(`Missing evidence: ${missing.join(', ')}.`);
  const negative = checks.filter(id => normalizedEvidence[id].status === 'finding');
  const unknown = checks.filter(id => normalizedEvidence[id].status === 'unknown');
  let conclusion = 'suitable';
  if (negative.includes('reduced_motion') || negative.includes('alternate_input') || negative.includes('low_performance')) conclusion = 'needs-degradation';
  else if (negative.length || failed) conclusion = 'limited';
  else if (trials.length < 20 || unknown.length) conclusion = 'unknown';
  return {
    conclusion,
    findings,
    evidence: checks.map(id => ({ id, ...normalizedEvidence[id] })),
    trial_summary: { total: trials.length, failed, cancelled: trials.filter(item => item.cancelled).length, interrupted: trials.filter(item => item.interrupted).length }
  };
}

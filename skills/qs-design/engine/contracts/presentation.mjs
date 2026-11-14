import { assertEnum, timestamp, unique } from '../shared/utils.mjs';

export const PRESENTATION_WORK_MODES = ['design', 'audit', 'interaction-lab', 'implementation', 'context-reset'];
export const PRESENTATION_STATUSES = ['planned', 'presented', 'blocked', 'not-applicable'];
export const PRESENTATION_CHANNELS = ['conversation', 'export', 'product'];

const visualModes = new Set(['design', 'interaction-lab', 'implementation']);

function refs(values) {
  return unique(values).map(value => String(value).trim()).filter(Boolean);
}

export function createPresentationRecord({
  workMode = 'design',
  status = 'planned',
  artifactRefs = [],
  previewRefs = [],
  experienceRefs = [],
  channel = 'conversation',
  blocker = null,
  presentedAt = null,
  now = new Date()
} = {}) {
  assertEnum(workMode, PRESENTATION_WORK_MODES, 'Presentation work mode');
  assertEnum(status, PRESENTATION_STATUSES, 'Presentation status');
  assertEnum(channel, PRESENTATION_CHANNELS, 'Presentation channel');
  const record = {
    schema: 1,
    work_mode: workMode,
    status,
    artifact_refs: refs(artifactRefs),
    preview_refs: refs(previewRefs),
    experience_refs: refs(experienceRefs),
    channel,
    blocker: blocker == null ? null : String(blocker).trim(),
    presented_at: status === 'presented' ? timestamp(presentedAt ? new Date(presentedAt) : now) : null
  };
  const result = validatePresentationRecord(record);
  if (result.errors.length) throw new Error(result.errors.join(' '));
  return record;
}

export function validatePresentationRecord(record, { prototypeContract = null, requireComplete = false } = {}) {
  const errors = [];
  const advisories = [];
  if (record?.schema !== 1) errors.push('Presentation Record must use schema 1.');
  if (!PRESENTATION_WORK_MODES.includes(record?.work_mode)) errors.push('Presentation Record has an invalid work_mode.');
  if (!PRESENTATION_STATUSES.includes(record?.status)) errors.push('Presentation Record has an invalid status.');
  if (!PRESENTATION_CHANNELS.includes(record?.channel)) errors.push('Presentation Record has an invalid channel.');
  for (const field of ['artifact_refs', 'preview_refs', 'experience_refs']) {
    if (!Array.isArray(record?.[field])) errors.push(`Presentation Record ${field} must be an array.`);
    else {
      if (new Set(record[field]).size !== record[field].length) errors.push(`Presentation Record ${field} must be unique.`);
      if (record[field].some(value => typeof value !== 'string' || !value.trim())) errors.push(`Presentation Record ${field} contains an invalid reference.`);
    }
  }
  const artifactRefs = new Set(record?.artifact_refs ?? []);
  for (const ref of [...(record?.preview_refs ?? []), ...(record?.experience_refs ?? [])]) {
    if (!artifactRefs.has(ref)) errors.push(`Presentation reference ${ref} is not declared in artifact_refs.`);
  }
  if (record?.status === 'presented') {
    if (!(record?.artifact_refs ?? []).length) errors.push('Presented work requires at least one artifact reference.');
    if (visualModes.has(record?.work_mode) && !(record?.preview_refs ?? []).length) errors.push('Presented visual work requires at least one directly viewable preview reference.');
    if (!record?.presented_at || Number.isNaN(new Date(record.presented_at).getTime())) errors.push('Presented work requires a valid presented_at timestamp.');
    if (record?.blocker) errors.push('Presented work cannot also declare a blocker.');
    if (['clickable', 'native'].includes(prototypeContract?.fidelity) && !(record?.experience_refs ?? []).length) errors.push(`${prototypeContract.fidelity} work requires a runnable experience reference in addition to its preview.`);
  } else if (record?.presented_at != null) errors.push('Only presented work may set presented_at.');
  if (record?.status === 'blocked' && !String(record?.blocker ?? '').trim()) errors.push('Blocked presentation requires a concrete blocker and recovery context.');
  if (record?.status !== 'blocked' && record?.blocker) errors.push('Only blocked presentation may declare a blocker.');
  if (visualModes.has(record?.work_mode) && record?.status === 'not-applicable') errors.push(`${record.work_mode} work cannot mark visual presentation not-applicable.`);
  if (requireComplete && visualModes.has(record?.work_mode) && record?.status !== 'presented') errors.push(`Completed ${record.work_mode} work must be presented, not ${record.status ?? 'missing'}.`);
  if (record?.work_mode === 'audit' && record?.status === 'planned') advisories.push('A text-only audit should normally mark presentation not-applicable rather than leave it planned.');
  return { errors: unique(errors), advisories: unique(advisories) };
}

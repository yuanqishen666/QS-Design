import { clone, requiredText, unique } from '../shared/utils.mjs';
import { normalizeEvidenceCheck, normalizeSource, normalizeTextList, validateEvidenceCheck } from './shared.mjs';
import { productTruthIds } from './product-truth.mjs';

export const ATTENTION_ROLES = ['primary', 'secondary', 'tertiary', 'context'];
export const ATTENTION_CHECKS = ['five-second', 'blur-squint', 'grayscale', 'focus-order', 'text-scale'];

export function createAttentionContract({
  taskId,
  firstViewportJob,
  firstViewportQuestion,
  attentionOrder = [],
  quietTargets = [],
  checks = {}
} = {}) {
  if (!/^task-[a-z0-9-]+$/.test(String(taskId ?? ''))) throw new Error('Attention Contract taskId must match task-[a-z0-9-]+.');
  const order = attentionOrder.map((item, index) => ({
    rank: Number.isInteger(item.rank) && item.rank > 0 ? item.rank : index + 1,
    target_id: requiredText(item.target_id ?? item.targetId, 'Attention target_id'),
    role: ATTENTION_ROLES.includes(item.role) ? item.role : index === 0 ? 'primary' : index === 1 ? 'secondary' : 'tertiary',
    reason: requiredText(item.reason, 'Attention reason'),
    source: normalizeSource(item.source)
  }));
  const normalizedChecks = ATTENTION_CHECKS.map(id => normalizeEvidenceCheck(id, Array.isArray(checks) ? checks.find(item => item.id === id) : checks[id] ?? { reason: 'Check has not run yet.' }));
  return {
    schema: 1,
    task_id: taskId,
    first_viewport_job: requiredText(firstViewportJob, 'First viewport job'),
    first_viewport_question: requiredText(firstViewportQuestion, 'First viewport question'),
    primary_action_id: order.find(item => item.role === 'primary')?.target_id ?? null,
    attention_order: order,
    quiet_targets: normalizeTextList(quietTargets),
    checks: normalizedChecks
  };
}

export function validateAttentionContract(contract, { productTruth = null } = {}) {
  const errors = [];
  const advisories = [];
  const outcomes = [];
  if (contract?.schema !== 1) errors.push('Attention Contract must use schema 1.');
  if (!/^task-[a-z0-9-]+$/.test(contract?.task_id ?? '')) errors.push('Attention Contract has an invalid task_id.');
  if (!String(contract?.first_viewport_job ?? '').trim()) errors.push('Attention Contract requires first_viewport_job.');
  if (!String(contract?.first_viewport_question ?? '').trim()) errors.push('Attention Contract requires first_viewport_question.');
  if (!Array.isArray(contract?.attention_order) || !contract.attention_order.length) errors.push('Attention Contract requires an attention_order.');
  const ranks = (contract?.attention_order ?? []).map(item => item.rank);
  if (new Set(ranks).size !== ranks.length) errors.push('Attention ranks must be unique.');
  if (ranks.length && Math.min(...ranks) !== 1) errors.push('Attention order must start at rank 1.');
  const primary = (contract?.attention_order ?? []).filter(item => item.role === 'primary');
  if (primary.length !== 1) errors.push('Attention Contract requires exactly one primary target.');
  if (primary[0] && primary[0].rank !== 1) errors.push('The primary attention target must be rank 1.');
  if (primary[0] && contract?.primary_action_id !== primary[0].target_id) errors.push('primary_action_id must match the rank-1 primary target.');
  for (const item of contract?.attention_order ?? []) {
    if (!ATTENTION_ROLES.includes(item.role)) errors.push(`Attention target ${item.target_id ?? 'unknown'} has an invalid role.`);
    if (!String(item.target_id ?? '').trim() || !String(item.reason ?? '').trim() || !String(item.source ?? '').trim()) errors.push('Attention targets require target_id, reason and source.');
  }
  const orderIds = (contract?.attention_order ?? []).map(item => item.target_id);
  if (new Set(orderIds).size !== orderIds.length) errors.push('Attention targets must be unique.');
  const roleOrder = new Map(ATTENTION_ROLES.map((role, index) => [role, index]));
  const rankedRoles = [...(contract?.attention_order ?? [])].sort((left, right) => left.rank - right.rank).map(item => roleOrder.get(item.role));
  if (rankedRoles.some((value, index) => index > 0 && value < rankedRoles[index - 1])) errors.push('Attention roles must progress from primary to secondary, tertiary and context without returning to a stronger role.');
  if ((contract?.quiet_targets ?? []).some(id => orderIds.includes(id))) errors.push('A target cannot be both ranked and quiet.');
  if (productTruth) {
    if (productTruth.task_id !== contract?.task_id) errors.push('Attention Contract belongs to a different Product Truth task.');
    const known = new Set(productTruthIds(productTruth));
    for (const target of orderIds) if (!known.has(target) && !target.startsWith('content:')) advisories.push(`Attention target ${target} is not registered in Product Truth.`);
    if (contract?.primary_action_id && !(productTruth.visible_affordances ?? []).some(item => item.id === contract.primary_action_id)) errors.push(`Primary action ${contract.primary_action_id} is not an allowlisted visible affordance.`);
  }
  if (!Array.isArray(contract?.checks)) errors.push('Attention Contract checks must be an array.');
  for (const id of ATTENTION_CHECKS) if (!(contract?.checks ?? []).some(check => check.id === id)) errors.push(`Attention Contract is missing ${id} check.`);
  for (const check of contract?.checks ?? []) {
    errors.push(...validateEvidenceCheck(check, `Attention check ${check?.id ?? 'unknown'}`));
    outcomes.push(clone(check));
  }
  return { errors: unique(errors), advisories: unique(advisories), outcomes };
}

import { clone, requiredText, unique } from '../shared/utils.mjs';
import { validateCraftReview } from '../art-direction/craft-review.mjs';
import { validateGeneralityTests } from '../art-direction/specificity.mjs';
import { meaningfullyEquivalent, normalizeMeaning } from '../shared/text-similarity.mjs';

export function planDirectionCount({
  relation = 'fresh-root',
  changeKind = 'design',
  ambiguity = 'low',
  userRequested = null
} = {}) {
  if (userRequested != null) {
    const count = Number(userRequested);
    if (!Number.isInteger(count) || count < 1) throw new Error('Direction count must be a positive integer.');
    return {
      count,
      reason: `用户明确要求比较 ${count} 个真实方向。`,
      cost_notice: count > 3 ? '超过默认探索上限；先交付可比较样张，视觉精修与跨端扩展成本会随方向数增加。' : null
    };
  }
  if (['continue-parent', 'aspect-inheritance'].includes(relation)) return { count: 1, reason: '本次是已点名方向的继续或局部继承。' };
  if (['mechanical', 'design-system-extension'].includes(changeKind)) return { count: 1, reason: '变化边界明确，不存在需要并行验证的产品解释。' };
  if (ambiguity === 'high') return { count: 3, reason: '产品解释、任务结构或操控模型存在多个真实分叉。' };
  if (ambiguity === 'medium') return { count: 2, reason: '存在一个会实质改变结果的关键分歧。' };
  return { count: 1, reason: '业务目标和设计边界足够明确，集中完成一个方向更有利于视觉工艺。' };
}

const normalize = normalizeMeaning;

export function createDirectionSet({ taskId, reason, costNotice = null, comparisonFrame = [], directions = [] } = {}) {
  const normalizedTaskId = requiredText(taskId, 'Direction taskId');
  if (!/^task-[a-z0-9-]+$/.test(normalizedTaskId)) throw new Error('Direction taskId must match task-[a-z0-9-]+.');
  return { schema: 1, task_id: normalizedTaskId, count: directions.length, reason: requiredText(reason, 'Direction reason'), cost_notice: costNotice, comparison_frame: unique(comparisonFrame), directions: clone(directions) };
}

export function validateDirectionSet(set) {
  const errors = [];
  const advisories = [];
  if (set?.schema !== 1) errors.push('Direction set must use schema 1.');
  if (!/^task-[a-z0-9-]+$/.test(set?.task_id ?? '')) errors.push('Direction set has an invalid task_id.');
  if (!Number.isInteger(set?.count) || set.count < 1) errors.push('Direction count must be a positive integer.');
  if (set?.count > 3 && !String(set?.cost_notice ?? '').trim()) errors.push('More than three directions require a visible cost notice.');
  if ((set?.directions ?? []).length !== set?.count) errors.push('Direction count does not match the number of directions.');
  const ids = new Set();
  const required = ['id', 'thesis', 'business_signature', 'information_topology', 'interaction_model', 'art_direction', 'dominant_decisions', 'craft_review', 'generality_tests', 'non_transferability', 'platform_expressions', 'evidence', 'risks'];
  for (const [index, direction] of (set?.directions ?? []).entries()) {
    for (const field of required) if (direction[field] == null || direction[field] === '') errors.push(`directions[${index}].${field} is required.`);
    if (!Array.isArray(direction.dominant_decisions) || !direction.dominant_decisions.length) errors.push(`directions[${index}].dominant_decisions must contain at least one traceable decision.`);
    if (ids.has(direction.id)) errors.push(`Duplicate direction id: ${direction.id}.`);
    ids.add(direction.id);
    if (normalize(direction.non_transferability).length < 12) advisories.push(`Direction ${direction.id} has a weak non-transferability claim.`);
    for (const error of validateCraftReview(direction.craft_review).errors) errors.push(`Direction ${direction.id}: ${error}`);
    for (const error of validateGeneralityTests(direction.generality_tests).errors) errors.push(`Direction ${direction.id}: ${error}`);
  }
  if (set?.count > 1) {
    for (const field of ['thesis', 'business_signature', 'information_topology', 'interaction_model']) {
      const values = (set.directions ?? []).map(direction => normalize(direction[field]));
      if (new Set(values).size !== values.length) errors.push(`Directions must differ in ${field}.`);
      for (let left = 0; left < values.length; left += 1) for (let right = left + 1; right < values.length; right += 1) {
        if (values[left] !== values[right] && meaningfullyEquivalent(values[left], values[right])) errors.push(`Directions ${set.directions[left].id} and ${set.directions[right].id} are only paraphrased in ${field}.`);
      }
    }
  }
  return { errors, advisories };
}

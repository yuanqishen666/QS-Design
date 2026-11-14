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
const visualDifferenceFields = ['dominant_visual_carrier', 'composition_logic', 'surface_strategy', 'image_strategy', 'material_logic'];
const comparisonSpecimenTextFields = ['representative_task', 'primary_action', 'outcome'];
const currentSpecimenTextFields = ['representative_task_id', 'selection_rationale', 'fixture_source'];
const selectionBases = ['frequency', 'risk', 'learning-goal', 'user-request'];

function meaningfullyDifferent(left, right) {
  const normalizedLeft = normalize(left);
  const normalizedRight = normalize(right);
  return Boolean(normalizedLeft && normalizedRight && normalizedLeft !== normalizedRight && !meaningfullyEquivalent(normalizedLeft, normalizedRight));
}

export function createDirectionSet({ taskId, reason, costNotice = null, comparisonFrame = [], comparisonSpecimen = null, directions = [] } = {}) {
  const normalizedTaskId = requiredText(taskId, 'Direction taskId');
  if (!/^task-[a-z0-9-]+$/.test(normalizedTaskId)) throw new Error('Direction taskId must match task-[a-z0-9-]+.');
  return { schema: 1, task_id: normalizedTaskId, count: directions.length, reason: requiredText(reason, 'Direction reason'), cost_notice: costNotice, comparison_frame: unique(comparisonFrame), comparison_specimen: comparisonSpecimen == null ? null : clone(comparisonSpecimen), directions: clone(directions) };
}

export function validateDirectionSet(set, { productTruth = null, attentionContract = null, prototypeContract = null, requireCurrentContract = false } = {}) {
  const errors = [];
  const advisories = [];
  if (set?.schema !== 1) errors.push('Direction set must use schema 1.');
  if (!/^task-[a-z0-9-]+$/.test(set?.task_id ?? '')) errors.push('Direction set has an invalid task_id.');
  if (!Number.isInteger(set?.count) || set.count < 1) errors.push('Direction count must be a positive integer.');
  if (set?.count > 3 && !String(set?.cost_notice ?? '').trim()) errors.push('More than three directions require a visible cost notice.');
  if ((set?.directions ?? []).length !== set?.count) errors.push('Direction count does not match the number of directions.');
  const specimen = set?.comparison_specimen;
  if (set?.count > 1 && (!specimen || typeof specimen !== 'object' || Array.isArray(specimen))) errors.push('Multiple directions require one shared comparison_specimen so task content, information volume, primary action and outcome cannot drift.');
  if (specimen && typeof specimen === 'object' && !Array.isArray(specimen)) {
    for (const field of comparisonSpecimenTextFields) if (!String(specimen[field] ?? '').trim()) errors.push(`comparison_specimen.${field} is required.`);
    if (!specimen.content_fixture || typeof specimen.content_fixture !== 'object' || Array.isArray(specimen.content_fixture) || !Object.keys(specimen.content_fixture).length) errors.push('comparison_specimen.content_fixture must be a non-empty object.');
    if (!Array.isArray(specimen.information_scope) || !specimen.information_scope.length || specimen.information_scope.some(item => !String(item ?? '').trim())) errors.push('comparison_specimen.information_scope must contain the fixed visible field groups.');
    const currentContract = specimen.contract_version === 2 || requireCurrentContract;
    if (requireCurrentContract && specimen.contract_version !== 2) errors.push('comparison_specimen.contract_version 2 is required for new formal candidates; legacy specimens remain readable but cannot prove the current contract.');
    if (!currentContract) advisories.push('comparison_specimen uses the legacy contract and does not prove representative-task selection, action order or required paths.');
    if (currentContract) {
      for (const field of currentSpecimenTextFields) if (!String(specimen[field] ?? '').trim()) errors.push(`comparison_specimen.${field} is required by contract_version 2.`);
      if (!Array.isArray(specimen.selection_basis) || !specimen.selection_basis.length || specimen.selection_basis.some(item => !selectionBases.includes(item))) errors.push('comparison_specimen.selection_basis must identify frequency, risk, learning-goal or user-request evidence.');
      if (!Array.isArray(specimen.action_order) || !specimen.action_order.length || specimen.action_order.some(item => !String(item ?? '').trim())) errors.push('comparison_specimen.action_order must freeze visible action priority.');
      else if (specimen.action_order[0] !== specimen.primary_action) errors.push('comparison_specimen.primary_action must be the first action_order item.');
      if (!Array.isArray(specimen.required_paths) || !specimen.required_paths.length || specimen.required_paths.some(item => !String(item ?? '').trim())) errors.push('comparison_specimen.required_paths must freeze the paths each direction proves.');
    }
    if (productTruth && currentContract) {
      const knownTasks = new Set([...(productTruth.primary_jobs ?? []), ...(productTruth.critical_journeys ?? [])].map(item => item.id));
      if (!knownTasks.has(specimen.representative_task_id)) errors.push(`comparison_specimen references unknown Product Truth task ${specimen.representative_task_id}.`);
      const affordances = new Set((productTruth.visible_affordances ?? []).map(item => item.id));
      for (const action of specimen.action_order ?? []) if (!affordances.has(action)) errors.push(`comparison_specimen action ${action} is outside the Product Truth affordance allowlist.`);
    }
    if (attentionContract && currentContract) {
      if (specimen.primary_action !== attentionContract.primary_action_id) errors.push('comparison_specimen primary action does not match the Attention Contract.');
      const affordanceIds = new Set((productTruth?.visible_affordances ?? []).map(item => item.id));
      const attentionOrder = [...(attentionContract.attention_order ?? [])].sort((left, right) => left.rank - right.rank).map(item => item.target_id).filter(id => !productTruth || affordanceIds.has(id));
      if (JSON.stringify(specimen.action_order) !== JSON.stringify(attentionOrder.slice(0, specimen.action_order.length))) errors.push('comparison_specimen action_order does not preserve the Attention Contract order.');
    }
    if (prototypeContract && currentContract) {
      const pathIds = new Set((prototypeContract.required_paths ?? []).map(item => item.id));
      for (const path of specimen.required_paths ?? []) if (!pathIds.has(path)) errors.push(`comparison_specimen references unknown Prototype Contract path ${path}.`);
    }
  }
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
    for (let left = 0; left < set.directions.length; left += 1) for (let right = left + 1; right < set.directions.length; right += 1) {
      const leftArt = set.directions[left].art_direction ?? {};
      const rightArt = set.directions[right].art_direction ?? {};
      const differences = visualDifferenceFields.filter(field => meaningfullyDifferent(leftArt[field], rightArt[field]));
      if (differences.length < 2) errors.push(`Directions ${set.directions[left].id} and ${set.directions[right].id} must differ in at least two visual grammar fields (${visualDifferenceFields.join(', ')}), not only styling.`);
    }
  }
  return { errors, advisories };
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { createBusinessModel, validateBusinessModel } from '../engine/business-model/model.mjs';
import { allowedContentDeliveries, createContentContract, validateContentContract } from '../engine/content/contract.mjs';
import { createSemanticIntent, validateSemanticIntent } from '../engine/semantics/intent.mjs';
import { createDirectionSet, planDirectionCount, validateDirectionSet } from '../engine/directions/planner.mjs';
import { createArtDirection, createDesignFingerprint, compareFingerprints, detectHouseStyle, validateArtDirection } from '../engine/art-direction/contract.mjs';
import { createCraftReview, validateCraftReview } from '../engine/art-direction/craft-review.mjs';
import { createGeneralityTests, validateGeneralityTests } from '../engine/art-direction/specificity.mjs';
import { approvalDrift, artifactHash, createApproval, materialChanges, verifyApproval } from '../engine/governance/approval.mjs';
import { createDecision, createException, validateException } from '../engine/governance/decisions.mjs';
import { createTaskCapsule } from '../engine/context/task-capsule.mjs';
import { compileContextManifest } from '../engine/context/read-policy.mjs';
import { applyVerificationExceptions, finding, verifyBundle, verifyBundleWithRules } from '../engine/verification/report.mjs';
import { createVerificationRule } from '../engine/verification/rules.mjs';

const art = () => createArtDirection({
  visual_thesis: '让异常关系而不是装饰卡片成为画面主角',
  business_anchor: '用户通过金额、对象和差异关系判断异常交易是否可恢复',
  primary_visual_object: '可追踪的差异关系',
  composition_logic: '从异常来源到修复结果的连续关系',
  type_roles: ['data', 'navigation', 'body'],
  image_strategy: '原创关系图形，不使用无关图片',
  material_logic: '清晰前后景表达已确认与待处理状态',
  color_behavior: '色彩只承担状态与风险层级',
  spatial_rhythm: '高频操作紧凑，解释区域留出停顿',
  motion_language: '修复动作连续更新关系并可中断',
  signature_moment: '差异归零时关系合拢而不阻塞下一步',
  restraint_budget: '只允许一个明显运动中心',
  fallback_strategy: '减少动态时直接更新关系和文本状态'
});

const model = () => createBusinessModel({
  businessDna: {
    entities: ['transaction', 'account'], relations: ['belongs-to'], flows: ['reconcile'], state_transitions: ['unmatched->matched'],
    value_moments: ['difference resolved'], risk_and_trust: ['wrong account'], temporal_rhythm: ['daily close'], frequency: { reconcile: 'daily' },
    content_morphology: ['comparison', 'flow'], cultural_context: ['CNY amount formatting']
  },
  taskGraph: { goal: 'resolve mismatch' }, contentGraph: { amount: 'primary' }, stateGraph: { initial: 'unmatched' },
  actionContracts: [{ id: 'resolve', result: 'matched' }], platformRequirements: ['keyboard']
});

const reviewContracts = () => ({ craft_review: createCraftReview(), generality_tests: createGeneralityTests() });
const dominantDecisions = () => [{ business_basis: '差异关系', user_effect: '理解异常来源', expression: '连续关系图', remove_test: '移除后无法追踪差异来源' }];

test('business model requires core entities and exposes missing evidence', () => {
  assert.deepEqual(validateBusinessModel(model()).errors, []);
  assert.ok(validateBusinessModel(createBusinessModel()).errors.some(message => message.includes('core entity')));
});

test('content visibility contract keeps critical meaning visible and makes tooltip exceptional', () => {
  const critical = createContentContract({ entries: [{ key: 'renewal', kind: 'risk', source: 'billing-policy', owner: 'billing', purpose: 'risk', criticality: 'critical', audience: 'all', timing: 'before-action', delivery: 'tooltip', irreducible_fact: '到期后自动扣款', structure_attempt: '开关状态无法表达扣款后果' }] });
  assert.ok(validateContentContract(critical).errors.some(message => message.includes('must remain visible')));

  const optional = createContentContract({ entries: [{ key: 'term', kind: 'definition', source: 'domain-glossary', owner: 'product', purpose: 'recognition', criticality: 'optional', audience: 'some', timing: 'on-demand', delivery: 'tooltip', irreducible_fact: '账期的领域定义', structure_attempt: '术语本身不能完整表达定义' }] });
  assert.deepEqual(validateContentContract(optional), { errors: [], advisories: [] });
  assert.ok(allowedContentDeliveries({ criticality: 'optional', audience: 'some', timing: 'on-demand' }).allowed.includes('tooltip'));
  assert.ok(!allowedContentDeliveries({ criticality: 'critical', audience: 'all', timing: 'before-action' }).allowed.includes('tooltip'));
});

test('fuzzy language requires business meaning and observable criteria', () => {
  const weak = createSemanticIntent({ rawLanguage: ['专业但不冷'] });
  assert.equal(validateSemanticIntent(weak).errors.length, 2);
  const strong = createSemanticIntent({ rawLanguage: ['专业但不冷'], tensions: ['准确与亲近'], businessInterpretation: ['对账可信，恢复不责备'], observableExperience: ['金额关系明确，错误可恢复'] });
  assert.equal(validateSemanticIntent(strong).errors.length, 0);
  const justified = createSemanticIntent({ rawLanguage: ['专业'], businessInterpretation: ['风险判断准确'], observableExperience: ['状态和金额可核对'], visualImplications: ['使用企业蓝区分受监管状态'], formRationales: [{ form: '企业蓝', business_reason: '沿用已确认监管品牌色', evidence: ['official-brand:color'] }] });
  assert.ok(!validateSemanticIntent(justified).advisories.some(message => message.includes('企业蓝')));
});

test('direction count adapts to uncertainty and continuation', () => {
  assert.equal(planDirectionCount({ ambiguity: 'high' }).count, 3);
  assert.equal(planDirectionCount({ ambiguity: 'medium' }).count, 2);
  assert.equal(planDirectionCount({ relation: 'continue-parent', ambiguity: 'high' }).count, 1);
  assert.equal(planDirectionCount({ changeKind: 'design-system-extension' }).count, 1);
  const expanded = planDirectionCount({ userRequested: 5 });
  assert.equal(expanded.count, 5);
  assert.match(expanded.cost_notice, /成本/);
});

test('multiple directions must differ semantically', () => {
  const direction = id => ({ id, thesis: 'same', business_signature: 'same', information_topology: 'same', interaction_model: 'same', art_direction: art(), dominant_decisions: dominantDecisions(), ...reviewContracts(), non_transferability: '只因当前对账差异关系成立', platform_expressions: {}, evidence: [], risks: [] });
  const result = validateDirectionSet(createDirectionSet({ taskId: 'task-demo', reason: 'test', directions: [direction('a'), direction('b')] }));
  assert.ok(result.errors.some(message => message.includes('thesis')));
});

test('formal directions carry explicit craft and generality evidence states', () => {
  assert.deepEqual(validateCraftReview(createCraftReview()).errors, []);
  assert.deepEqual(validateGeneralityTests(createGeneralityTests()).errors, []);
  const invalid = createCraftReview();
  invalid.checks['grayscale-hierarchy'] = { status: 'clean', evidence: [], reason: '' };
  assert.ok(validateCraftReview(invalid).errors.some(message => message.includes('grayscale-hierarchy')));
});

test('art direction requires business grounding and dominant decision trace', () => {
  assert.equal(validateArtDirection(art(), { dominantDecisions: [{ business_basis: '差异关系', user_effect: '理解来源', expression: '连续连线', remove_test: '移除后来源难理解' }] }).errors.length, 0);
  assert.ok(validateArtDirection(createArtDirection()).errors.length > 0);
  assert.equal(validateArtDirection(art(), { dominantDecisions: [{ art_direction_basis: '保持唯一运动中心', user_effect: '降低高频疲劳', expression: '其余状态静态切换', remove_test: '移除后注意力持续被打断' }] }).errors.length, 0);
});

test('fingerprint comparison flags repeated house style without making it a score', () => {
  const left = createDesignFingerprint({ topology: 'grid', density: 'sparse', type_system: 'grotesk', surface_logic: 'glass' });
  const right = createDesignFingerprint({ topology: 'grid', density: 'sparse', type_system: 'grotesk', surface_logic: 'glass' });
  assert.equal(compareFingerprints(left, right).repeated, true);
  assert.equal(detectHouseStyle({ current: left, comparisons: [{ candidate_id: 'unrelated', fingerprint: right }] }).status, 'finding');
  assert.equal(detectHouseStyle({ current: left, comparisons: [{ candidate_id: 'same-brand', fingerprint: right, shared_brand_system: true }] }).status, 'clean');
});

test('approval binds semantic contract and artifacts', () => {
  const bundle = { task_capsule: { task_id: 'task-demo', current_requirements: ['修复异常'], created_at: 'a', updated_at: 'a', candidate_refs: [] }, business_model: model(), direction: { id: 'a' }, user_visible_copy: ['修复差异'] };
  const artifacts = [{ ref: 'prototype-a', content: 'hash-a' }];
  const approval = createApproval({ taskId: 'task-demo', candidateId: 'candidate-a', userEvidence: '用户选择 A', semanticBundle: bundle, artifacts });
  assert.ok(approval.semantic_component_hashes.user_visible_copy);
  assert.equal(approval.artifact_manifest.length, 1);
  const identity = { taskId: 'task-demo', candidateId: 'candidate-a' };
  assert.deepEqual(verifyApproval(approval, { ...identity, semanticBundle: bundle, artifacts }), []);
  assert.ok(verifyApproval(approval, { ...identity, semanticBundle: { ...bundle, user_visible_copy: ['已更改'] }, artifacts }).length);
  assert.deepEqual(verifyApproval(approval, { ...identity, semanticBundle: { ...bundle, task_capsule: { ...bundle.task_capsule, created_at: 'b', updated_at: 'b', candidate_refs: ['candidate-new'] } }, artifacts }), []);
  assert.ok(verifyApproval(approval, { taskId: 'task-demo', candidateId: 'candidate-b', semanticBundle: bundle, artifacts }).some(message => message.includes('candidate')));
  assert.deepEqual(materialChanges(bundle, { ...bundle, user_visible_copy: ['已更改'] }), ['user_visible_copy']);
  assert.deepEqual(approvalDrift(approval, { ...identity, semanticBundle: { ...bundle, user_visible_copy: ['已更改'] }, artifacts }).material_fields, ['user_visible_copy']);
  assert.throws(() => artifactHash([{ path: '/tmp/prototype.html' }]), /only a path/);
  assert.throws(() => artifactHash(['/tmp/prototype.html']), /ambiguous string/);
  assert.throws(() => createApproval({ taskId: 'task-other', candidateId: 'candidate-a', userEvidence: '用户选择 A', semanticBundle: bundle, artifacts }), /does not match/);
});

test('decisions preserve human scope and exceptions cannot be permanent and ownerless', () => {
  assert.throws(() => createDecision({ decision: '永远不用渐变', scope: 'profile', owner: 'user', userEvidence: '用户原话' }), /explicit user consent/);
  assert.throws(() => createDecision({ decision: '模型猜测永远不用渐变', scope: 'profile', owner: 'model', explicitConsent: true }), /owned directly by the user|cannot become/);
  const decision = createDecision({ decision: '本任务保留恢复入口', scope: 'task', owner: 'user', userEvidence: '必须能撤销' });
  assert.equal(decision.scope, 'task');
  assert.throws(() => createException({ findingId: 'finding-a', reason: '以后再说', owner: 'designer' }), /expiry or review trigger/);
  assert.throws(() => createException({ findingId: 'finding-a', scope: 'global', reason: '全部忽略', owner: 'designer', reviewTrigger: 'SDK upgrade' }), /Exception scope/);
  assert.throws(() => createException({ findingId: 'finding-a', reason: '永久忽略', owner: 'designer', reviewTrigger: 'never' }), /permanent/);
  const exception = createException({ findingId: 'finding-a', reason: '依赖下个 SDK', owner: 'designer', reviewTrigger: 'SDK upgrade' });
  assert.deepEqual(validateException(exception), []);
});

test('verification exceptions attach to findings without hiding them', () => {
  const report = verifyBundle({ task: createTaskCapsule({ taskId: 'task-exception' }), evidenceByDimension: { maintainability: [{ status: 'finding', evidence: ['Design token fork detected.'] }] } });
  const target = report.findings.find(item => item.status === 'finding');
  const exception = createException({ findingId: target.id, reason: '等待平台 SDK', owner: 'design-lead', reviewTrigger: 'SDK upgrade' });
  const governed = applyVerificationExceptions(report, [exception]);
  assert.equal(governed.findings.find(item => item.id === target.id).status, target.status);
  assert.equal(governed.findings.find(item => item.id === target.id).exception.exception_id, exception.exception_id);
  const clean = report.findings.find(item => item.status === 'clean');
  const invalid = applyVerificationExceptions(report, [createException({ findingId: clean.id, reason: '不应忽略 clean', owner: 'design-lead', reviewTrigger: 'next review' })]);
  assert.equal(invalid.findings.find(item => item.id === clean.id).exception, null);
});

test('verification report returns evidence dimensions instead of a total score', () => {
  const task = createTaskCapsule({ taskId: 'task-demo', businessFacts: ['对账'], currentRequirements: ['修复异常'] });
  const manifest = compileContextManifest({ task, relation: 'fresh-root', runId: 'run-verify' });
  const direction = { id: 'a', thesis: '关系修复', business_signature: '差异关系', information_topology: 'comparison flow', interaction_model: 'select then resolve', art_direction: art(), ...reviewContracts(), non_transferability: '只有交易、账户与差异修复的关系存在时该结构才成立', platform_expressions: {}, evidence: [], risks: [], dominant_decisions: [{ business_basis: '差异来源', user_effect: '理解错误', expression: '关系图', remove_test: '移除后难以追踪' }] };
  const set = createDirectionSet({ taskId: task.task_id, reason: '边界明确', directions: [direction] });
  const report = verifyBundle({ task, manifest, businessModel: model(), semanticIntent: createSemanticIntent({ rawLanguage: ['专业但不冷'], businessInterpretation: ['可信且可恢复'], observableExperience: ['金额清楚，错误可恢复'] }), directionSet: set });
  assert.equal('score' in report, false);
  assert.equal(new Set(report.findings.map(item => item.dimension)).size, 10);
  assert.ok(['finding', 'clean', 'unknown'].some(status => report.summary[status] >= 0));
});

test('verification reports unsafe content disclosure in the content-quality dimension', () => {
  const task = createTaskCapsule({ taskId: 'task-content', businessFacts: ['自动续费'], currentRequirements: ['确认订阅'] });
  const contentContract = createContentContract({ entries: [{ key: 'renewal', kind: 'risk', source: 'billing-policy', owner: 'billing', purpose: 'risk', criticality: 'critical', audience: 'all', timing: 'before-action', delivery: 'tooltip', irreducible_fact: '到期后自动扣款', structure_attempt: '开关状态无法表达扣款后果' }] });
  const report = verifyBundle({ task, businessModel: model(), contentContract });
  assert.ok(report.findings.some(item => item.dimension === 'content-quality' && item.status === 'finding'));
});

test('verification findings cannot claim clean without evidence', () => {
  const result = finding({ status: 'clean', dimension: 'visual-craft', evidence: [] });
  assert.equal(result.status, 'unknown');
  assert.match(String(result.evidence[0]), /No evidence/);
});

test('verification rules report not-applicable and failures without collapsing to a score', async () => {
  const task = createTaskCapsule({ taskId: 'task-rules', businessFacts: ['业务事实'], currentRequirements: ['完成任务'] });
  const rules = [
    createVerificationRule({ id: 'native-only', dimension: 'platform-performance', applies: () => false, evaluate: () => [] }),
    createVerificationRule({ id: 'runtime-failure', dimension: 'interaction-accessibility', evaluate: () => { throw new Error('runner unavailable'); } })
  ];
  const report = await verifyBundleWithRules({ task }, rules);
  assert.ok(report.findings.some(item => item.status === 'not-applicable' && item.target === 'native-only'));
  assert.ok(report.findings.some(item => item.status === 'unknown' && item.target === 'runtime-failure'));
  assert.equal('score' in report, false);
});

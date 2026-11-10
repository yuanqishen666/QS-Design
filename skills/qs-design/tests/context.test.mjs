import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createTaskCapsule, contextItem, validateTaskCapsule } from '../engine/context/task-capsule.mjs';
import { createCandidate, normalizeFeedback, readableCandidate, transitionCandidate } from '../engine/context/candidates.mjs';
import { compileContextManifest, validateContextManifest } from '../engine/context/read-policy.mjs';
import { createContinuityContract, validateContinuityContract } from '../engine/context/continuity.mjs';
import { buildWorkerPayload } from '../engine/context/worker-payload.mjs';
import { runIsolatedWorker } from '../engine/context/worker-runner.mjs';
import { checkPostGenerationSimilarity } from '../engine/context/similarity-gate.mjs';
import { compileSourcePolicy } from '../engine/context/source-policy.mjs';

const makeTask = () => createTaskCapsule({
  taskId: 'task-demo',
  persistence: 'ephemeral',
  businessFacts: [contextItem('保存更新每日目标', { id: 'fact-save', source: 'user' }), contextItem('支持取消', { id: 'fact-cancel', source: 'user' })],
  currentRequirements: [contextItem('专业但不冷', { id: 'req-tone', kind: 'decision', source: 'user' })],
  officialConstraints: [contextItem('不得误提交', { id: 'constraint-submit', source: 'business-rule' })],
  platformTargets: ['web']
});

test('projectless task capsule is first-class and valid', () => {
  const task = makeTask();
  assert.equal(task.persistence, 'ephemeral');
  assert.deepEqual(validateTaskCapsule(task), []);
});

test('profile feedback requires explicit user consent', () => {
  assert.throws(() => normalizeFeedback({ verbatim: '以后都不要玻璃', scope: 'profile' }), /explicit user consent/);
  const feedback = normalizeFeedback({ verbatim: '以后都不要玻璃', scope: 'profile', explicitConsent: true, carryForward: true });
  assert.equal(feedback.scope, 'profile');
  assert.throws(() => normalizeFeedback({ verbatim: '模型猜测用户不喜欢渐变', origin: 'model', scope: 'profile', explicitConsent: true }), /cannot become/);
  assert.throws(() => normalizeFeedback({ verbatim: '这一版太普通' }), /candidate id/);
});

test('profile context facts also require explicit user consent', () => {
  assert.throws(() => contextItem('永远偏好深色', { scope: 'profile' }), /explicit user consent/);
  assert.equal(contextItem('用户明确要求记住深色偏好', { scope: 'profile', explicitConsent: true }).explicit_consent, true);
});

test('remembered profile context is not readable without task-specific authorization', () => {
  const profile = contextItem('用户明确要求记住深色偏好', { id: 'profile-dark', scope: 'profile', explicitConsent: true });
  const base = createTaskCapsule({ taskId: 'task-profile-read', businessFacts: [profile] });
  const blocked = compileContextManifest({ task: base, relation: 'fresh-root', runId: 'run-profile-blocked' });
  assert.ok(!blocked.included.includes('business-fact:profile-dark'));
  const allowedTask = { ...base, read_policy: { allowed_profile_context: ['profile-dark'] } };
  const allowed = compileContextManifest({ task: allowedTask, relation: 'fresh-root', runId: 'run-profile-allowed' });
  assert.ok(allowed.included.includes('business-fact:profile-dark'));
});

test('rejected candidates are never readable as parents', () => {
  const candidate = createCandidate({ taskId: 'task-demo', candidateId: 'candidate-a', status: 'rejected' });
  assert.equal(readableCandidate(candidate, { explicitlyNamed: true }), false);
});

test('candidate state transitions preserve explicit rejection', () => {
  const candidate = createCandidate({ taskId: 'task-demo', candidateId: 'candidate-a', status: 'shown' });
  const rejected = transitionCandidate(candidate, 'rejected');
  assert.equal(rejected.status, 'rejected');
  assert.throws(() => transitionCandidate(rejected, 'selected'), /Cannot transition/);
});

test('fresh root excludes every prior candidate', () => {
  const task = makeTask();
  const candidates = [
    createCandidate({ taskId: task.task_id, candidateId: 'candidate-a', status: 'selected' }),
    createCandidate({ taskId: task.task_id, candidateId: 'candidate-b', status: 'rejected' })
  ];
  const manifest = compileContextManifest({ task, candidates, relation: 'fresh-root', runId: 'run-fresh' });
  assert.deepEqual(manifest.parents, []);
  assert.ok(manifest.excluded.includes('candidate:candidate-a'));
  assert.ok(manifest.excluded.includes('candidate:candidate-b'));
  assert.equal(validateContextManifest(manifest, candidates).length, 0);
});

test('task read policy is an upper bound on every manifest', () => {
  const base = makeTask();
  const task = { ...base, read_policy: { denied_context: ['requirement:req-tone'], denied_candidates: ['candidate-a'] } };
  const candidate = createCandidate({ taskId: task.task_id, candidateId: 'candidate-a', status: 'selected' });
  const fresh = compileContextManifest({ task, candidates: [candidate], relation: 'fresh-root', runId: 'run-policy' });
  assert.ok(!fresh.included.includes('requirement:req-tone'));
  assert.ok(fresh.excluded.includes('requirement:req-tone'));
  assert.throws(() => compileContextManifest({ task, candidates: [candidate], relation: 'continue-parent', parentIds: ['candidate-a'] }), /read policy denies/);
});

test('continue parent reads only an explicitly named non-rejected candidate', () => {
  const task = makeTask();
  const candidates = [
    createCandidate({ taskId: task.task_id, candidateId: 'candidate-a', status: 'selected' }),
    createCandidate({ taskId: task.task_id, candidateId: 'candidate-b', status: 'shown' })
  ];
  const manifest = compileContextManifest({ task, candidates, relation: 'continue-parent', parentIds: ['candidate-a'], runId: 'run-continue' });
  assert.ok(manifest.included.includes('candidate:candidate-a'));
  assert.ok(manifest.excluded.includes('candidate:candidate-b'));
});

test('a rejected candidate cannot be named as parent', () => {
  const task = makeTask();
  const candidates = [createCandidate({ taskId: task.task_id, candidateId: 'candidate-a', status: 'rejected' })];
  assert.throws(() => compileContextManifest({ task, candidates, relation: 'continue-parent', parentIds: ['candidate-a'] }), /cannot be read/);
});

test('soft reset keeps explicit abstract constraints without old candidates', () => {
  const task = { ...makeTask(), semantic_intent: { schema: 1, raw_language: ['旧视觉语义'] }, continuity_contract: { preserve: ['旧视觉'] } };
  const candidates = [createCandidate({ taskId: task.task_id, candidateId: 'candidate-a', status: 'rejected' })];
  const manifest = compileContextManifest({ task, candidates, relation: 'soft-reset', constraintIds: ['avoid-equal-card-grid'], runId: 'run-soft' });
  assert.deepEqual(manifest.included_as_constraints, ['avoid-equal-card-grid']);
  assert.ok(manifest.excluded.includes('candidate:candidate-a'));
  assert.ok(!manifest.included.includes('semantic-intent'));
  assert.ok(!manifest.included.includes('continuity-contract'));
  assert.ok(!manifest.included.some(item => item.startsWith('requirement:')));
  assert.ok(!manifest.included.some(item => item.startsWith('official-constraint:')));
  assert.ok(manifest.included.includes('platform-targets'));
});

test('soft reset can retain only explicitly reconfirmed functional requirements and constraints', () => {
  const task = makeTask();
  const manifest = compileContextManifest({
    task,
    relation: 'soft-reset',
    softResetRequirementIds: ['req-tone'],
    softResetConstraintIds: ['constraint-submit'],
    runId: 'run-soft-reconfirmed'
  });
  assert.ok(manifest.included.includes('requirement:req-tone'));
  assert.ok(manifest.included.includes('official-constraint:constraint-submit'));
  const payload = buildWorkerPayload({ task, manifest });
  assert.deepEqual(payload.platform_targets, ['web']);
});

test('hard reset includes only reconfirmed facts and requirements plus official constraints', () => {
  const task = makeTask();
  const manifest = compileContextManifest({ task, relation: 'hard-reset', hardResetFactIds: ['fact-save'], hardResetRequirementIds: ['req-tone'], hardResetConstraintIds: ['constraint-submit'], runId: 'run-hard' });
  assert.ok(manifest.included.includes('business-fact:fact-save'));
  assert.ok(!manifest.included.includes('business-fact:fact-cancel'));
  assert.ok(manifest.included.includes('requirement:req-tone'));
  assert.ok(manifest.included.includes('official-constraint:constraint-submit'));
  assert.ok(!manifest.included.includes('semantic-intent'));
});

test('hard reset does not carry stale requirements unless explicitly reconfirmed', () => {
  const manifest = compileContextManifest({ task: makeTask(), relation: 'hard-reset', hardResetFactIds: ['fact-save'], runId: 'run-hard-no-old-requirements' });
  assert.ok(!manifest.included.some(item => item.startsWith('requirement:')));
});

test('aspect inheritance exposes only the named aspect artifacts', () => {
  const task = makeTask();
  const candidate = createCandidate({
    taskId: task.task_id,
    candidateId: 'candidate-scoped',
    status: 'selected',
    artifactRefs: ['artifact-full-ui', 'artifact-secret-visual'],
    aspectRefs: { structure: ['artifact-structure'], interaction: ['artifact-interaction'] },
    acceptedAspects: ['structure', 'interaction']
  });
  const manifest = compileContextManifest({ task, candidates: [candidate], relation: 'aspect-inheritance', parentIds: [candidate.candidate_id], inheritedAspects: ['structure'], runId: 'run-aspect' });
  const payload = buildWorkerPayload({ task, manifest, candidates: [candidate], artifacts: [
    { ref: 'artifact-structure', value: { topology: 'business-flow' } },
    { ref: 'artifact-interaction', value: { secret: 'unselected interaction' } },
    { ref: 'artifact-secret-visual', value: { secret: 'unselected visual' } },
    { ref: 'artifact-full-ui', value: { secret: 'full old UI' } }
  ] });
  assert.deepEqual(payload.parents[0].artifact_refs, ['artifact-structure']);
  assert.deepEqual(payload.parents[0].artifacts, [{ ref: 'artifact-structure', value: { topology: 'business-flow' } }]);
  assert.deepEqual(payload.parents[0].accepted_aspects, ['structure']);
  assert.doesNotMatch(JSON.stringify(payload), /secret-visual|artifact-full-ui|artifact-interaction/);
});

test('explicit merge requires a per-parent aspect map', () => {
  const task = makeTask();
  const candidates = [
    createCandidate({ taskId: task.task_id, candidateId: 'candidate-a', status: 'selected', aspectRefs: { structure: ['a-structure'] }, acceptedAspects: ['structure'] }),
    createCandidate({ taskId: task.task_id, candidateId: 'candidate-b', status: 'shown', aspectRefs: { interaction: ['b-interaction'] }, acceptedAspects: ['interaction'] })
  ];
  assert.throws(() => compileContextManifest({ task, candidates, relation: 'explicit-merge', parentIds: ['candidate-a', 'candidate-b'] }), /named aspects/);
  const manifest = compileContextManifest({ task, candidates, relation: 'explicit-merge', parentIds: ['candidate-a', 'candidate-b'], inheritanceMap: { 'candidate-a': ['structure'], 'candidate-b': ['interaction'] }, runId: 'run-merge' });
  const payload = buildWorkerPayload({ task, manifest, candidates, artifacts: [{ ref: 'a-structure', value: 'A structure' }, { ref: 'b-interaction', value: 'B interaction' }] });
  assert.deepEqual(payload.parents.map(parent => parent.artifact_refs), [['a-structure'], ['b-interaction']]);
});

test('aspect inheritance cannot silently become a multi-parent merge', () => {
  const task = makeTask();
  const candidates = [
    createCandidate({ taskId: task.task_id, candidateId: 'candidate-a', status: 'selected', aspectRefs: { structure: ['a-structure'] } }),
    createCandidate({ taskId: task.task_id, candidateId: 'candidate-b', status: 'shown', aspectRefs: { interaction: ['b-interaction'] } })
  ];
  assert.throws(() => compileContextManifest({ task, candidates, relation: 'aspect-inheritance', parentIds: ['candidate-a', 'candidate-b'], inheritanceMap: { 'candidate-a': ['structure'], 'candidate-b': ['interaction'] } }), /exactly one parent/);
});

test('manifest hash reveals unauthorized mutation', () => {
  const manifest = compileContextManifest({ task: makeTask(), relation: 'fresh-root', runId: 'run-hash' });
  manifest.included.push('candidate:secret');
  assert.ok(validateContextManifest(manifest).includes('Manifest context_hash is invalid.'));
});

test('worker payload contains no rejected or unselected candidate artifacts', () => {
  const task = makeTask();
  const candidates = [
    createCandidate({ taskId: task.task_id, candidateId: 'candidate-a', status: 'selected', artifactRefs: ['artifact-selected'] }),
    createCandidate({ taskId: task.task_id, candidateId: 'candidate-b', status: 'rejected', artifactRefs: ['artifact-rejected'] })
  ];
  const fresh = compileContextManifest({ task, candidates, relation: 'fresh-root', runId: 'run-worker' });
  const payload = buildWorkerPayload({ task, manifest: fresh, candidates });
  assert.deepEqual(payload.parents, []);
  assert.doesNotMatch(JSON.stringify(payload), /artifact-rejected|artifact-selected/);

  const continued = compileContextManifest({ task, candidates, relation: 'continue-parent', parentIds: ['candidate-a'], runId: 'run-worker-parent' });
  const parentPayload = buildWorkerPayload({ task, manifest: continued, candidates, artifacts: [{ ref: 'artifact-selected', value: { selected: true } }, { ref: 'artifact-rejected', value: { secret: true } }] });
  assert.deepEqual(parentPayload.parents[0].artifact_refs, ['artifact-selected']);
  assert.deepEqual(parentPayload.parents[0].artifacts, [{ ref: 'artifact-selected', value: { selected: true } }]);
  assert.doesNotMatch(JSON.stringify(parentPayload), /artifact-rejected/);
});

test('worker payload fails closed when authorized parent artifact content is missing', () => {
  const task = makeTask();
  const candidate = createCandidate({ taskId: task.task_id, candidateId: 'candidate-a', status: 'selected', artifactRefs: ['artifact-selected'] });
  const manifest = compileContextManifest({ task, candidates: [candidate], relation: 'continue-parent', parentIds: ['candidate-a'], runId: 'run-missing-artifact' });
  assert.throws(() => buildWorkerPayload({ task, manifest, candidates: [candidate] }), /missing artifact content/);
});

test('worker payload rejects a manifest compiled for another task', () => {
  const task = makeTask();
  const manifest = compileContextManifest({ task, relation: 'fresh-root', runId: 'run-wrong-task' });
  assert.throws(() => buildWorkerPayload({ task: createTaskCapsule({ taskId: 'task-other' }), manifest }), /belongs to task|Manifest belongs/);
});

test('continuity contract detects the same claim in conflicting levels', () => {
  const contract = createContinuityContract({
    preserve: [{ id: 'a', claim: '保留品牌字体', source: 'brand', confidence: 'high' }],
    open: [{ id: 'b', claim: '保留品牌字体', source: 'user', confidence: 'high' }]
  });
  assert.ok(validateContinuityContract(contract).some(message => message.includes('both preserve and open')));
});

test('source policy treats target UI as problem evidence and excludes generated UI by default', () => {
  const policy = compileSourcePolicy({ sources: [
    { id: 'target', kind: 'internal-product', role: 'problem-evidence' },
    { id: 'old-qs', kind: 'generated-artifact', role: 'generated-output', candidate_id: 'candidate-old' },
    { id: 'fake-approved', kind: 'user-approved-parent', role: 'continuity-evidence', candidate_id: 'candidate-unapproved' },
    { id: 'reference', kind: 'external-reference', role: 'mechanism-reference' }
  ] });
  assert.equal(policy.included.find(item => item.id === 'target').visual_authority, false);
  assert.equal(policy.included.find(item => item.id === 'reference').copy_unique_expression, false);
  assert.deepEqual(policy.excluded.map(item => item.id), ['old-qs', 'fake-approved']);
});

test('post-generation similarity returns only an abstract one-way result', () => {
  const fingerprint = { topology: 'grid', density: 'sparse', type_system: 'grotesk', surface_logic: 'glass' };
  const result = checkPostGenerationSimilarity({ generatedFingerprint: fingerprint, priorFingerprints: [{ candidate_id: 'candidate-rejected', fingerprint: { ...fingerprint, secret_notes: 'must never return' } }] });
  assert.equal(result.status, 'finding');
  assert.doesNotMatch(JSON.stringify(result), /secret_notes|grotesk|glass/);
  assert.equal(checkPostGenerationSimilarity({ generatedFingerprint: fingerprint, priorFingerprints: [], enabled: false }).status, 'not-applicable');
});

test('isolated worker receives only the compiled payload and an allowlisted environment', async () => {
  const task = makeTask();
  const manifest = compileContextManifest({ task, relation: 'fresh-root', runId: 'run-isolated' });
  const payload = buildWorkerPayload({ task, manifest });
  const code = 'let s="";process.stdin.on("data",c=>s+=c);process.stdin.on("end",()=>process.stdout.write(JSON.stringify({task:JSON.parse(s).task_id,secret:process.env.QS_SECRET_TEST??null,hash:process.env.QS_DESIGN_CONTEXT_HASH})))';
  const cwd = await mkdtemp(join(tmpdir(), 'qs-worker-'));
  try {
    const result = await runIsolatedWorker({
      command: process.execPath,
      args: ['-e', code],
      payload,
      cwd,
      permissions: { network: false, read_paths: [], write_paths: [], external_programs: [process.execPath] },
      env: { QS_WORKER_MODE: 'design' }
    });
    assert.equal(result.status, 'completed');
    assert.equal(result.filesystem_isolation, 'host-required');
    assert.equal(result.declared_permissions.network, false);
    const output = JSON.parse(result.stdout);
    assert.equal(output.task, task.task_id);
    assert.equal(output.secret, null);
    assert.equal(output.hash, payload.payload_hash);
  } finally { await rm(cwd, { recursive: true, force: true }); }
});

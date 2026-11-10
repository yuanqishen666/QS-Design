import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MemoryStore } from '../stores/memory-store.mjs';
import { FileStore } from '../stores/file-store.mjs';
import { createTaskCapsule } from '../engine/context/task-capsule.mjs';
import { createCandidate } from '../engine/context/candidates.mjs';
import { adapters } from '../platforms/index.mjs';
import { selfCheck } from '../engine/cli/qs-design.mjs';
import { addLedgerEntry, readLedger } from '../scripts/ledger.mjs';
import { purgeCandidateArtifacts } from '../stores/privacy.mjs';

const commandPermissions = (paths = []) => ({ network: false, read_paths: paths, write_paths: paths, external_programs: [process.execPath] });

test('memory store is projectless and enforces artifact exclusions', async () => {
  const store = new MemoryStore();
  const task = createTaskCapsule({ taskId: 'task-memory' });
  await store.saveTask(task);
  await store.saveArtifact(task.task_id, 'artifact-a', { visual: 'private' });
  assert.deepEqual(await store.loadTask(task.task_id), task);
  await assert.rejects(() => store.readArtifact(task.task_id, 'artifact-a'), /not authorized/);
  await assert.rejects(() => store.readArtifact(task.task_id, 'artifact-a', { allowed: ['artifact-a'], excluded: ['artifact-a'] }), /excluded/);
  assert.deepEqual(await store.readArtifact(task.task_id, 'artifact-a', { allowed: ['artifact-a'] }), { visual: 'private' });
});

test('portable file store preserves task and candidates without requiring a product project', async () => {
  const root = await mkdtemp(join(tmpdir(), 'qs-store-'));
  try {
    const store = new FileStore(root, { mode: 'portable' });
    const task = createTaskCapsule({ taskId: 'task-portable', persistence: 'portable' });
    const candidate = createCandidate({ taskId: task.task_id, candidateId: 'candidate-a', status: 'shown' });
    await store.saveTask(task); await store.saveCandidate(candidate); await store.saveArtifact(task.task_id, 'prototype:首页/a', { html: '<main />' });
    await store.saveGovernance(task.task_id, 'decisions', { schema: 1, decision_id: 'decision-exported', decision: '保留恢复入口' });
    await store.saveGovernance(task.task_id, 'approvals', { schema: 1, approval_id: 'approval-exported', task_id: task.task_id, candidate_id: candidate.candidate_id });
    const bundle = await store.exportSession(task.task_id);
    assert.match(bundle.bundle_hash, /^[a-f0-9]{64}$/);
    assert.equal(bundle.task.task_id, task.task_id);
    assert.deepEqual(bundle.task.candidate_refs, ['candidate-a']);
    assert.equal(bundle.candidates[0].candidate_id, 'candidate-a');
    assert.equal(bundle.artifacts[0].ref, 'prototype:首页/a');
    assert.equal(bundle.governance.decisions[0].decision_id, 'decision-exported');
    assert.equal(bundle.governance.approvals[0].approval_id, 'approval-exported');
    const importedRoot = join(root, 'imported');
    const imported = new FileStore(importedRoot, { mode: 'portable' });
    await imported.importSession(bundle);
    assert.deepEqual(await imported.readArtifact(task.task_id, 'prototype:首页/a', { allowed: ['prototype:首页/a'] }), { html: '<main />' });
    assert.equal((await imported.listGovernance(task.task_id)).approvals[0].approval_id, 'approval-exported');
    const tampered = structuredClone(bundle);
    tampered.artifacts[0].value.html = '<main>tampered</main>';
    await assert.rejects(() => imported.importSession(tampered), /bundle_hash is invalid/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('portable import rejects cross-task candidate injection', async () => {
  const store = new MemoryStore();
  const task = createTaskCapsule({ taskId: 'task-import' });
  const intruder = createCandidate({ taskId: 'task-other', candidateId: 'candidate-intruder' });
  await assert.rejects(() => store.importSession({ schema: 1, task, candidates: [intruder], artifacts: [] }), /different task/);
});

test('rejected candidate artifacts can be deleted while retaining only audit hashes', async () => {
  const store = new MemoryStore();
  const candidate = createCandidate({ taskId: 'task-delete', candidateId: 'candidate-delete', status: 'rejected', artifactRefs: ['artifact-private'], aspectRefs: { structure: ['artifact-structure-private'] } });
  await store.saveTask(createTaskCapsule({ taskId: candidate.task_id }));
  await store.saveCandidate(candidate);
  await store.saveArtifact(candidate.task_id, 'artifact-private', { pixels: 'private' });
  await store.saveArtifact(candidate.task_id, 'artifact-structure-private', { structure: 'private' });
  const result = await purgeCandidateArtifacts(store, candidate);
  assert.equal(result.retained_content, false);
  assert.match(result.artifacts[0].hash, /^[a-f0-9]{64}$/);
  assert.equal(result.artifacts.length, 2);
  assert.deepEqual(result.candidate.artifact_refs, []);
  assert.deepEqual(result.candidate.aspect_refs.structure, []);
  await assert.rejects(() => store.readArtifact(candidate.task_id, 'artifact-private', { allowed: ['artifact-private'] }), /Unknown artifact/);
  await assert.rejects(() => store.readArtifact(candidate.task_id, 'artifact-structure-private', { allowed: ['artifact-structure-private'] }), /Unknown artifact/);
});

test('all five platform adapters implement the same contract', async () => {
  assert.deepEqual(Object.keys(adapters).sort(), ['alipay', 'android', 'ios', 'web', 'wechat']);
  for (const adapter of Object.values(adapters)) {
    for (const method of ['inspect', 'plan', 'render', 'run', 'verify', 'capture']) assert.equal(typeof adapter[method], 'function');
    const result = await adapter.inspect();
    assert.ok(['available', 'unknown'].includes(result.status));
    assert.ok(Array.isArray(adapter.verification_suite));
  }
});

test('platform runtime executes only an explicit target and keeps missing assertions unknown', async () => {
  const missing = await adapters.web.run();
  assert.equal(missing.status, 'unknown');
  await assert.rejects(() => adapters.web.run({}, { target: { command: process.execPath, args: ['-e', 'process.exit(0)'] } }), /permissions declaration/);
  const session = await adapters.web.run({}, { target: { command: process.execPath, args: ['-e', 'process.stdout.write("runtime-ok")'], permissions: commandPermissions() } });
  assert.equal(session.status, 'completed');
  assert.equal(session.stdout, 'runtime-ok');
  const findings = await adapters.web.verify(session);
  assert.equal(findings.length, adapters.web.verification_suite.length);
  assert.ok(findings.every(item => item.status === 'unknown'));
});

test('platform runtime never accepts an unsupported clean assertion without evidence provenance', async () => {
  const session = await adapters.web.run({}, { target: {
    command: process.execPath,
    args: ['-e', 'process.exit(0)'],
    permissions: commandPermissions(),
    assertions: [{ id: 'keyboard-path', status: 'clean', source: 'automated-test', evidence_attested: true, evidence: ['claimed but unproven'] }]
  } });
  const findings = await adapters.web.verify(session);
  assert.equal(findings.find(item => item.target === 'keyboard-path').status, 'unknown');
  assert.equal(session.assertions[0].declared_status, 'clean');
  assert.equal(session.assertions[0].evidence_attested, false);
});

test('platform runtime accepts only an assertion report changed by the executed command', async () => {
  const root = await mkdtemp(join(tmpdir(), 'qs-runtime-'));
  try {
    const report = join(root, 'assertions.json');
    const payload = JSON.stringify([{ id: 'keyboard-path', status: 'clean', source: 'automated-test', evidence: ['Keyboard path completed.'] }]);
    const session = await adapters.web.run({}, { target: {
      command: process.execPath,
      args: ['-e', `require('node:fs').writeFileSync('assertions.json', ${JSON.stringify(payload)})`],
      cwd: root,
      assertion_report: 'assertions.json',
      permissions: commandPermissions(['assertions.json'])
    } });
    const findings = await adapters.web.verify(session);
    assert.equal(findings.find(item => item.target === 'keyboard-path').status, 'clean');

    await writeFile(report, payload, 'utf8');
    const stale = await adapters.web.run({}, { target: { command: process.execPath, args: ['-e', 'process.exit(0)'], cwd: root, assertion_report: 'assertions.json', permissions: commandPermissions(['assertions.json']) } });
    const staleFindings = await adapters.web.verify(stale);
    assert.equal(staleFindings.find(item => item.target === 'keyboard-path').status, 'unknown');
    assert.ok(stale.evidence.some(item => item.kind === 'runtime-assertion-report-error'));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('self-check parses every schema and reports platform evidence', async () => {
  const result = await selfCheck();
  assert.equal(result.status, 'ok');
  assert.equal(result.schema_ids_unique, true);
  assert.ok(result.schemas.includes('task-capsule.schema.json'));
  assert.equal(Object.keys(result.platforms).length, 5);
});

test('decision ledger defaults to candidate scope and protects profile memory', async () => {
  const root = await mkdtemp(join(tmpdir(), 'qs-ledger-'));
  const path = join(root, 'ledger.jsonl');
  try {
    const record = await addLedgerEntry(path, { verbatim: '这一版太普通', candidate_id: 'candidate-a', carry_forward: true, schema: 999 });
    assert.equal(record.scope, 'candidate');
    assert.equal(record.carry_forward, false);
    assert.equal(record.schema, 2);
    await assert.rejects(() => addLedgerEntry(path, { decision: '不要玻璃', scope: 'profile' }), /explicit_consent/);
    assert.equal((await readLedger(path)).length, 1);
  } finally { await rm(root, { recursive: true, force: true }); }
});

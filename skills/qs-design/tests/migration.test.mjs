import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { migrateV2Project } from '../engine/migration/v2.mjs';

async function writeRun(root, feature, runId, manifest) {
  const directory = join(root, 'design', 'qs-design', feature, 'runs', runId);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'run.json'), `${JSON.stringify(manifest)}\n`);
}

test('v2 migration archives unapproved history, preserves approved proof and never edits old files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'qs-v2-migration-'));
  try {
    await writeRun(root, '首页设计', 'draft-one', { status: 'review_ready', entry: 'overview.html' });
    await writeRun(root, '首页设计', 'approved-two', { status: 'approved', entry: 'overview.html', approval: { prototype_hash: 'proof-hash', direction_id: 'b' } });
    const ledgerRoot = join(root, 'design', 'qs-design');
    await writeFile(join(ledgerRoot, 'ledger.jsonl'), `${JSON.stringify({ decision: '只对本候选生效' })}\n`);
    const migrated = await migrateV2Project(root);
    assert.equal(migrated.tasks.length, 1);
    assert.match(migrated.tasks[0].task.task_id, /^task-v2-[a-f0-9]{12}$/);
    const byId = new Map(migrated.tasks[0].candidates.map(candidate => [candidate.candidate_id, candidate]));
    assert.equal(byId.get('candidate-v2-draft-one').status, 'archived');
    assert.equal(byId.get('candidate-v2-approved-two').status, 'selected');
    assert.equal(byId.get('candidate-v2-approved-two').context_digest, 'proof-hash');
    assert.equal(migrated.legacy_decisions[0].scope, 'candidate');
  } finally { await rm(root, { recursive: true, force: true }); }
});

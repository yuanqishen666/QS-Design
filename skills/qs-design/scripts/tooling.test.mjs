import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { lintContentHTML } from './content-lint.mjs';
import { analyzeStateCoverage } from './state-coverage.mjs';
import { checkProvenance } from './provenance-check.mjs';

test('content lint tracks source, ownership, claims and required states', () => {
  const html = '<main><p data-content-key="claim" data-state="default">节省 50% 时间</p></main>';
  const manifest = { schema: 1, required_states: ['default', 'error'], entries: [{ key: 'claim', kind: 'claim', source: 'marketing', owner: 'growth', evidence: [] }] };
  const result = lintContentHTML(html, 'index.html', { contentManifest: manifest });
  assert.ok(result.warnings.some(item => item.rule === 'content-claim-unverified'));
  assert.ok(result.warnings.some(item => item.rule === 'content-state-missing'));
});

test('state coverage checks cancellation, recovery, idempotency and cross-platform outcomes', () => {
  const result = analyzeStateCoverage({
    initial: 'idle',
    states: { idle: { on: { START: 'saving' } }, saving: { on: { COMMIT: 'done', CANCEL: 'idle', RETRY: 'saving' } }, done: { on: {} } },
    required_states: ['done'],
    critical_actions: [{ id: 'save', from: 'idle', success_state: 'done', cancel_event: 'CANCEL', recovery_event: 'RETRY', retryable: true }],
    platform_contracts: [{ id: 'save-result', platforms: { web: { success: 'saved', cancel: 'idle' }, ios: { success: 'saved', cancel: 'closed' } }, allowed_divergence: [] }]
  });
  assert.ok(result.warnings.some(item => item.includes('idempotency')));
  assert.ok(result.errors.some(item => item.includes('diverges in cancel')));
  assert.deepEqual(result.state_reachability, { reachable: 3, total: 3 });
  assert.equal('coverage' in result, false);
});

test('provenance strict mode verifies integrity and redistribution metadata', async () => {
  const root = await mkdtemp(join(tmpdir(), 'qs-provenance-'));
  try {
    const assetRoot = join(root, 'assets');
    await mkdir(assetRoot);
    const bytes = Buffer.from('asset');
    await writeFile(join(assetRoot, 'icon.svg'), bytes);
    const hash = createHash('sha256').update(bytes).digest('hex');
    await writeFile(join(assetRoot, 'provenance.json'), `${JSON.stringify({
      original: false,
      sources: ['https://example.com/source'],
      novel_decisions: ['Recomposed for the product task'],
      assets: [{ path: 'icon.svg', license: 'MIT', source_url: 'https://example.com/icon', redistribution_scope: 'bundled', license_compatibility: 'reviewed-compatible', sha256: hash }]
    })}\n`);
    const result = await checkProvenance(root, { strict: true });
    assert.deepEqual(result.errors, []);
  } finally { await rm(root, { recursive: true, force: true }); }
});

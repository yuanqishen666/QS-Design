import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { lintHTML } from './design-lint.mjs';
import { validateSources } from './source-check.mjs';
import { renderReferenceBoard } from './ref-board.mjs';
import { routeRequest } from './eval-routing.mjs';
import { addLedgerEntry, readLedger } from './ledger.mjs';
import { queryCapability } from './platform-check.mjs';
import { analyzeStateCoverage } from './state-coverage.mjs';

test('HTML lint catches structural failures and accepts a minimal document', () => {
  const bad = lintHTML('<img src="x.png"><div onclick="go()">Go</div>');
  assert.ok(bad.errors.length >= 4);
  const good = lintHTML('<!doctype html><html lang="zh-CN"><head><title>Demo</title></head><body><button>Go</button><img src="x.png" alt=""></body></html>');
  assert.equal(good.errors.length, 0);
});

test('source validation requires evidence boundaries', () => {
  const errors = validateSources([{ id:'x', title:'X', url:'http://x', publisher:'P', kind:'award', evidence_level:'Z', platforms:[], use_for:'u', does_not_prove:'n', accessed_at:'today', license_or_terms:'link' }]);
  assert.ok(errors.length >= 4);
});

test('reference board escapes untrusted text', () => {
  const html = renderReferenceBoard({ title:'<Board>', items:[{ title:'<script>', url:'https://example.com', observation:'A&B' }] });
  assert.match(html, /&lt;Board&gt;/); assert.doesNotMatch(html, /<script>/); assert.match(html, /A&amp;B/);
});

test('router separates platforms, audits, and interaction lab', () => {
  assert.equal(routeRequest('设计 iPhone 首页'), 'qs-ios-design');
  assert.equal(routeRequest('微信和支付宝两个小程序都要做'), 'qs-design');
  assert.equal(routeRequest('审计现有 Android 页面'), 'qs-design-audit');
  assert.equal(routeRequest('做生活化物理动画探针'), 'qs-interaction-lab');
});

test('ledger writes scope-aware decisions as jsonl', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'qs-ledger-'));
  const path = join(dir, 'ledger.jsonl');
  await addLedgerEntry(path, { project:'demo', platform:'ios', scope:'project', decision:'dense typography', user_evidence:'用户选择方向 B' });
  const entries = await readLedger(path);
  assert.equal(entries.length, 1); assert.equal(entries[0].scope, 'project');
});

test('platform checks expose unknown entries without pretending support', () => {
  const result = queryCapability({ updated_at:'2026-10-28', capabilities:[{ id:'spring', ios:{support:'native'} }] }, 'spring', ['ios','wechat']);
  assert.equal(result.platforms.ios.support,'native'); assert.equal(result.platforms.wechat.support,'unknown');
});

test('state coverage finds unreachable and unknown states', () => {
  const good = analyzeStateCoverage({ initial:'idle', required_states:['done'], required_events:['CANCEL'], states:{ idle:{on:{START:'active'}},active:{on:{CANCEL:'idle',COMMIT:'done'}},done:{on:{RESET:'idle'}} } });
  assert.equal(good.errors.length,0); assert.equal(good.coverage,1);
  const bad = analyzeStateCoverage({ initial:'idle', states:{ idle:{on:{GO:'missing'}},orphan:{} } });
  assert.ok(bad.errors.length>=2);
});

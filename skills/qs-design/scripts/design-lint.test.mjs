import test from 'node:test';
import assert from 'node:assert/strict';
import { lintHTML } from './design-lint.mjs';

const base = body => `<!doctype html><html lang="zh-CN"><head><title>Test</title></head><body>${body}</body></html>`;

test('keeps document and semantic errors deterministic', () => {
  const result = lintHTML('<img src="x.png"><div onclick="go()">Go</div>');
  assert.ok(result.errors.some(item => item.rule === 'document-doctype'));
  assert.ok(result.errors.some(item => item.rule === 'image-alt'));
  assert.ok(result.errors.some(item => item.rule === 'clickable-semantics'));
});

test('warns about unbounded or overly broad motion', () => {
  const result = lintHTML(base('<style>.a{animation:pulse 1s infinite;transition:all .2s}@keyframes pulse{to{opacity:.5}}@media(prefers-reduced-motion:reduce){.a{animation:none}}</style><div class="a">Status</div><video autoplay loop></video>'));
  assert.ok(result.warnings.some(item => item.rule === 'infinite-motion'));
  assert.ok(result.warnings.some(item => item.rule === 'transition-all'));
  assert.ok(result.warnings.some(item => item.rule === 'looping-autoplay'));
  assert.ok(!result.warnings.some(item => item.rule === 'reduced-motion'));
});

test('includes content duplication warnings', () => {
  const result = lintHTML(base('<h1>选择词书</h1><p>选择一本词书</p>'));
  assert.ok(result.warnings.some(item => item.rule === 'content-semantic-overlap'));
});

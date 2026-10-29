import test from 'node:test';
import assert from 'node:assert/strict';
import { lintContentHTML, normalizeContentText } from './content-lint.mjs';

test('normalizes Chinese, Latin and entity text consistently', () => {
  assert.equal(normalizeContentText(' DAILY&nbsp;Plan！ '), 'dailyplan');
  assert.equal(normalizeContentText('选择 词书'), '选择词书');
});

test('reports exact and near duplicate content across adjacent roles', () => {
  const result = lintContentHTML('<h1>选择词书</h1><p>选择一本词书</p><ul><li>大学英语四级</li></ul>');
  assert.ok(result.warnings.some(item => item.rule === 'content-semantic-overlap'));
  const exact = lintContentHTML('<h2>学习计划</h2><p>学习计划</p>');
  assert.ok(exact.warnings.some(item => item.rule === 'content-exact-duplicate'));
});

test('reports repeated option prefixes and respects explicit exceptions', () => {
  const repeated = lintContentHTML('<ul><li>导出 PDF</li><li>导出 Excel</li><li>导出 CSV</li></ul>');
  assert.ok(repeated.warnings.some(item => item.rule === 'content-repeated-prefix'));
  const allowed = lintContentHTML('<h1 data-content-repeat-ok="a11y">确认付款</h1><p>确认付款</p>');
  assert.equal(allowed.warnings.length, 0);
});

test('does not treat distinct title and next-step copy as duplication', () => {
  const result = lintContentHTML('<h2>服务器不可用</h2><p>检查网络连接后重试</p>');
  assert.equal(result.warnings.length, 0);
});

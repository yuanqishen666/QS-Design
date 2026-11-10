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

test('requires supplemental copy to declare why structure cannot replace it', () => {
  const result = lintContentHTML('<p data-content-role="helper">输入发票代码后查询</p>');
  assert.ok(result.warnings.some(item => item.rule === 'content-contract-missing'));

  const hiddenCritical = lintContentHTML('<p data-content-key="renewal" data-content-role="risk" data-content-delivery="tooltip">到期后自动扣款</p>', 'billing.html', {
    contentManifest: {
      schema: 1,
      required_states: [],
      entries: [{ key: 'renewal', kind: 'risk', source: 'billing-policy', owner: 'billing', purpose: 'risk', criticality: 'critical', audience: 'all', timing: 'before-action', delivery: 'tooltip', irreducible_fact: '到期后自动扣款', structure_attempt: '开关状态无法表达扣款后果' }]
    }
  });
  assert.ok(hiddenCritical.warnings.some(item => item.rule === 'content-contract-invalid'));
});

test('checks tooltip relationships, focusability and interactive content', () => {
  const contract = {
    schema: 1,
    required_states: [],
    entries: [{ key: 'term', kind: 'definition', source: 'domain-glossary', owner: 'product', purpose: 'recognition', criticality: 'optional', audience: 'some', timing: 'on-demand', delivery: 'tooltip', irreducible_fact: '账期的领域定义', structure_attempt: '术语本身不能完整表达定义' }]
  };
  const valid = lintContentHTML('<button aria-label="查看账期定义" aria-describedby="term-tip" data-content-source-exempt>i</button><div id="term-tip" role="tooltip" data-content-key="term" data-content-role="definition" data-content-delivery="tooltip">账期是本次结算覆盖的日期范围</div>', 'term.html', { contentManifest: contract });
  assert.equal(valid.warnings.filter(item => item.rule.startsWith('tooltip-')).length, 0);

  const invalid = lintContentHTML('<button disabled aria-describedby="tip">i</button><div id="tip" role="tooltip"><a href="/help">帮助</a></div>');
  assert.ok(invalid.warnings.some(item => item.rule === 'tooltip-disabled-trigger'));
  assert.ok(invalid.warnings.some(item => item.rule === 'tooltip-interactive-content'));
});

test('preserves visible form labels and detects repeated explanation templates', () => {
  const form = lintContentHTML('<input id="email" placeholder="name@example.com" aria-label="邮箱">');
  assert.ok(form.warnings.some(item => item.rule === 'form-visible-label-missing'));
  const labelled = lintContentHTML('<label for="email">邮箱</label><input id="email" placeholder="name@example.com">');
  assert.ok(!labelled.warnings.some(item => item.rule.startsWith('form-')));

  const repeated = lintContentHTML('<h2>A</h2><p>说明 A</p><h2>B</h2><p>说明 B</p><h2>C</h2><p>说明 C</p>');
  assert.ok(repeated.warnings.some(item => item.rule === 'content-repeated-helper-pattern'));
});

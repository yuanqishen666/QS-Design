#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const platforms = [
  ['wechat-miniapp', /微信|wechat|skyline|wxml|wxss|worklet/i],
  ['alipay-miniapp', /支付宝|alipay|axml|acss|my\.createanimation/i],
  ['ios', /\bios\b|iphone|ipad|swiftui|uikit|ipados/i],
  ['android', /android|安卓|jetpack compose|material 3|折叠屏/i],
  ['web', /\bweb\b|网页|网站|浏览器|react|vue|svelte|响应式/i]
];

export function routeRequest(prompt) {
  const platformHits = platforms.filter(([, pattern]) => pattern.test(prompt)).map(([name]) => name);
  const target = platformHits.length > 1 || /多端|跨平台|所有平台|全平台/i.test(prompt)
    ? 'multi'
    : platformHits[0] ?? 'unspecified';
  const mode = /审计|评审|检查|review|audit|lint|上线前验证/i.test(prompt)
    ? 'audit'
    : /生活化|物理动画|手势动画|交互探针|撕|倒水|惯性|shader|rive|material motion/i.test(prompt)
      ? 'interaction'
      : platformHits.length || /设计|页面|界面|原型|design|prototype|小程序|app|网站|网页/i.test(prompt)
        ? 'design'
        : null;
  return mode ? `${mode}:${target}` : null;
}

async function main() {
  const cases = JSON.parse(await readFile(process.argv[2] ?? 'evals/routing.json', 'utf8'));
  const failures = cases.filter(item => routeRequest(item.prompt) !== item.expected).map(item => ({ ...item, actual: routeRequest(item.prompt) }));
  failures.forEach(item => console.error(`FAIL ${item.id}: expected ${item.expected}, got ${item.actual}`));
  console.log(`Routing eval: ${cases.length - failures.length}/${cases.length} passed.`);
  if (failures.length) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error); process.exitCode = 1; });

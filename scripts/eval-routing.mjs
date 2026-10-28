#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const routes = [
  ['qs-design-audit', /审计|评审|检查|review|audit|lint|上线前验证/i],
  ['qs-interaction-lab', /生活化|物理动画|手势动画|交互探针|撕|倒水|惯性|shader|rive|material motion/i],
  ['qs-wechat-miniapp-design', /微信小程序|wechat mini|skyline|wxml|wxss|worklet/i],
  ['qs-alipay-miniapp-design', /支付宝小程序|alipay mini|axml|acss|my\.createanimation/i],
  ['qs-ios-design', /\bios\b|iphone|ipad|swiftui|uikit|ipados/i],
  ['qs-android-design', /android|安卓|jetpack compose|material 3|折叠屏/i],
  ['qs-web-design', /\bweb\b|网页|网站|浏览器|react|vue|svelte|响应式/i]
];

export function routeRequest(prompt) {
  const mentionedPlatforms = [/\bios\b|iphone|ipad|swiftui|uikit|ipados/i,/android|安卓|jetpack compose|material 3|折叠屏/i,/\bweb\b|网页|网站|浏览器|react|vue|svelte|响应式/i,/微信|wechat|skyline|wxml|wxss/i,/支付宝|alipay|axml|acss/i].filter(pattern => pattern.test(prompt)).length;
  if (mentionedPlatforms > 1) return 'qs-design';
  const hits = routes.filter(([, pattern]) => pattern.test(prompt)).map(([name]) => name);
  const platformHits = hits.filter(name => name.endsWith('-design') && !['qs-design-audit'].includes(name));
  if (platformHits.length > 1 || /多端|跨平台|所有平台|全平台/i.test(prompt)) return 'qs-design';
  if (hits[0]) return hits[0];
  return /设计|页面|界面|原型|design|prototype/i.test(prompt) ? 'qs-design' : null;
}

async function main() {
  const cases = JSON.parse(await readFile(process.argv[2] ?? 'evals/routing.json', 'utf8'));
  const failures = cases.filter(item => routeRequest(item.prompt) !== item.expected).map(item => ({ ...item, actual: routeRequest(item.prompt) }));
  failures.forEach(item => console.error(`FAIL ${item.id}: expected ${item.expected}, got ${item.actual}`));
  console.log(`Routing eval: ${cases.length - failures.length}/${cases.length} passed.`);
  if (failures.length) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error); process.exitCode = 1; });

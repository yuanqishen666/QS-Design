#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

export function renderReferenceBoard(data) {
  const items = data.items ?? [];
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(data.title ?? 'Reference Board')}</title><style>:root{color-scheme:light dark;font:15px/1.5 system-ui,sans-serif}body{margin:0;padding:32px;background:#111318;color:#f6f7fb}header{max-width:960px;margin:auto auto 28px}h1{font-size:clamp(32px,7vw,72px);line-height:.95;margin:0 0 16px}.grid{max-width:1200px;margin:auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px}.card{background:#1c2028;border:1px solid #343a46;border-radius:20px;overflow:hidden}.card img{width:100%;aspect-ratio:4/3;object-fit:cover;background:#292e38}.copy{padding:16px}.meta{font-size:12px;color:#aeb7c7}.tags{display:flex;gap:6px;flex-wrap:wrap}.tag{padding:3px 8px;border-radius:999px;background:#2b3240}a{color:#8fb5ff}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}</style></head><body><header><h1>${escape(data.title ?? 'Reference Board')}</h1><p>${escape(data.brief ?? '')}</p><p class="meta">临时研究板：保留原始链接与观察机制，不随 skill 分发第三方截图。</p></header><main class="grid">${items.map(item => `<article class="card">${item.image ? `<img src="${escape(item.image)}" alt="">` : ''}<div class="copy"><h2>${escape(item.title)}</h2><p>${escape(item.observation)}</p><div class="tags">${(item.tags ?? []).map(tag => `<span class="tag">${escape(tag)}</span>`).join('')}</div><p class="meta">访问：${escape(item.accessed_at)} · <a href="${escape(item.url)}">原始来源</a></p></div></article>`).join('')}</main></body></html>`;
}

async function main() {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) throw new Error('Usage: node scripts/ref-board.mjs input.json output.html');
  const data = JSON.parse(await readFile(input, 'utf8'));
  const html = renderReferenceBoard(data);
  await mkdir(dirname(resolve(output)), { recursive: true });
  await writeFile(output, html);
  console.log(`Wrote ${output} with ${(data.items ?? []).length} references.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });

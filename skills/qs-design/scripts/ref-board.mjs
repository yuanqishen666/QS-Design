#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

export function renderReferenceBoard(data) {
  const items = data.items ?? [];
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(data.title ?? 'Reference Board')}</title><style>:root{color-scheme:light dark;font:15px/1.5 system-ui,sans-serif}body{margin:0;padding:clamp(24px,5vw,72px);background:#111318;color:#f6f7fb}header{max-width:1100px;margin:0 auto clamp(56px,10vw,120px);display:grid;grid-template-columns:minmax(0,2fr) minmax(240px,1fr);gap:clamp(24px,5vw,80px);align-items:end}h1{font-size:clamp(48px,9vw,128px);letter-spacing:-.06em;line-height:.82;margin:0}.intro{max-width:46ch}.stream{max-width:1200px;margin:auto;counter-reset:reference}.reference{counter-increment:reference;display:grid;grid-template-columns:minmax(56px,.35fr) minmax(220px,1fr) minmax(300px,2fr);gap:clamp(16px,4vw,64px);align-items:start;padding:32px 0;border-top:1px solid #343a46}.reference:before{content:counter(reference,decimal-leading-zero);font:700 clamp(20px,3vw,44px)/1 ui-monospace,monospace;color:#8fb5ff}.reference:nth-child(even) .visual{order:3}.visual img{display:block;width:100%;max-height:520px;object-fit:cover}.copy h2{font-size:clamp(24px,4vw,52px);line-height:1;margin:0 0 18px}.meta{font-size:12px;color:#aeb7c7}.tags{display:flex;gap:8px 16px;flex-wrap:wrap}.tag{border-bottom:1px solid #687386;padding-bottom:2px}a{color:#8fb5ff}@media(max-width:760px){header,.reference{grid-template-columns:1fr}.reference:nth-child(even) .visual{order:initial}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}</style></head><body><header><h1>${escape(data.title ?? 'Reference Board')}</h1><div class="intro"><p>${escape(data.brief ?? '')}</p><p class="meta">临时研究板：保留原始链接与观察机制，不随 skill 分发第三方截图。</p></div></header><main class="stream">${items.map(item => `<article class="reference"><div class="copy"><h2>${escape(item.title)}</h2><p>${escape(item.observation)}</p><div class="tags">${(item.tags ?? []).map(tag => `<span class="tag">${escape(tag)}</span>`).join('')}</div><p class="meta">访问：${escape(item.accessed_at)} · <a href="${escape(item.url)}">原始来源</a></p></div>${item.image ? `<figure class="visual"><img src="${escape(item.image)}" alt=""></figure>` : '<div class="visual"></div>'}</article>`).join('')}</main></body></html>`;
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

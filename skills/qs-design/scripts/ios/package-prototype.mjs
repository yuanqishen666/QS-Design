#!/usr/bin/env node
// Package trusted, locally authored HTML. No downloads, bundler or UI framework.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const mime = { '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.gif':'image/gif', '.svg':'image/svg+xml', '.woff':'font/woff', '.woff2':'font/woff2', '.mp3':'audio/mpeg', '.mp4':'video/mp4', '.ogg':'audio/ogg', '.ico':'image/x-icon' };
const attr = (tag, name) => new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i').exec(tag)?.[2];
const local = (url, base) => {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|\/)/i.test(url)) throw new Error(`Use relative local dependencies: ${url}`);
  return resolve(base, decodeURIComponent(url.split(/[?#]/)[0]));
};
async function replaceAsync(text, pattern, fn) {
  let out = '', end = 0;
  for (const match of text.matchAll(pattern)) { out += text.slice(end, match.index) + await fn(...match); end = match.index + match[0].length; }
  return out + text.slice(end);
}
async function dataURL(url, base) {
  if (/^(data:|#)/i.test(url)) return url;
  const path = local(url, base), type = mime[extname(path).toLowerCase()];
  if (!type) throw new Error(`Unsupported asset type: ${url}`);
  const fragment = url.includes('#') ? '#' + url.split('#')[1] : '';
  return `data:${type};base64,${(await readFile(path)).toString('base64')}${fragment}`;
}
async function inlineCSS(css, base) {
  if (/@import\b/i.test(css)) throw new Error('Use local link stylesheets instead of CSS @import.');
  return replaceAsync(css, /url\(\s*(["']?)([^)'"\s]+)\1\s*\)/gi, async (_, quote, url) => `url("${await dataURL(url, base)}")`);
}
export async function packagePrototype(source, output) {
  const base = dirname(resolve(source));
  let html = await readFile(source, 'utf8');
  if (/\bsrcset\s*=/i.test(html)) throw new Error('srcset is not supported; use local src assets.');
  html = await replaceAsync(html, /<script\b[^>]*\bsrc\s*=\s*["'][^"']+["'][^>]*>\s*<\/script\s*>/gi, async tag => {
    if (/\btype\s*=\s*["']module["']/i.test(tag)) throw new Error('Bundle ES modules first; this packager supports classic scripts.');
    const js = await readFile(local(attr(tag, 'src'), base), 'utf8');
    return `<script>\n${js.replace(/<\/script/gi, '<\\/script')}\n</script>`;
  });
  html = await replaceAsync(html, /<link\b[^>]*>/gi, async tag => {
    if (attr(tag, 'rel')?.toLowerCase() !== 'stylesheet') return tag;
    const path = local(attr(tag, 'href'), base);
    // Stylesheet is processed below after resolving its asset paths here.
    return `<style>\n${(await inlineCSS(await readFile(path, 'utf8'), dirname(path))).replace(/<\/style/gi, '<\\/style')}\n</style>`;
  });
  html = await replaceAsync(html, /<style\b[^>]*>([\s\S]*?)<\/style>/gi, async (_, css) => `<style>${await inlineCSS(css, base)}</style>`);
  html = await replaceAsync(html, /<(?:img|source|audio|video|input)\b[^>]*>/gi, async tag => {
    for (const name of ['src','poster']) { const url = attr(tag, name); if (url) tag = tag.replace(`${name}="${url}"`, `${name}="${await dataURL(url, base)}"`).replace(`${name}='${url}'`, `${name}="${await dataURL(url, base)}"`); }
    return tag;
  });
  // SVG image references, if present. Local fragment references remain local.
  html = await replaceAsync(html, /<image\b[^>]*>/gi, async tag => {
    const url = attr(tag, '(?:xlink:)?href');
    return url ? tag.replace(url, await dataURL(url, base)) : tag;
  });
  if (/<script\b[^>]*\bsrc\s*=/i.test(html)) throw new Error('Unpackaged script dependency.');
  await mkdir(dirname(resolve(output)), { recursive: true });
  await writeFile(output, html);
  return { source, output, bytes: Buffer.byteLength(html) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length === 2) console.log(await packagePrototype(args[0], args[1]));
  else { console.error('Usage: node package-prototype.mjs source.html output.html'); process.exitCode = 1; }
}

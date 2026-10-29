#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { walk } from './lib.mjs';

const textTags = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'label', 'legend', 'button', 'li']);

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

export function normalizeContentText(value) {
  return decodeEntities(String(value ?? '').replace(/<[^>]*>/g, ' '))
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '');
}

function displayText(value) {
  return decodeEntities(String(value ?? '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function bigrams(value) {
  const output = new Set();
  for (let index = 0; index < value.length - 1; index += 1) output.add(value.slice(index, index + 2));
  return output;
}

function similarity(left, right) {
  const a = bigrams(left), b = bigrams(right);
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  for (const item of a) if (b.has(item)) overlap += 1;
  return overlap / new Set([...a, ...b]).size;
}

function subsequenceOverlap(left, right) {
  let previous = new Uint16Array(right.length + 1);
  for (let x = 1; x <= left.length; x += 1) {
    const current = new Uint16Array(right.length + 1);
    for (let y = 1; y <= right.length; y += 1) {
      current[y] = left[x - 1] === right[y - 1] ? previous[y - 1] + 1 : Math.max(previous[y], current[y - 1]);
    }
    previous = current;
  }
  const common = previous[right.length];
  return { shorter: common / Math.min(left.length, right.length), longer: common / Math.max(left.length, right.length) };
}

function commonPrefix(values) {
  if (!values.length) return '';
  let prefix = values[0];
  for (const value of values.slice(1)) {
    while (prefix && !value.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

export function extractContentItems(html) {
  const source = String(html ?? '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  const items = [];
  const pattern = /<(h[1-6]|p|label|legend|button|li)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  for (const match of source.matchAll(pattern)) {
    const tag = match[1].toLowerCase();
    if (!textTags.has(tag)) continue;
    const text = displayText(match[3]);
    const normalized = normalizeContentText(text);
    if (!normalized) continue;
    items.push({ tag, text, normalized, exempt: /\bdata-content-repeat-ok\s*=/.test(match[2]), index: match.index ?? 0 });
  }
  return items;
}

export function lintContentHTML(html, path = '<html>') {
  const warnings = [];
  const seen = new Set();
  const add = (rule, message) => {
    const key = `${rule}:${message}`;
    if (!seen.has(key)) { seen.add(key); warnings.push({ path, rule, message }); }
  };
  const items = extractContentItems(html);
  for (let leftIndex = 0; leftIndex < items.length; leftIndex += 1) {
    const left = items[leftIndex];
    if (left.exempt || left.normalized.length < 4) continue;
    for (let rightIndex = leftIndex + 1; rightIndex < items.length; rightIndex += 1) {
      const right = items[rightIndex];
      if (right.exempt || right.normalized.length < 4) continue;
      if (left.normalized === right.normalized) {
        add('content-exact-duplicate', `${left.tag} “${left.text}” repeats ${right.tag} “${right.text}”.`);
        continue;
      }
      if (rightIndex - leftIndex > 3) continue;
      const shorter = left.normalized.length <= right.normalized.length ? left.normalized : right.normalized;
      const longer = shorter === left.normalized ? right.normalized : left.normalized;
      const contains = longer.includes(shorter) && shorter.length / longer.length >= 0.55;
      const sequence = Math.max(left.normalized.length, right.normalized.length) <= 160
        ? subsequenceOverlap(left.normalized, right.normalized)
        : { shorter: 0, longer: 0 };
      const near = (Math.min(left.normalized.length, right.normalized.length) >= 6 && similarity(left.normalized, right.normalized) >= 0.72)
        || (sequence.shorter >= 0.8 && sequence.longer >= 0.55);
      if (contains || near) add('content-semantic-overlap', `${left.tag} “${left.text}” substantially overlaps ${right.tag} “${right.text}”; verify that each adds new information.`);
    }
  }

  const options = items.filter(item => !item.exempt && ['li', 'button'].includes(item.tag) && item.normalized.length >= 3);
  const buckets = new Map();
  for (const item of options) {
    const key = item.normalized.slice(0, 2);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(item);
  }
  for (const group of buckets.values()) {
    if (group.length < 3) continue;
    const prefix = commonPrefix(group.map(item => item.normalized));
    if (prefix.length >= 2 && group.every(item => item.normalized.length > prefix.length)) {
      add('content-repeated-prefix', `${group.length} ${group[0].tag} items repeat the prefix “${prefix}”; consider moving shared meaning to the group label.`);
    }
  }
  return { warnings, items };
}

export async function lintContentPaths(target) {
  const paths = await walk(target, path => path.endsWith('.html'));
  const result = { warnings: [], files: paths.length };
  for (const path of paths) result.warnings.push(...lintContentHTML(await readFile(path, 'utf8'), path).warnings);
  return result;
}

async function main() {
  const target = process.argv[2] ?? '.';
  const result = await lintContentPaths(target);
  for (const item of result.warnings) console.warn(`WARN ${item.path} [${item.rule}] ${item.message}`);
  console.log(`Checked content in ${result.files} HTML files; ${result.warnings.length} warnings.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error); process.exitCode = 1; });

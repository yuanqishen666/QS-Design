#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { walk } from './lib.mjs';
import { lintContentHTML } from './content-lint.mjs';

export function lintHTML(text, path = '<html>') {
  const errors = [];
  const warnings = [];
  const add = (list, rule, message) => list.push({ path, rule, message });
  if (!/<!doctype html>/i.test(text)) add(errors, 'document-doctype', 'Missing HTML doctype.');
  if (!/<html\b[^>]*\blang=/i.test(text)) add(errors, 'document-language', 'Set the document language.');
  if (!/<title>[^<]+<\/title>/i.test(text)) add(errors, 'document-title', 'Provide a non-empty title.');
  for (const match of text.matchAll(/<img\b([^>]*)>/gi)) if (!/\balt\s*=/.test(match[1])) add(errors, 'image-alt', 'Image is missing alt; use alt="" only when decorative.');
  for (const match of text.matchAll(/<(div|span)\b([^>]*)\bonclick\s*=/gi)) if (!/\b(role|tabindex)\s*=/.test(match[2])) add(errors, 'clickable-semantics', `Clickable <${match[1]}> lacks role/tabindex; prefer a button or link.`);
  if (/<style[\s>]/i.test(text) && /@keyframes|\btransition\s*:|\banimation\s*:/i.test(text) && !/prefers-reduced-motion/i.test(text)) add(warnings, 'reduced-motion', 'Motion exists without a prefers-reduced-motion path.');
  if (/animation(?:-[^:]+)?\s*:[^;{}]*\binfinite\b|animation-iteration-count\s*:\s*infinite/i.test(text)) add(warnings, 'infinite-motion', 'Infinite motion needs an explicit attention, frequency and reduced-motion justification.');
  if (/transition(?:-property)?\s*:\s*all\b/i.test(text)) add(warnings, 'transition-all', 'Avoid transition: all; name the properties that carry the intended feedback.');
  if (/<(?:video|audio)\b(?=[^>]*\bautoplay\b)(?=[^>]*\bloop\b)[^>]*>/i.test(text)) add(warnings, 'looping-autoplay', 'Autoplaying looped media can compete with the primary task; provide control and a reduced-motion path.');
  if (/https?:\/\/[^"'\s)]+\.(?:js|css)(?:[?"'\s)]|$)/i.test(text)) add(warnings, 'external-runtime', 'External CSS/JS dependency reduces offline prototype reliability.');
  if (/<canvas\b/i.test(text) && !/(aria-label|role=|<button|<input)/i.test(text)) add(warnings, 'canvas-alternative', 'Canvas appears without an obvious semantic control layer.');
  const ids = [...text.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(match => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) add(errors, 'duplicate-id', `Duplicate IDs: ${[...new Set(duplicates)].join(', ')}.`);
  warnings.push(...lintContentHTML(text, path).warnings);
  return { errors, warnings };
}

export async function lintPaths(target) {
  const paths = await walk(target, path => path.endsWith('.html'));
  const result = { errors: [], warnings: [], files: paths.length };
  for (const path of paths) {
    const lint = lintHTML(await readFile(path, 'utf8'), path);
    result.errors.push(...lint.errors); result.warnings.push(...lint.warnings);
  }
  return result;
}

async function main() {
  const target = process.argv[2] ?? '.';
  const result = await lintPaths(target);
  for (const item of result.warnings) console.warn(`WARN ${item.path} [${item.rule}] ${item.message}`);
  for (const item of result.errors) console.error(`ERROR ${item.path} [${item.rule}] ${item.message}`);
  console.log(`Linted ${result.files} HTML files; ${result.errors.length} errors, ${result.warnings.length} warnings.`);
  if (result.errors.length) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error); process.exitCode = 1; });

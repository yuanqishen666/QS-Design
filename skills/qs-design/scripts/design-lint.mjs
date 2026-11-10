#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';
import { walk } from './lib.mjs';
import { lintContentHTML } from './content-lint.mjs';
import { nodeText, parseHTMLStructure, walkElements } from '../engine/verification/html-structure.mjs';
import { cssTokens, parseCSSStructure } from '../engine/verification/css-structure.mjs';

export function lintHTML(text, path = '<html>') {
  const errors = [];
  const warnings = [];
  const add = (list, rule, message) => list.push({ path, rule, message });
  const structure = parseHTMLStructure(text);
  const elements = walkElements(structure.root);
  if (!structure.doctype) add(errors, 'document-doctype', 'Missing HTML doctype.');
  const html = elements.find(node => node.tag === 'html');
  if (!html || !Object.hasOwn(html.attrs, 'lang')) add(errors, 'document-language', 'Set the document language.');
  const title = elements.find(node => node.tag === 'title');
  if (!title || !nodeText(title)) add(errors, 'document-title', 'Provide a non-empty title.');
  for (const node of elements.filter(node => node.tag === 'img')) if (!Object.hasOwn(node.attrs, 'alt')) add(errors, 'image-alt', 'Image is missing alt; use alt="" only when decorative.');
  for (const node of elements.filter(node => ['div', 'span'].includes(node.tag) && Object.hasOwn(node.attrs, 'onclick'))) {
    if (!Object.hasOwn(node.attrs, 'role') && !Object.hasOwn(node.attrs, 'tabindex')) add(errors, 'clickable-semantics', `Clickable <${node.tag}> lacks role/tabindex; prefer a button or link.`);
  }
  const styles = elements.filter(node => node.tag === 'style').map(node => (node.children ?? []).filter(child => child.type === 'text').map(child => child.value).join(''));
  const css = styles.map(parseCSSStructure);
  const declarations = css.flatMap(sheet => sheet.rules.flatMap(rule => rule.declarations));
  const atRules = css.flatMap(sheet => sheet.at_rules.map(rule => rule.prelude.toLowerCase()));
  const hasMotion = atRules.some(rule => rule.startsWith('@keyframes')) || declarations.some(item => item.property.startsWith('animation') || item.property.startsWith('transition'));
  const hasReducedMotion = atRules.some(rule => rule.includes('prefers-reduced-motion'));
  if (hasMotion && !hasReducedMotion) add(warnings, 'reduced-motion', 'Motion exists without a prefers-reduced-motion path.');
  if (declarations.some(item => item.property.startsWith('animation') && cssTokens(item.value).includes('infinite'))) add(warnings, 'infinite-motion', 'Infinite motion needs an explicit attention, frequency and reduced-motion justification.');
  if (declarations.some(item => ['transition', 'transition-property'].includes(item.property) && cssTokens(item.value).includes('all'))) add(warnings, 'transition-all', 'Avoid transition: all; name the properties that carry the intended feedback.');
  if (elements.some(node => ['video', 'audio'].includes(node.tag) && Object.hasOwn(node.attrs, 'autoplay') && Object.hasOwn(node.attrs, 'loop'))) add(warnings, 'looping-autoplay', 'Autoplaying looped media can compete with the primary task; provide control and a reduced-motion path.');
  const externalRuntime = elements.some(node => (node.tag === 'script' && /^https?:\/\//i.test(node.attrs.src ?? '')) || (node.tag === 'link' && /^https?:\/\//i.test(node.attrs.href ?? '')));
  if (externalRuntime) add(warnings, 'external-runtime', 'External CSS/JS dependency reduces offline prototype reliability.');
  for (const node of elements.filter(node => node.tag === 'script' && !node.attrs.src && (node.attrs.type ?? '').toLowerCase() !== 'module')) {
    const source = (node.children ?? []).filter(child => child.type === 'text').map(child => child.value).join('');
    if (!source.trim()) continue;
    try { new Script(source); } catch (error) { add(errors, 'script-syntax', `Inline script syntax error: ${error.message}`); }
  }
  if (elements.some(node => node.tag === 'canvas') && !elements.some(node => ['button', 'input'].includes(node.tag) || Object.hasOwn(node.attrs, 'aria-label') || Object.hasOwn(node.attrs, 'role'))) add(warnings, 'canvas-alternative', 'Canvas appears without an obvious semantic control layer.');
  const ids = elements.map(node => node.attrs.id).filter(Boolean);
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

#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { walk } from './lib.mjs';
import { SUPPLEMENTAL_CONTENT_KINDS, validateContentContract } from '../engine/content/contract.mjs';
import { nodeText, parseHTMLStructure, walkElements } from '../engine/verification/html-structure.mjs';

const textTags = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'small', 'label', 'legend', 'button', 'li', 'dt', 'dd', 'summary']);
const headingTags = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
const helperTags = new Set(['p', 'small']);
const formControlTags = new Set(['input', 'select', 'textarea']);
const interactiveTags = new Set(['a', 'button', 'input', 'select', 'textarea', 'summary']);
const decorativeRoles = new Set(['slogan', 'eyebrow', 'section-intro']);
const decorativeClassPattern = /(?:^|[\s_-])(eyebrow|kicker|overline|supertitle|pretitle|surtitle)(?:$|[\s_-])/i;
const vagueEvaluativeHeadingPattern = /^(?:这一轮|本轮|这一(?:步|次)|这一次|现在|接下来)[，,:：]?(?:可以|还能|会)?更(?:自然|清晰|轻松|高效|专业|简单|智能|贴心)[。.!！]?$/u;

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
  const structure = parseHTMLStructure(html);
  const items = [];
  for (const [index, node] of walkElements(structure.root).entries()) {
    const tag = node.tag;
    const explicitCarrier = Object.hasOwn(node.attrs, 'data-content-key') || node.attrs.role === 'tooltip' || Object.hasOwn(node.attrs, 'data-content-role');
    if ((!textTags.has(tag) && !explicitCarrier) || ['script', 'style'].includes(tag)) continue;
    const text = displayText(nodeText(node));
    const normalized = normalizeContentText(text);
    if (!normalized) continue;
    items.push({
      tag,
      text,
      normalized,
      exempt: Object.hasOwn(node.attrs, 'data-content-repeat-ok'),
      source_exempt: Object.hasOwn(node.attrs, 'data-content-source-exempt'),
      key: node.attrs['data-content-key'] ?? null,
      state: node.attrs['data-state'] ?? null,
      role: node.attrs['data-content-role'] ?? null,
      delivery: node.attrs['data-content-delivery'] ?? (node.attrs.role === 'tooltip' ? 'tooltip' : null),
      justified: Boolean(node.attrs['data-content-justification']),
      className: node.attrs.class ?? '',
      id: node.attrs.id ?? '',
      lang: node.attrs.lang ?? '',
      index
    });
  }
  return items;
}

function attributeTokens(value) {
  return String(value ?? '').trim().split(/\s+/).filter(Boolean);
}

function isDisabled(node) {
  return Object.hasOwn(node.attrs, 'disabled') || node.attrs['aria-disabled'] === 'true';
}

function isFocusable(node) {
  if (isDisabled(node)) return false;
  if (['button', 'input', 'select', 'textarea', 'summary'].includes(node.tag)) return true;
  if (node.tag === 'a' && Boolean(node.attrs.href)) return true;
  return Object.hasOwn(node.attrs, 'tabindex') && node.attrs.tabindex !== '-1';
}

function parentMap(root) {
  const output = new Map();
  const visit = node => {
    for (const child of node.children ?? []) {
      if (child.type === 'element') output.set(child, node);
      visit(child);
    }
  };
  visit(root);
  return output;
}

function hasVisibleLabel(control, elements, parents) {
  const id = control.attrs.id;
  if (id && elements.some(node => node.tag === 'label' && node.attrs.for === id && displayText(nodeText(node)))) return true;
  for (let current = parents.get(control); current; current = parents.get(current)) {
    if (current.tag === 'label' && displayText(nodeText(current))) return true;
  }
  const labelledBy = attributeTokens(control.attrs['aria-labelledby']);
  return labelledBy.length > 0 && labelledBy.every(ref => elements.some(node => node.attrs.id === ref && displayText(nodeText(node))));
}

export function lintContentHTML(html, path = '<html>', { contentManifest = null } = {}) {
  const warnings = [];
  const seen = new Set();
  const add = (rule, message) => {
    const key = `${rule}:${message}`;
    if (!seen.has(key)) { seen.add(key); warnings.push({ path, rule, message }); }
  };
  const items = extractContentItems(html);
  const structure = parseHTMLStructure(html);
  const elements = walkElements(structure.root);
  const parents = parentMap(structure.root);
  const documentLanguage = elements.find(node => node.tag === 'html')?.attrs.lang?.toLowerCase() ?? '';
  const sourceBackedKeys = new Set((contentManifest?.entries ?? []).filter(entry => entry?.source).map(entry => entry.key));
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

  const headingHelperPairs = items.filter((item, index) => headingTags.has(item.tag) && helperTags.has(items[index + 1]?.tag));
  if (headingHelperPairs.length >= 3) {
    add('content-repeated-helper-pattern', `${headingHelperPairs.length} headings are each followed by helper copy; verify that the page is not using explanation as a repeated module template.`);
  }

  for (const node of elements.filter(node => Object.hasOwn(node.attrs, 'title') && node.tag !== 'title')) {
    add('tooltip-native-title', `<${node.tag}> relies on a title attribute; do not use native title as the only tooltip or accessible-name implementation.`);
  }

  const tooltips = elements.filter(node => node.attrs.role === 'tooltip' || node.attrs['data-content-delivery'] === 'tooltip');
  for (const tooltip of tooltips) {
    const id = tooltip.attrs.id;
    const label = id ? `Tooltip #${id}` : 'Tooltip';
    if (!displayText(nodeText(tooltip))) add('tooltip-empty', `${label} has no text content.`);
    if (!id) add('tooltip-id-missing', `${label} needs an id so its trigger can reference it.`);
    const descendants = walkElements(tooltip).slice(1);
    if (descendants.some(node => interactiveTags.has(node.tag) || isFocusable(node))) add('tooltip-interactive-content', `${label} contains interactive or focusable content; use details, popover or dialog instead.`);
    const triggers = id ? elements.filter(node => attributeTokens(node.attrs['aria-describedby']).includes(id)) : [];
    if (id && !triggers.length) add('tooltip-trigger-missing', `${label} has no trigger linked with aria-describedby.`);
    for (const trigger of triggers) {
      if (isDisabled(trigger)) add('tooltip-disabled-trigger', `${label} is attached to a disabled trigger and may be unreachable.`);
      else if (!isFocusable(trigger)) add('tooltip-trigger-not-focusable', `${label} trigger <${trigger.tag}> is not keyboard focusable.`);
    }
  }

  for (const trigger of elements.filter(node => Object.hasOwn(node.attrs, 'data-info-trigger'))) {
    if (!attributeTokens(trigger.attrs['aria-describedby']).length && !trigger.attrs['aria-controls']) {
      add('info-trigger-unbound', `Info trigger <${trigger.tag}> has no aria-describedby or aria-controls relationship.`);
    }
    if (!isFocusable(trigger)) add('info-trigger-not-focusable', `Info trigger <${trigger.tag}> is not keyboard focusable.`);
  }

  const ignoredInputTypes = new Set(['hidden', 'button', 'submit', 'reset', 'image']);
  for (const control of elements.filter(node => formControlTags.has(node.tag) && !ignoredInputTypes.has((node.attrs.type ?? '').toLowerCase()))) {
    if (hasVisibleLabel(control, elements, parents)) continue;
    const identity = control.attrs.id ? `#${control.attrs.id}` : `<${control.tag}>`;
    if (control.attrs['aria-label']) add('form-visible-label-missing', `${identity} has only an aria-label; provide a visible label unless the control is an established icon-only exception.`);
    else if (control.attrs.placeholder) add('form-placeholder-label', `${identity} uses placeholder text without a visible label; placeholder is not a label.`);
    else add('form-label-missing', `${identity} has no visible label or labelled-by relationship.`);
  }

  for (const item of items.filter(item => decorativeRoles.has(item.role) && !item.justified)) {
    add('content-decorative-copy', `${item.tag} “${item.text}” is marked ${item.role} without a business or brand justification.`);
  }

  const nonEnglishSurface = documentLanguage
    ? !documentLanguage.startsWith('en')
    : items.some(item => /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(item.text));
  for (const item of items) {
    const sourceBacked = item.source_exempt || item.justified || (item.key && sourceBackedKeys.has(item.key));
    const targetLanguageSample = item.lang && documentLanguage && item.lang.toLowerCase() !== documentLanguage;
    const latinWords = item.text.match(/[A-Za-z]{2,}/g) ?? [];
    const inferredDecorativeRole = decorativeClassPattern.test(`${item.className} ${item.id}`);
    if (nonEnglishSurface && !sourceBacked && !targetLanguageSample && inferredDecorativeRole && latinWords.length >= 2) {
      add('content-decorative-english', `${item.tag} “${item.text}” looks like unsupported decorative English on a non-English surface; remove it or declare its user, brand or business basis.`);
    }
    if (!sourceBacked && headingTags.has(item.tag) && vagueEvaluativeHeadingPattern.test(item.text.replace(/\s+/g, ''))) {
      add('content-vague-evaluative-heading', `${item.tag} “${item.text}” makes a vague improvement judgment without a concrete state or source; remove it or replace it with observable task information.`);
    }
  }

  if (contentManifest) {
    const validation = validateContentContract(contentManifest);
    for (const message of validation.errors) add('content-contract-invalid', message);
    for (const message of validation.advisories) add('content-contract-advisory', message);
    const entries = new Map((contentManifest.entries ?? []).map(entry => [entry.key, entry]));
    const presentKeys = new Set(items.map(item => item.key).filter(Boolean));
    for (const item of items) {
      if (!item.key && !item.source_exempt) { add('content-key-missing', `${item.tag} “${item.text}” has no content key for source and ownership review.`); continue; }
      if (!item.key) continue;
      const entry = entries.get(item.key);
      if (!entry) add('content-source-missing', `${item.tag} “${item.text}” uses content key ${item.key} without a manifest entry.`);
      else {
        if (!entry.source) add('content-source-missing', `Content ${item.key} has no source.`);
        if (!entry.owner) add('content-owner-missing', `Content ${item.key} has no owner.`);
        if (entry.kind === 'claim' && !(entry.evidence ?? []).length) add('content-claim-unverified', `Claim ${item.key} has no supporting evidence.`);
        if (item.delivery && entry.delivery && item.delivery !== entry.delivery) add('content-delivery-mismatch', `Content ${item.key} renders as ${item.delivery} but its contract declares ${entry.delivery}.`);
        if (item.role && SUPPLEMENTAL_CONTENT_KINDS.includes(item.role) && !SUPPLEMENTAL_CONTENT_KINDS.includes(entry.kind)) add('content-role-mismatch', `Content ${item.key} is rendered as ${item.role} but its contract kind is ${entry.kind ?? 'missing'}.`);
      }
    }
    for (const entry of contentManifest.entries ?? []) if (entry.required !== false && !presentKeys.has(entry.key)) add('content-entry-missing', `Required content entry ${entry.key} is not rendered.`);
    const presentStates = new Set(items.map(item => item.state).filter(Boolean));
    for (const state of contentManifest.required_states ?? []) if (!presentStates.has(state)) add('content-state-missing', `Required content state “${state}” is not represented.`);
  } else {
    for (const item of items.filter(item => SUPPLEMENTAL_CONTENT_KINDS.includes(item.role) || item.delivery)) {
      add('content-contract-missing', `${item.tag} “${item.text}” is supplemental or disclosed content without a content visibility contract.`);
    }
  }
  return { warnings, items };
}

export async function lintContentPaths(target, options = {}) {
  const paths = await walk(target, path => path.endsWith('.html'));
  const result = { warnings: [], files: paths.length };
  for (const path of paths) result.warnings.push(...lintContentHTML(await readFile(path, 'utf8'), path, options).warnings);
  return result;
}

export function parseContentLintArgs(args = []) {
  const manifestIndex = args.indexOf('--manifest');
  const manifestPath = manifestIndex >= 0 ? args[manifestIndex + 1] : null;
  const manifestValueIndex = manifestIndex >= 0 ? manifestIndex + 1 : -1;
  const target = args.find((arg, index) => !arg.startsWith('--') && index !== manifestValueIndex) ?? '.';
  return { target, manifestPath };
}

async function main() {
  const { target, manifestPath } = parseContentLintArgs(process.argv.slice(2));
  const contentManifest = manifestPath ? JSON.parse(await readFile(manifestPath, 'utf8')) : null;
  const result = await lintContentPaths(target, { contentManifest });
  for (const item of result.warnings) console.warn(`WARN ${item.path} [${item.rule}] ${item.message}`);
  console.log(`Checked content in ${result.files} HTML files; ${result.warnings.length} warnings.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error); process.exitCode = 1; });

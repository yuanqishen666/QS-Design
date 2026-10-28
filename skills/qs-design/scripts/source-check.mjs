#!/usr/bin/env node
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJSON } from './lib.mjs';

export function validateSources(sources) {
  const errors = [];
  const ids = new Set();
  const urls = new Set();
  const required = ['id', 'title', 'url', 'publisher', 'kind', 'evidence_level', 'platforms', 'use_for', 'does_not_prove', 'accessed_at', 'license_or_terms'];
  for (const [index, source] of sources.entries()) {
    for (const field of required) if (source[field] == null || source[field] === '') errors.push(`Entry ${index} missing ${field}.`);
    if (ids.has(source.id)) errors.push(`Duplicate source id: ${source.id}.`); ids.add(source.id);
    if (urls.has(source.url)) errors.push(`Duplicate source URL: ${source.url}.`); urls.add(source.url);
    if (!/^https:\/\//.test(source.url ?? '')) errors.push(`${source.id}: source URL must use https.`);
    if (!['A', 'B', 'C'].includes(source.evidence_level)) errors.push(`${source.id}: invalid evidence level.`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(source.accessed_at ?? '')) errors.push(`${source.id}: invalid accessed_at.`);
    if (!Array.isArray(source.platforms) || !source.platforms.length) errors.push(`${source.id}: platforms must be non-empty.`);
  }
  return errors;
}

async function main() {
  const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const path = process.argv[2] ?? join(skillRoot, 'references/data/award-sources.json');
  const sources = await readJSON(path);
  const errors = validateSources(sources);
  for (const error of errors) console.error(`ERROR ${error}`);
  console.log(`Checked ${sources.length} award/reference sources.`);
  if (errors.length) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error); process.exitCode = 1; });

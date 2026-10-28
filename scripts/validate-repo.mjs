#!/usr/bin/env node
import { access, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { markdownLinks, parseFrontmatter, readJSON, walk } from './lib.mjs';

export async function validateRepository(root = '.') {
  const base = resolve(root);
  const errors = [];
  const warnings = [];
  const manifest = await readJSON(join(base, 'plugin.json')).catch(error => { errors.push(`plugin.json: ${error.message}`); return null; });
  if (manifest) {
    if (manifest.name !== 'qs-design') errors.push('plugin.json: name must remain qs-design.');
    if (!/^\d+\.\d+\.\d+$/.test(manifest.version ?? '')) errors.push('plugin.json: version must be semver.');
  }
  const skills = await walk(join(base, 'skills'), path => path.endsWith('/SKILL.md'));
  if (!skills.length) errors.push('No skills found under skills/.');
  const names = new Set();
  for (const path of skills) {
    const text = await readFile(path, 'utf8');
    const frontmatter = parseFrontmatter(text);
    const folder = dirname(path).split('/').at(-1);
    if (!frontmatter) { errors.push(`${path}: missing frontmatter.`); continue; }
    if (frontmatter.name !== folder) errors.push(`${path}: name ${frontmatter.name} must match folder ${folder}.`);
    if (!frontmatter.description || frontmatter.description.length < 24) errors.push(`${path}: description is missing or not discriminating.`);
    if (names.has(frontmatter.name)) errors.push(`${path}: duplicate skill name ${frontmatter.name}.`);
    names.add(frontmatter.name);
  }
  const markdown = await walk(base, path => path.endsWith('.md'));
  for (const path of markdown) {
    const text = await readFile(path, 'utf8');
    for (const link of markdownLinks(text)) {
      if (/^(?:https?:|mailto:|data:)/i.test(link)) continue;
      const local = resolve(dirname(path), decodeURIComponent(link));
      try { await access(local); }
      catch { errors.push(`${path}: missing local link ${link}.`); }
    }
    if (/\b(?:TBD|PLACEHOLDER)\b/.test(text)) warnings.push(`${path}: contains unfinished marker.`);
  }
  for (const path of await walk(base, path => path.endsWith('.json'))) {
    try { await readJSON(path); }
    catch (error) { errors.push(`${path}: invalid JSON: ${error.message}`); }
  }
  return { errors, warnings, skills: [...names].sort() };
}

async function main() {
  const root = process.argv[2] ?? '.';
  const result = await validateRepository(root);
  for (const warning of result.warnings) console.warn(`WARN ${warning}`);
  for (const error of result.errors) console.error(`ERROR ${error}`);
  console.log(`Validated ${result.skills.length} skills: ${result.skills.join(', ')}`);
  if (result.errors.length) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error); process.exitCode = 1; });

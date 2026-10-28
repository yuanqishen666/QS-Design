#!/usr/bin/env node
import { access, readFile } from 'node:fs/promises';
import { dirname, join, parse, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMedia, walk } from './lib.mjs';

export async function checkProvenance(target, { strict = false } = {}) {
  const root = resolve(target);
  const errors = [];
  const warnings = [];
  const packages = await walk(root, path => path.endsWith('provenance.json'));
  for (const path of packages) {
    let data;
    try { data = JSON.parse(await readFile(path, 'utf8')); }
    catch (error) { errors.push(`${path}: invalid JSON: ${error.message}`); continue; }
    if (data.original !== true && !Array.isArray(data.sources)) errors.push(`${path}: declare original or list sources.`);
    for (const asset of data.assets ?? []) {
      if (!asset.path || !asset.license || !asset.source_url) errors.push(`${path}: each external asset needs path, license and source_url.`);
      if (asset.path) try { await access(resolve(dirname(path), asset.path)); } catch { errors.push(`${path}: missing asset ${asset.path}.`); }
    }
    if (!Array.isArray(data.novel_decisions) || !data.novel_decisions.length) warnings.push(`${path}: record at least one novel decision.`);
  }
  const media = await walk(root, isMedia);
  for (const path of media) {
    const folder = dirname(path);
    const localPackage = join(folder, 'provenance.json');
    try { await access(localPackage); }
    catch { (strict ? errors : warnings).push(`${path}: no provenance.json in ${folder}.`); }
  }
  return { errors, warnings, packages: packages.length, media: media.length };
}

async function main() {
  const strict = process.argv.includes('--strict');
  const target = process.argv.find(arg => !arg.startsWith('--') && arg !== process.argv[0] && arg !== process.argv[1]) ?? 'specimens';
  const result = await checkProvenance(target, { strict });
  result.warnings.forEach(message => console.warn(`WARN ${message}`));
  result.errors.forEach(message => console.error(`ERROR ${message}`));
  console.log(`Checked ${result.packages} provenance packages and ${result.media} media files.`);
  if (result.errors.length) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error); process.exitCode = 1; });

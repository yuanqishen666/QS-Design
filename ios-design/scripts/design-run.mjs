#!/usr/bin/env node
import { randomBytes } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const tool = 'qs-ios-design';
const runPattern = /^\d{8}T\d{6}Z-[a-z0-9]{4,12}$/;

export function normalizeFeature(value) {
  const feature = String(value ?? '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
    .replace(/-+$/g, '');
  if (!feature) throw new Error('Feature name must contain letters or numbers.');
  return feature;
}

function assertRunId(runId) {
  if (!runPattern.test(String(runId ?? ''))) throw new Error(`Invalid run ID: ${runId}`);
  return runId;
}

function runIdFor(now = new Date(), token = randomBytes(3).toString('hex')) {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const suffix = String(token).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
  if (suffix.length < 4) throw new Error('Run token must contain at least four letters or numbers.');
  return `${stamp}-${suffix}`;
}

function featureRoot(projectRoot, feature) {
  return join(resolve(projectRoot), 'design', tool, normalizeFeature(feature));
}

function runDirectory(projectRoot, feature, runId) {
  return join(featureRoot(projectRoot, feature), 'runs', assertRunId(runId));
}

function inside(base, value) {
  if (!value || isAbsolute(value)) throw new Error('Artifact paths must be relative to the run directory.');
  const target = resolve(base, value);
  const rel = relative(base, target);
  if (!rel || rel.startsWith('..') || isAbsolute(rel)) throw new Error(`Artifact path leaves the run directory: ${value}`);
  return target;
}

async function readJSON(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJSON(path, value, options) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, options);
}

export async function createRun({ projectRoot = '.', feature, parentRunId = null, now = new Date(), token } = {}) {
  const featureId = normalizeFeature(feature);
  const runsRoot = join(featureRoot(projectRoot, featureId), 'runs');
  await mkdir(runsRoot, { recursive: true });

  if (parentRunId) {
    assertRunId(parentRunId);
    const parent = await readJSON(join(runDirectory(projectRoot, featureId, parentRunId), 'run.json'));
    if (parent.tool !== tool || parent.feature !== featureId) throw new Error('Parent run belongs to a different feature.');
  }

  const runId = runIdFor(now, token);
  const directory = join(runsRoot, runId);
  await mkdir(directory);
  const manifest = {
    schema: 1,
    tool,
    feature: featureId,
    run_id: runId,
    mode: parentRunId ? 'iterate' : 'new',
    parent_run_id: parentRunId,
    status: 'draft',
    entry: null,
    preview: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  };
  await writeJSON(join(directory, 'run.json'), manifest, { flag: 'wx' });
  return { directory, manifest };
}

export async function selectRun({ projectRoot = '.', feature, runId, now = new Date() } = {}) {
  const featureId = normalizeFeature(feature);
  assertRunId(runId);
  const manifest = await readJSON(join(runDirectory(projectRoot, featureId, runId), 'run.json'));
  if (manifest.tool !== tool || manifest.feature !== featureId) throw new Error('Run belongs to a different feature.');
  const pointer = { schema: 1, tool, feature: featureId, run_id: runId, updated_at: now.toISOString() };
  await writeJSON(join(featureRoot(projectRoot, featureId), 'selected.json'), pointer);
  return pointer;
}

export async function getSelectedRun({ projectRoot = '.', feature } = {}) {
  const featureId = normalizeFeature(feature);
  try {
    const pointer = await readJSON(join(featureRoot(projectRoot, featureId), 'selected.json'));
    if (pointer.tool !== tool || pointer.feature !== featureId) throw new Error('Selected run belongs to a different feature.');
    assertRunId(pointer.run_id);
    const manifest = await readJSON(join(runDirectory(projectRoot, featureId, pointer.run_id), 'run.json'));
    if (manifest.tool !== tool || manifest.feature !== featureId || manifest.run_id !== pointer.run_id) throw new Error('Selected run metadata is inconsistent.');
    return { pointer, manifest, directory: runDirectory(projectRoot, featureId, pointer.run_id) };
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

export async function finishRun({ projectRoot = '.', feature, runId, entry, preview = null, now = new Date(), select = true } = {}) {
  const featureId = normalizeFeature(feature);
  const directory = runDirectory(projectRoot, featureId, runId);
  const manifestPath = join(directory, 'run.json');
  const manifest = await readJSON(manifestPath);
  if (manifest.tool !== tool || manifest.feature !== featureId || manifest.run_id !== runId) throw new Error('Run metadata is inconsistent.');
  await stat(inside(directory, entry));
  if (preview) await stat(inside(directory, preview));
  const finished = { ...manifest, status: 'ready', entry, preview, updated_at: now.toISOString() };
  await writeJSON(manifestPath, finished);
  if (select) await selectRun({ projectRoot, feature: featureId, runId, now });
  return { directory, manifest: finished };
}

export async function listRuns({ projectRoot = '.', feature } = {}) {
  const featureId = normalizeFeature(feature);
  const root = join(featureRoot(projectRoot, featureId), 'runs');
  let names;
  try { names = await readdir(root); }
  catch (error) { if (error?.code === 'ENOENT') return []; throw error; }
  const runs = [];
  for (const name of names.filter(name => runPattern.test(name)).sort()) {
    try { runs.push(await readJSON(join(root, name, 'run.json'))); }
    catch (error) { if (error?.code !== 'ENOENT') throw error; }
  }
  return runs;
}

function parseArgs(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith('--')) throw new Error(`Unexpected argument: ${arg}`);
    const key = arg.slice(2);
    const value = args[i + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for --${key}`);
    options[key] = value;
    i += 1;
  }
  return options;
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const options = parseArgs(rest);
  const common = { projectRoot: options.project ?? '.', feature: options.feature };
  let result;
  if (command === 'create') result = await createRun({ ...common, parentRunId: options.parent ?? null });
  else if (command === 'finish') result = await finishRun({ ...common, runId: options.run, entry: options.entry, preview: options.preview ?? null });
  else if (command === 'select') result = await selectRun({ ...common, runId: options.run });
  else if (command === 'selected') result = await getSelectedRun(common);
  else if (command === 'list') result = await listRuns(common);
  else throw new Error('Usage: design-run.mjs create|finish|select|selected|list --project . --feature name [options]');
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}

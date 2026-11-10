import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createTaskCapsule } from '../context/task-capsule.mjs';
import { createCandidate } from '../context/candidates.mjs';
import { sha256 } from '../shared/utils.mjs';

const statusMap = {
  draft: 'archived',
  ready: 'archived',
  review_ready: 'archived',
  approved: 'selected',
  implementing: 'selected',
  implemented: 'implemented',
  rejected: 'rejected'
};

const legacyId = (prefix, value) => {
  const slug = String(value ?? '').normalize('NFKC').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  return `${prefix}-v2-${slug || sha256(String(value)).slice(0, 12)}`;
};

async function listDirectories(root) {
  try { return (await readdir(root, { withFileTypes: true })).filter(entry => entry.isDirectory()).map(entry => entry.name); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}

async function readJSONLines(path) {
  try {
    return (await readFile(path, 'utf8')).split('\n').filter(Boolean).map((line, index) => {
      try { return JSON.parse(line); }
      catch (error) { throw new Error(`${path}:${index + 1}: ${error.message}`); }
    });
  } catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}

export async function migrateV2Project(projectRoot) {
  const root = resolve(projectRoot);
  const designRoot = join(root, 'design', 'qs-design');
  const features = await listDirectories(designRoot);
  const tasks = [];
  for (const feature of features) {
    const task = createTaskCapsule({ taskId: legacyId('task', feature), persistence: 'project', currentRequirements: [{ value: `Migrated legacy feature: ${feature}`, kind: 'unknown', source: 'v2-run-manifest', confidence: 'unknown', scope: 'task' }] });
    const candidates = [];
    for (const runId of await listDirectories(join(designRoot, feature, 'runs'))) {
      let manifest;
      try { manifest = JSON.parse(await readFile(join(designRoot, feature, 'runs', runId, 'run.json'), 'utf8')); }
      catch (error) { if (error.code === 'ENOENT') continue; throw error; }
      const artifactRefs = [manifest.entry, manifest.preview, manifest.directions_manifest].filter(Boolean).map(path => `legacy:${feature}/${runId}/${path}`);
      candidates.push(createCandidate({
        candidateId: legacyId('candidate', runId),
        taskId: task.task_id,
        status: statusMap[manifest.status] ?? 'archived',
        parents: manifest.parent_run_id ? [legacyId('candidate', manifest.parent_run_id)] : [],
        contextDigest: manifest.approval?.prototype_hash ?? '',
        artifactRefs,
        acceptedAspects: manifest.approval?.direction_id ? [`legacy-direction:${manifest.approval.direction_id}`] : [],
        feedback: []
      }));
    }
    task.candidate_refs = candidates.map(candidate => candidate.candidate_id);
    tasks.push({ task, candidates });
  }
  const ledgerPaths = [
    join(designRoot, 'ledger.jsonl'),
    join(designRoot, 'appearance-ledger.jsonl'),
    join(root, '.qs-design', 'decision-ledger.jsonl')
  ];
  const legacyDecisions = [];
  for (const path of ledgerPaths) {
    for (const entry of await readJSONLines(path)) legacyDecisions.push({
      ...entry,
      scope: entry.scope ?? 'candidate',
      carry_forward: entry.carry_forward === true,
      migrated_from: path
    });
  }
  return { schema: 1, migrated_from: 'qs-design-v2', project_root: root, tasks, legacy_decisions: legacyDecisions };
}

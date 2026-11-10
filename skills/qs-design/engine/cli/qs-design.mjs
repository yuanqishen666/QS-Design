#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createTaskCapsule } from '../context/task-capsule.mjs';
import { createCandidate } from '../context/candidates.mjs';
import { compileContextManifest } from '../context/read-policy.mjs';
import { buildWorkerPayload } from '../context/worker-payload.mjs';
import { planDirectionCount } from '../directions/planner.mjs';
import { applyVerificationExceptions, verifyBundle } from '../verification/report.mjs';
import { migrateV2Project } from '../migration/v2.mjs';
import { createDecision, createException } from '../governance/decisions.mjs';
import { createApproval, approvalDrift, hashArtifactFiles } from '../governance/approval.mjs';
import { adapters } from '../../platforms/index.mjs';
import { createStore } from '../../stores/index.mjs';
import { readJSON, writeJSON } from '../shared/utils.mjs';

function parseArgs(args) {
  const positionals = [];
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const item = args[index];
    if (!item.startsWith('--')) { positionals.push(item); continue; }
    const key = item.slice(2);
    const value = args[index + 1];
    if (!value || value.startsWith('--')) options[key] = true;
    else { options[key] = value; index += 1; }
  }
  return { positionals, options };
}

const csv = value => value ? String(value).split(',').map(item => item.trim()).filter(Boolean) : [];
const optionalJSON = async path => path ? readJSON(path) : {};

async function selfCheck() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const packageRecord = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  const schemas = join(root, 'schemas');
  const schemaNames = (await readdir(schemas)).filter(name => name.endsWith('.json')).sort();
  const schemaIds = new Set();
  for (const name of schemaNames) {
    const schema = JSON.parse(await readFile(join(schemas, name), 'utf8'));
    if (!schema.$id || schemaIds.has(schema.$id)) throw new Error(`Schema ${name} has a missing or duplicate $id.`);
    schemaIds.add(schema.$id);
  }
  const platforms = {};
  for (const [id, adapter] of Object.entries(adapters)) {
    for (const method of ['inspect', 'plan', 'render', 'run', 'verify', 'capture']) if (typeof adapter[method] !== 'function') throw new Error(`Platform ${id} is missing ${method}.`);
    platforms[id] = await adapter.inspect();
  }
  return { status: 'ok', version: packageRecord.version, schemas: schemaNames, schema_ids_unique: true, platforms };
}

async function main() {
  const { positionals, options } = parseArgs(process.argv.slice(2));
  const [group, action] = positionals;
  let result;

  if (group === 'self-check') result = await selfCheck();
  else if (group === 'task' && action === 'create') {
    const input = await optionalJSON(options.input);
    result = createTaskCapsule({
      ...input,
      taskId: options.id ?? input.taskId,
      persistence: options.store ?? input.persistence ?? 'ephemeral',
      platformTargets: csv(options.platforms).length ? csv(options.platforms) : input.platformTargets
    });
  } else if (group === 'candidate' && action === 'create') {
    const input = await optionalJSON(options.input);
    result = createCandidate({ ...input, taskId: options.task ?? input.taskId, candidateId: options.id ?? input.candidateId });
  } else if (group === 'manifest' && action === 'compile') {
    const task = await readJSON(options.task);
    const candidates = options.candidates ? await readJSON(options.candidates) : [];
    result = compileContextManifest({
      task,
      candidates,
      relation: options.relation ?? 'fresh-root',
      parentIds: csv(options.parents),
      inheritedAspects: csv(options.inherit),
      inheritanceMap: options['inheritance-map'] ? await readJSON(options['inheritance-map']) : {},
      constraintIds: csv(options.constraints),
      softResetRequirementIds: csv(options['soft-requirements']),
      softResetConstraintIds: csv(options['soft-official-constraints']),
      retainContinuity: options['retain-continuity'] === true,
      hardResetFactIds: csv(options.facts),
      hardResetRequirementIds: csv(options.requirements),
      hardResetConstraintIds: csv(options['official-constraints']),
      retainSemanticIntent: options['retain-semantic-intent'] === true
    });
  } else if (group === 'directions' && action === 'plan') {
    const input = await optionalJSON(options.input);
    result = planDirectionCount({ ...input, relation: options.relation ?? input.relation, changeKind: options.change ?? input.changeKind, ambiguity: options.ambiguity ?? input.ambiguity, userRequested: options.count ?? input.userRequested });
  } else if (group === 'payload' && action === 'build') {
    const task = await readJSON(options.task);
    const manifest = await readJSON(options.manifest);
    const candidates = options.candidates ? await readJSON(options.candidates) : [];
    const artifacts = options.artifacts ? await readJSON(options.artifacts) : [];
    result = buildWorkerPayload({ task, manifest, candidates, artifacts });
  } else if (group === 'verify') {
    const bundle = await readJSON(options.input);
    result = verifyBundle(bundle);
  } else if (group === 'report' && action === 'apply-exceptions') {
    result = applyVerificationExceptions(await readJSON(options.report), await readJSON(options.exceptions));
  } else if (group === 'platform' && action === 'inspect') {
    const ids = positionals.slice(2).length ? positionals.slice(2) : Object.keys(adapters);
    result = {};
    for (const id of ids) {
      if (!adapters[id]) throw new Error(`Unknown platform: ${id}.`);
      result[id] = await adapters[id].inspect();
    }
  } else if (group === 'platform' && ['run', 'verify', 'capture'].includes(action)) {
    const id = positionals[2];
    if (!adapters[id]) throw new Error(`Unknown platform: ${id}.`);
    const input = await optionalJSON(options.input);
    if (action === 'run') result = await adapters[id].run(input.artifacts ?? {}, { ...(input.options ?? {}), target: input.target ?? input });
    else if (action === 'verify') result = await adapters[id].verify(input.session ?? input);
    else result = await adapters[id].capture(input.session ?? input, input.options ?? {});
  } else if (group === 'store' && ['export', 'import', 'record'].includes(action)) {
    const kind = options.kind ?? 'portable';
    const store = createStore(kind, { root: options.root });
    if (action === 'export') result = await store.exportSession(options.task);
    else if (action === 'import') result = { task_id: await store.importSession(await readJSON(options.input)), store: kind };
    else {
      const record = await readJSON(options.input);
      await store.saveGovernance(options.task, options['record-kind'], record);
      result = { task_id: options.task, record_kind: options['record-kind'], saved: true };
    }
  } else if (group === 'decision' && action === 'create') {
    const input = await readJSON(options.input);
    result = createDecision(input);
  } else if (group === 'exception' && action === 'create') {
    const input = await readJSON(options.input);
    result = createException(input);
  } else if (group === 'approval' && action === 'create') {
    const input = await readJSON(options.input);
    const artifacts = input.artifact_files ? await hashArtifactFiles(input.artifact_files, { cwd: input.artifact_cwd }) : input.artifacts;
    result = createApproval({ ...input, artifacts });
  } else if (group === 'approval' && action === 'check') {
    const input = await readJSON(options.input);
    result = approvalDrift(input.approval, {
      taskId: input.taskId ?? input.task_id,
      candidateId: input.candidateId ?? input.candidate_id,
      semanticBundle: input.semanticBundle,
      artifacts: input.artifacts
    });
  } else if (group === 'migrate-v2') result = await migrateV2Project(options.project ?? '.');
  else throw new Error('Usage: qs-design self-check | task create | candidate create | manifest compile | payload build | directions plan | verify | report apply-exceptions | platform inspect|run|verify|capture | store export|import|record | decision create | exception create | approval create|check | migrate-v2');

  if (options.output) await writeJSON(options.output, result);
  else process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });

export { main, selfCheck };

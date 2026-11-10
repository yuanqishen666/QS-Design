#!/usr/bin/env node
// v3 decision and feedback ledger. Project identity is optional; scope defaults to candidate.
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultPath = '.qs-design/decision-ledger.jsonl';
const scopes = ['candidate', 'task', 'session', 'project', 'profile'];

export async function addLedgerEntry(path, entry) {
  const scope = entry.scope ?? 'candidate';
  if (!scopes.includes(scope)) throw new Error(`Invalid ledger scope: ${scope}`);
  if (!entry.decision && !entry.verbatim) throw new Error('Ledger entry requires decision or verbatim feedback.');
  if (scope === 'profile' && entry.explicit_consent !== true) throw new Error('Profile entries require explicit_consent: true.');
  if (entry.model_inference === true && ['project', 'profile'].includes(scope)) throw new Error('Model inference cannot be stored as a persistent preference.');
  const record = {
    ...entry,
    schema: 2,
    recorded_at: new Date().toISOString(),
    task_id: entry.task_id ?? null,
    candidate_id: entry.candidate_id ?? null,
    scope,
    carry_forward: scope === 'candidate' ? false : Boolean(entry.carry_forward),
    explicit_consent: Boolean(entry.explicit_consent)
  };
  await mkdir(dirname(resolve(path)), { recursive: true });
  await appendFile(path, `${JSON.stringify(record)}\n`, { encoding: 'utf8', mode: 0o600 });
  return record;
}

export async function readLedger(path) {
  try { return (await readFile(path, 'utf8')).split('\n').filter(Boolean).map(line => JSON.parse(line)); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const pathIndex = rest.indexOf('--path');
  const path = pathIndex >= 0 ? rest[pathIndex + 1] : defaultPath;
  if (command === 'list') console.log(JSON.stringify(await readLedger(path), null, 2));
  else if (command === 'add') {
    const jsonIndex = rest.indexOf('--json');
    if (jsonIndex < 0 || !rest[jsonIndex + 1]) throw new Error('Usage: ledger.mjs add --json \'{...}\' [--path file]');
    console.log(JSON.stringify(await addLedgerEntry(path, JSON.parse(rest[jsonIndex + 1])), null, 2));
  } else throw new Error('Usage: ledger.mjs add|list [options]');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });

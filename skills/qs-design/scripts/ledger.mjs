#!/usr/bin/env node
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultPath = '.qs-design/ledger.jsonl';

export async function addLedgerEntry(path, entry) {
  const required = ['project', 'platform', 'scope', 'decision', 'user_evidence'];
  for (const field of required) if (!entry[field]) throw new Error(`Missing ledger field: ${field}`);
  const record = { schema: 1, recorded_at: new Date().toISOString(), ...entry };
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

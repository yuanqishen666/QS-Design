#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ageDays = (date, now) => Math.floor((now.getTime() - new Date(`${date}T00:00:00Z`).getTime()) / 86_400_000);

export function queryCapability(data, capabilityId, platforms, now = new Date()) {
  const item = data.capabilities.find(candidate => candidate.id === capabilityId);
  if (!item) throw new Error(`Unknown capability: ${capabilityId}`);
  const age = ageDays(data.updated_at, now);
  const stale = age > (data.stale_after_days ?? 90);
  return {
    capability: item.id,
    updated_at: data.updated_at,
    age_days: age,
    stale,
    policy: data.policy ?? 'Static capability data is not runtime proof.',
    platforms: Object.fromEntries(platforms.map(platform => [platform, {
      ...(item[platform] ?? { support: 'unknown', notes: 'No maintained entry.' }),
      verification_status: stale ? 'unknown' : 'requires-runtime-verification'
    }]))
  };
}

async function main() {
  const [capability, ...platforms] = process.argv.slice(2);
  if (!capability || !platforms.length) throw new Error('Usage: platform-check.mjs capability platform [platform...]');
  const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const data = JSON.parse(await readFile(join(skillRoot, 'references/data/platform-capabilities.json'), 'utf8'));
  console.log(JSON.stringify(queryCapability(data, capability, platforms), null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });

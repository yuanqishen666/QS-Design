#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function queryCapability(data, capabilityId, platforms){const item=data.capabilities.find(candidate=>candidate.id===capabilityId);if(!item)throw new Error(`Unknown capability: ${capabilityId}`);return{capability:item.id,updated_at:data.updated_at,platforms:Object.fromEntries(platforms.map(platform=>[platform,item[platform]??{support:'unknown',notes:'No maintained entry.'}]))}}
async function main(){const [capability,...platforms]=process.argv.slice(2);if(!capability||!platforms.length)throw new Error('Usage: platform-check.mjs capability platform [platform...]');const data=JSON.parse(await readFile('core/data/platform-capabilities.json','utf8'));console.log(JSON.stringify(queryCapability(data,capability,platforms),null,2))}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error.message);process.exitCode=1});

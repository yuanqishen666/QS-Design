#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { walk } from './lib.mjs';

export async function buildLicenseReport(target){const files=await walk(target,path=>path.endsWith('provenance.json')),assets=[];for(const path of files){const data=JSON.parse(await readFile(path,'utf8'));for(const asset of data.assets??[])assets.push({package:path,path:asset.path,license:asset.license,source_url:asset.source_url,author:asset.author??null})}const byLicense=Object.groupBy(assets,item=>item.license??'unknown');return{generated_at:new Date().toISOString(),packages:files.length,assets,summary:Object.fromEntries(Object.entries(byLicense).map(([key,value])=>[key,value.length]))}}
async function main(){console.log(JSON.stringify(await buildLicenseReport(process.argv[2]??'specimens'),null,2))}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error);process.exitCode=1});

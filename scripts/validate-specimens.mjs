#!/usr/bin/env node
import { access, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintHTML } from '../skills/qs-design/scripts/design-lint.mjs';

export async function validateSpecimens(root='.') {
  const base=resolve(root),catalog=JSON.parse(await readFile(join(base,'specimens/catalog.json'),'utf8'));
  const errors=[],ids=new Set(),counts={};
  for(const item of catalog.families){
    if(ids.has(item.id))errors.push(`Duplicate specimen id: ${item.id}`);ids.add(item.id);counts[item.category]=(counts[item.category]??0)+1;
    if(item.states?.length<3)errors.push(`${item.id}: needs at least three states.`);
    for(const name of ['index.html','preview.svg','meta.json','rationale.md','provenance.json','validation.json'])try{await access(join(base,'specimens/generated',item.id,name))}catch{errors.push(`${item.id}: missing ${name}.`)}
    const page=join(base,'specimens/generated',item.id,'index.html');
    try{const result=lintHTML(await readFile(page,'utf8'),page);errors.push(...result.errors.map(entry=>`${item.id}: ${entry.rule}`));
      const validationPath=join(base,'specimens/generated',item.id,'validation.json');const validation=JSON.parse(await readFile(validationPath,'utf8'));const nextStatus=result.errors.length?'failed':'validated';const nextLint={errors:result.errors.length,warnings:result.warnings.length};const changed=validation.status!==nextStatus||validation.lint?.errors!==nextLint.errors||validation.lint?.warnings!==nextLint.warnings;if(changed){validation.validated_at=new Date().toISOString();validation.status=nextStatus;validation.lint=nextLint;await writeFile(validationPath,JSON.stringify(validation,null,2)+'\n')}
    }catch(error){errors.push(`${item.id}: ${error.message}`)}
  }
  if(catalog.families.length!==48)errors.push(`Expected 48 families, found ${catalog.families.length}.`);
  return{errors,total:catalog.families.length,counts};
}

async function main(){const result=await validateSpecimens(process.argv[2]??'.');result.errors.forEach(error=>console.error(`ERROR ${error}`));console.log(`Specimens: ${result.total}; ${JSON.stringify(result.counts)}`);if(result.errors.length)process.exitCode=1}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error);process.exitCode=1});

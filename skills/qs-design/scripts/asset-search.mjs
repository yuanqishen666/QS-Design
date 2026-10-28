#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function searchAssets({ provider='openverse', query, limit=12, fetchImpl=fetch }) {
  if (!query) throw new Error('Asset search requires a query.');
  if (provider === 'openverse') {
    const url = new URL('https://api.openverse.org/v1/images/'); url.searchParams.set('q',query); url.searchParams.set('page_size',String(limit));
    const response = await fetchImpl(url, { headers:{'User-Agent':'QS-Design/1.0 asset research'} }); if(!response.ok)throw new Error(`Openverse ${response.status}`);
    const data=await response.json(); return data.results.map(item=>({provider,id:item.id,title:item.title,creator:item.creator,source_url:item.foreign_landing_url,preview_url:item.thumbnail,asset_url:item.url,license:item.license,license_url:item.license_url}));
  }
  if (provider === 'wikimedia') {
    const url=new URL('https://commons.wikimedia.org/w/api.php');for(const [key,value] of Object.entries({action:'query',generator:'search',gsrsearch:`filetype:bitmap ${query}`,gsrnamespace:'6',gsrlimit:String(limit),prop:'imageinfo',iiprop:'url|extmetadata',format:'json',origin:'*'}))url.searchParams.set(key,value);
    const response=await fetchImpl(url,{headers:{'User-Agent':'QS-Design/1.0 asset research'}});if(!response.ok)throw new Error(`Wikimedia ${response.status}`);const data=await response.json();
    return Object.values(data.query?.pages??{}).map(page=>{const info=page.imageinfo?.[0]??{},meta=info.extmetadata??{};return{provider,id:String(page.pageid),title:page.title,creator:meta.Artist?.value??null,source_url:info.descriptionurl,preview_url:info.thumburl??info.url,asset_url:info.url,license:meta.LicenseShortName?.value??null,license_url:meta.LicenseUrl?.value??null}});
  }
  throw new Error(`Unknown provider: ${provider}`);
}

async function main(){const args=process.argv.slice(2),get=name=>{const index=args.indexOf(name);return index>=0?args[index+1]:null};const query=get('--query'),provider=get('--provider')??'openverse',limit=Number(get('--limit')??12),output=get('--output');const results=await searchAssets({provider,query,limit});const record={query,provider,accessed_at:new Date().toISOString(),results};const json=JSON.stringify(record,null,2)+'\n';if(output){await writeFile(output,json);console.log(`Wrote ${results.length} candidates to ${output}.`)}else process.stdout.write(json)}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error.message);process.exitCode=1});

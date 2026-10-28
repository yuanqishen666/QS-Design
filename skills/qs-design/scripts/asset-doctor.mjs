#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMedia, walk } from './lib.mjs';

function imageDimensions(buffer, extension) {
  if (extension === '.png' && buffer.toString('ascii', 1, 4) === 'PNG') return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  if (extension === '.gif') return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  if (extension === '.jpg' || extension === '.jpeg') {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) { offset += 1; continue; }
      const marker = buffer[offset + 1], length = buffer.readUInt16BE(offset + 2);
      if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      offset += 2 + length;
    }
  }
  return null;
}

export async function inspectAssets(target) {
  const files = await walk(target, isMedia);
  const records = [];
  for (const path of files) {
    const buffer = await readFile(path);
    const extension = extname(path).toLowerCase();
    records.push({ path, extension, bytes: (await stat(path)).size, sha256: createHash('sha256').update(buffer).digest('hex'), dimensions: imageDimensions(buffer, extension) });
  }
  const duplicates = Object.values(Object.groupBy(records, record => record.sha256)).filter(group => group.length > 1).map(group => group.map(record => record.path));
  return { records, duplicates };
}

async function main() {
  const target = process.argv[2] ?? 'specimens';
  const result = await inspectAssets(target);
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error); process.exitCode = 1; });

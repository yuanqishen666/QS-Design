import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

export async function walk(root, predicate = () => true) {
  const base = resolve(root);
  const output = [];
  async function visit(path) {
    const info = await stat(path);
    if (info.isDirectory()) {
      for (const name of await readdir(path)) {
        if (name === '.git' || name === 'node_modules') continue;
        await visit(join(path, name));
      }
    } else if (predicate(path)) output.push(path);
  }
  await visit(base);
  return output;
}

export function parseFrontmatter(text) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match) return null;
  const values = {};
  for (const line of match[1].split('\n')) {
    const item = /^([a-zA-Z0-9_-]+):\s*(.*)$/.exec(line);
    if (item) values[item[1]] = item[2].replace(/^['"]|['"]$/g, '');
  }
  return values;
}

export function markdownLinks(text) {
  return [...text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map(match => match[1].split('#')[0]).filter(Boolean);
}

export async function readJSON(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

export const posixRelative = (from, to) => relative(from, to).split('\\').join('/');
export const isMedia = path => ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.mp3', '.wav', '.ogg', '.mp4', '.webm', '.mov', '.woff', '.woff2', '.ttf', '.otf'].includes(extname(path).toLowerCase());

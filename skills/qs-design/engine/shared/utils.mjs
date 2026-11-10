import { createHash, randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export const clone = value => value == null ? value : structuredClone(value);

export function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stableValue(value[key])]));
  }
  return value;
}

export const stableStringify = value => JSON.stringify(stableValue(value));
export const sha256 = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : stableStringify(value)).digest('hex');
export const timestamp = now => (now ?? new Date()).toISOString();

export function identifier(prefix, supplied = null) {
  const token = String(supplied ?? randomBytes(6).toString('hex'))
    .normalize('NFKC').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  if (!token) throw new Error(`Cannot create ${prefix} identifier.`);
  return `${prefix}-${token}`;
}

export function requiredText(value, label) {
  const text = String(value ?? '').trim();
  if (!text) throw new Error(`${label} must be non-empty.`);
  return text;
}

export function unique(values) {
  return [...new Set((values ?? []).filter(value => value != null && value !== ''))];
}

export async function readJSON(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

export async function writeJSON(path, value) {
  const target = resolve(path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  return target;
}

export function assertEnum(value, allowed, label) {
  if (!allowed.includes(value)) throw new Error(`${label} must be one of: ${allowed.join(', ')}.`);
  return value;
}

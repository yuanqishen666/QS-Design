import { resolve } from 'node:path';
import { MemoryStore } from './memory-store.mjs';
import { FileStore } from './file-store.mjs';

export function createStore(kind = 'ephemeral', { root = null } = {}) {
  if (kind === 'ephemeral') return new MemoryStore();
  if (!['chat', 'portable', 'project'].includes(kind)) throw new Error(`Unknown store kind: ${kind}.`);
  if (!root) throw new Error(`${kind} store requires an explicit root.`);
  return new FileStore(resolve(root), { mode: kind });
}

export { MemoryStore, FileStore };
export { purgeCandidateArtifacts } from './privacy.mjs';

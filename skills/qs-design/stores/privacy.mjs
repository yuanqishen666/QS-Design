import { sha256 } from '../engine/shared/utils.mjs';

export async function purgeCandidateArtifacts(store, candidate, { retainHashes = true } = {}) {
  const removed = [];
  const refs = [...new Set([...(candidate?.artifact_refs ?? []), ...Object.values(candidate?.aspect_refs ?? {}).flat()])];
  for (const ref of refs) {
    let hash = null;
    if (retainHashes) {
      try { hash = sha256(await store.readArtifact(candidate.task_id, ref, { allowed: [ref] })); }
      catch (error) { if (error.code !== 'ENOENT' && !/Unknown artifact/.test(error.message)) throw error; }
    }
    const deleted = await store.deleteArtifact(candidate.task_id, ref);
    removed.push({ ref, deleted, hash });
  }
  const removedRefs = new Set(removed.filter(item => item.deleted).map(item => item.ref));
  const updatedCandidate = {
    ...candidate,
    artifact_refs: (candidate?.artifact_refs ?? []).filter(ref => !removedRefs.has(ref)),
    aspect_refs: Object.fromEntries(Object.entries(candidate?.aspect_refs ?? {}).map(([aspect, refs]) => [aspect, refs.filter(ref => !removedRefs.has(ref))])),
    updated_at: new Date().toISOString()
  };
  if (store?.saveCandidate && candidate?.task_id) await store.saveCandidate(updatedCandidate);
  return {
    candidate_id: candidate?.candidate_id ?? null,
    retained_content: false,
    retained_hashes: retainHashes,
    artifacts: removed,
    candidate: updatedCandidate
  };
}

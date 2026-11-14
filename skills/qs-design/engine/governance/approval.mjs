import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { identifier, requiredText, sha256, stableValue, timestamp, unique } from '../shared/utils.mjs';

const BASE_MATERIAL_FIELDS = [
  'task_capsule',
  'business_model',
  'continuity_contract',
  'semantic_intent',
  'direction',
  'prototype_contract',
  'user_visible_copy',
  'signature_interaction',
  'platform_expression',
  'known_unknowns',
  'captures'
];

const EXTENDED_MATERIAL_FIELDS = [
  'product_truth',
  'attention_contract',
  'terminology_contract',
  'reference_synthesis',
  'feedback_delta',
  'mutation_scope',
  'element_registry',
  'propagation_map'
];

const MATERIAL_FIELDS = [...BASE_MATERIAL_FIELDS, ...EXTENDED_MATERIAL_FIELDS];

function activeMaterialFields(bundle) {
  return [...BASE_MATERIAL_FIELDS, ...EXTENDED_MATERIAL_FIELDS.filter(field => Object.hasOwn(bundle ?? {}, field))];
}

function materialValue(field, value) {
  const normalized = stableValue(value ?? null);
  if (field === 'task_capsule' && normalized && typeof normalized === 'object') {
    const { created_at, updated_at, candidate_refs, ...material } = normalized;
    return material;
  }
  if (field === 'captures' && Array.isArray(normalized)) return normalized.map(capture => {
    if (!capture || typeof capture !== 'object') return capture;
    const { captured_at, temporary_path, ...material } = capture;
    return material;
  });
  return normalized;
}

export function semanticComponentHashes(bundle) {
  return Object.fromEntries(activeMaterialFields(bundle).map(field => [field, sha256(materialValue(field, bundle?.[field]))]));
}

export function semanticHash(bundle) {
  return sha256(Object.fromEntries(activeMaterialFields(bundle).map(field => [field, materialValue(field, bundle?.[field])])));
}

export function artifactManifest(artifacts = []) {
  const records = [...artifacts].map((item, index) => {
    if (Buffer.isBuffer(item)) { const digest = sha256(item); return { ref: `buffer:${digest}`, sha256: digest, size: item.length, kind: 'content' }; }
    if (typeof item === 'string') {
      const digest = item.replace(/^sha256:/, '');
      if (/^[a-f0-9]{64}$/i.test(digest)) return { ref: `digest:${digest.toLowerCase()}`, sha256: digest.toLowerCase(), size: null, kind: 'digest' };
      throw new Error(`Artifact ${index} is an ambiguous string; wrap content in { ref, content } or supply a sha256 digest.`);
    }
    if (!item || typeof item !== 'object') throw new Error(`Artifact ${index} must be content or a hash descriptor.`);
    if (item.path && !item.sha256 && !Object.hasOwn(item, 'content')) throw new Error(`Artifact ${item.path} is only a path; hash its file content before approval.`);
    if (Object.hasOwn(item, 'content') && typeof item.content !== 'string' && !Buffer.isBuffer(item.content) && !(item.content instanceof Uint8Array)) throw new Error(`Artifact ${item.ref ?? index} content must be text or bytes.`);
    const digest = item.sha256 ? String(item.sha256).replace(/^sha256:/, '') : sha256(item.content);
    if (!/^[a-f0-9]{64}$/i.test(digest)) throw new Error(`Artifact ${item.ref ?? index} has an invalid sha256 digest.`);
    const ref = String(item.ref ?? item.path ?? `artifact:${index}`).trim();
    if (!ref) throw new Error(`Artifact ${index} requires a non-empty ref.`);
    return { ref, sha256: digest.toLowerCase(), size: item.size ?? (Object.hasOwn(item, 'content') ? Buffer.byteLength(typeof item.content === 'string' ? item.content : Buffer.from(item.content)) : null), kind: item.kind ?? (item.sha256 ? 'digest' : 'content') };
  });
  records.sort((left, right) => left.ref.localeCompare(right.ref) || left.sha256.localeCompare(right.sha256));
  const refs = records.map(item => item.ref);
  if (new Set(refs).size !== refs.length) throw new Error('Artifact references must be unique within an approval.');
  return records;
}

export async function hashArtifactFiles(files = [], { cwd = process.cwd() } = {}) {
  const records = [];
  for (const item of files) {
    const path = resolve(cwd, typeof item === 'string' ? item : item.path);
    const bytes = await readFile(path);
    const metadata = await stat(path);
    records.push({ ref: typeof item === 'string' ? item : item.ref ?? item.path, sha256: sha256(bytes), size: metadata.size, kind: 'file' });
  }
  return records;
}

export function artifactHash(artifacts = []) {
  return sha256(artifactManifest(artifacts));
}

export function createApproval({ taskId, candidateId, userEvidence, semanticBundle, artifacts = [], scope = [], now = new Date() } = {}) {
  if (!String(userEvidence ?? '').trim()) throw new Error('Approval requires direct user evidence.');
  if (!/^task-[a-z0-9-]+$/.test(String(taskId ?? ''))) throw new Error('Approval taskId must match task-[a-z0-9-]+.');
  if (!/^candidate-[a-z0-9-]+$/.test(String(candidateId ?? ''))) throw new Error('Approval candidateId must match candidate-[a-z0-9-]+.');
  const semanticTaskId = semanticBundle?.task_capsule?.task_id;
  if (semanticTaskId && semanticTaskId !== taskId) throw new Error(`Approval taskId ${taskId} does not match semantic Task Capsule ${semanticTaskId}.`);
  const artifactRecords = artifactManifest(artifacts);
  return {
    schema: 1,
    approval_id: identifier('approval'),
    task_id: requiredText(taskId, 'Approval taskId'),
    candidate_id: requiredText(candidateId, 'Approval candidateId'),
    user_evidence: String(userEvidence).trim(),
    semantic_hash: semanticHash(semanticBundle),
    semantic_component_hashes: semanticComponentHashes(semanticBundle),
    artifact_manifest: artifactRecords,
    artifact_hash: sha256(artifactRecords),
    scope: unique(scope),
    approved_at: timestamp(now)
  };
}

export function verifyApproval(approval, { taskId = null, candidateId = null, semanticBundle, artifacts = [] } = {}) {
  const errors = [];
  if (approval?.schema !== 1) errors.push('Approval must use schema 1.');
  const expectedTaskId = taskId ?? semanticBundle?.task_capsule?.task_id ?? null;
  const expectedCandidateId = candidateId ?? semanticBundle?.candidate?.candidate_id ?? semanticBundle?.direction?.candidate_id ?? null;
  if (!expectedTaskId) errors.push('Approval verification requires the expected task identity.');
  else if (approval?.task_id !== expectedTaskId) errors.push(`Approval belongs to task ${approval?.task_id ?? 'unknown'}, not ${expectedTaskId}.`);
  if (!expectedCandidateId) errors.push('Approval verification requires the expected candidate identity.');
  else if (approval?.candidate_id !== expectedCandidateId) errors.push(`Approval belongs to candidate ${approval?.candidate_id ?? 'unknown'}, not ${expectedCandidateId}.`);
  if (approval?.semantic_hash !== semanticHash(semanticBundle)) errors.push('Approved semantic contract changed.');
  if (approval?.artifact_hash !== artifactHash(artifacts)) errors.push('Approved artifacts changed.');
  return errors;
}

export function materialChanges(before, after) {
  const fields = new Set([...activeMaterialFields(before), ...activeMaterialFields(after)]);
  return [...fields].filter(field => sha256(materialValue(field, before?.[field])) !== sha256(materialValue(field, after?.[field])));
}

export function approvalDrift(approval, { taskId = null, candidateId = null, semanticBundle, artifacts = [] } = {}) {
  const current = semanticComponentHashes(semanticBundle);
  const approved = approval?.semantic_component_hashes ?? {};
  const materialFields = [...new Set([...Object.keys(approved), ...Object.keys(current)])].filter(field => approved[field] !== current[field]);
  const categories = new Set();
  for (const field of materialFields) {
    if (['task_capsule', 'business_model', 'continuity_contract', 'semantic_intent'].includes(field)) categories.add('semantic-or-state');
    if (['product_truth', 'attention_contract', 'terminology_contract', 'reference_synthesis', 'feedback_delta'].includes(field)) categories.add('semantic-or-state');
    if (['direction', 'prototype_contract', 'user_visible_copy', 'captures', 'element_registry', 'propagation_map'].includes(field)) categories.add('visual-or-content');
    if (field === 'mutation_scope') categories.add('change-boundary');
    if (field === 'signature_interaction') categories.add('interaction');
    if (field === 'platform_expression') categories.add('platform');
    if (field === 'known_unknowns') categories.add('risk-contract');
  }
  return {
    material_fields: materialFields,
    drift_categories: [...categories],
    artifacts_changed: approval?.artifact_hash !== artifactHash(artifacts),
    errors: verifyApproval(approval, { taskId, candidateId, semanticBundle, artifacts })
  };
}

export { MATERIAL_FIELDS };

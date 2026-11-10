import { clone, unique } from '../shared/utils.mjs';
import { meaningfullyEquivalent } from '../shared/text-similarity.mjs';

export const ART_FIELDS = ['visual_thesis', 'business_anchor', 'primary_visual_object', 'composition_logic', 'type_roles', 'image_strategy', 'material_logic', 'color_behavior', 'spatial_rhythm', 'motion_language', 'signature_moment', 'restraint_budget', 'fallback_strategy'];

export function createArtDirection(values = {}) {
  return Object.fromEntries(ART_FIELDS.map(field => [field, field === 'type_roles' ? unique(values[field] ?? []) : clone(values[field] ?? '')]));
}

export function createDesignFingerprint(values = {}) {
  const fields = ['topology', 'density', 'type_system', 'surface_logic', 'image_strategy', 'color_behavior', 'interaction_model', 'motion_language'];
  return Object.fromEntries(fields.map(field => [field, String(values[field] ?? '').trim()]));
}

export function validateArtDirection(contract, { dominantDecisions = [] } = {}) {
  const errors = [];
  const advisories = [];
  for (const field of ART_FIELDS) {
    const value = contract?.[field];
    if (field === 'type_roles' ? !Array.isArray(value) || !value.length : !String(value ?? '').trim()) errors.push(`Art direction requires ${field}.`);
  }
  if (String(contract?.business_anchor ?? '').trim().length < 10) advisories.push('Business anchor is too vague; the visual direction may be transferable to unrelated products.');
  for (const [index, decision] of dominantDecisions.entries()) {
    const hasGrounding = decision.business_basis || decision.art_direction_basis || decision.brand_basis || decision.platform_basis;
    if (!hasGrounding || !decision.user_effect || !decision.expression || !decision.remove_test) errors.push(`Dominant decision ${index} requires a business, art-direction, brand or platform basis plus user_effect, expression and remove_test.`);
  }
  return { errors, advisories };
}

export function compareFingerprints(left, right) {
  const fields = Object.keys(createDesignFingerprint({}));
  const same = fields.filter(field => left?.[field] && right?.[field] && left[field] === right[field]);
  const similar = fields.filter(field => !same.includes(field) && left?.[field] && right?.[field] && meaningfullyEquivalent(left[field], right[field], 0.76));
  return { same, similar, repeated: new Set([...same, ...similar]).size >= 3 };
}

export function detectHouseStyle({ current, comparisons = [] } = {}) {
  const findings = [];
  for (const comparison of comparisons) {
    const result = compareFingerprints(current, comparison.fingerprint);
    const sharedReason = Boolean(comparison.shared_business_reason || comparison.shared_brand_system);
    if (result.repeated && !sharedReason) findings.push({
      candidate_id: comparison.candidate_id ?? null,
      same_dominant_fields: result.same,
      similar_dominant_fields: result.similar,
      abstract_feedback: '多个主导决定在无共同业务或品牌理由时重复，可能正在形成 QS house style。'
    });
  }
  return { status: findings.length ? 'finding' : 'clean', findings };
}

export function businessSpecificityChecks({ artDirection, nonTransferability, dominantDecisions = [] } = {}) {
  const findings = [];
  if (!String(artDirection?.business_anchor ?? '').trim()) findings.push('Visual direction has no business anchor.');
  if (!String(nonTransferability ?? '').trim()) findings.push('Direction does not explain why it cannot transfer unchanged to an unrelated domain.');
  if (!dominantDecisions.length) findings.push('No dominant design decisions are traced to business or user outcomes.');
  for (const decision of dominantDecisions) if (!decision.business_basis && !decision.art_direction_basis && !decision.brand_basis && !decision.platform_basis) findings.push(`Decision “${decision.expression ?? 'unknown'}” has no business, art-direction, brand or platform basis.`);
  return findings;
}

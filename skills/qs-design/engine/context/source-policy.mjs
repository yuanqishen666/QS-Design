import { SOURCE_KINDS, SOURCE_ROLES } from './continuity.mjs';
import { clone, unique } from '../shared/utils.mjs';

export function compileSourcePolicy({ sources = [], approvedCandidateIds = [] } = {}) {
  const approved = new Set(approvedCandidateIds);
  const included = [];
  const excluded = [];
  for (const source of sources) {
    if (!SOURCE_KINDS.includes(source.kind)) throw new Error(`Unknown source kind: ${source.kind}.`);
    if (!SOURCE_ROLES.includes(source.role)) throw new Error(`Unknown source role: ${source.role}.`);
    const record = clone(source);
    if (source.kind === 'user-approved-parent' && (!source.candidate_id || !approved.has(source.candidate_id))) {
      excluded.push({ ...record, reason: 'A user-approved parent must reference an explicitly approved candidate.' });
      continue;
    }
    const generatedAllowed = source.kind !== 'generated-artifact' || (source.candidate_id && approved.has(source.candidate_id));
    if (!generatedAllowed) {
      excluded.push({ ...record, reason: 'Generated artifacts require an explicitly approved parent.' });
      continue;
    }
    if (source.role === 'problem-evidence') {
      included.push({ ...record, allowed_facets: unique(source.allowed_facets ?? ['business-facts', 'tasks', 'states', 'problems']), visual_authority: false });
      continue;
    }
    if (source.kind === 'external-reference') {
      included.push({ ...record, allowed_facets: unique(source.allowed_facets ?? ['mechanism', 'task', 'content-principle']), visual_authority: false, copy_unique_expression: false });
      continue;
    }
    included.push({ ...record, visual_authority: source.role === 'brand-authority' || source.role === 'continuity-evidence' });
  }
  return {
    schema: 1,
    included,
    excluded,
    default_path_exclusions: ['design/qs-design/**', '.qs-design/**', '**/generated/**', '**/dist/**'],
    policy: 'Project presence never authorizes generated UI; source role and continuity level do.'
  };
}

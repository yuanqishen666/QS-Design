import { compareFingerprints } from '../art-direction/contract.mjs';

export function checkPostGenerationSimilarity({ generatedFingerprint, priorFingerprints = [], enabled = true } = {}) {
  if (!enabled) return {
    status: 'not-applicable',
    abstract_feedback: null,
    compared_candidates: 0,
    policy: 'Similarity checking was disabled by the user; no previous artifact was read.'
  };
  const matches = priorFingerprints.filter(item => compareFingerprints(generatedFingerprint, item.fingerprint).repeated);
  return {
    status: matches.length ? 'finding' : 'clean',
    abstract_feedback: matches.length ? '新结果与已排除方向的主导结构差异不足；请重新解释业务主角、信息拓扑或操控模型。' : null,
    compared_candidates: priorFingerprints.length,
    matched_candidate_ids: matches.map(item => item.candidate_id),
    policy: 'Only this abstract result may return to the generation worker; prior visual details remain private.'
  };
}

import { clone, unique } from '../shared/utils.mjs';

const STYLE_SHORTCUTS = [
  ['高级', ['黑金', '大留白']],
  ['科技', ['蓝紫渐变', '发光网格']],
  ['友好', ['大圆角', '卡通插画']],
  ['年轻', ['高饱和', '贴纸']],
  ['专业', ['企业蓝', '表格']],
  ['极简', ['大面积空白']]
];

export function createSemanticIntent({
  rawLanguage = [],
  tensions = [],
  businessInterpretation = [],
  observableExperience = [],
  visualImplications = [],
  interactionImplications = [],
  rejectedShortcuts = [],
  formRationales = [],
  uncertainties = []
} = {}) {
  return {
    schema: 1,
    raw_language: unique(rawLanguage),
    tensions: unique(tensions),
    business_interpretation: unique(businessInterpretation),
    observable_experience: unique(observableExperience),
    visual_implications: unique(visualImplications),
    interaction_implications: unique(interactionImplications),
    rejected_shortcuts: unique(rejectedShortcuts),
    form_rationales: clone(formRationales),
    uncertainties: unique(uncertainties)
  };
}

export function validateSemanticIntent(intent) {
  const errors = [];
  const advisories = [];
  if (intent?.schema !== 1) errors.push('Semantic intent must use schema 1.');
  if (!(intent?.raw_language ?? []).length) advisories.push('No raw user language is preserved.');
  if ((intent?.raw_language ?? []).length && !(intent?.business_interpretation ?? []).length) errors.push('Fuzzy language requires a business interpretation.');
  if ((intent?.raw_language ?? []).length && !(intent?.observable_experience ?? []).length) errors.push('Fuzzy language requires observable experience criteria.');

  const raw = (intent?.raw_language ?? []).join(' ');
  const implications = [...(intent?.visual_implications ?? []), ...(intent?.interaction_implications ?? [])].join(' ');
  for (const [semantic, shortcuts] of STYLE_SHORTCUTS) {
    if (!raw.includes(semantic)) continue;
    for (const shortcut of shortcuts) {
      if (implications.includes(shortcut) && !(intent?.rejected_shortcuts ?? []).some(item => item.includes(shortcut))) {
        const justified = (intent?.form_rationales ?? []).some(item => String(item.form ?? '').includes(shortcut) && String(item.business_reason ?? '').trim() && (item.evidence ?? []).length);
        if (!justified) advisories.push(`“${semantic}” may have collapsed directly into the style shortcut “${shortcut}”; record a business reason with evidence or reject the shortcut.`);
      }
    }
  }
  return { errors, advisories };
}

export function highImpactQuestion(intent) {
  const first = clone(intent?.uncertainties ?? [])[0];
  return first ? `需要澄清：${first}` : null;
}

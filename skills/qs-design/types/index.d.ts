export type PersistenceMode = 'ephemeral' | 'chat' | 'portable' | 'project';
export type ContextKind = 'fact' | 'decision' | 'inference' | 'hypothesis' | 'unknown';
export type ContextScope = 'candidate' | 'task' | 'session' | 'project' | 'profile';
export type CandidateStatus = 'draft' | 'shown' | 'selected' | 'rejected' | 'superseded' | 'archived' | 'implemented';
export type RunRelation = 'fresh-root' | 'continue-parent' | 'aspect-inheritance' | 'explicit-merge' | 'soft-reset' | 'hard-reset';
export type VerificationStatus = 'finding' | 'clean' | 'unknown' | 'not-applicable';
export type ContentPurpose = 'recognition' | 'decision' | 'action' | 'constraint' | 'risk' | 'recovery';
export type ContentCriticality = 'critical' | 'supporting' | 'optional';
export type ContentAudience = 'all' | 'most' | 'some';
export type ContentTiming = 'persistent' | 'before-action' | 'on-error' | 'first-run' | 'on-demand';
export type ContentDelivery = 'visible' | 'inline-hint' | 'details' | 'popover' | 'tooltip' | 'contextual-tip';
export type PrototypeFidelity = 'specimen' | 'static' | 'clickable' | 'native';
export type PresentationWorkMode = 'design' | 'audit' | 'interaction-lab' | 'implementation' | 'context-reset';
export type PresentationStatus = 'planned' | 'presented' | 'blocked' | 'not-applicable';
export type ContractEvidenceStatus = VerificationStatus;

export interface ProductTruthContract {
  schema: 1;
  task_id: string;
  source_mode: 'conversation' | 'product' | 'mixed';
  affordance_policy: 'allowlist';
  primary_jobs: Array<Record<string, unknown>>;
  critical_journeys: Array<Record<string, unknown>>;
  routes: Array<Record<string, unknown>>;
  visible_affordances: Array<Record<string, unknown>>;
  states: Array<Record<string, unknown>>;
  forbidden_inventions: Array<Record<string, unknown>>;
  unknowns: Array<Record<string, unknown>>;
  terminology_risks: string[];
  representative_task: Record<string, unknown> | null;
  fixture_policy: Record<string, unknown>;
}

export interface AttentionContract {
  schema: 1;
  task_id: string;
  first_viewport_job: string;
  first_viewport_question: string;
  primary_action_id: string | null;
  attention_order: Array<Record<string, unknown>>;
  quiet_targets: string[];
  checks: Array<Record<string, unknown>>;
}

export interface TerminologyContract {
  schema: 1;
  task_id: string;
  risk_status: 'reviewed-none' | 'terms-present' | 'unknown';
  entries: Array<Record<string, unknown>>;
}

export interface PrototypeContract {
  schema: 1;
  task_id: string;
  fidelity: PrototypeFidelity;
  coverage_scope: 'representative' | 'full-product';
  purpose: string;
  required_paths: Array<Record<string, unknown>>;
  required_states: string[];
  data_fixture: Record<string, unknown>;
  fixture_source: string;
  viewports: Array<Record<string, unknown>>;
  evidence_requirements: string[];
  path_evidence: Array<Record<string, unknown>>;
  critique_policy: Record<string, unknown>;
  critique_cycles: Array<Record<string, unknown>>;
  prohibited_claims: string[];
}

export interface PresentationRecord {
  schema: 1;
  work_mode: PresentationWorkMode;
  status: PresentationStatus;
  artifact_refs: string[];
  preview_refs: string[];
  experience_refs: string[];
  channel: 'conversation' | 'export' | 'product';
  blocker: string | null;
  presented_at: string | null;
}

export interface DesignContracts {
  product_truth: ProductTruthContract | null;
  attention: AttentionContract | null;
  terminology: TerminologyContract | null;
  prototype: PrototypeContract | null;
  reference_synthesis: Record<string, unknown> | null;
}

export interface ContentContractEntry {
  key: string;
  kind: string;
  source: string;
  owner: string;
  required?: boolean;
  evidence?: unknown[];
  purpose?: ContentPurpose;
  criticality?: ContentCriticality;
  audience?: ContentAudience;
  timing?: ContentTiming;
  delivery?: ContentDelivery;
  irreducible_fact?: string;
  structure_attempt?: string;
  interactive?: boolean;
}

export interface ContentContract {
  schema: 1;
  entries: ContentContractEntry[];
  required_states: string[];
}

export interface ContextItem {
  id: string;
  value: unknown;
  kind: ContextKind;
  source: string;
  confidence: 'high' | 'medium' | 'low' | 'unknown';
  scope: ContextScope;
  verified_at: string | null;
  review_trigger: string | null;
  explicit_consent: boolean;
}

export interface TaskCapsule {
  schema: 1;
  task_id: string;
  persistence: PersistenceMode;
  business_facts: ContextItem[];
  current_requirements: ContextItem[];
  assumptions: ContextItem[];
  official_constraints: ContextItem[];
  semantic_intent: Record<string, unknown> | null;
  continuity_contract: Record<string, unknown> | null;
  design_contracts?: DesignContracts;
  read_policy: Record<string, unknown>;
  platform_targets: Array<'web' | 'ios' | 'android' | 'wechat' | 'alipay'>;
  candidate_refs: string[];
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  schema: 1;
  candidate_id: string;
  task_id: string;
  status: CandidateStatus;
  parents: string[];
  context_digest: string;
  artifact_refs: string[];
  aspect_refs: Record<string, string[]>;
  accepted_aspects: string[];
  rejected_aspects: string[];
  feedback: Array<Record<string, unknown>>;
  created_at: string;
  updated_at: string;
}

export interface ContextManifest {
  schema: 1;
  run_id: string;
  task_id: string;
  relation: RunRelation;
  included: string[];
  included_as_constraints: string[];
  excluded: string[];
  parents: string[];
  inherited_aspects: string[];
  inheritance_map: Record<string, string[]>;
  mutation_scope?: Record<string, unknown> | null;
  feedback_delta?: Record<string, unknown> | null;
  context_hash: string;
  created_at: string;
}

export interface WorkerExecutionPolicy {
  schema: 1;
  policy_id: string;
  content: { source_priority: string[]; requirements: string[] };
  product: { requirements: string[] };
  platform: { requirements: string[] };
  visual: { requirements: string[] };
  terminology: { requirements: string[] };
  research: { requirements: string[] };
  change: { requirements: string[] };
  delivery: { requirements: string[] };
  validation: { requirements: string[] };
}

export interface WorkerPayload {
  schema: 1;
  task_id: string;
  execution_policy: WorkerExecutionPolicy;
  relation: RunRelation;
  business_facts: ContextItem[];
  current_requirements: ContextItem[];
  official_constraints: ContextItem[];
  semantic_intent: Record<string, unknown> | null;
  continuity_contract: Record<string, unknown> | null;
  design_contracts: DesignContracts;
  platform_targets: string[];
  mutation_scope: Record<string, unknown> | null;
  feedback_delta: Record<string, unknown> | null;
  constraints: string[];
  parents: Array<Record<string, unknown>>;
  prohibited_context: string[];
  payload_hash: string;
}

export interface RenderedArtifact {
  id?: string;
  path?: string;
  html: string;
}

export interface ContextStore {
  loadTask(taskId: string): Promise<TaskCapsule | null>;
  saveTask(task: TaskCapsule): Promise<void>;
  listCandidates(taskId: string): Promise<Candidate[]>;
  saveCandidate(candidate: Candidate): Promise<void>;
  saveArtifact(taskId: string, ref: string, value: unknown): Promise<void>;
  readArtifact(taskId: string, ref: string, policy: { allowed: string[]; excluded?: string[] }): Promise<unknown>;
  deleteArtifact(taskId: string, ref: string): Promise<boolean>;
  saveGovernance(taskId: string, kind: 'decisions' | 'exceptions' | 'approvals' | 'verification_reports', record: Record<string, unknown>): Promise<void>;
  listGovernance(taskId: string): Promise<Record<string, Array<Record<string, unknown>>>>;
  exportSession(taskId: string): Promise<Record<string, unknown>>;
  importSession(bundle: Record<string, unknown>): Promise<string>;
}

export interface VerificationFinding {
  id: string;
  status: VerificationStatus;
  dimension: string;
  severity: 'blocker' | 'major' | 'advisory';
  target: string;
  evidence: unknown[];
  confidence: 'high' | 'medium' | 'low' | 'unknown';
  impact: string;
  correction_direction: string;
  exception: Record<string, unknown> | null;
}

export interface PlatformAdapter {
  id: string;
  capabilities: Record<string, unknown>;
  inspect(context?: TaskCapsule): Promise<Record<string, unknown>>;
  plan(model: Record<string, unknown>): Promise<Record<string, unknown>>;
  render(direction: Record<string, unknown>, plan: Record<string, unknown>, options?: Record<string, unknown>): Promise<Record<string, unknown>>;
  run(artifacts?: Record<string, unknown>, options?: Record<string, unknown>): Promise<Record<string, unknown>>;
  verify(session: Record<string, unknown>): Promise<VerificationFinding[]>;
  capture(session: Record<string, unknown>, options?: Record<string, unknown>): Promise<Record<string, unknown>>;
}

export interface VerificationRule {
  id: string;
  dimension: string;
  applies(input: unknown): boolean | Promise<boolean>;
  evaluate(input: unknown): VerificationFinding | VerificationFinding[] | Promise<VerificationFinding | VerificationFinding[]>;
}

export interface ValidationResult {
  errors: string[];
  advisories: string[];
}

export interface ContractValidationResult extends ValidationResult {
  outcomes?: Array<Record<string, unknown>>;
}

export const PERSISTENCE_MODES: PersistenceMode[];
export const CONTEXT_KINDS: ContextKind[];
export const CONTEXT_SCOPES: ContextScope[];
export const CONFIDENCE_LEVELS: string[];
export const PLATFORMS: string[];
export const DESIGN_CONTRACT_KEYS: string[];
export const CANDIDATE_STATUSES: CandidateStatus[];
export const RUN_RELATIONS: RunRelation[];
export const SOURCE_KINDS: string[];
export const SOURCE_ROLES: string[];
export const CONTINUITY_LEVELS: string[];
export const CRAFT_CHECKS: string[];
export const EVIDENCE_STATUSES: VerificationStatus[];
export const GENERALITY_TESTS: string[];
export const PROBE_CONCLUSIONS: string[];
export const PROBE_EVIDENCE_STATUSES: VerificationStatus[];
export const PROBE_EVIDENCE_SOURCES: string[];
export const DECISION_SCOPES: ContextScope[];
export const DECISION_STATUSES: string[];
export const EXCEPTION_SCOPES: string[];
export const MATERIAL_FIELDS: string[];
export const VERIFICATION_DIMENSIONS: string[];
export const CONTENT_PURPOSES: ContentPurpose[];
export const CONTENT_CRITICALITY: ContentCriticality[];
export const CONTENT_AUDIENCES: ContentAudience[];
export const CONTENT_TIMINGS: ContentTiming[];
export const CONTENT_DELIVERIES: ContentDelivery[];
export const SUPPLEMENTAL_CONTENT_KINDS: string[];
export const DEFAULT_ENV_ALLOWLIST: string[];
export const EMPTY_GOVERNANCE: Readonly<Record<string, unknown[]>>;
export const WORKER_EXECUTION_POLICY: WorkerExecutionPolicy;
export const VISUAL_CARRIERS: readonly string[];
export const PRODUCT_TRUTH_SOURCE_MODES: string[];
export const PRODUCT_TRUTH_CONFIDENCE: string[];
export const PRODUCT_ITEM_STATUSES: string[];
export const AFFORDANCE_KINDS: string[];
export const FIXTURE_MODES: string[];
export const ATTENTION_ROLES: string[];
export const ATTENTION_CHECKS: string[];
export const TERMINOLOGY_RISK_STATUSES: string[];
export const TERMINOLOGY_ITEM_STATUSES: string[];
export const TERMINOLOGY_RESOLUTIONS: string[];
export const PROTOTYPE_FIDELITIES: PrototypeFidelity[];
export const PROTOTYPE_COVERAGE: string[];
export const PROTOTYPE_EVIDENCE: string[];
export const REFERENCE_FACETS: string[];
export const REFERENCE_LICENSE: string[];
export const FEEDBACK_DIAGNOSIS_CONFIDENCE: string[];
export const FEEDBACK_CHANGE_SCOPES: string[];
export const FEEDBACK_RELATIONS: string[];
export const FEEDBACK_SCOPES: string[];
export const ELEMENT_FACETS: string[];
export const MUTATION_CONFLICT_POLICIES: string[];
export const PROPAGATION_COVERAGE_STATUSES: string[];

export function contextItem(value: unknown, options?: Record<string, unknown>): ContextItem;
export function addTaskContext(task: TaskCapsule, section: string, item: unknown, now?: Date): TaskCapsule;
export function validateTaskCapsule(task: unknown): string[];
export function transitionCandidate(candidate: Candidate, status: CandidateStatus, now?: Date): Candidate;
export function validateCandidate(candidate: unknown): string[];
export function validateCandidateGraph(candidates: Candidate[], taskId?: string | null): string[];
export function readableCandidate(candidate: Candidate | null, options?: { explicitlyNamed?: boolean }): boolean;
export function normalizeFeedback(input: Record<string, unknown>): Record<string, unknown>;
export function createProductTruth(input: Record<string, unknown>): ProductTruthContract;
export function validateProductTruth(contract: unknown): ValidationResult;
export function productTruthIds(contract: ProductTruthContract): string[];
export function createAttentionContract(input: Record<string, unknown>): AttentionContract;
export function validateAttentionContract(contract: unknown, options?: { productTruth?: ProductTruthContract | null }): ContractValidationResult;
export function createTerminologyContract(input: Record<string, unknown>): TerminologyContract;
export function validateTerminologyContract(contract: unknown, options?: { productTruth?: ProductTruthContract | null }): ContractValidationResult;
export function createPrototypeContract(input: Record<string, unknown>): PrototypeContract;
export function validatePrototypeContract(contract: unknown, options?: { productTruth?: ProductTruthContract | null }): ContractValidationResult;
export function createPresentationRecord(input?: Record<string, unknown>): PresentationRecord;
export function validatePresentationRecord(record: unknown, options?: { prototypeContract?: PrototypeContract | null; requireComplete?: boolean }): ValidationResult;
export function createReferenceSynthesis(input: Record<string, unknown>): Record<string, unknown>;
export function validateReferenceSynthesis(contract: unknown): ValidationResult;
export function createFeedbackDelta(input: Record<string, unknown>): Record<string, unknown>;
export function validateFeedbackDelta(delta: unknown): ValidationResult & { normalized: Record<string, unknown> };
export function createElementRegistry(input: Record<string, unknown>): Record<string, unknown>;
export function validateElementRegistry(registry: unknown): string[];
export function createMutationScope(input: Record<string, unknown>): Record<string, unknown>;
export function validateMutationScope(scope: unknown, options?: { registry?: Record<string, unknown> | null }): string[];
export function auditElementMutation(input: Record<string, unknown>): { errors: string[]; changes: Array<Record<string, unknown>>; conflicts: Array<Record<string, unknown>>; clean: boolean };
export function createPropagationMap(input: Record<string, unknown>): Record<string, unknown>;
export function validatePropagationMap(map: unknown, options?: { productTruth?: ProductTruthContract | null }): ValidationResult;
export function validateContextManifest(manifest: unknown, candidates?: Candidate[], options?: Record<string, unknown>): string[];
export function buildWorkerPayload(input: { task: TaskCapsule; manifest: ContextManifest; candidates?: Candidate[]; artifacts?: Array<{ ref: string; value: unknown }> }): WorkerPayload;
export function continuityItem(claim: string, options?: Record<string, unknown>): Record<string, unknown>;
export function createContinuityContract(input?: Record<string, unknown>): Record<string, unknown>;
export function validateContinuityContract(contract: unknown): string[];
export function compileSourcePolicy(input?: Record<string, unknown>): Record<string, unknown>;
export function runIsolatedWorker(input: Record<string, unknown>): Promise<Record<string, unknown>>;
export function checkPostGenerationSimilarity(input?: Record<string, unknown>): Record<string, unknown>;
export function createPortableSession(input: Record<string, unknown>): Record<string, unknown>;
export function validatePortableSession(bundle: unknown, options?: { requireHash?: boolean }): string[];
export function createBusinessModel(input?: Record<string, unknown>): Record<string, unknown>;
export function validateBusinessModel(model: unknown): ValidationResult;
export function traceAction(model: Record<string, unknown>, actionId: string): Record<string, unknown> | null;
export function createContentContract(input?: Record<string, unknown>): ContentContract;
export function validateContentContract(contract: unknown): ValidationResult;
export function allowedContentDeliveries(input?: Record<string, unknown>): { allowed: ContentDelivery[]; reason: string };
export function createSemanticIntent(input?: Record<string, unknown>): Record<string, unknown>;
export function validateSemanticIntent(intent: unknown): ValidationResult;
export function highImpactQuestion(intent: Record<string, unknown>): string | null;
export function planDirectionCount(input?: Record<string, unknown>): { count: number; reason: string; cost_notice?: string | null };
export function createDirectionSet(input: Record<string, unknown>): Record<string, unknown>;
export function validateDirectionSet(set: unknown): ValidationResult;
export function createArtDirection(input?: Record<string, unknown>): Record<string, unknown>;
export function createDesignFingerprint(input?: Record<string, unknown>): Record<string, string>;
export function validateArtDirection(contract: unknown, options?: Record<string, unknown>): ValidationResult;
export function compareFingerprints(left: Record<string, string>, right: Record<string, string>): Record<string, unknown>;
export function detectHouseStyle(input?: Record<string, unknown>): Record<string, unknown>;
export function businessSpecificityChecks(input?: Record<string, unknown>): string[];
export function createCraftReview(input?: Record<string, unknown>): Record<string, unknown>;
export function validateCraftReview(review: unknown): { errors: string[]; outcomes: Array<Record<string, unknown>> };
export function createGeneralityTests(input?: Record<string, unknown>): Record<string, unknown>;
export function validateGeneralityTests(contract: unknown): { errors: string[]; outcomes: Array<Record<string, unknown>> };
export function createInteractionProbe(input: Record<string, unknown>): Record<string, unknown>;
export function evaluateInteractionProbe(probe: unknown): Record<string, unknown>;
export function semanticComponentHashes(bundle: Record<string, unknown>): Record<string, string>;
export function semanticHash(bundle: Record<string, unknown>): string;
export function artifactManifest(artifacts?: unknown[]): Array<Record<string, unknown>>;
export function artifactHash(artifacts?: unknown[]): string;
export function hashArtifactFiles(files?: unknown[], options?: { cwd?: string }): Promise<Array<Record<string, unknown>>>;
export function createApproval(input: Record<string, unknown>): Record<string, unknown>;
export function verifyApproval(approval: Record<string, unknown>, current: Record<string, unknown>): string[];
export function materialChanges(before: Record<string, unknown>, after: Record<string, unknown>): string[];
export function approvalDrift(approval: Record<string, unknown>, current: Record<string, unknown>): Record<string, unknown>;
export function createDecision(input: Record<string, unknown>): Record<string, unknown>;
export function createException(input: Record<string, unknown>): Record<string, unknown>;
export function validateException(exception: unknown, now?: Date): string[];
export function activeDecisions(decisions: Array<Record<string, unknown>>, options?: Record<string, unknown>): Array<Record<string, unknown>>;
export function finding(input?: Record<string, unknown>): VerificationFinding;
export function verifyBundle(bundle?: Record<string, unknown> & { renderedArtifacts?: RenderedArtifact[] | RenderedArtifact | string[] | string }, now?: Date): Record<string, unknown>;
export function applyVerificationExceptions(report: Record<string, unknown>, exceptions?: Array<Record<string, unknown>>, now?: Date): Record<string, unknown>;
export function verifyBundleWithRules(bundle?: Record<string, unknown>, rules?: VerificationRule[], now?: Date): Promise<Record<string, unknown>>;
export function createVerificationRule(input: Record<string, unknown>): VerificationRule;
export function runVerificationRules(rules: VerificationRule[], input: unknown): Promise<VerificationFinding[]>;
export function purgeCandidateArtifacts(store: ContextStore, candidate: Candidate, options?: { retainHashes?: boolean }): Promise<Record<string, unknown>>;

export class MemoryStore implements ContextStore {
  loadTask(taskId: string): Promise<TaskCapsule | null>;
  saveTask(task: TaskCapsule): Promise<void>;
  listCandidates(taskId: string): Promise<Candidate[]>;
  saveCandidate(candidate: Candidate): Promise<void>;
  saveArtifact(taskId: string, ref: string, value: unknown): Promise<void>;
  readArtifact(taskId: string, ref: string, policy: { allowed: string[]; excluded?: string[] }): Promise<unknown>;
  deleteArtifact(taskId: string, ref: string): Promise<boolean>;
  saveGovernance(taskId: string, kind: 'decisions' | 'exceptions' | 'approvals' | 'verification_reports', record: Record<string, unknown>): Promise<void>;
  listGovernance(taskId: string): Promise<Record<string, Array<Record<string, unknown>>>>;
  exportSession(taskId: string): Promise<Record<string, unknown>>;
  importSession(bundle: Record<string, unknown>): Promise<string>;
}

export class FileStore implements ContextStore {
  constructor(root: string, options?: { mode?: Exclude<PersistenceMode, 'ephemeral'> });
  loadTask(taskId: string): Promise<TaskCapsule | null>;
  saveTask(task: TaskCapsule): Promise<void>;
  listCandidates(taskId: string): Promise<Candidate[]>;
  saveCandidate(candidate: Candidate): Promise<void>;
  saveArtifact(taskId: string, ref: string, value: unknown): Promise<void>;
  readArtifact(taskId: string, ref: string, policy: { allowed: string[]; excluded?: string[] }): Promise<unknown>;
  deleteArtifact(taskId: string, ref: string): Promise<boolean>;
  saveGovernance(taskId: string, kind: 'decisions' | 'exceptions' | 'approvals' | 'verification_reports', record: Record<string, unknown>): Promise<void>;
  listGovernance(taskId: string): Promise<Record<string, Array<Record<string, unknown>>>>;
  exportSession(taskId: string): Promise<Record<string, unknown>>;
  importSession(bundle: Record<string, unknown>): Promise<string>;
  describe(): Record<string, unknown>;
}

export function createTaskCapsule(input?: Record<string, unknown>): TaskCapsule;
export function createCandidate(input: Record<string, unknown>): Candidate;
export function compileContextManifest(input: Record<string, unknown>): ContextManifest;
export function buildWorkerPayload(input: Record<string, unknown>): Record<string, unknown>;
export function verifyBundle(input?: Record<string, unknown>, now?: Date): Record<string, unknown>;
export function createStore(kind?: PersistenceMode, options?: { root?: string | null }): ContextStore;
export const adapters: Record<string, PlatformAdapter>;
export function getAdapter(id: string): PlatformAdapter;

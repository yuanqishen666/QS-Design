# Architecture (3.2)

QS Design 3 is organized around Task Capsule → context manifest → business model → directions → platform adapters → verification → approval.

## Trust boundary

The coordinator can see the conversation and stored candidates. A fresh design worker receives only the compiled payload derived from the context manifest. Rejected artifacts never enter its model input. Parent artifacts are resolved by exact allowlisted ref; aspect inheritance includes only the named aspect contents and fails closed when any authorized content is missing. Post-generation similarity checking runs separately.

`worker-runner.mjs` enforces the stdin/environment boundary with a hash-verified payload, an environment allowlist, an explicit dedicated working directory and a required network/read/write/external-program permission declaration. It is not an operating-system filesystem sandbox: the host must supply that containment and declare whether it did. `similarity-gate.mjs` returns only an abstract collision result, never prior visual details.

Task `read_policy` is an upper bound on every manifest. A profile item requires consent when stored and must also be named in `allowed_profile_context` for the current task. Soft reset includes business facts and platform targets by default; functional requirements, official constraints, semantic intent and continuity are opt-in. Hard reset includes only explicitly reconfirmed item IDs.

## Data contracts

Schemas in `schemas/` are the source of truth for task, candidate, continuity, business, content visibility, semantic, direction, approval and verification records. Runtime modules perform additional relational checks that JSON Schema cannot express.

Supplemental interface copy is governed inside `business_model.content_graph` by the content visibility contract. It records what irreducible fact the text carries, why structure cannot carry it alone, who needs it, when it is needed and how it is disclosed. This is a business-semantic contract, not a house-style token layer. Primary labels, actions and raw data do not require redundant visibility metadata.

## Storage

`ephemeral` uses memory. `chat`, `portable` and `project` use the same file-store contract with different lifecycle and ownership. Project storage is never required for design-only work.

Portable exports include the Task Capsule, candidate records, referenced artifact values and scoped governance records (decisions, exceptions, approvals and verification reports). The whole bundle is integrity hashed. Artifact filenames are derived from hashes rather than untrusted references; imports refuse to merge silently into an existing task. Rejected content, including aspect-specific artifacts, may be purged while an audit hash remains.

## Runtime evidence

Adapters share metadata and lifecycle methods. Web can use target-local Playwright; iOS builds explicit Xcode targets and captures Simulator output; Android runs explicit Gradle targets and captures ADB output. Mini-program adapters require explicit vendor CLI contracts. A successful process is evidence of execution only. Command assertions remain unknown unless the runner observes them directly or the current command creates/changes a bounded JSON assertion report with recognized evidence sources.

## Legacy

`scripts/ios/design-run.mjs` and v2 manifests remain available only to preserve old approvals. `engine/migration/v2.mjs` maps them to archived or selected v3 candidates without reading their UI into a new context.

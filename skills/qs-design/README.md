# QS Design 3.2

QS Design turns fuzzy product language, business contracts and platform constraints into business-specific, visually directed and verifiable interface work.

## What changed in 3.2

- Structure, hierarchy, spacing, data relations and clear actions now have to do explanatory work before helper copy is admitted.
- Supplemental copy carries a business-semantic visibility contract: purpose, criticality, audience, timing, delivery, irreducible fact and failed structural substitute.
- Critical information cannot be hidden in tooltips; tooltips are limited to short, optional, non-interactive, on-demand content.
- Content lint checks repeated explanation templates, visible form labels, tooltip relationships, disabled triggers, interactive tooltip content and contract drift.
- Verification separates explanatory dependency, critical-information visibility, disclosure input parity and false-deletion risk instead of rewarding low word counts.
- Platform adapters require evidence that disclosures work across keyboard, pointer, touch and assistive technology.

## Retained from 3.1

- The design task, not a project folder, is the context root.
- Rejected candidates are excluded from fresh generation by a hashed context manifest.
- One to three directions are chosen by default according to real uncertainty; explicit larger explorations carry a visible cost notice.
- Existing products use a scoped continuity contract instead of absolute UI isolation.
- Fuzzy language is translated into business meaning and observable experience.
- Art direction, business specificity and platform evidence are explicit contracts.
- Verification reports evidence and unknowns rather than a universal style score.
- Soft reset no longer carries old visual requirements or continuity by default.
- Profile memory requires separate consent to store and task-specific authorization to read.
- Aspect inheritance packages only the authorized artifact contents and fails closed when they are missing.
- Runtime assertions require runner attestation or a report changed by the current command.
- Portable sessions include decisions, exceptions, approvals and verification reports without feeding them back into generation.

## Verify the installation

```bash
npm test
node engine/cli/qs-design.mjs self-check
```

## Create a projectless task

```bash
node engine/cli/qs-design.mjs task create --id task-example --store ephemeral
```

See `SKILL.md` for the agent workflow and `docs/architecture.md` for system contracts.

## Run an explicit platform target

Platform runs are data-driven and never use a shell. Supply a JSON target with an explicit command, argument list, working directory and runtime assertions. A successful command without accessibility or behavior assertions remains partially `unknown`.

Every executable target also declares `permissions.network`, `permissions.read_paths`, `permissions.write_paths` and `permissions.external_programs`. QS Design validates and reports the declaration; operating-system enforcement still belongs to the host sandbox.

```bash
node engine/cli/qs-design.mjs platform run web --input /absolute/path/to/target.json
```

Portable stores export the Task Capsule, candidates, artifacts and scoped governance records as one integrity-hashed JSON-compatible `.qsdesign` bundle. Artifact reads require an explicit allowlist; profile memory requires separate storage and current-task read authorization.

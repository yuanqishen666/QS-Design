# Security and privacy

- Local-first and no telemetry by default.
- Network research and asset search are explicit actions.
- A Task Capsule read policy bounds every manifest; a manifest records every source allowed into generation.
- Profile memory has two gates: explicit storage consent and explicit authorization for the current task to read a named item.
- `worker-runner.mjs` starts a no-shell child process with an environment allowlist, requires an explicit dedicated working directory and sends only a hash-verified worker payload over stdin.
- The worker runner does not itself provide an operating-system filesystem sandbox. A host sandbox is required for that claim; otherwise the result is marked `host-required`.
- Rejected and archived candidates cannot be parents.
- Profile memory requires direct user consent.
- Portable/project stores validate task and candidate graphs, hash artifact filenames, require allowlisted artifact reads, refuse silent import merging, and prevent path traversal.
- Rejected artifacts can be deleted while retaining only audit hashes.
- Prototype packaging rejects network runtime dependencies.
- Platform runners report `unknown` when tools or evidence are absent.
- Platform target commands and arguments must be explicit. Every executable target must declare network, read paths, write paths and external programs; the declaration is validated and attached to evidence, while the host remains responsible for OS enforcement. Runtime success never implies accessibility success. Declared statuses are downgraded to unknown unless the runner attests them, and unchanged pre-existing assertion reports are rejected.
- No persistent hook is installed by the skill.

Secrets, customer data and private screenshots must not be copied into portable sessions unless the user explicitly requests it. Approval evidence stores the minimum necessary user statement rather than full conversation history.

# Platform adapter contract

Every adapter exposes `inspect`, `plan`, `render`, `run`, `verify` and `capture`.

It also declares capabilities, native patterns, navigation/input/accessibility/motion mappings, performance constraints, fallbacks, runtime runner, capture strategy and required verification assertions. Every platform includes `critical-content-visible` and `disclosure-input-parity`; those assertions remain independent from general accessibility or core-task claims.

- `inspect`: reports local tools and capabilities with evidence.
- `plan`: translates shared business semantics into native platform guidance.
- `render`: produces platform artifacts or returns `unknown` with a reason.
- `run`: launches a real, explicitly declared no-shell target when one is supplied and records command plus network/read/write/external-program permissions.
- `verify`: checks platform behavior and accessibility from runner-attested assertions.
- `capture`: records actual runtime output.

Adapters may return `unknown`; they may not claim a native capability based only on documentation, source presence, a successful build command or an HTML approximation. A target may name an `assertion_report` inside its working directory. The report is accepted only when the current command creates or changes it, stays below the size limit, uses recognized evidence sources and supplies observations. Each required assertion otherwise remains unknown.

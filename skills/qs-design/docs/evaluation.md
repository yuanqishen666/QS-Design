# Evaluation

QS Design does not use a composite quality score. Compare systems on separate dimensions: task completion, recovery, accessibility, design-system drift, business recognizability, content-transfer genericity, cross-task fingerprint repetition, visual craft, implementation fidelity, native platform behavior, maintenance cost, repeated-use fatigue, explanatory dependency, critical-information visibility, disclosure input parity and false-deletion risk.

Benchmarks must include vanilla coding agents, Impeccable, QS Design 2 and QS Design 3. Visual review is blinded; reviewer disagreement is preserved. QS Design may claim superiority only after reproducible results support the claim.

`evals/corpus/core.json`, `evals/rubrics/blind-review.json` and `evals/run.mjs` provide the reproducible task inventory, blind-review rules and dimension-only summarizer. Rows must share a corpus revision, carry evidence, identify the exact system version and use numeric values or explicit reasoned unknowns. The report exposes task-overlap gaps rather than treating unequal task sets as comparable. The repository deliberately ships no fabricated baseline results.

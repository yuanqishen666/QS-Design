# Reproducible evaluation

The corpus covers mature-system changes, projectless fuzzy briefs, rejected-round resets, complex recovery, high-trust work, five-platform compilation, signature interaction, repeated-use tools, structure-first content and cross-input disclosure.

Result rows identify the exact system version, task, corpus revision and execution time, preserve independent metrics and may include raw blinded reviewer records. Every row needs evidence. Metrics are numeric or an explicit `unknown` with a reason. `run.mjs` rejects mixed corpus revisions, reports task-set overlap and summarizes each dimension separately without a composite score.

```bash
npm run eval -- --results /absolute/path/to/results.json
```

The harness does not contain invented benchmark results. Run the same tasks against the declared baselines before making comparative claims.

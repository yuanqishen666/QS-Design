#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function transitionTarget(value) { return typeof value === 'string' ? value : value?.target; }

function canReach(states, from, target) {
  const seen = new Set();
  const queue = [from];
  while (queue.length) {
    const state = queue.shift();
    if (state === target) return true;
    if (seen.has(state) || !states[state]) continue;
    seen.add(state);
    for (const transition of Object.values(states[state].on ?? {})) queue.push(transitionTarget(transition));
  }
  return false;
}

export function analyzeStateCoverage(model) {
  const errors = [];
  const warnings = [];
  const states = model.states ?? {};
  if (!states[model.initial]) errors.push(`Unknown initial state: ${model.initial}`);
  const reachable = new Set();
  const queue = states[model.initial] ? [model.initial] : [];
  while (queue.length) {
    const state = queue.shift();
    if (reachable.has(state)) continue;
    reachable.add(state);
    for (const target of Object.values(states[state]?.on ?? {})) {
      const next = transitionTarget(target);
      if (!states[next]) errors.push(`${state} transitions to unknown state ${next}`);
      else if (!reachable.has(next)) queue.push(next);
    }
  }
  for (const state of Object.keys(states)) if (!reachable.has(state)) errors.push(`Unreachable state: ${state}`);
  for (const required of model.required_states ?? []) if (!reachable.has(required)) errors.push(`Required state is not reachable: ${required}`);
  const eventNames = new Set(Object.values(states).flatMap(state => Object.keys(state.on ?? {})));
  for (const event of model.required_events ?? []) if (!eventNames.has(event)) errors.push(`Required event is absent: ${event}`);

  for (const action of model.critical_actions ?? []) {
    if (!action.id || !action.from || !action.success_state) { errors.push('Critical actions require id, from and success_state.'); continue; }
    if (!canReach(states, action.from, action.success_state)) errors.push(`Critical action ${action.id} cannot reach success state ${action.success_state}.`);
    for (const field of ['cancel_event', 'recovery_event']) if (action[field] && !eventNames.has(action[field])) errors.push(`Critical action ${action.id} requires missing ${field} ${action[field]}.`);
    if (action.irreversible && !action.confirmation_event) warnings.push(`Irreversible action ${action.id} has no confirmation_event.`);
    if (action.retryable && action.idempotent == null) warnings.push(`Retryable action ${action.id} does not declare idempotency.`);
  }

  for (const contract of model.platform_contracts ?? []) {
    for (const outcome of ['success', 'cancel', 'error', 'recovery']) {
      const values = Object.values(contract.platforms ?? {}).map(platform => platform?.[outcome]).filter(value => value != null);
      if (new Set(values.map(JSON.stringify)).size > 1 && !(contract.allowed_divergence ?? []).includes(outcome)) errors.push(`Platform contract ${contract.id} diverges in ${outcome} without permission.`);
    }
  }

  return {
    errors,
    warnings,
    reachable: [...reachable],
    state_reachability: { reachable: reachable.size, total: Object.keys(states).length },
    evidence: { events: [...eventNames].sort(), critical_actions: (model.critical_actions ?? []).map(action => action.id).filter(Boolean) }
  };
}
async function main(){const path=process.argv[2];if(!path)throw new Error('Usage: state-coverage.mjs model.json');const result=analyzeStateCoverage(JSON.parse(await readFile(path,'utf8')));console.log(JSON.stringify(result,null,2));if(result.errors.length)process.exitCode=1}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error.message);process.exitCode=1});

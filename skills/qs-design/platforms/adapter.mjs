import { spawn } from 'node:child_process';
import { executeDeclaredTarget, verifyRuntimeAssertions } from './runtime.mjs';

function which(command) {
  return new Promise(resolve => {
    const child = spawn('which', [command], { stdio: ['ignore', 'pipe', 'ignore'] });
    let output = '';
    child.stdout.on('data', chunk => { output += chunk; });
    child.on('error', () => resolve(null));
    child.on('close', code => resolve(code === 0 ? output.trim() : null));
  });
}

export function definePlatformAdapter({ id, displayName, tools = [], capabilities = {}, guidance = {}, requiredAssertions = [], runtime = {} }) {
  const nativePatterns = guidance.native_patterns ?? guidance;
  return Object.freeze({
    id,
    displayName,
    capabilities,
    guidance,
    native_patterns: nativePatterns,
    navigation_mapping: guidance.navigation ?? 'unknown',
    input_mapping: guidance.input ?? 'platform-native input with explicit fallback',
    accessibility_mapping: guidance.accessibility ?? 'requires runtime evidence',
    motion_mapping: guidance.motion ?? 'requires runtime evidence',
    performance_constraints: guidance.performance ?? [],
    fallbacks: guidance.fallbacks ?? [],
    runtime_runner: runtime.run ? 'platform-specific' : 'explicit-command',
    capture_strategy: guidance.capture ?? 'requires an explicit runtime session',
    verification_suite: [...requiredAssertions],
    async inspect() {
      const resolvedTools = {};
      for (const tool of tools) resolvedTools[tool] = await which(tool);
      const available = Object.values(resolvedTools).every(Boolean) || tools.length === 0;
      return {
        platform: id,
        status: available ? 'available' : 'unknown',
        tooling_status: available ? 'available' : 'incomplete',
        runtime_status: 'unknown',
        tools: resolvedTools,
        capabilities,
        evidence: available
          ? ['Declared command-line prerequisites were found; no product target was executed by inspection.']
          : ['One or more declared platform prerequisites were not found; runtime claims must remain unknown.']
      };
    },
    async plan(model) {
      return {
        platform: id,
        shared_business_model: model,
        native_guidance: guidance,
        capability_contract: capabilities,
        invariants: ['business-result', 'core-objects', 'content-meaning', 'safety-and-recovery', 'brand-identity'],
        native_divergence: ['navigation', 'controls', 'gestures', 'window-structure', 'density', 'motion-and-haptics']
      };
    },
    async render(direction, plan, options = {}) {
      if (runtime.render) return runtime.render({ direction, plan, options, platform: id });
      return { platform: id, status: 'unknown', artifacts: [], evidence: ['Rendering requires a project or platform sample supplied by the active task.'] };
    },
    async run(artifacts = {}, options = {}) {
      const target = options.target ?? artifacts.target ?? null;
      return runtime.run ? runtime.run({ artifacts, options, target, platform: id }) : executeDeclaredTarget({ platform: id, target });
    },
    async verify(session) {
      if (runtime.verify) return runtime.verify({ session, platform: id, requiredAssertions });
      return verifyRuntimeAssertions(id, session, requiredAssertions);
    },
    async capture(session, options = {}) {
      if (runtime.capture) return runtime.capture({ session, options, platform: id });
      return { platform: id, status: 'unknown', captures: [], evidence: ['No platform capture implementation or runtime session was supplied.'] };
    }
  });
}

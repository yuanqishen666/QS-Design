import { resolve } from 'node:path';
import { executeDeclaredTarget } from '../runtime.mjs';

const XCODE_ACTIONS = ['build', 'test', 'build-for-testing', 'test-without-building'];

export async function runIOSTarget({ target, platform = 'ios' } = {}) {
  if (target?.command) return executeDeclaredTarget({ platform, target });
  if (!target?.xcode) return { platform, status: 'unknown', assertions: [], evidence: ['iOS runtime requires target.xcode or an explicit command.'] };
  const config = target.xcode;
  if (!config.scheme || (!config.project && !config.workspace)) throw new Error('Xcode target requires scheme and project or workspace.');
  const action = config.action ?? 'test';
  if (!XCODE_ACTIONS.includes(action)) throw new Error(`Unsupported xcodebuild action: ${action}.`);
  const args = [];
  if (config.workspace) args.push('-workspace', config.workspace);
  else args.push('-project', config.project);
  args.push('-scheme', config.scheme);
  if (config.configuration) args.push('-configuration', config.configuration);
  if (config.destination) args.push('-destination', config.destination);
  if (config.result_bundle_path) args.push('-resultBundlePath', config.result_bundle_path);
  args.push(action, ...(config.extra_args ?? []));
  return executeDeclaredTarget({ platform, target: { command: 'xcodebuild', args, cwd: target.cwd, timeout_ms: target.timeout_ms, assertions: target.assertions, assertion_report: target.assertion_report, permissions: target.permissions } });
}

export async function captureIOSSimulator({ session, options } = {}) {
  if (session?.status !== 'completed') return { platform: 'ios', status: 'unknown', captures: [], evidence: ['A completed iOS runtime session is required before capture.'] };
  if (!options?.output) return { platform: 'ios', status: 'unknown', captures: [], evidence: ['Simulator capture requires options.output.'] };
  const output = resolve(options.cwd ?? process.cwd(), options.output);
  const device = options.device ?? 'booted';
  const result = await executeDeclaredTarget({ platform: 'ios', target: { command: 'xcrun', args: ['simctl', 'io', device, 'screenshot', output], cwd: options.cwd, permissions: options.permissions, required_write_paths: [output] } });
  return result.status === 'completed'
    ? { platform: 'ios', status: 'completed', captures: [{ kind: 'simulator-screenshot', path: output, device }], evidence: result.evidence }
    : { platform: 'ios', status: result.status, captures: [], evidence: result.evidence };
}

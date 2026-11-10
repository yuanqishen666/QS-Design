import { spawn } from 'node:child_process';
import { basename, resolve } from 'node:path';
import { sha256 } from '../shared/utils.mjs';

const DEFAULT_ENV_ALLOWLIST = ['PATH', 'TMPDIR', 'TMP', 'TEMP', 'LANG', 'LC_ALL', 'DEVELOPER_DIR', 'SDKROOT'];
const DANGEROUS_ENV_KEYS = new Set(['NODE_OPTIONS', 'NODE_PATH', 'LD_PRELOAD', 'DYLD_INSERT_LIBRARIES', 'BASH_ENV', 'ENV', 'ZDOTDIR']);

function validatePayload(payload) {
  if (payload?.schema !== 1 || !payload.payload_hash) throw new Error('Isolated worker requires a compiled worker payload.');
  const comparable = { ...payload };
  delete comparable.payload_hash;
  if (sha256(comparable) !== payload.payload_hash) throw new Error('Worker payload hash is invalid.');
}

function isolatedEnvironment(payload, allowlist, additions) {
  const env = {};
  for (const key of allowlist) if (process.env[key] != null) env[key] = process.env[key];
  for (const [key, value] of Object.entries(additions ?? {})) {
    if (!/^[A-Z][A-Z0-9_]*$/.test(key)) throw new Error(`Invalid worker environment key: ${key}.`);
    if (DANGEROUS_ENV_KEYS.has(key)) throw new Error(`Worker environment key is not allowed: ${key}.`);
    env[key] = String(value);
  }
  env.QS_DESIGN_TASK_ID = payload.task_id;
  env.QS_DESIGN_CONTEXT_HASH = payload.payload_hash;
  return env;
}

function normalizeWorkerPermissions(permissions, command, cwd) {
  if (!permissions || typeof permissions !== 'object' || Array.isArray(permissions)) throw new Error('Isolated worker requires an explicit permissions declaration.');
  if (typeof permissions.network !== 'boolean') throw new Error('Worker permissions.network must be boolean.');
  for (const field of ['read_paths', 'write_paths', 'external_programs']) if (!Array.isArray(permissions[field]) || permissions[field].some(value => typeof value !== 'string' || !value.trim())) throw new Error(`Worker permissions.${field} must be an array of non-empty strings.`);
  if (!permissions.external_programs.includes(command) && !permissions.external_programs.includes(basename(command))) throw new Error(`Worker permissions do not authorize external program ${command}.`);
  return {
    network: permissions.network,
    read_paths: [...new Set(permissions.read_paths.map(path => resolve(cwd, path)))],
    write_paths: [...new Set(permissions.write_paths.map(path => resolve(cwd, path)))],
    external_programs: [...new Set(permissions.external_programs)],
    enforcement: 'declared-and-validated; host sandbox required for OS enforcement'
  };
}

export async function runIsolatedWorker({
  command,
  args = [],
  payload,
  cwd,
  filesystemIsolation = 'host-required',
  permissions,
  timeoutMs = 120_000,
  maxOutputBytes = 2_000_000,
  envAllowlist = DEFAULT_ENV_ALLOWLIST,
  env = {}
} = {}) {
  validatePayload(payload);
  if (!String(command ?? '').trim()) throw new Error('Isolated worker requires an explicit command.');
  if (!String(cwd ?? '').trim()) throw new Error('Isolated worker requires an explicit dedicated cwd.');
  if (!['host-required', 'host-sandboxed'].includes(filesystemIsolation)) throw new Error('filesystemIsolation must be host-required or host-sandboxed.');
  if (!Array.isArray(args) || args.some(arg => typeof arg !== 'string')) throw new Error('Worker args must be an array of strings.');
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('Worker timeout must be positive.');
  if (!Number.isFinite(maxOutputBytes) || maxOutputBytes <= 0) throw new Error('Worker maxOutputBytes must be positive.');
  const declaredPermissions = normalizeWorkerPermissions(permissions, String(command), resolve(cwd));

  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: resolve(cwd),
      env: isolatedEnvironment(payload, envAllowlist, env),
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    let stdout = Buffer.alloc(0);
    let stderr = Buffer.alloc(0);
    let settled = false;
    let timer = null;
    const finish = result => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolvePromise(result);
    };
    const fail = error => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error);
    };
    const append = (current, chunk) => {
      const next = Buffer.concat([current, chunk]);
      if (next.length > maxOutputBytes) {
        child.kill('SIGKILL');
        fail(new Error(`Isolated worker exceeded ${maxOutputBytes} output bytes.`));
        return current;
      }
      return next;
    };
    child.stdout.on('data', chunk => { stdout = append(stdout, chunk); });
    child.stderr.on('data', chunk => { stderr = append(stderr, chunk); });
    child.on('error', fail);
    child.on('close', (code, signal) => finish({
      status: code === 0 ? 'completed' : 'failed',
      exit_code: code,
      signal,
      stdout: stdout.toString('utf8'),
      stderr: stderr.toString('utf8'),
      context_hash: payload.payload_hash,
      filesystem_isolation: filesystemIsolation,
      declared_permissions: declaredPermissions
    }));
    child.stdin.end(`${JSON.stringify(payload)}\n`);
    timer = setTimeout(() => {
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 1_000).unref();
      finish({ status: 'timeout', exit_code: null, signal: 'SIGTERM', stdout: stdout.toString('utf8'), stderr: stderr.toString('utf8'), context_hash: payload.payload_hash, filesystem_isolation: filesystemIsolation, declared_permissions: declaredPermissions });
    }, timeoutMs);
    timer.unref();
  });
}

export { DEFAULT_ENV_ALLOWLIST };

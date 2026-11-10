import { spawn } from 'node:child_process';
import { access, readFile, stat } from 'node:fs/promises';
import { basename, relative, resolve } from 'node:path';

const ENV_ALLOWLIST = ['PATH', 'TMPDIR', 'TMP', 'TEMP', 'LANG', 'LC_ALL', 'DEVELOPER_DIR', 'SDKROOT', 'JAVA_HOME', 'ANDROID_HOME'];
const ASSERTION_STATUSES = ['finding', 'clean', 'unknown', 'not-applicable'];
const ASSERTION_SOURCES = ['playwright', 'xctest', 'compose-test', 'developer-tools', 'device-session', 'manual-session', 'runtime-output', 'automated-test'];
const DANGEROUS_ENV_KEYS = new Set(['NODE_OPTIONS', 'NODE_PATH', 'LD_PRELOAD', 'DYLD_INSERT_LIBRARIES', 'BASH_ENV', 'ENV', 'ZDOTDIR']);

export async function pathExists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function optionalBytes(path) {
  if (!path) return null;
  try { return await readFile(path); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

function declaredAssertions(assertions = []) {
  return assertions.map(assertion => ({
    ...assertion,
    declared_status: assertion.status ?? null,
    status: 'unknown',
    source: null,
    evidence_attested: false,
    evidence: ['The assertion was declared for this command but was not evaluated by the runtime runner.']
  }));
}

export function normalizeDeclaredPermissions(permissions, { command, cwd, networkRequired = false, requiredReadPaths = [], requiredWritePaths = [] } = {}) {
  if (!permissions || typeof permissions !== 'object' || Array.isArray(permissions)) throw new Error('Runtime target requires an explicit permissions declaration.');
  if (typeof permissions.network !== 'boolean') throw new Error('Runtime permissions.network must be boolean.');
  for (const field of ['read_paths', 'write_paths', 'external_programs']) if (!Array.isArray(permissions[field]) || permissions[field].some(value => typeof value !== 'string' || !value.trim())) throw new Error(`Runtime permissions.${field} must be an array of non-empty strings.`);
  const externalPrograms = [...new Set(permissions.external_programs)];
  if (command && !externalPrograms.includes(command) && !externalPrograms.includes(basename(command))) throw new Error(`Runtime permissions do not authorize external program ${command}.`);
  if (networkRequired && permissions.network !== true) throw new Error('Runtime target requires network permission for this URL.');
  const readPaths = [...new Set(permissions.read_paths.map(path => resolve(cwd, path)))];
  const writePaths = [...new Set(permissions.write_paths.map(path => resolve(cwd, path)))];
  for (const path of requiredReadPaths.map(path => resolve(cwd, path))) if (!readPaths.includes(path)) throw new Error(`Runtime permissions do not authorize reading ${path}.`);
  for (const path of requiredWritePaths.map(path => resolve(cwd, path))) if (!writePaths.includes(path)) throw new Error(`Runtime permissions do not authorize writing ${path}.`);
  return { network: permissions.network, read_paths: readPaths, write_paths: writePaths, external_programs: externalPrograms, enforcement: 'declared-and-validated; host sandbox required for OS enforcement' };
}

export async function executeDeclaredTarget({ platform, target, defaultTimeoutMs = 180_000 } = {}) {
  if (!target?.command) return {
    platform,
    status: 'unknown',
    evidence: ['No explicit runnable target was supplied.'],
    assertions: []
  };
  if (!Array.isArray(target.args ?? []) || (target.args ?? []).some(value => typeof value !== 'string')) throw new Error('Runtime target args must be strings.');
  const cwd = resolve(target.cwd ?? process.cwd());
  if (!await pathExists(cwd)) throw new Error(`Runtime target cwd does not exist: ${cwd}.`);
  const timeoutMs = Number(target.timeout_ms ?? defaultTimeoutMs);
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('Runtime target timeout must be positive.');
  const max = Number(target.max_output_bytes ?? 1_000_000);
  if (!Number.isFinite(max) || max <= 0) throw new Error('Runtime target max_output_bytes must be positive.');
  const assertionReport = target.assertion_report ? resolve(cwd, target.assertion_report) : null;
  if (assertionReport) {
    const reportRelative = relative(cwd, assertionReport);
    if (reportRelative.startsWith('..') || resolve(cwd, reportRelative) !== assertionReport) throw new Error('Runtime assertion_report must stay inside target cwd.');
  }
  const declaredPermissions = normalizeDeclaredPermissions(target.permissions, {
    command: String(target.command),
    cwd,
    requiredReadPaths: [...(target.required_read_paths ?? []), ...(assertionReport ? [assertionReport] : [])],
    requiredWritePaths: [...(target.required_write_paths ?? []), ...(assertionReport ? [assertionReport] : [])]
  });
  const assertionReportBefore = await optionalBytes(assertionReport);
  const env = {};
  for (const key of ENV_ALLOWLIST) if (process.env[key] != null) env[key] = process.env[key];
  for (const [key, value] of Object.entries(target.env ?? {})) {
    if (!/^[A-Z][A-Z0-9_]*$/.test(key)) throw new Error(`Invalid runtime environment key: ${key}.`);
    if (DANGEROUS_ENV_KEYS.has(key)) throw new Error(`Runtime environment key is not allowed: ${key}.`);
    env[key] = String(value);
  }

  return new Promise((resolvePromise, reject) => {
    const child = spawn(String(target.command), target.args ?? [], { cwd, env, shell: false, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const append = (current, chunk) => `${current}${chunk}`.slice(-max);
    child.stdout.on('data', chunk => { stdout = append(stdout, chunk); });
    child.stderr.on('data', chunk => { stderr = append(stderr, chunk); });
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', async (code, signal) => {
      clearTimeout(timer);
      let assertions = declaredAssertions(target.assertions ?? []);
      const reportEvidence = [];
      if (!timedOut && code === 0 && assertionReport) {
        try {
          const metadata = await stat(assertionReport);
          if (metadata.size > 1_000_000) throw new Error('Assertion report exceeds 1000000 bytes.');
          const bytes = await readFile(assertionReport);
          if (assertionReportBefore?.equals(bytes)) throw new Error('Assertion report was not generated or changed by this runtime command.');
          const parsed = JSON.parse(bytes.toString('utf8'));
          const records = Array.isArray(parsed) ? parsed : parsed?.assertions;
          if (!Array.isArray(records)) throw new Error('Assertion report must be an array or contain an assertions array.');
          assertions = records.map(assertion => ({ ...assertion, evidence_attested: true }));
          reportEvidence.push({ kind: 'runtime-assertion-report', path: assertionReport, size: metadata.size, assertions: assertions.length });
        } catch (error) {
          reportEvidence.push({ kind: 'runtime-assertion-report-error', path: assertionReport, message: error.message });
        }
      }
      resolvePromise({
        platform,
        status: timedOut ? 'timeout' : code === 0 ? 'completed' : 'failed',
        exit_code: code,
        signal,
        cwd,
        command: String(target.command),
        args: [...(target.args ?? [])],
        declared_permissions: declaredPermissions,
        stdout,
        stderr,
        assertions,
        evidence: [{ kind: 'runtime-command', command: String(target.command), args: [...(target.args ?? [])], cwd, exit_code: code, declared_permissions: declaredPermissions }, ...reportEvidence]
      });
    });
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 1_000).unref();
    }, timeoutMs);
    timer.unref();
  });
}

export function verifyRuntimeAssertions(platform, session, requiredAssertions = []) {
  if (!session || session.status === 'unknown') return [{
    status: 'unknown', dimension: 'platform-performance', severity: 'major', platform,
    evidence: session?.evidence ?? ['No runtime session.'], confidence: 'unknown'
  }];
  if (session.status !== 'completed') return [{
    status: 'finding', dimension: 'platform-performance', severity: 'blocker', platform,
    evidence: session.evidence ?? [`Runtime finished with status ${session.status}.`], confidence: 'high'
  }];
  const assertions = session.assertions ?? [];
  const index = new Map(assertions.map(assertion => [assertion.id, assertion]));
  const duplicateIds = new Set(assertions.map(assertion => assertion.id).filter((id, position, values) => values.indexOf(id) !== position));
  const ids = [...new Set([...requiredAssertions, ...assertions.map(assertion => assertion.id).filter(Boolean)])];
  return ids.map(id => {
    const assertion = index.get(id);
    if (!assertion) return { status: 'unknown', dimension: 'platform-performance', severity: 'major', platform, target: id, evidence: ['No runtime assertion was supplied.'], confidence: 'unknown' };
    if (duplicateIds.has(id)) return { status: 'unknown', dimension: assertion.dimension ?? 'platform-performance', severity: 'major', platform, target: id, evidence: ['Duplicate runtime assertion ids make the evidence ambiguous.'], confidence: 'unknown' };
    const evidence = Array.isArray(assertion.evidence) ? assertion.evidence.filter(Boolean) : [];
    if (!ASSERTION_STATUSES.includes(assertion.status)) return { status: 'unknown', dimension: assertion.dimension ?? 'platform-performance', severity: 'major', platform, target: id, evidence: [`Invalid runtime assertion status: ${assertion.status ?? 'missing'}.`], confidence: 'unknown' };
    if (['clean', 'finding', 'not-applicable'].includes(assertion.status) && (!evidence.length || !ASSERTION_SOURCES.includes(assertion.source) || assertion.evidence_attested !== true)) {
      return { status: 'unknown', dimension: assertion.dimension ?? 'platform-performance', severity: 'major', platform, target: id, evidence: ['The assertion lacks evidence, a recognized runtime source, or runner attestation.'], confidence: 'unknown' };
    }
    return {
      status: assertion.status,
      dimension: assertion.dimension ?? 'platform-performance',
      severity: assertion.severity ?? 'major',
      platform,
      target: id,
      evidence,
      confidence: assertion.confidence ?? 'medium'
    };
  });
}

export { ASSERTION_SOURCES, ASSERTION_STATUSES, ENV_ALLOWLIST };

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { executeDeclaredTarget, normalizeDeclaredPermissions, pathExists } from '../runtime.mjs';

export async function runAndroidTarget({ target, platform = 'android' } = {}) {
  if (target?.command) return executeDeclaredTarget({ platform, target });
  if (!target?.gradle) return { platform, status: 'unknown', assertions: [], evidence: ['Android runtime requires target.gradle or an explicit command.'] };
  const cwd = resolve(target.cwd ?? process.cwd());
  const wrapper = resolve(cwd, target.gradle.wrapper ?? 'gradlew');
  if (!await pathExists(wrapper)) return { platform, status: 'unknown', assertions: [], evidence: [`Gradle wrapper was not found: ${wrapper}.`] };
  return executeDeclaredTarget({ platform, target: { command: wrapper, args: target.gradle.tasks ?? ['connectedCheck'], cwd, timeout_ms: target.timeout_ms, assertions: target.assertions, assertion_report: target.assertion_report, permissions: target.permissions } });
}

export async function captureAndroidEmulator({ session, options } = {}) {
  if (session?.status !== 'completed') return { platform: 'android', status: 'unknown', captures: [], evidence: ['A completed Android runtime session is required before capture.'] };
  if (!options?.output) return { platform: 'android', status: 'unknown', captures: [], evidence: ['Android capture requires options.output.'] };
  const output = resolve(options.cwd ?? process.cwd(), options.output);
  const cwd = resolve(options.cwd ?? process.cwd());
  const declaredPermissions = normalizeDeclaredPermissions(options.permissions, { command: 'adb', cwd, requiredWritePaths: [output] });
  const timeoutMs = Number(options.timeout_ms ?? 30_000);
  const maxOutputBytes = Number(options.max_output_bytes ?? 25_000_000);
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('Android capture timeout_ms must be positive.');
  if (!Number.isFinite(maxOutputBytes) || maxOutputBytes <= 0) throw new Error('Android capture max_output_bytes must be positive.');
  await mkdir(dirname(output), { recursive: true });
  return new Promise((resolvePromise, reject) => {
    const args = [];
    if (options.serial) args.push('-s', options.serial);
    args.push('exec-out', 'screencap', '-p');
    const child = spawn('adb', args, { cwd, shell: false, stdio: ['ignore', 'pipe', 'pipe'] });
    const chunks = [];
    let bytes = 0;
    let stderr = '';
    let settled = false;
    const finish = value => { if (!settled) { settled = true; clearTimeout(timer); resolvePromise(value); } };
    const fail = error => { if (!settled) { settled = true; clearTimeout(timer); reject(error); } };
    child.stdout.on('data', chunk => {
      bytes += chunk.length;
      if (bytes > maxOutputBytes) {
        child.kill('SIGKILL');
        finish({ platform: 'android', status: 'failed', captures: [], declared_permissions: declaredPermissions, evidence: [`ADB capture exceeded ${maxOutputBytes} bytes.`] });
        return;
      }
      chunks.push(chunk);
    });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', fail);
    child.on('close', async code => {
      if (settled) return;
      if (code !== 0) return finish({ platform: 'android', status: 'failed', captures: [], declared_permissions: declaredPermissions, evidence: [stderr || `adb exited ${code}.`] });
      try {
        await writeFile(output, Buffer.concat(chunks));
        finish({ platform: 'android', status: 'completed', captures: [{ kind: 'emulator-screenshot', path: output, serial: options.serial ?? null }], declared_permissions: declaredPermissions, evidence: [{ kind: 'adb-screencap', exit_code: code, bytes, declared_permissions: declaredPermissions }] });
      } catch (error) { fail(error); }
    });
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 1_000).unref();
      finish({ platform: 'android', status: 'timeout', captures: [], declared_permissions: declaredPermissions, evidence: [`ADB capture exceeded ${timeoutMs}ms.`] });
    }, timeoutMs);
    timer.unref();
  });
}

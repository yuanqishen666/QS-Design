import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { executeDeclaredTarget, normalizeDeclaredPermissions } from '../runtime.mjs';

async function loadPlaywright(cwd) {
  try { return await import('playwright'); }
  catch {
    try {
      const require = createRequire(join(resolve(cwd ?? process.cwd()), 'package.json'));
      return await import(pathToFileURL(require.resolve('playwright')).href);
    } catch { return null; }
  }
}

async function applyAction(page, action) {
  if (action.type === 'wait') { await page.waitForTimeout(Number(action.ms ?? 0)); return; }
  const locator = action.role ? page.getByRole(action.role, action.name ? { name: action.name } : {}) : page.locator(action.selector);
  if (action.type === 'click') await locator.click();
  else if (action.type === 'fill') await locator.fill(String(action.value ?? ''));
  else if (action.type === 'press') await locator.press(String(action.key));
  else if (action.type === 'focus') await locator.focus();
  else throw new Error(`Unknown web action: ${action.type}.`);
}

async function evaluateAssertion(page, assertion) {
  try {
    if (assertion.type === 'visible') {
      const locator = assertion.role ? page.getByRole(assertion.role, assertion.name ? { name: assertion.name } : {}) : page.locator(assertion.selector);
      return { ...assertion, source: 'playwright', evidence_attested: true, status: await locator.isVisible() ? 'clean' : 'finding', evidence: [`Visibility checked for ${assertion.selector ?? assertion.role}.`] };
    }
    if (assertion.type === 'text') {
      const text = await page.locator(assertion.selector).innerText();
      return { ...assertion, source: 'playwright', evidence_attested: true, status: text.includes(assertion.includes) ? 'clean' : 'finding', evidence: [`Observed text: ${text}`] };
    }
    if (assertion.type === 'url') {
      const url = page.url();
      return { ...assertion, source: 'playwright', evidence_attested: true, status: url.includes(assertion.includes) ? 'clean' : 'finding', evidence: [`Observed URL: ${url}`] };
    }
    if (assertion.type === 'no-horizontal-overflow') {
      const fits = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      return { ...assertion, source: 'playwright', evidence_attested: true, status: fits ? 'clean' : 'finding', evidence: [`Horizontal overflow ${fits ? 'was not' : 'was'} detected.`] };
    }
    return { ...assertion, source: 'playwright', evidence_attested: true, status: 'unknown', evidence: [`Unsupported assertion type: ${assertion.type}.`] };
  } catch (error) { return { ...assertion, source: 'playwright', evidence_attested: true, status: 'finding', evidence: [error.message] }; }
}

export async function runWebTarget({ target, platform = 'web' } = {}) {
  if (target?.command) return executeDeclaredTarget({ platform, target });
  if (!target?.url) return { platform, status: 'unknown', assertions: [], evidence: ['Web runtime requires target.url or an explicit command.'] };
  const cwd = resolve(target.cwd ?? process.cwd());
  const networkRequired = /^https?:\/\//i.test(target.url);
  const screenshot = target.screenshot ? resolve(cwd, target.screenshot) : null;
  const declaredPermissions = normalizeDeclaredPermissions(target.permissions, {
    command: 'playwright-browser', cwd, networkRequired, requiredWritePaths: screenshot ? [screenshot] : []
  });
  const playwright = await loadPlaywright(target.cwd);
  if (!playwright) return { platform, status: 'unknown', assertions: [], evidence: ['Playwright is not installed in QS Design or the target project.'] };
  const browserName = target.browser ?? 'chromium';
  if (!playwright[browserName]) throw new Error(`Unsupported Playwright browser: ${browserName}.`);
  const browser = await playwright[browserName].launch({ headless: target.headless !== false });
  try {
    const context = await browser.newContext({ viewport: target.viewport ?? { width: 1280, height: 800 }, reducedMotion: target.reduced_motion ? 'reduce' : 'no-preference' });
    const page = await context.newPage();
    await page.goto(target.url, { waitUntil: target.wait_until ?? 'networkidle', timeout: target.timeout_ms ?? 30_000 });
    for (const action of target.actions ?? []) await applyAction(page, action);
    const assertions = [];
    for (const assertion of target.assertions ?? []) assertions.push(await evaluateAssertion(page, assertion));
    const captures = [];
    if (target.screenshot) {
      const path = resolve(target.cwd ?? process.cwd(), target.screenshot);
      await page.screenshot({ path, fullPage: target.full_page !== false });
      captures.push({ kind: 'screenshot', path });
    }
    return {
      platform,
      status: 'completed',
      url: page.url(),
      title: await page.title(),
      assertions,
      captures,
      declared_permissions: declaredPermissions,
      evidence: [{ kind: 'browser-runtime', engine: browserName, url: page.url(), viewport: target.viewport ?? { width: 1280, height: 800 }, declared_permissions: declaredPermissions }]
    };
  } finally { await browser.close(); }
}

export async function captureWebTarget({ session } = {}) {
  if (session?.captures?.length) return { platform: 'web', status: 'completed', captures: session.captures, evidence: session.evidence ?? [] };
  return { platform: 'web', status: 'unknown', captures: [], evidence: ['The web session did not produce a capture.'] };
}

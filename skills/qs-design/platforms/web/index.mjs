import { definePlatformAdapter } from '../adapter.mjs';
import { captureWebTarget, runWebTarget } from './runtime.mjs';

export default definePlatformAdapter({
  id: 'web',
  displayName: 'Web',
  tools: ['node'],
  requiredAssertions: ['keyboard-path', 'accessible-names', 'critical-content-visible', 'disclosure-input-parity', 'reduced-motion', 'responsive-layout'],
  capabilities: { semantic_dom: 'native', keyboard: 'native', reduced_motion: 'native', pointer_input: 'native', runtime_capture: 'conditional-playwright' },
  guidance: { navigation: 'URL and browser history', input: 'keyboard, pointer and touch without pointer-only outcomes', accessibility: 'semantic DOM and accessible names', motion: 'interruptible transform/opacity with reduced-motion path', layout: 'content-driven responsive layout', performance: ['avoid layout work in continuous input', 'verify real viewports'], fallbacks: ['semantic HTML before canvas', 'static state change for reduced motion'], capture: 'Playwright or an explicit browser evidence contract' },
  runtime: { run: runWebTarget, capture: captureWebTarget }
});

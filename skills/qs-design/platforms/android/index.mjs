import { definePlatformAdapter } from '../adapter.mjs';
import { captureAndroidEmulator, runAndroidTarget } from './runtime.mjs';

export default definePlatformAdapter({
  id: 'android',
  displayName: 'Android',
  tools: ['adb', 'gradle'],
  requiredAssertions: ['core-task', 'talkback', 'font-scaling', 'critical-content-visible', 'disclosure-input-parity', 'predictive-back', 'reduced-motion'],
  capabilities: { talkback: 'native', font_scaling: 'native', predictive_back: 'conditional', haptics: 'native', emulator_capture: 'conditional' },
  guidance: { navigation: 'predictive-back-compatible navigation', input: 'touch, keyboard, switch and accessibility actions', accessibility: 'TalkBack semantics and font scaling', motion: 'Compose/View animation with interruption', layout: 'window size classes and foldables', performance: ['measure recomposition or render cost', 'test low-tier emulator/device'], fallbacks: ['visible control for gesture-only actions', 'static transition for reduced motion'], capture: 'Emulator/Compose test capture tied to device and build' },
  runtime: { run: runAndroidTarget, capture: captureAndroidEmulator }
});

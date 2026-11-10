import { definePlatformAdapter } from '../adapter.mjs';

export default definePlatformAdapter({
  id: 'wechat',
  displayName: 'WeChat Mini Program',
  tools: ['cli'],
  requiredAssertions: ['core-task', 'navigation-stack', 'text-scaling', 'critical-content-visible', 'disclosure-input-parity', 'low-end-fallback'],
  capabilities: { skyline: 'conditional', worklet: 'conditional', accessibility: 'conditional', haptics: 'conditional', developer_tool_capture: 'conditional' },
  guidance: { navigation: 'mini-program navigation stack', input: 'tap, keyboard where supported, and native component actions', accessibility: 'platform component semantics with explicit verification', motion: 'Skyline/Worklet where supported; avoid per-frame setData', layout: 'capsule, safe area and real-device variance', performance: ['avoid per-frame setData', 'verify low-end device fallback'], fallbacks: ['WebView-compatible static feedback', 'non-haptic confirmation'], capture: 'Developer Tools CLI or explicit real-device evidence contract' }
});

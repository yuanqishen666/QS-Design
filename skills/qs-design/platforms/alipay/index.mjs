import { definePlatformAdapter } from '../adapter.mjs';

export default definePlatformAdapter({
  id: 'alipay',
  displayName: 'Alipay Mini Program',
  tools: ['minidev'],
  requiredAssertions: ['core-task', 'navigation-stack', 'accessibility-semantics', 'critical-content-visible', 'disclosure-input-parity', 'client-fallback'],
  capabilities: { native_animation: 'conditional', movable_view: 'conditional', accessibility: 'conditional', haptics: 'conditional', developer_tool_capture: 'conditional' },
  guidance: { navigation: 'mini-program navigation and payment/auth results', input: 'tap and native component actions with explicit alternatives', accessibility: 'aria-component and client verification', motion: 'supported native animation or explicit fallback', layout: 'safe area, client variation and payment context', performance: ['verify target client versions', 'avoid high-frequency bridge updates'], fallbacks: ['static state feedback', 'client-capability fallback'], capture: 'Developer Tools or explicit real-device evidence contract' }
});

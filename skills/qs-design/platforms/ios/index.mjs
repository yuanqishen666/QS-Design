import { definePlatformAdapter } from '../adapter.mjs';
import { captureIOSSimulator, runIOSTarget } from './runtime.mjs';

export default definePlatformAdapter({
  id: 'ios',
  displayName: 'iOS / iPadOS',
  tools: ['xcrun', 'xcodebuild'],
  requiredAssertions: ['core-task', 'voiceover', 'dynamic-type', 'critical-content-visible', 'disclosure-input-parity', 'reduced-motion', 'cancel-and-recovery'],
  capabilities: { voiceover: 'native', dynamic_type: 'native', reduced_motion: 'native', haptics: 'native', simulator_capture: 'conditional' },
  guidance: { navigation: 'NavigationStack or project-native routing', input: 'touch, keyboard and assistive actions', accessibility: 'VoiceOver and Dynamic Type', motion: 'interruptible native state-driven motion', layout: 'safe areas, window classes and multitasking', performance: ['measure repeated gestures', 'avoid layout feedback loops'], fallbacks: ['non-gesture control', 'reduced-motion state change'], capture: 'Simulator/XCTest capture tied to a build and device identity' },
  runtime: { run: runIOSTarget, capture: captureIOSSimulator }
});

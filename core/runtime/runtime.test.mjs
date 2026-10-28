import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp, mapRange, createMotionValue, createSpring, createDecay, createStateMachine, createThresholds } from './interaction-runtime.js';

function frameHarness(reduced = false) {
  let id = 0;
  const queue = new Map();
  return {
    queue,
    env: {
      requestAnimationFrame(fn) { queue.set(++id, fn); return id; },
      cancelAnimationFrame(frame) { queue.delete(frame); },
      matchMedia: () => ({ matches: reduced })
    },
    step(time) { const callbacks = [...queue.values()]; queue.clear(); callbacks.forEach(fn => fn(time)); }
  };
}

test('range helpers clamp and reject invalid ranges', () => {
  assert.equal(clamp(4, 0, 2), 2);
  assert.equal(mapRange(5, [0, 10], [0, 100]), 50);
  assert.equal(mapRange(20, [0, 10], [0, 100]), 100);
  assert.throws(() => mapRange(1, [1, 1], [0, 1]), /must not be zero/);
});

test('motion values expose velocity and subscriptions', () => {
  let time = 0;
  const value = createMotionValue(0, { now: () => time });
  const seen = [];
  const off = value.subscribe((next, velocity) => seen.push([next, velocity]));
  time = 100;
  value.set(10);
  off();
  assert.equal(value.get(), 10);
  assert.equal(value.getVelocity(), 100);
  assert.deepEqual(seen, [[10, 100]]);
});

test('spring is interruptible and reduced motion settles immediately', () => {
  const harness = frameHarness();
  const value = createMotionValue(0, { now: () => 0 });
  const spring = createSpring(value, () => {}, harness.env);
  spring.to(100, { velocity: 20 });
  harness.step(0); harness.step(16); harness.step(32);
  assert.ok(value.get() > 0 && value.get() < 100);
  spring.to(50);
  assert.equal(harness.queue.size, 1);
  const reduced = frameHarness(true);
  const next = createMotionValue(0, { now: () => 0 });
  createSpring(next, () => {}, reduced.env).to(9);
  assert.equal(next.get(), 9);
  assert.equal(reduced.queue.size, 0);
});

test('decay respects constraints', () => {
  const harness = frameHarness();
  const value = createMotionValue(0, { now: () => 0 });
  const decay = createDecay(value, () => {}, harness.env);
  decay.start(1000, { min: 0, max: 10, deceleration: 0.99 });
  harness.step(0); harness.step(20);
  assert.equal(value.get(), 10);
  assert.equal(decay.isAnimating(), false);
});

test('state machine rejects unsupported events and records valid transitions', () => {
  const transitions = [];
  const machine = createStateMachine({
    initial: 'idle',
    states: { idle: { on: { START: 'dragging' } }, dragging: { on: { COMMIT: 'done', CANCEL: 'idle' } }, done: { on: { RESET: 'idle' } } },
    onTransition: item => transitions.push(item)
  });
  assert.equal(machine.send('COMMIT'), false);
  assert.equal(machine.send('START'), true);
  assert.equal(machine.can('CANCEL'), true);
  machine.send('CANCEL');
  assert.equal(machine.getState(), 'idle');
  assert.equal(transitions.length, 2);
});

test('thresholds report crossings in both directions', () => {
  const thresholds = createThresholds([{ id: 'preview', at: 0.3 }, { id: 'commit', at: 0.8 }]);
  assert.equal(thresholds.update(0.2).active, null);
  assert.equal(thresholds.update(0.5).active.id, 'preview');
  assert.equal(thresholds.update(0.9).active.id, 'commit');
  const result = thresholds.update(0.4);
  assert.equal(result.active.id, 'preview');
  assert.equal(result.changed, true);
});

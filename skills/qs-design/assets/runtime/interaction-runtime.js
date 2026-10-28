const defaultEnvironment = globalThis;

export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function mapRange(value, input, output, { clampOutput = true } = {}) {
  const [inMin, inMax] = input;
  const [outMin, outMax] = output;
  if (inMin === inMax) throw new Error('Input range must not be zero.');
  const progress = (value - inMin) / (inMax - inMin);
  const mapped = outMin + progress * (outMax - outMin);
  return clampOutput ? clamp(mapped, Math.min(outMin, outMax), Math.max(outMin, outMax)) : mapped;
}

export function prefersReducedMotion(env = defaultEnvironment) {
  return Boolean(env.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

export function createMotionValue(initial, { now = () => defaultEnvironment.performance?.now?.() ?? Date.now() } = {}) {
  let value = Number(initial);
  let velocity = 0;
  let timestamp = now();
  const listeners = new Set();
  const set = (next, at = now()) => {
    const numeric = Number(next);
    const elapsed = Math.max(1, at - timestamp);
    velocity = (numeric - value) / (elapsed / 1000);
    value = numeric;
    timestamp = at;
    listeners.forEach(listener => listener(value, velocity));
    return value;
  };
  return Object.freeze({
    get: () => value,
    getVelocity: () => velocity,
    set,
    jump(next, at = now()) { value = Number(next); velocity = 0; timestamp = at; listeners.forEach(listener => listener(value, velocity)); return value; },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
  });
}

function frameEnvironment(env) {
  if (!env?.requestAnimationFrame || !env?.cancelAnimationFrame) throw new Error('Animation environment requires requestAnimationFrame and cancelAnimationFrame.');
  return env;
}

export function createSpring(motionValue, onUpdate = () => {}, env = defaultEnvironment) {
  let frame = null;
  let target = motionValue.get();
  let velocity = 0;
  let previous = null;
  const cancel = () => { if (frame !== null) frameEnvironment(env).cancelAnimationFrame(frame); frame = null; previous = null; };
  const settle = value => { motionValue.jump(value); onUpdate(value, 0); frame = null; previous = null; };
  const to = (next, options = {}) => {
    const { stiffness = 360, damping = 34, mass = 1, restSpeed = 0.5, restDelta = 0.1, velocity: suppliedVelocity } = options;
    target = Number(next);
    velocity = Number.isFinite(suppliedVelocity) ? suppliedVelocity : (frame === null ? motionValue.getVelocity() : velocity);
    if (prefersReducedMotion(env)) { cancel(); settle(target); return { cancel }; }
    cancel();
    const tick = time => {
      const dt = previous == null ? 1 / 60 : clamp((time - previous) / 1000, 1 / 240, 1 / 20);
      previous = time;
      const position = motionValue.get();
      const acceleration = (-stiffness * (position - target) - damping * velocity) / mass;
      velocity += acceleration * dt;
      const nextValue = position + velocity * dt;
      motionValue.set(nextValue, time);
      onUpdate(nextValue, velocity);
      if (Math.abs(velocity) <= restSpeed && Math.abs(target - nextValue) <= restDelta) settle(target);
      else frame = frameEnvironment(env).requestAnimationFrame(tick);
    };
    frame = frameEnvironment(env).requestAnimationFrame(tick);
    return { cancel };
  };
  return Object.freeze({ to, cancel, getTarget: () => target, isAnimating: () => frame !== null });
}

export function createDecay(motionValue, onUpdate = () => {}, env = defaultEnvironment) {
  let frame = null;
  const cancel = () => { if (frame !== null) frameEnvironment(env).cancelAnimationFrame(frame); frame = null; };
  const start = (initialVelocity = motionValue.getVelocity(), options = {}) => {
    const { deceleration = 0.998, min = -Infinity, max = Infinity, restSpeed = 5 } = options;
    cancel();
    if (prefersReducedMotion(env)) return { cancel };
    let velocity = Number(initialVelocity);
    let previous = null;
    const tick = time => {
      const elapsed = previous == null ? 16.667 : clamp(time - previous, 4, 50);
      previous = time;
      velocity *= Math.pow(deceleration, elapsed);
      const raw = motionValue.get() + velocity * (elapsed / 1000);
      const next = clamp(raw, min, max);
      motionValue.set(next, time);
      onUpdate(next, velocity);
      if (Math.abs(velocity) <= restSpeed || next !== raw) frame = null;
      else frame = frameEnvironment(env).requestAnimationFrame(tick);
    };
    frame = frameEnvironment(env).requestAnimationFrame(tick);
    return { cancel };
  };
  return Object.freeze({ start, cancel, isAnimating: () => frame !== null });
}

export function createStateMachine({ initial, states, onTransition = () => {} }) {
  if (!Object.hasOwn(states, initial)) throw new Error(`Unknown initial state: ${initial}`);
  let current = initial;
  const listeners = new Set();
  const send = (event, payload) => {
    const transition = states[current]?.on?.[event];
    if (!transition) return false;
    const candidate = typeof transition === 'function' ? transition(payload, current) : transition;
    const next = typeof candidate === 'string' ? candidate : candidate?.target;
    if (!next || !Object.hasOwn(states, next)) throw new Error(`Invalid transition target from ${current} on ${event}.`);
    const previous = current;
    current = next;
    onTransition({ previous, current, event, payload });
    listeners.forEach(listener => listener(current, previous, event, payload));
    return true;
  };
  return Object.freeze({
    getState: () => current,
    can: event => Boolean(states[current]?.on?.[event]),
    send,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
  });
}

export function createThresholds(definitions) {
  const ordered = [...definitions].sort((a, b) => a.at - b.at);
  let active = null;
  return Object.freeze({
    update(value) {
      const next = ordered.filter(item => value >= item.at).at(-1) ?? null;
      const changed = next?.id !== active?.id;
      const previous = active;
      active = next;
      return { active, previous, changed };
    },
    getActive: () => active
  });
}

export function bindPressable(element, activate) {
  const click = event => activate(event);
  const keydown = event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    activate(event);
  };
  element.addEventListener('click', click);
  element.addEventListener('keydown', keydown);
  return () => { element.removeEventListener('click', click); element.removeEventListener('keydown', keydown); };
}

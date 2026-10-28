/* QS Design: optional behavior helpers, no visual components. */
(function (root) {
  'use strict';
  const copy = value => typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));

  function createStore(initial) {
    let state = copy(initial);
    const listeners = new Set();
    const getState = () => copy(state);
    const setState = next => {
      state = copy(next);
      listeners.forEach(fn => fn(getState()));
      return getState();
    };
    return { getState, setState, update: fn => setState(fn(getState())),
      subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); } };
  }

  // Start a new session each time an editor opens. Closing never commits.
  function createDraft(initial, onCommit) {
    let value = copy(initial), active = true;
    return {
      getValue: () => copy(value),
      update(fn) { if (active) value = copy(fn(copy(value))); return copy(value); },
      commit() { if (!active) return false; active = false; onCommit(copy(value)); return true; },
      cancel() { if (!active) return false; active = false; return true; },
      isActive: () => active
    };
  }

  // render(route) returns the destination heading or control to focus.
  function createNavigator(initial, render, env = root) {
    let current = copy(initial);
    const history = [];
    const show = (route, focus, scrollY = 0) => {
      current = copy(route);
      const target = render(copy(current));
      env.scrollTo?.(0, scrollY);
      (focus?.isConnected ? focus : target)?.focus?.({ preventScroll: true });
    };
    return {
      getRoute: () => copy(current),
      go(route) { history.push({ route: copy(current), focus: env.document?.activeElement, y: env.scrollY || 0 }); show(route); },
      back() { const previous = history.pop(); if (!previous) return false; show(previous.route, previous.focus, previous.y); return true; },
      reset(route = initial) { history.length = 0; show(route); }
    };
  }

  // Apply touch-action: pan-y to horizontal handles, pan-x to vertical handles.
  // Use a range input for simple values. Bind this only to the actual drag region.
  function bindDrag(element, { axis = 'x', threshold = 6, onStart, onMove, onEnd, onCancel } = {}) {
    let gesture = null, suppressClick = false;
    const point = event => ({ x: event.clientX, y: event.clientY });
    const payload = event => ({ ...point(event), dx: event.clientX - gesture.x, dy: event.clientY - gesture.y, pointerId: event.pointerId });
    const finish = (event, cancelled) => {
      if (!gesture || event.pointerId !== gesture.id) return;
      const started = gesture.started, result = payload(event), id = gesture.id;
      gesture = null;
      if (element.hasPointerCapture?.(id)) element.releasePointerCapture(id);
      if (started) { suppressClick = true; (cancelled ? onCancel : onEnd)?.(result); }
    };
    const down = event => {
      if (gesture || event.isPrimary === false || (event.button != null && event.button !== 0)) return;
      if (event.target.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])')) return;
      suppressClick = false;
      gesture = { ...point(event), id: event.pointerId, started: false };
    };
    const move = event => {
      if (!gesture || gesture.id !== event.pointerId) return;
      const result = payload(event), primary = Math.abs(axis === 'x' ? result.dx : result.dy), cross = Math.abs(axis === 'x' ? result.dy : result.dx);
      if (!gesture.started) {
        if (cross > threshold && cross > primary) { gesture = null; return; }
        if (primary < threshold) return;
        gesture.started = true;
        element.setPointerCapture?.(event.pointerId);
        onStart?.(result);
      }
      onMove?.(result);
    };
    const up = event => finish(event, false);
    const cancel = event => finish(event, true);
    const click = event => { if (suppressClick) { suppressClick = false; event.preventDefault(); event.stopImmediatePropagation(); } };
    const leave = event => { if (gesture && !gesture.started) cancel(event); };
    const handlers = { pointerdown: down, pointermove: move, pointerup: up, pointercancel: cancel, lostpointercapture: cancel, pointerleave: leave, click };
    for (const [type, fn] of Object.entries(handlers)) element.addEventListener(type, fn, type === 'click');
    return () => {
      if (gesture) cancel({ pointerId: gesture.id, clientX: gesture.x, clientY: gesture.y });
      for (const [type, fn] of Object.entries(handlers)) element.removeEventListener(type, fn, type === 'click');
    };
  }

  function createMotion(initial, onUpdate, env = root) {
    let value = initial, frame = null;
    const cancel = () => { if (frame !== null) env.cancelAnimationFrame(frame); frame = null; };
    return {
      getValue: () => value, cancel,
      to(target, duration = 220) {
        cancel();
        if (duration <= 0 || env.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { value = target; onUpdate(value); return; }
        const start = value, began = env.performance.now();
        const tick = now => {
          const progress = Math.min(1, Math.max(0, (now - began) / duration));
          value = start + (target - start) * (1 - Math.pow(1 - progress, 3));
          onUpdate(value);
          frame = progress < 1 ? env.requestAnimationFrame(tick) : null;
        };
        frame = env.requestAnimationFrame(tick);
      }
    };
  }

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const reduced = env => !!env.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function mapRange(value, input, output, clampOutput = true) {
    const [inMin, inMax] = input, [outMin, outMax] = output;
    if (inMin === inMax) throw new Error('Input range must not be zero.');
    const mapped = outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
    return clampOutput ? clamp(mapped, Math.min(outMin, outMax), Math.max(outMin, outMax)) : mapped;
  }

  function createMotionValue(initial, now = () => root.performance?.now?.() ?? Date.now()) {
    let value = Number(initial), velocity = 0, timestamp = now();
    const listeners = new Set();
    const notify = () => listeners.forEach(fn => fn(value, velocity));
    return {
      get: () => value,
      getVelocity: () => velocity,
      set(next, at = now()) { const elapsed = Math.max(1, at - timestamp); velocity = (Number(next) - value) / (elapsed / 1000); value = Number(next); timestamp = at; notify(); return value; },
      jump(next, at = now()) { value = Number(next); velocity = 0; timestamp = at; notify(); return value; },
      subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
    };
  }

  function createSpring(motionValue, onUpdate = () => {}, env = root) {
    let frame = null, previous = null, velocity = 0, target = motionValue.get();
    const cancel = () => { if (frame !== null) env.cancelAnimationFrame(frame); frame = null; previous = null; };
    const settle = () => { motionValue.jump(target); onUpdate(target, 0); frame = null; previous = null; };
    return {
      to(next, { stiffness = 360, damping = 34, mass = 1, restSpeed = .5, restDelta = .1, velocity: suppliedVelocity } = {}) {
        target = Number(next); velocity = Number.isFinite(suppliedVelocity) ? suppliedVelocity : (frame === null ? motionValue.getVelocity() : velocity);
        cancel();
        if (reduced(env)) { settle(); return; }
        const tick = time => {
          const dt = previous == null ? 1 / 60 : clamp((time - previous) / 1000, 1 / 240, 1 / 20); previous = time;
          const position = motionValue.get(); velocity += ((-stiffness * (position - target) - damping * velocity) / mass) * dt;
          const value = position + velocity * dt; motionValue.set(value, time); onUpdate(value, velocity);
          if (Math.abs(velocity) <= restSpeed && Math.abs(target - value) <= restDelta) settle();
          else frame = env.requestAnimationFrame(tick);
        };
        frame = env.requestAnimationFrame(tick);
      },
      cancel,
      isAnimating: () => frame !== null
    };
  }

  function createDecay(motionValue, onUpdate = () => {}, env = root) {
    let frame = null;
    const cancel = () => { if (frame !== null) env.cancelAnimationFrame(frame); frame = null; };
    return {
      start(initialVelocity = motionValue.getVelocity(), { deceleration = .998, min = -Infinity, max = Infinity, restSpeed = 5 } = {}) {
        cancel(); if (reduced(env)) return;
        let velocity = Number(initialVelocity), previous = null;
        const tick = time => {
          const elapsed = previous == null ? 16.667 : clamp(time - previous, 4, 50); previous = time; velocity *= Math.pow(deceleration, elapsed);
          const raw = motionValue.get() + velocity * elapsed / 1000, value = clamp(raw, min, max); motionValue.set(value, time); onUpdate(value, velocity);
          if (Math.abs(velocity) <= restSpeed || value !== raw) frame = null; else frame = env.requestAnimationFrame(tick);
        };
        frame = env.requestAnimationFrame(tick);
      },
      cancel,
      isAnimating: () => frame !== null
    };
  }

  function createStateMachine({ initial, states, onTransition = () => {} }) {
    if (!Object.prototype.hasOwnProperty.call(states, initial)) throw new Error(`Unknown initial state: ${initial}`);
    let current = initial;
    return {
      getState: () => current,
      can: event => !!states[current]?.on?.[event],
      send(event, payload) {
        const transition = states[current]?.on?.[event]; if (!transition) return false;
        const candidate = typeof transition === 'function' ? transition(payload, current) : transition;
        const next = typeof candidate === 'string' ? candidate : candidate?.target;
        if (!next || !Object.prototype.hasOwnProperty.call(states, next)) throw new Error(`Invalid transition target from ${current} on ${event}.`);
        const previous = current; current = next; onTransition({ previous, current, event, payload }); return true;
      }
    };
  }

  function createThresholds(definitions) {
    const ordered = [...definitions].sort((a, b) => a.at - b.at); let active = null;
    return { update(value) { const next = ordered.filter(item => value >= item.at).at(-1) || null; const result = { active: next, previous: active, changed: next?.id !== active?.id }; active = next; return result; }, getActive: () => active };
  }

  root.PrototypeCore = Object.freeze({ createStore, createDraft, createNavigator, bindDrag, createMotion, clamp, mapRange, createMotionValue, createSpring, createDecay, createStateMachine, createThresholds });
})(globalThis);

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
  root.PrototypeCore = Object.freeze({ createStore, createDraft, createNavigator, bindDrag, createMotion });
})(globalThis);

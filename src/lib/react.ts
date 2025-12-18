export type VNode = {
  type: any;
  props: any;
};

export const Fragment = Symbol('Fragment');
export const StrictMode = ({ children }: { children: any }) => children as any;

let hooks: any[] = [];
let hookIndex = 0;
let pendingEffects: number[] = [];
let renderQueue: (() => void)[] = [];
let currentRender: (() => void) | null = null;

const areDepsEqual = (a?: any[], b?: any[]) => {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  return a.every((val, i) => Object.is(val, b[i]));
};

export function scheduleRender(renderer: () => void) {
  currentRender = renderer;
}

const enqueueRender = () => {
  if (renderQueue.length === 0) {
    Promise.resolve().then(() => {
      const queue = renderQueue;
      renderQueue = [];
      queue.forEach((fn) => fn());
    });
  }
  if (currentRender) {
    renderQueue.push(currentRender);
  }
};

export function resetHooks() {
  hookIndex = 0;
  pendingEffects = [];
}

export function flushEffects() {
  const toRun = pendingEffects;
  pendingEffects = [];
  toRun.forEach((idx) => {
    const record = hooks[idx];
    if (!record) return;
    if (typeof record.cleanup === 'function') {
      record.cleanup();
    }
    record.cleanup = record.effect();
  });
}

export function createElement(type: any, props: any, ...children: any[]): VNode {
  const normalizedChildren = children.flat().filter((child) => child !== null && child !== false && child !== true && child !== undefined);
  return { type, props: { ...(props || {}), children: normalizedChildren } };
}

export function useState<T>(initial: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void] {
  const idx = hookIndex++;
  if (hooks[idx] === undefined) {
    hooks[idx] = typeof initial === 'function' ? (initial as () => T)() : initial;
  }
  const setState = (value: T | ((prev: T) => T)) => {
    const next = typeof value === 'function' ? (value as (prev: T) => T)(hooks[idx]) : value;
    if (!Object.is(next, hooks[idx])) {
      hooks[idx] = next;
      enqueueRender();
    }
  };
  return [hooks[idx], setState];
}

export function useRef<T>(initial: T): { current: T } {
  const idx = hookIndex++;
  if (hooks[idx] === undefined) {
    hooks[idx] = { current: initial };
  }
  return hooks[idx];
}

export function useMemo<T>(factory: () => T, deps?: any[]): T {
  const idx = hookIndex++;
  const record = hooks[idx];
  if (!record || !deps || !record.deps || !areDepsEqual(record.deps, deps)) {
    const value = factory();
    hooks[idx] = { value, deps };
  }
  return hooks[idx].value as T;
}

export function useEffect(effect: () => void | (() => void), deps?: any[]) {
  const idx = hookIndex++;
  const record = hooks[idx];
  const shouldRun = !record || !deps || !record.deps || !areDepsEqual(record.deps, deps);
  hooks[idx] = { effect, deps, cleanup: record?.cleanup };
  if (shouldRun) {
    pendingEffects.push(idx);
  }
}

export default {
  createElement,
  useState,
  useEffect,
  useMemo,
  useRef,
  Fragment,
  StrictMode,
};

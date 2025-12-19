declare module 'react' {
  export type FC<P = {}> = (props: P & { children?: any }) => any;
  export interface JSXElement {}
  export interface RefObject<T> { current: T }
  export const Fragment: unique symbol;
  export const StrictMode: ({ children }: { children: any }) => any;
  export function createElement(type: any, props?: any, ...children: any[]): any;
  export function useState<T>(initial: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useMemo<T>(factory: () => T, deps?: any[]): T;
  export function useRef<T>(initial: T): RefObject<T>;
  const _default: {
    createElement: typeof createElement;
    useState: typeof useState;
    useEffect: typeof useEffect;
    useMemo: typeof useMemo;
    useRef: typeof useRef;
    Fragment: typeof Fragment;
    StrictMode: typeof StrictMode;
  };
  export default _default;
}

declare module 'react/jsx-runtime' {
  export const Fragment: any;
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
  export function jsxDEV(type: any, props: any, key?: any): any;
}

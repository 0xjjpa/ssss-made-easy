import { createElement, Fragment } from './react';

export { Fragment };

export function jsx(type: any, props: any, key?: any) {
  return createElement(type, { ...props, key });
}

export function jsxs(type: any, props: any, key?: any) {
  return createElement(type, { ...props, key });
}

export function jsxDEV(type: any, props: any, key?: any) {
  return createElement(type, { ...props, key });
}

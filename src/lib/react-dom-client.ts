import {
  createElement,
  flushEffects,
  Fragment,
  resetHooks,
  scheduleRender,
  StrictMode,
  VNode,
} from './react';

function isVNode(value: any): value is VNode {
  return value && typeof value === 'object' && 'type' in value && 'props' in value;
}

function setProp(el: HTMLElement, key: string, value: any) {
  if (key === 'children' || value === undefined) return;
  if (key === 'className') {
    el.setAttribute('class', value);
    return;
  }
  if (key.startsWith('on') && typeof value === 'function') {
    const event = key.substring(2).toLowerCase();
    el.addEventListener(event, value as EventListener);
    return;
  }
  if (key === 'style' && typeof value === 'object') {
    Object.assign((el as HTMLElement).style, value);
    return;
  }
  if (key in el) {
    // @ts-ignore
    (el as any)[key] = value;
  } else {
    el.setAttribute(key, value);
  }
}

function renderVNode(node: any): Node | null {
  if (node === null || node === undefined || typeof node === 'boolean') return document.createComment('');
  if (typeof node === 'string' || typeof node === 'number') return document.createTextNode(String(node));
  if (Array.isArray(node)) {
    const frag = document.createDocumentFragment();
    node.forEach((child) => {
      const rendered = renderVNode(child);
      if (rendered) frag.appendChild(rendered);
    });
    return frag;
  }
  if (isVNode(node)) {
    if (node.type === Fragment || node.type === StrictMode) {
      return renderVNode(node.props.children);
    }
    if (typeof node.type === 'function') {
      return renderVNode(node.type({ ...(node.props || {}), children: node.props?.children }));
    }
    if (typeof node.type === 'string') {
      const el = document.createElement(node.type);
      Object.entries(node.props || {}).forEach(([key, value]) => setProp(el, key, value));
      const children = node.props?.children || [];
      const renderedChildren = Array.isArray(children) ? children : [children];
      renderedChildren.forEach((child) => {
        const rendered = renderVNode(child);
        if (rendered) el.appendChild(rendered);
      });
      return el;
    }
  }
  return document.createTextNode('');
}

export function createRoot(container: HTMLElement) {
  let rootNode: any = null;

  const renderOnce = () => {
    resetHooks();
    const dom = renderVNode(rootNode);
    if (dom) {
      container.replaceChildren(dom);
    }
    flushEffects();
  };

  const render = (node: any) => {
    rootNode = node;
    renderOnce();
  };

  scheduleRender(renderOnce);

  return { render };
}

export default { createRoot, createElement };

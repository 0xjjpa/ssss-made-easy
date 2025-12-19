import { useEffect, useMemo, useState } from './react';

const routerState = {
  path: typeof window !== 'undefined' ? window.location.pathname : '/',
  listeners: new Set<(path: string) => void>(),
};

function notify(path: string) {
  routerState.path = path;
  routerState.listeners.forEach((listener) => listener(path));
}

export function navigate(path: string) {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === path) return;
  window.history.pushState({}, '', path);
  notify(path);
}

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => notify(window.location.pathname));
}

function useRouterPath() {
  const [path, setPath] = useState(routerState.path);
  useEffect(() => {
    const listener = (next: string) => setPath(next);
    routerState.listeners.add(listener);
    return () => {
      routerState.listeners.delete(listener);
    };
  }, []);
  return path;
}

export function BrowserRouter({ children }: { children: any }) {
  return children;
}

export function Routes({ children }: { children: any }) {
  const path = useRouterPath();
  const childArray = Array.isArray(children) ? children : [children];
  const match = useMemo(() => {
    for (const child of childArray) {
      if (!child || typeof child !== 'object') continue;
      const { path: routePath, element, end } = child.props || {};
      if (typeof routePath !== 'string') continue;
      if (end ? path === routePath : path.startsWith(routePath)) {
        return element ?? null;
      }
    }
    return null;
  }, [path, childArray]);
  return match;
}

export function Route(props: { path: string; element: any; end?: boolean }) {
  return props as any;
}

export function Link({ to, children, className }: { to: string; children: any; className?: string }) {
  return (
    <a
      href={to}
      className={className}
      onClick={(e: Event) => {
        e.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

export function NavLink({ to, children, className, end }: { to: string; children: any; className: any; end?: boolean }) {
  const path = useRouterPath();
  const isActive = end ? path === to : path.startsWith(to);
  const computedClass = typeof className === 'function' ? className({ isActive }) : className;
  return (
    <Link to={to} className={computedClass}>
      {children}
    </Link>
  );
}

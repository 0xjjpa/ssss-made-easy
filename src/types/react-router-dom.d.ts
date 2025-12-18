declare module 'react-router-dom' {
  export function BrowserRouter(props: { children: any }): any;
  export function Routes(props: { children: any }): any;
  export function Route(props: { path: string; element: any; end?: boolean }): any;
  export function Link(props: { to: string; children: any; className?: string }): any;
  export function NavLink(props: {
    to: string;
    children: any;
    className?: string | ((opts: { isActive: boolean }) => string);
    end?: boolean;
  }): any;
}

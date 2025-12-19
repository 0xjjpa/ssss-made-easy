import { PropsWithChildren } from 'react';

function PageTitle({ children }: PropsWithChildren) {
  return <h1 className="text-3xl font-bold leading-tight text-white">{children}</h1>;
}

export default PageTitle;

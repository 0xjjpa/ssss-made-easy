import { PropsWithChildren } from 'react';

interface Props {
  target: string;
  title: string;
  description: string;
}

function LabelWithDescription({ target, title, description }: PropsWithChildren<Props>) {
  return (
    <label htmlFor={target} className="block text-left">
      <span className="text-sm font-bold">{title}</span>
      <p className="text-xs text-indigo-100">{description}</p>
    </label>
  );
}

export default LabelWithDescription;

import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import clsx from 'classnames';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
  filled?: boolean;
}

function RoundButton({ children, fullWidth, filled = true, className, ...rest }: PropsWithChildren<Props>) {
  return (
    <button
      className={clsx(
        'flex items-center justify-center gap-2 rounded-full px-4 py-3 text-lg font-semibold transition-colors',
        filled ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'border border-indigo-300 text-indigo-100 hover:bg-indigo-800',
        fullWidth ? 'w-full' : '',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export default RoundButton;

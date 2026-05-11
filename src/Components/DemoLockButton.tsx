import { ButtonHTMLAttributes, ReactNode } from 'react';
import useIsDemo from '../hooks/useIsDemo';

interface DemoLockButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  lockMessage?: string;
}

const DemoLockButton = ({
  children,
  className = '',
  disabled,
  lockMessage = 'Demo plan - upgrade to enable',
  title,
  ...props
}: DemoLockButtonProps) => {
  const isDemo = useIsDemo();
  const locked = isDemo || disabled;

  return (
    <button
      {...props}
      disabled={locked}
      title={isDemo ? lockMessage : title}
      className={`${className} ${isDemo ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      {children}
    </button>
  );
};

export default DemoLockButton;

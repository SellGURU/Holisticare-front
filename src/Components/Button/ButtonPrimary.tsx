import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonDefaultProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
  ClassName?: string;
  children: ReactNode;
  outLine?: boolean;
  size?: 'normal' | 'small';
}

export const ButtonPrimary: React.FC<ButtonDefaultProps> = ({
  onClick,
  ClassName = '',
  children,
  outLine,
  size,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      className={
        ` text-[12px]  flex items-center justify-center gap-1 ${outLine ? 'bg-[#FDFDFD] border-Primary-DeepTeal text-Primary-DeepTeal' : 'bg-Primary-DeepTeal border-gray-50 text-white'}  rounded-3xl border  disabled:bg-[#999999]
          ${size == 'small' ? ' px-4 py-[2px] ' : ' px-6 py-[6px] '}
        ` + ClassName
      }
      {...props}
    >
      {children}
    </button>
  );
};

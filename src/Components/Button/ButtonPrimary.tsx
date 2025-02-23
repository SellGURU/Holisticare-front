/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonDefaultProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: (e?: any) => void;
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
        ` text-[12px]  flex items-center justify-center gap-1 ${outLine ? 'bg-transparent border-Primary-DeepTeal text-Primary-DeepTeal' : 'bg-Primary-DeepTeal border-gray-50 text-white'}  rounded-3xl border  disabled:bg-[#999999]
          ${size == 'small' ? ' px-4 py-[2px] ' : ' px-6 py-[5.5px] '}
        ` + ClassName
      }
      {...props}
    >
      {children}
    </button>
  );
};

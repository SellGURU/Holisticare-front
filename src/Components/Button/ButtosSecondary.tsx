import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonDefaultProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
  ClassName?: string;
  children: ReactNode;
  size?: 'normal' | 'small';
}

export const ButtonSecondary: React.FC<ButtonDefaultProps> = ({
  onClick,
  ClassName = '',
  children,
  size,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      className={
        ` text-[12px] text-white  flex items-center justify-center gap-1 bg-Primary-EmeraldGreen rounded-[12px] border border-gray-50  disabled:bg-[#999999] 
         ${size == 'small' ? ' px-3 py-1 ' : ' px-6 py-[6px] '}
           ` + ClassName
      }
      {...props}
    >
      {children}
    </button>
  );
};

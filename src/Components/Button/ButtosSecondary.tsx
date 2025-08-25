import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonDefaultProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
  ClassName?: string;
  children: ReactNode;
  outline?: boolean;
  size?: 'normal' | 'small';
}

export const ButtonSecondary: React.FC<ButtonDefaultProps> = ({
  onClick,
  ClassName = '',
  children,
  size,
  outline,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      className={
        ` text-[12px]  flex items-center justify-center gap-1 ${outline ? 'bg-transparent border border-Primary-EmeraldGreen text-Primary-EmeraldGreen' : 'bg-Primary-EmeraldGreen text-white  border border-gray-50 '} rounded-[12px]  disabled:bg-[#999999] 
         ${size == 'small' ? ' px-3 py-1 ' : ' px-6 py-[6px] '}
           ` + ClassName
      }
      {...props}
    >
      {children}
    </button>
  );
};

import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonDefaultProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
  ClassName?: string;
  children: ReactNode;
  outLine?:boolean
}

export const ButtonPrimary: React.FC<ButtonDefaultProps> = ({
  onClick,
  ClassName = '',
  children,
  outLine,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      className={
        ` text-[12px]  flex items-center justify-center gap-1 ${outLine?'bg-backgroundColor-Main border-Primary-DeepTeal text-Primary-DeepTeal':'bg-Primary-DeepTeal border-gray-50 text-white'}  rounded-3xl border px-6 py-[6px] disabled:bg-[#999999] ` +
        ClassName
      }
      {...props}
    >
      {children}
    </button>
  );
};
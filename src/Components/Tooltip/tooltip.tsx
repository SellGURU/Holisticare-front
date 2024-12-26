import React from 'react';

interface TooltipProps {
    contextText: () => JSX.Element;  // The function returning JSX for the tooltip
    children: React.ReactNode;       // This allows any content as a child (image, text)
    className?:string;
}

export const Tooltip: React.FC<TooltipProps> = ({ contextText, className,children, ...props }) => {
    return (
        <div className="relative flex items-center justify-center gap-2 cursor-pointer group " {...props}>
            {children}

            {/* Tooltip */}
            <div
                className={" overscroll-y-auto overflow-y-auto TextStyle-Tiny bg-white shadow-200 w-[212px] h-[80px] !text-Text-Secondary absolute -bottom-[90px] mb-2 right-1/6 transform -translate-x-1/2 px-2 py-1 border border-Gray-50 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 "+className}>
                {contextText()} {/* Call the function to render JSX content */}
            </div>
        </div>
    );
};

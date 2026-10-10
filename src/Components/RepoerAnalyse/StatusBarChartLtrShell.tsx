import { ReactNode } from 'react';

/** Status bar layout is always LTR (segments + pin math); isolate from page `dir=rtl`. */
export default function StatusBarChartLtrShell({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      dir="ltr"
      className={`isolate w-full text-left ${className}`}
      style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
    >
      {children}
    </div>
  );
}

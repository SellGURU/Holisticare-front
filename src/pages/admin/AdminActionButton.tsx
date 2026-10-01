import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type Variant = 'default' | 'warning' | 'danger';

const VARIANT: Record<Variant, string> = {
  default:
    'border-Gray-50 bg-[#F8FAFB] text-Text-Primary hover:border-Primary-DeepTeal/40 hover:bg-white',
  warning:
    'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100',
  danger:
    'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
};

interface AdminActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  label: ReactNode;
  variant?: Variant;
}

const AdminActionButton = ({
  icon: Icon,
  label,
  variant = 'default',
  className = '',
  type = 'button',
  ...props
}: AdminActionButtonProps) => (
  <button
    type={type}
    className={`inline-flex w-full shrink-0 items-center justify-start gap-1.5 whitespace-nowrap rounded-xl border px-3 py-1.5 text-left text-[12px] font-medium leading-none transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT[variant]} ${className}`}
    {...props}
  >
    {Icon ? <Icon size={14} className="shrink-0" aria-hidden /> : null}
    <span>{label}</span>
  </button>
);

export default AdminActionButton;

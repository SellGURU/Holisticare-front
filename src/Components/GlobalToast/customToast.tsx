import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'error' | 'success' | 'warning' | 'info';

const config = {
  error: {
    border: 'border-red-200',
    bg: 'bg-white',
    iconBg: 'bg-red-500',
    icon: XCircle,
    text: 'text-black',
    borderLeft: 'bg-red-300',
  },
  success: {
    border: 'border-green-200',
    bg: 'bg-white',
    iconBg: 'bg-green-500',
    icon: CheckCircle,
    text: 'text-black',
    borderLeft: 'bg-green-300',
  },
  warning: {
    border: 'border-yellow-200',
    bg: 'bg-white',
    iconBg: 'bg-yellow-400',
    icon: AlertTriangle,
    text: 'text-black',
    borderLeft: 'bg-yellow-200',
  },
  info: {
    border: 'border-purple-200',
    bg: 'bg-white',
    iconBg: 'bg-purple-500',
    icon: Info,
    text: 'text-black',
    borderLeft: 'bg-purple-300',
  },
};

export function ToastContent({
  type,
  title,
  description,
  closeToast,
}: {
  type: ToastType;
  title: string;
  description?: string;
  closeToast?: () => void;
}) {
  const cfg = config[type];
  const Icon = cfg.icon;

  return (
    <div
      className={`relative flex gap-3 p-4 rounded-lg border shadow-xl ${cfg.bg} ${cfg.border}`}
    >
      {/* Left colored strip */}
      <div
        className={`absolute left-0 top-0 h-full w-1 rounded-l-lg ${cfg.borderLeft}`}
      />

      {/* Icon */}
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${cfg.iconBg}`}
      >
        <Icon size={18} />
      </div>

      {/* Text */}
      <div className="flex-1">
        <div className="flex items-center justify-between gap-8">
          <div className={`font-semibold text-sm ${cfg.text}`}>{title}</div>
          {/* Close */}
          <button
            onClick={closeToast}
            className="text-gray-400 hover:text-gray-700 transition"
          >
            <X size={16} color="black" />
          </button>
        </div>
        {description && (
          <div className="text-xs text-gray-600 mt-1">{description}</div>
        )}
      </div>
    </div>
  );
}

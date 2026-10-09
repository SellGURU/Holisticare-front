import type { ReactNode } from 'react';
import EnabledSwitch from '../../../Components/EnabledSwitch';

type NotificationSwitchProps = {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
};

export const NotificationSwitch = ({
  label,
  checked,
  onChange,
}: NotificationSwitchProps) => (
  <div className="flex items-center justify-between gap-3 py-2.5">
    <span className="text-xs text-Text-Primary">{label}</span>
    <div className="flex shrink-0 items-center gap-2">
      <span className="w-6 text-right text-[10px] text-[#888888]">
        {checked ? 'On' : 'Off'}
      </span>
      <EnabledSwitch
        enabled={checked}
        title={checked ? `Turn off ${label}` : `Turn on ${label}`}
        onChange={onChange}
      />
    </div>
  </div>
);

export const NotificationSwitchGroup = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="rounded-xl border border-Gray-50 bg-[#FDFDFD] px-4 py-3">
    <h3 className="mb-1 text-[10px] font-medium uppercase tracking-[0.04em] text-[#B0B0B0]">
      {title}
    </h3>
    <div className="divide-y divide-Gray-50">{children}</div>
  </section>
);

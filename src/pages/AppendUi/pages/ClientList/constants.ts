import type { PlanStatus, Urgency } from './types';

interface UrgencyStyle {
  label: string;
  bg: string;
  text: string;
  border: string;
  ring: string;
  avatarBg: string;
  avatarText: string;
}

interface PlanStyle {
  label: string;
  bg: string;
  text: string;
  border: string;
}

export const URGENCY_CONFIG: Record<Urgency, UrgencyStyle> = {
  immediate: {
    label: 'Immediate',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    ring: 'bg-red-500',
    avatarBg: 'bg-red-100',
    avatarText: 'text-red-700',
  },
  monitor: {
    label: 'Monitor',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    ring: 'bg-amber-500',
    avatarBg: 'bg-amber-100',
    avatarText: 'text-amber-700',
  },
  stable: {
    label: 'Stable',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    ring: 'bg-emerald-500',
    avatarBg: 'bg-emerald-100',
    avatarText: 'text-emerald-700',
  },
};

export const PLAN_CONFIG: Record<PlanStatus, PlanStyle> = {
  active: {
    label: 'Active',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  draft: {
    label: 'Draft',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
  },
  none: {
    label: 'No Plan',
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
  },
};

export const CATEGORY_COLORS: Record<string, string> = {
  Peptide: 'bg-violet-50 text-violet-700 border-violet-200',
  Longevity: 'bg-blue-50 text-blue-700 border-blue-200',
  Diet: 'bg-amber-50 text-amber-700 border-amber-200',
  Sleep: 'bg-teal-50 text-teal-700 border-teal-200',
  Lifestyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const DEFAULT_CATEGORY_COLOR =
  'bg-gray-50 text-gray-700 border-gray-200';

export const URGENCY_ORDER: Record<Urgency, number> = {
  immediate: 0,
  monitor: 1,
  stable: 2,
};

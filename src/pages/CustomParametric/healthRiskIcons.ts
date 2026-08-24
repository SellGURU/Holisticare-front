import {
  Activity,
  Brain,
  Clock,
  Flame,
  Gauge,
  Heart,
  HeartPulse,
  Leaf,
  Network,
  ShieldAlert,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export const HEALTH_RISK_ICONS: Record<string, LucideIcon> = {
  Heart,
  HeartPulse,
  Activity,
  Flame,
  Brain,
  Zap,
  Leaf,
  Clock,
  ShieldAlert,
  Gauge,
  Network,
};

export const HEALTH_RISK_DEFAULT_ICON: LucideIcon = Activity;

export const HEALTH_RISK_ICON_KEYS = Object.keys(HEALTH_RISK_ICONS);

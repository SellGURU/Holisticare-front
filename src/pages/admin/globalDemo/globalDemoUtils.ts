import type { GlobalDemoCandidate, GlobalDemoClientItem } from '../../../types/admin';

export const DEMO_TEMPLATE_MANAGE_PERMISSION = 'demo_template_manage';

export function maskIdentifier(value: string | number | null | undefined, visible = 4): string {
  const text = String(value ?? '').trim();
  if (!text) return '••••';
  if (text.length <= visible) return '•'.repeat(Math.max(text.length, 2));
  return `${'•'.repeat(Math.min(4, text.length - visible))}${text.slice(-visible)}`;
}

export function hasDemoTemplateManage(
  permissions: Record<string, unknown> | null | undefined,
): boolean {
  const value = permissions?.[DEMO_TEMPLATE_MANAGE_PERMISSION];
  if (value === true || value === 1) return true;
  return String(value ?? '')
    .trim()
    .toLowerCase() === 'true';
}

export function isCandidateSelectable(candidate: GlobalDemoCandidate): boolean {
  return !candidate.already_global;
}

export function globalDemoStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'propagating':
      return 'Propagating';
    case 'active':
      return 'Active';
    case 'failed':
      return 'Needs retry';
    case 'removing':
      return 'Archiving';
    case 'removed':
      return 'Removed';
    default:
      return status || 'Unknown';
  }
}

export function globalDemoStatusClass(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700';
    case 'propagating':
    case 'pending':
      return 'bg-teal-50 text-teal-700';
    case 'failed':
      return 'bg-amber-50 text-amber-700';
    case 'removing':
      return 'bg-slate-100 text-slate-600';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

export function jobIsActive(job?: { status?: string } | null): boolean {
  return Boolean(job && (job.status === 'pending' || job.status === 'running'));
}

export function progressSummary(item: GlobalDemoClientItem): string {
  const progress = item.progress || {
    total: 0,
    copied: 0,
    skipped: 0,
    failed: 0,
    archived: 0,
  };
  return `Copied ${progress.copied} · skipped ${progress.skipped} · failed ${progress.failed}${
    progress.total ? ` · total ${progress.total}` : ''
  }`;
}

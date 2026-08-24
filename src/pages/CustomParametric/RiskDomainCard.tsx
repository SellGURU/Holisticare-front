import { Clock, Copy, Eye, Pencil, Trash2 } from 'lucide-react';
import {
  HEALTH_RISK_DEFAULT_ICON,
  HEALTH_RISK_ICONS,
} from './healthRiskIcons';
import type { RiskDomainViewModel } from './types';

const GROUP_COLORS: Record<string, string> = {
  Longevity: 'bg-blue-50 text-blue-700 border-blue-200',
  Peptide: 'bg-violet-50 text-violet-700 border-violet-200',
  Diet: 'bg-amber-50 text-amber-700 border-amber-200',
  Sleep: 'bg-teal-50 text-teal-700 border-teal-200',
  Lifestyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function groupBadgeClass(group: string): string {
  return GROUP_COLORS[group] ?? 'bg-gray-50 text-gray-600 border-gray-200';
}

interface RiskDomainCardProps {
  domain: RiskDomainViewModel;
  onToggleActive: (domain: RiskDomainViewModel, next: boolean) => void;
  onView: (domain: RiskDomainViewModel) => void;
  onEdit: (domain: RiskDomainViewModel) => void;
  onDuplicate?: (domain: RiskDomainViewModel) => void;
  onDelete: (domain: RiskDomainViewModel) => void;
  toggleDisabled?: boolean;
  hideDuplicate?: boolean;
}

export default function RiskDomainCard({
  domain,
  onToggleActive,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  toggleDisabled,
  hideDuplicate,
}: RiskDomainCardProps) {
  const Icon = HEALTH_RISK_ICONS[domain.iconKey] ?? HEALTH_RISK_DEFAULT_ICON;
  const visibleBiomarkers = domain.biomarkers.slice(0, 5);
  const extraBiomarkers = domain.biomarkers.length - visibleBiomarkers.length;

  return (
    <div
      className={`group min-w-0 overflow-hidden rounded-xl border border-gray-200/80 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-md ${
        !domain.isEnabled ? 'opacity-55' : ''
      }`}
    >
      <div className="h-[3px]" style={{ backgroundColor: domain.iconColor }} />
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${domain.iconColor}15` }}
            >
              <Icon
                className="size-5"
                style={{ color: domain.iconColor }}
                aria-hidden
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3
                  className="min-w-0 text-[14px] font-bold break-words text-gray-900"
                  title={domain.displayName}
                >
                  {domain.displayName}
                </h3>
                <span className="shrink-0 rounded border border-gray-200 px-1.5 py-0.5 text-[9px] font-semibold text-gray-500">
                  {domain.source}
                </span>
              </div>
              {domain.timeHorizon ? (
                <div className="mt-0.5 flex min-w-0 items-start gap-1.5">
                  <Clock
                    className="mt-0.5 size-3 shrink-0 text-gray-400"
                    aria-hidden
                  />
                  <span className="min-w-0 text-[11px] break-words text-gray-400">
                    Horizon: {domain.timeHorizon}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={domain.isEnabled}
            disabled={toggleDisabled}
            onClick={() => onToggleActive(domain, !domain.isEnabled)}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
              domain.isEnabled ? 'bg-Primary-DeepTeal' : 'bg-gray-300'
            }`}
            aria-label={
              domain.isEnabled ? 'Deactivate domain' : 'Activate domain'
            }
          >
            <span
              className={`inline-block size-4 rounded-full bg-white transition-transform ${
                domain.isEnabled ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {domain.description ? (
          <p className="mb-3.5 text-[12px] leading-relaxed break-words text-gray-500 [overflow-wrap:anywhere]">
            {domain.description}
          </p>
        ) : null}

        {domain.biomarkers.length > 0 ? (
          <div className="mb-3.5">
            <p className="mb-1.5 text-[10px] font-semibold tracking-wide text-gray-400">
              FORMULA INPUTS ({domain.biomarkers.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {visibleBiomarkers.map((bm) => (
                <span
                  key={bm}
                  className="max-w-full rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium break-all text-gray-600"
                >
                  {bm}
                </span>
              ))}
              {extraBiomarkers > 0 ? (
                <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-400">
                  +{extraBiomarkers} more
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-3.5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            {domain.assignedGroups.length > 0 ? (
              <>
                <p className="mb-1.5 text-[10px] font-semibold tracking-wide text-gray-400">
                  ASSIGNED TO
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {domain.assignedGroups.map((g) => (
                    <span
                      key={g}
                      className={`max-w-full rounded border px-2 py-0.5 text-[9px] font-semibold break-words ${groupBadgeClass(g)}`}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-0.5 self-end opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100">
            <button
              type="button"
              title="View Formula"
              onClick={() => onView(domain)}
              className="flex size-7 items-center justify-center rounded-md transition-colors duration-150 hover:bg-blue-50"
            >
              <Eye
                className="size-3.5 text-gray-400 hover:text-blue-600"
                aria-hidden
              />
            </button>
            <button
              type="button"
              title="Edit"
              onClick={() => onEdit(domain)}
              className="flex size-7 items-center justify-center rounded-md transition-colors duration-150 hover:bg-emerald-50"
            >
              <Pencil
                className="size-3.5 text-gray-400 hover:text-emerald-600"
                aria-hidden
              />
            </button>
            {!hideDuplicate && onDuplicate ? (
              <button
                type="button"
                title="Duplicate"
                onClick={() => onDuplicate(domain)}
                className="flex size-7 items-center justify-center rounded-md transition-colors duration-150 hover:bg-violet-50"
              >
                <Copy
                  className="size-3.5 text-gray-400 hover:text-violet-600"
                  aria-hidden
                />
              </button>
            ) : null}
            <button
              type="button"
              title="Delete"
              onClick={() => onDelete(domain)}
              className="flex size-7 items-center justify-center rounded-md transition-colors duration-150 hover:bg-red-50"
            >
              <Trash2
                className="size-3.5 text-gray-400 hover:text-red-500"
                aria-hidden
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

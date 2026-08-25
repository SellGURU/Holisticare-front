import {
  formatRiskScore,
  riskContributions,
  scoreBarPercent,
  type HealthRiskAssessment,
  type RiskContribution,
} from './healthRiskAssessments';

function severityTone(
  severity: string | null | undefined,
  kind: 'risk' | 'score' | 'age' = 'risk',
) {
  const key = String(severity || '').toLowerCase();
  if (kind === 'age') {
    if (key.includes('accelerat') || key.includes('poor') || key.includes('high')) {
      return {
        ring: '#EF4444',
        chip: 'bg-red-50 text-red-700',
        wash: 'from-red-50/80 to-white',
      };
    }
    if (key.includes('older') || key.includes('moderat')) {
      return {
        ring: '#F59E0B',
        chip: 'bg-amber-50 text-amber-800',
        wash: 'from-amber-50/80 to-white',
      };
    }
    if (key.includes('young')) {
      return {
        ring: '#10B981',
        chip: 'bg-emerald-50 text-emerald-800',
        wash: 'from-emerald-50/70 to-white',
      };
    }
    return {
      ring: '#0D9488',
      chip: 'bg-[#E6F3F1] text-Primary-DeepTeal',
      wash: 'from-[#F4FBFA] to-white',
    };
  }
  const highIsBad = kind === 'risk';
  if (key.includes('high') || key.includes('critical') || key.includes('severe') || key.includes('poor')) {
    if (!highIsBad && (key.includes('high') || key.includes('optimal') || key.includes('excellent') || key.includes('good'))) {
      return {
        ring: '#10B981',
        chip: 'bg-emerald-50 text-emerald-800',
        wash: 'from-emerald-50/70 to-white',
      };
    }
    return {
      ring: '#EF4444',
      chip: 'bg-red-50 text-red-700',
      wash: 'from-red-50/80 to-white',
    };
  }
  if (key.includes('moderat') || key.includes('medium') || key.includes('low')) {
    if (!highIsBad && key.includes('low')) {
      return {
        ring: '#F59E0B',
        chip: 'bg-amber-50 text-amber-800',
        wash: 'from-amber-50/80 to-white',
      };
    }
    if (highIsBad && key.includes('low')) {
      return {
        ring: '#10B981',
        chip: 'bg-emerald-50 text-emerald-800',
        wash: 'from-emerald-50/70 to-white',
      };
    }
    return {
      ring: '#F59E0B',
      chip: 'bg-amber-50 text-amber-800',
      wash: 'from-amber-50/80 to-white',
    };
  }
  if (key.includes('optimal') || key.includes('good') || key.includes('excellent')) {
    return {
      ring: '#10B981',
      chip: 'bg-emerald-50 text-emerald-800',
      wash: 'from-emerald-50/70 to-white',
    };
  }
  return {
    ring: '#0D9488',
    chip: 'bg-[#E6F3F1] text-Primary-DeepTeal',
    wash: 'from-[#F4FBFA] to-white',
  };
}

function ageRingPercent(item: HealthRiskAssessment): number {
  const years = Number(item.score);
  if (!Number.isFinite(years)) return 0;
  const chrono = (item.evidence || []).find((row) =>
    /profile\.age|^age$/i.test(String(row.input || '')),
  );
  const chronoVal = chrono?.value != null ? Number(chrono.value) : NaN;
  if (Number.isFinite(chronoVal) && chronoVal > 0) {
    return Math.max(8, Math.min(100, 50 + (years - chronoVal) * 5));
  }
  return Math.max(8, Math.min(100, years));
}

function Donut({
  percent,
  segments,
  color,
}: {
  percent: number;
  segments: RiskContribution[];
  color: string;
}) {
  const size = 116;
  const stroke = 11;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * radius;
  let offset = 0;
  const usable = segments.filter((row) => row.share > 0);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
      aria-hidden
    >
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="#EEF2F3"
        strokeWidth={stroke}
      />
      {usable.length > 0 ? (
        usable.map((row) => {
          const length = (row.share / 100) * circ;
          const dash = `${length} ${circ - length}`;
          const el = (
            <circle
              key={row.label}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={row.color}
              strokeWidth={stroke}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += length;
          return el;
        })
      ) : (
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${(percent / 100) * circ} ${circ}`}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export default function HealthRiskScoreCard({
  item,
  compact = false,
  kind = 'risk',
}: {
  item: HealthRiskAssessment;
  compact?: boolean;
  kind?: 'risk' | 'score' | 'age';
}) {
  const tone = severityTone(item.severity, kind);
  const percent = kind === 'age' ? ageRingPercent(item) : scoreBarPercent(item.score);
  const parts = kind === 'age' ? [] : riskContributions(item);
  const evidence = item.evidence || [];
  const chrono = evidence.find((row) =>
    /profile\.age|^age$/i.test(String(row.input || '')),
  );
  const years =
    item.score == null || Number.isNaN(Number(item.score))
      ? null
      : Number(item.score);

  return (
    <article className={`overflow-hidden rounded-2xl border border-Gray-50 bg-gradient-to-br ${tone.wash} ${compact ? 'p-3' : 'p-4'} shadow-[0_8px_24px_rgba(15,23,42,0.04)]`}>
      <div className={`flex items-center ${compact ? 'flex-col text-center gap-2' : 'gap-4'}`}>
        <div className="relative shrink-0">
          <Donut
            percent={percent}
            segments={kind === 'risk' ? parts : []}
            color={tone.ring}
          />
          <div className="absolute inset-0 flex rotate-0 flex-col items-center justify-center">
            <span className="text-[22px] font-semibold leading-none text-Text-Primary">
              {kind === 'age'
                ? years == null
                  ? '—'
                  : Math.round(years)
                : Math.round(percent)}
            </span>
            <span className="mt-0.5 text-[10px] tracking-wide text-Text-Secondary uppercase">
              {kind === 'age'
                ? 'years'
                : `% ${kind === 'score' ? 'score' : 'risk'}`}
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[15px] font-semibold text-Text-Primary">
              {item.display_name || item.risk_key}
            </h3>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tone.chip}`}
            >
              {item.severity || 'Calculated'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-Text-Secondary">
            {kind === 'age'
              ? `${formatRiskScore(item.score)} years${
                  chrono?.value != null ? ` · chrono ${chrono.value}` : ''
                } · formula screening, not a diagnosis`
              : `Score ${formatRiskScore(item.score)} · formula screening, not a diagnosis`}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EEF2F3]">
            <div
              className="h-full rounded-full"
              style={{ width: `${percent}%`, background: tone.ring }}
            />
          </div>
        </div>
      </div>

      {parts.length > 0 ? (
        <ul className="mt-4 space-y-2.5">
          {parts.map((row) => (
            <li key={row.label}>
              <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                <span className="min-w-0 truncate font-medium text-Text-Primary">
                  {row.label}
                </span>
                <span className="shrink-0 text-Text-Secondary">
                  {kind === 'score' ? `weight ${row.share}%` : `${row.share}%`}
                  {row.value != null
                    ? ` · ${row.value}${row.unit ? ` ${row.unit}` : ''}`
                    : ''}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#EEF2F3]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(row.share, 2)}%`, background: row.color }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : evidence.length > 0 ? (
        <ul className="mt-4 grid gap-1.5 text-[11px] text-Text-Secondary sm:grid-cols-2">
          {evidence.slice(0, 6).map((ev, index) => (
            <li key={`${ev.input}-${index}`}>
              {ev.input}
              {ev.value != null ? `: ${ev.value}${ev.unit ? ` ${ev.unit}` : ''}` : ''}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

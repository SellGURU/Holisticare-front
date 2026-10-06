import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  size = 72,
  stroke = 8,
}: {
  percent: number;
  segments: RiskContribution[];
  color: string;
  size?: number;
  stroke?: number;
}) {
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
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const hoverTimer = useRef<number>();
  const hasFlipTarget = parts.length > 0 || evidence.length > 0;
  const flipped = hasFlipTarget && (hovered || pinned);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [faceHeight, setFaceHeight] = useState<number>();
  const title = item.display_name || item.risk_key;
  const scoreLabel =
    kind === 'age'
      ? years == null
        ? '—'
        : String(Math.round(years))
      : String(Math.round(percent));

  useEffect(() => {
    return () => window.clearTimeout(hoverTimer.current);
  }, []);

  useLayoutEffect(() => {
    const node = flipped ? backRef.current : frontRef.current;
    if (!node) return;
    setFaceHeight(node.offsetHeight);
  }, [flipped, parts.length, evidence.length]);

  const detailsList =
    parts.length > 0 ? (
      <ul className="space-y-2">
        {parts.map((row) => (
          <li key={row.label}>
            <div className="mb-0.5 flex items-center justify-between gap-2 text-[10px]">
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
            <div className="h-1 overflow-hidden rounded-full bg-[#EEF2F3]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(row.share, 2)}%`,
                  background: row.color,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <ul className="grid gap-1 text-[10px] text-Text-Secondary">
        {evidence.slice(0, 6).map((ev, index) => (
          <li key={`${ev.input}-${index}`}>
            {ev.input}
            {ev.value != null ? `: ${ev.value}${ev.unit ? ` ${ev.unit}` : ''}` : ''}
          </li>
        ))}
      </ul>
    );

  return (
    <article
      className="[perspective:1200px]"
      onPointerEnter={(event) => {
        if (event.pointerType !== 'mouse') return;
        window.clearTimeout(hoverTimer.current);
        hoverTimer.current = window.setTimeout(() => setHovered(true), 450);
      }}
      onPointerLeave={() => {
        window.clearTimeout(hoverTimer.current);
        setHovered(false);
      }}
    >
      <div
        className={`relative overflow-hidden rounded-xl border border-Gray-50 bg-gradient-to-br ${tone.wash} shadow-[0_6px_16px_rgba(15,23,42,0.04)] transition-[height] duration-300`}
        style={faceHeight ? { height: faceHeight } : undefined}
      >
        <div
          className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${
            flipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          <div
            ref={frontRef}
            className={`${compact ? 'p-2.5' : 'p-3'} [backface-visibility:hidden]`}
          >
            <div className={`flex items-center ${compact ? 'flex-col text-center gap-2' : 'gap-3'}`}>
              <div className="relative shrink-0">
                <Donut
                  percent={percent}
                  segments={kind === 'risk' ? parts : []}
                  color={tone.ring}
                />
                <div className="absolute inset-0 flex rotate-0 flex-col items-center justify-center">
                  <span className="text-[15px] font-semibold leading-none text-Text-Primary">
                    {scoreLabel}
                  </span>
                  <span className="mt-0.5 text-[8px] tracking-wide text-Text-Secondary uppercase">
                    {kind === 'age' ? 'years' : `% ${kind === 'score' ? 'score' : 'risk'}`}
                  </span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[13px] font-semibold leading-5 text-Text-Primary">
                    {title}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${tone.chip}`}
                  >
                    {item.severity || 'Calculated'}
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] text-Text-Secondary">
                  {kind === 'age'
                    ? `${formatRiskScore(item.score)} years${
                        chrono?.value != null ? ` · chrono ${chrono.value}` : ''
                      } · screening only`
                    : `Score ${formatRiskScore(item.score)} · screening only`}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EEF2F3]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${percent}%`, background: tone.ring }}
                  />
                </div>
                {hasFlipTarget ? (
                  <button
                    type="button"
                    onClick={() => setPinned((open) => !open)}
                    aria-expanded={flipped}
                    className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-Primary-DeepTeal"
                  >
                    Show details
                    <img src="/icons/arrow-down-new.svg" alt="" className="size-3" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div
            ref={backRef}
            className={`absolute inset-x-0 top-0 ${compact ? 'p-2.5' : 'p-3'} [backface-visibility:hidden] [transform:rotateY(180deg)]`}
          >
            <div className="flex items-center gap-2 border-b border-Gray-50 pb-2">
              <div className="relative shrink-0">
                <Donut
                  percent={percent}
                  segments={kind === 'risk' ? parts : []}
                  color={tone.ring}
                  size={36}
                  stroke={4}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-semibold leading-none text-Text-Primary">
                    {scoreLabel}
                  </span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-[12px] font-semibold text-Text-Primary">
                    {title}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide ${tone.chip}`}
                  >
                    {item.severity || 'Calculated'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-2">{detailsList}</div>
            <button
              type="button"
              onClick={() => {
                setPinned(false);
                setHovered(false);
              }}
              className="mt-2 text-[10px] font-medium text-Primary-DeepTeal"
            >
              Hide details
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

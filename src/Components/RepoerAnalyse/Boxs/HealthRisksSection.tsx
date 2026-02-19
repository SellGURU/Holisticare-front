/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import HealthRiskArchitectureApi from '../../../api/HealthRiskArchitecture';
import { ChevronDown, ChevronUp, ExternalLink, ListTodo } from 'lucide-react';
import { publish } from '../../../utils/event';

interface ContributingBiomarker {
  value?: number;
  zone?: string;
}

interface RiskScoreRow {
  id: string;
  domain_name?: string;
  display_name?: string;
  icon?: string;
  category?: string;
  score?: number;
  base_score?: number;
  adjusted_score?: number;
  domain_type?: string;
  context_modifiers?: Record<string, unknown> | string;
  contributing_biomarkers?: Record<string, ContributingBiomarker> | string;
  calculation_metadata?: Record<string, unknown> | string;
}

interface HealthRisksSectionProps {
  patientsId: number | null;
  reportId?: number | null;
}

function parseContributing(
  b: Record<string, ContributingBiomarker> | string | undefined,
): Record<string, ContributingBiomarker> {
  if (!b) return {};
  if (typeof b === 'string') {
    try {
      return JSON.parse(b) as Record<string, ContributingBiomarker>;
    } catch {
      return {};
    }
  }
  return b;
}

function parseContext(
  c: Record<string, unknown> | string | undefined,
): Record<string, unknown> {
  if (!c) return {};
  if (typeof c === 'string') {
    try {
      return JSON.parse(c) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return c;
}

export default function HealthRisksSection({
  patientsId,
  reportId,
}: HealthRisksSectionProps) {
  const [scores, setScores] = useState<RiskScoreRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [sectionCollapsed, setSectionCollapsed] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    if (patientsId != null) {
      HealthRiskArchitectureApi.getRiskScores(patientsId, reportId ?? undefined)
        .then((res) => setScores(Array.isArray(res.data) ? res.data : []))
        .catch(() => setScores([]))
        .finally(() => setLoading(false));
    } else {
      HealthRiskArchitectureApi.getRiskScoresPreview()
        .then((res) => setScores(Array.isArray(res.data) ? res.data : []))
        .catch(() => setScores([]))
        .finally(() => setLoading(false));
    }
  }, [patientsId, reportId]);

  const sorted = [...scores].sort(
    (a, b) => (Number(b.score) ?? 0) - (Number(a.score) ?? 0),
  );
  const top3 = sorted.slice(0, 3);
  const lowerPriority = sorted.slice(3);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const scrollToDetailedAnalysis = () => {
    const el =
      document.getElementById('Detailed Analysis') ||
      document.querySelector('[id*="Detailed"]');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddToActionPlan = (row: RiskScoreRow) => {
    publish('addToActionPlan', {
      domainId: row.id,
      domainName: row.display_name || row.domain_name,
    });
  };

  if (loading || scores.length === 0) return null;

  return (
    <div className="my-8">
      <div
        className="border border-Gray-50 rounded-lg bg-white overflow-hidden"
        style={{ borderCollapse: 'separate' }}
      >
        {/* SECTION A: Health Risks - Collapsible header (Spec 7.2.1) */}
        <button
          type="button"
          onClick={() => setSectionCollapsed((c) => !c)}
          className="w-full flex items-center justify-between px-4 py-3 text-left bg-Gray-50/50 hover:bg-Gray-50/70 transition-colors"
        >
          <span
            id="Health Risks"
            className="sectionScrollEl text-Text-Primary TextStyle-Headline-4"
          >
            SECTION A: Health Risks
          </span>
          <span className="text-Text-Secondary text-sm">
            {sectionCollapsed ? (
              <ChevronDown className="w-5 h-5 inline" />
            ) : (
              <ChevronUp className="w-5 h-5 inline" />
            )}
          </span>
        </button>

        {!sectionCollapsed && (
          <div className="px-4 pb-4 space-y-4">
            {/* Priority Actions - Top 3 (Spec 7.2.1) */}
            {top3.length > 0 && (
              <>
                <div className="text-Text-Secondary text-sm font-medium pt-2">
                  Priority Actions – Top 3 Risks Require Attention:
                </div>
                <div className="space-y-3">
                  {top3.map((row, idx) => {
                    const contributing = parseContributing(
                      row.contributing_biomarkers,
                    );
                    const contextMods = parseContext(row.context_modifiers);
                    const drivers = Object.entries(contributing).map(
                      ([name, v]) => ({
                        name,
                        value: v?.value,
                        zone: v?.zone,
                      }),
                    );
                    return (
                      <div
                        key={row.id}
                        className="border border-Gray-50 rounded-lg p-4 bg-white"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl" role="img" aria-hidden>
                            {row.icon || '📊'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-Text-Primary">
                              {idx + 1}.{' '}
                              {row.display_name || row.domain_name || 'Domain'}
                            </div>
                            <div className="text-sm text-Gray-60 mt-1">
                              Score:{' '}
                              {row.score != null
                                ? Number(row.score).toFixed(1)
                                : '—'}{' '}
                              / 100 – {row.category}
                            </div>
                            {drivers.length > 0 && (
                              <div className="mt-2 text-xs text-Text-Secondary">
                                <span className="font-medium">
                                  Primary Drivers:
                                </span>
                                <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                                  {drivers.map((d) => (
                                    <li key={d.name}>
                                      {d.name}:{' '}
                                      {d.value != null ? Number(d.value) : '—'}{' '}
                                      ({d.zone || '—'})
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {Object.keys(contextMods).length > 0 && (
                              <div className="mt-2 text-xs text-Text-Secondary">
                                <span className="font-medium">
                                  Clinical Context:
                                </span>
                                <pre className="mt-0.5 whitespace-pre-wrap">
                                  {JSON.stringify(contextMods, null, 0)}
                                </pre>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={scrollToDetailedAnalysis}
                              className="mt-2 flex items-center gap-1 text-xs font-medium text-Primary-DeepTeal hover:underline"
                            >
                              View Detailed Analysis{' '}
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Lower Priority Risks (Monitoring) with Expand (Spec 7.2.1 + 7.2.2) */}
            {lowerPriority.length > 0 && (
              <>
                <div className="text-Text-Secondary text-sm font-medium pt-2">
                  Lower Priority Risks (Monitoring):
                </div>
                <div className="space-y-2">
                  {lowerPriority.map((row) => {
                    const contributing = parseContributing(
                      row.contributing_biomarkers,
                    );
                    const drivers = Object.keys(contributing);
                    const isExpanded = expandedIds.has(row.id);
                    return (
                      <div
                        key={row.id}
                        className="border border-Gray-50 rounded-lg bg-white overflow-hidden"
                      >
                        <div className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xl" role="img" aria-hidden>
                              {row.icon || '📊'}
                            </span>
                            <div>
                              <div className="font-medium text-Text-Primary text-sm truncate">
                                {row.display_name ||
                                  row.domain_name ||
                                  'Domain'}
                              </div>
                              <div className="text-xs text-Gray-60">
                                {row.score != null
                                  ? Number(row.score).toFixed(1)
                                  : '—'}{' '}
                                / 100 – {row.category}
                                {drivers.length > 0 &&
                                  ` · Driven by: ${drivers.slice(0, 4).join(', ')}${drivers.length > 4 ? '…' : ''}`}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleExpand(row.id)}
                            className="text-xs text-Primary-DeepTeal hover:underline flex items-center gap-0.5 shrink-0 ml-2"
                          >
                            {isExpanded ? 'Collapse' : 'Expand'}{' '}
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {isExpanded && (
                          <div className="border-t border-Gray-50 px-4 py-3 bg-Gray-50/30 text-sm">
                            <div className="font-medium text-Text-Primary mb-2">
                              Risk Breakdown
                            </div>
                            <div className="text-Text-Secondary mb-2">
                              Contributing Factors:
                            </div>
                            <ul className="list-disc list-inside space-y-0.5 text-xs mb-3">
                              {Object.entries(contributing).map(([name, v]) => (
                                <li key={name}>
                                  {name}:{' '}
                                  {v?.value != null ? Number(v.value) : '—'} (
                                  {v?.zone || '—'})
                                </li>
                              ))}
                            </ul>
                            <div className="text-Text-Secondary mb-2">
                              Overall Score:{' '}
                              {row.score != null
                                ? Number(row.score).toFixed(1)
                                : '—'}{' '}
                              / 100 ({row.category})
                            </div>
                            <div className="text-Text-Secondary mb-2">
                              Priority Actions:
                            </div>
                            <ul className="list-disc list-inside text-xs mb-3">
                              <li>
                                Review contributing biomarkers and consider
                                lifestyle or clinical intervention as needed.
                              </li>
                            </ul>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={scrollToDetailedAnalysis}
                                className="text-xs font-medium text-Primary-DeepTeal hover:underline flex items-center gap-1"
                              >
                                View Full Detailed Analysis
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddToActionPlan(row)}
                                className="text-xs font-medium text-Primary-DeepTeal hover:underline flex items-center gap-1"
                              >
                                <ListTodo className="w-3.5 h-3.5" /> Add to
                                Action Plan
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

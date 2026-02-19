/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import HealthRiskArchitectureApi from '../../api/HealthRiskArchitecture';
import { format } from 'date-fns';

interface RiskScoreRow {
  id: string;
  domain_name?: string;
  display_name?: string;
  icon?: string;
  category?: string;
  score?: number;
  calculated_at?: string;
  domain_type?: string;
}

interface ParametricScoreProgressionProps {
  memberId: number | null;
}

export default function ParametricScoreProgression({
  memberId,
}: ParametricScoreProgressionProps) {
  const [scores, setScores] = useState<RiskScoreRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (memberId == null) {
      setScores([]);
      return;
    }
    setLoading(true);
    HealthRiskArchitectureApi.getRiskScoresByMember(memberId)
      .then((res) => setScores(Array.isArray(res.data) ? res.data : []))
      .catch(() => setScores([]))
      .finally(() => setLoading(false));
  }, [memberId]);

  const byDomain = scores.reduce<Record<string, RiskScoreRow[]>>(
    (acc, row) => {
      const name = row.display_name || row.domain_name || 'Unknown';
      if (!acc[name]) acc[name] = [];
      acc[name].push(row);
      return acc;
    },
    {},
  );

  const domainNames = Object.keys(byDomain).sort();

  if (loading) {
    return (
      <div
        id="Health Parametric Progression"
        className="ProgresssectionScrollEl border border-Gray-50 rounded-xl bg-white p-6 mt-6"
      >
        <h2 className="TextStyle-Headline-5 text-Text-Primary mb-4">
          Health Parametric Score Progression
        </h2>
        <div className="text-Text-Secondary text-sm">Loading…</div>
      </div>
    );
  }

  if (domainNames.length === 0) {
    return null;
  }

  return (
    <div
      id="Health Parametric Progression"
      className="ProgresssectionScrollEl border border-Gray-50 rounded-xl bg-white p-6 mt-6"
    >
      <h2 className="TextStyle-Headline-5 text-Text-Primary mb-2">
        Health Parametric Score Progression
      </h2>
      <p className="text-Text-Secondary text-xs mb-4">
        Longitudinal view of risk, aging, and health scores over time.
      </p>
      <div className="space-y-6">
        {domainNames.map((domainName) => {
          const rows = byDomain[domainName];
          const sorted = [...rows].sort(
            (a, b) =>
              new Date(b.calculated_at || 0).getTime() -
              new Date(a.calculated_at || 0).getTime(),
          );
          const icon = rows[0]?.icon;
          return (
            <div
              key={domainName}
              className="border border-Gray-50 rounded-lg overflow-hidden"
            >
              <div className="bg-Gray-50/50 px-3 py-2 flex items-center gap-2">
                {icon && (
                  <span className="text-lg" role="img" aria-hidden>
                    {icon}
                  </span>
                )}
                <span className="text-sm font-medium text-Text-Primary">
                  {domainName}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-Gray-50 text-Text-Secondary">
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Score</th>
                      <th className="py-2 px-3">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.slice(0, 10).map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-Gray-50/50 hover:bg-Gray-50/30"
                      >
                        <td className="py-2 px-3 text-Text-Primary">
                          {row.calculated_at
                            ? format(
                                new Date(row.calculated_at),
                                'MMM d, yyyy',
                              )
                            : '—'}
                        </td>
                        <td className="py-2 px-3 text-Text-Primary">
                          {row.score != null
                            ? Number(row.score).toFixed(1)
                            : '—'}
                        </td>
                        <td className="py-2 px-3 text-Text-Secondary">
                          {row.category || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {sorted.length > 10 && (
                <div className="text-[10px] text-Text-Quadruple px-3 py-1">
                  Showing latest 10 of {sorted.length} records
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

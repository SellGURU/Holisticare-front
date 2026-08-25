import HealthRiskScoreCard from './HealthRiskScoreCard';
import {
  useHealthRiskAssessments,
  type HealthRiskAssessment,
} from './healthRiskAssessments';

interface HealthRisksPanelProps {
  memberId: number | null;
  enabled?: boolean;
}

function severityClass(severity: string | null | undefined, status: string | undefined) {
  if (status === 'insufficient_data') {
    return 'border-amber-200 bg-amber-50 text-amber-900';
  }
  const key = String(severity || '').toLowerCase();
  if (key.includes('high') || key.includes('critical') || key.includes('severe')) {
    return 'border-red-200 bg-red-50 text-red-800';
  }
  if (key.includes('moderat') || key.includes('medium')) {
    return 'border-orange-200 bg-orange-50 text-orange-900';
  }
  if (key.includes('low') || key.includes('optimal') || key.includes('none')) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  }
  return 'border-gray-200 bg-white text-gray-800';
}

export default function HealthRisksPanel({
  memberId,
  enabled = true,
}: HealthRisksPanelProps) {
  const { loading, error, assessments } = useHealthRiskAssessments(
    memberId,
    enabled,
  );

  if (!enabled) return null;

  return (
    <section className="my-16" aria-labelledby="health-risks-heading">
      <div
        id="Health Risks"
        className="sectionScrollEl TextStyle-Headline-4 text-Text-Primary"
      >
        <h2 id="health-risks-heading" className="text-inherit font-inherit">
          Health Risks
        </h2>
      </div>
      <p className="mt-1 text-[12px] text-Text-Secondary">
        Risk assessment / screening signal for practitioner review. This is not
        a diagnosis.
      </p>

      {loading ? (
        <div
          className="mt-4 h-24 animate-pulse rounded-xl border border-gray-200 bg-gray-50"
          aria-busy="true"
          aria-label="Loading health risk assessments"
        />
      ) : error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          Health risk assessments could not be loaded.
        </p>
      ) : assessments.length === 0 ? (
        <p className="mt-4 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px] text-gray-600">
          No calculated risk snapshot yet. Save lab values that match the
          clinic formula, then refresh. Missing data is not the same as no
          risk.
        </p>
      ) : (
        <ul className="mt-4 grid gap-4 xl:grid-cols-2">
          {assessments.map((item: HealthRiskAssessment) => {
            const incomplete = item.assessment_status === 'insufficient_data';
            return (
              <li key={`${item.risk_key}-${item.calculated_at}`}>
                {incomplete ? (
                  <div
                    className={`rounded-2xl border px-4 py-3 ${severityClass(item.severity, item.assessment_status)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[14px] font-semibold">
                        {item.display_name || item.risk_key}
                      </p>
                      <span className="text-[11px] font-medium uppercase tracking-wide">
                        Incomplete
                      </span>
                    </div>
                    <p className="mt-2 text-[12px]">
                      Assessment incomplete
                      {item.missing_inputs?.length
                        ? `: missing ${item.missing_inputs
                            .map((row) => row.token)
                            .filter(Boolean)
                            .join(', ')}`
                        : '.'}{' '}
                      Missing data is not the same as low or no risk.
                    </p>
                  </div>
                ) : (
                  <HealthRiskScoreCard item={item} />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

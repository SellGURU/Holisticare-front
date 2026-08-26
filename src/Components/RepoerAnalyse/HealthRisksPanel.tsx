import { useEffect } from 'react';
import { publish } from '../../utils/event';
import HealthRiskScoreCard from './HealthRiskScoreCard';
import {
  presentAges,
  presentRisks,
  presentScores,
  RISKS_SCORES_AGE_SECTION,
  shouldShowReportGroup,
  useHealthRiskAssessments,
  type HealthRiskAssessment,
} from './healthRiskAssessments';

interface HealthRisksPanelProps {
  memberId: number | null;
  enabled?: boolean;
}

function ModelGroup({
  title,
  blurb,
  empty,
  error,
  items,
  kind,
  show,
}: {
  title: string;
  blurb: string;
  empty: string;
  error: boolean;
  items: HealthRiskAssessment[];
  kind: 'risk' | 'score' | 'age';
  show: boolean;
}) {
  if (!show) return null;

  return (
    <div className="mt-8 first:mt-4">
      <h3 className="TextStyle-Headline-5 text-Text-Primary">{title}</h3>
      <p className="mt-1 text-[12px] text-Text-Secondary">{blurb}</p>
      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {title} could not be loaded.
        </p>
      ) : items.length === 0 ? (
        <p className="mt-4 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px] text-gray-600">
          {empty}
        </p>
      ) : (
        <ul className="mt-4 grid gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <li key={`${item.risk_key}-${item.calculated_at}`}>
              <HealthRiskScoreCard
                item={item}
                kind={kind}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function HealthRisksPanel({
  memberId,
  enabled = true,
}: HealthRisksPanelProps) {
  const { loading, error, assessments, activeTypes } = useHealthRiskAssessments(
    memberId,
    enabled,
  );

  const risks = presentRisks(assessments);
  const scores = presentScores(assessments);
  const ages = presentAges(assessments);
  const showRisks = shouldShowReportGroup(activeTypes, 'RISK', risks.length > 0);
  const showScores = shouldShowReportGroup(
    activeTypes,
    'SCORING',
    scores.length > 0,
  );
  const showAges = shouldShowReportGroup(activeTypes, 'AGING', ages.length > 0);
  const hasVisibleGroup = showRisks || showScores || showAges;

  useEffect(() => {
    if (!enabled) {
      publish('RisksScoresAgeStatus', { isempty: true });
      return;
    }
    if (loading) {
      publish('RisksScoresAgeStatus', { isempty: true });
      return;
    }
    publish('RisksScoresAgeStatus', { isempty: !hasVisibleGroup });
  }, [enabled, loading, hasVisibleGroup]);

  if (!enabled) return null;
  if (loading || !hasVisibleGroup) return null;

  return (
    <section className="my-16" aria-labelledby="risks-scores-age-heading">
      <div
        id={RISKS_SCORES_AGE_SECTION}
        className="sectionScrollEl TextStyle-Headline-4 text-Text-Primary"
      >
        <h2
          id="risks-scores-age-heading"
          className="text-inherit font-inherit"
        >
          {RISKS_SCORES_AGE_SECTION}
        </h2>
      </div>
      <p className="mt-1 text-[12px] text-Text-Secondary">
        Screening signal for practitioner review. This is not a diagnosis.
      </p>

      <ModelGroup
        title="Health Risks"
        blurb="Risk assessment from clinic formulas. Missing data is not the same as no risk."
        empty="No calculated risk snapshot yet. Save lab values that match the clinic formula, then refresh."
        error={error}
        items={risks}
        kind="risk"
        show={showRisks}
      />
      <ModelGroup
        title="Health Scores"
        blurb="Composite health index. Low scores need attention. Incomplete formulas are omitted."
        empty="No health score can be calculated from this patient's current labs. Missing data is not a low score."
        error={error}
        items={scores}
        kind="score"
        show={showScores}
      />
      <ModelGroup
        title="Age"
        blurb="Biological age clocks from clinic formulas."
        empty="No age clock can be calculated from this patient's current labs. Missing data is not a young or old result."
        error={error}
        items={ages}
        kind="age"
        show={showAges}
      />
    </section>
  );
}

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { publish } from '../../utils/event';
import HealthRiskScoreCard from './HealthRiskScoreCard';
import {
  presentAges,
  presentRisks,
  presentScores,
  RISKS_SCORES_AGE_SECTION,
  shouldHideHealthRisksSection,
  shouldShowReportGroup,
  useHealthRiskAssessments,
  type HealthRiskAssessment,
} from './healthRiskAssessments';
import { uiText } from '../../i18n/uiText';

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
      {error && items.length === 0 ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {title} could not be loaded.
        </p>
      ) : items.length === 0 ? (
        <p className="mt-4 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px] text-gray-600">
          {empty}
        </p>
      ) : (
        <ul className="mt-3 grid grid-cols-1 items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li key={`${item.risk_key}-${item.calculated_at}`}>
              <HealthRiskScoreCard item={item} kind={kind} />
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
  const { t } = useTranslation('upload');
  const { loading, error, assessments, activeTypes } = useHealthRiskAssessments(
    memberId,
    enabled,
  );

  const risks = presentRisks(assessments);
  const scores = presentScores(assessments);
  const ages = presentAges(assessments);
  const showRisks = shouldShowReportGroup(activeTypes, 'RISK');
  const showScores = shouldShowReportGroup(activeTypes, 'SCORING');
  const showAges = shouldShowReportGroup(activeTypes, 'AGING');
  const hasActiveType = Boolean(activeTypes?.length);

  useEffect(() => {
    if (!enabled) {
      publish('RisksScoresAgeStatus', { isempty: true });
      return;
    }
    if (loading || activeTypes == null) {
      return;
    }
    publish('RisksScoresAgeStatus', { isempty: !hasActiveType });
  }, [enabled, loading, activeTypes, hasActiveType]);

  if (!enabled) return null;
  const hasVisibleData = assessments.length > 0;
  if (
    shouldHideHealthRisksSection({
      hasVisibleData,
      loading,
      hasActiveType,
    })
  ) {
    return null;
  }

  return (
    <section className="my-16" aria-labelledby="risks-scores-age-heading">
      <div
        id={RISKS_SCORES_AGE_SECTION}
        className="sectionScrollEl TextStyle-Headline-4 text-Text-Primary"
      >
        <h2 id="risks-scores-age-heading" className="text-inherit font-inherit">
          {RISKS_SCORES_AGE_SECTION}
        </h2>
      </div>
      <p className="mt-1 text-[12px] text-Text-Secondary">
        {uiText(
          'Screening signal for practitioner review. This is not a diagnosis.',
        )}
      </p>

      <ModelGroup
        title={String(uiText('Health Risks'))}
        blurb={t('healthRisksBlurb')}
        empty={t('healthRisksEmpty')}
        error={error}
        items={risks}
        kind="risk"
        show={showRisks}
      />
      <ModelGroup
        title={String(uiText('Health Scores'))}
        blurb={t('healthScoreBlurb')}
        empty={t('healthScoreEmpty')}
        error={error}
        items={scores}
        kind="score"
        show={showScores}
      />
      <ModelGroup
        title={String(uiText('Age'))}
        blurb={t('ageClockBlurb')}
        empty={t('ageClockEmpty')}
        error={error}
        items={ages}
        kind="age"
        show={showAges}
      />
    </section>
  );
}

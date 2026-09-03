import { useEffect, useRef, useState } from 'react';
import HealthRiskArchitectureApi from '../../api/HealthRiskArchitecture';
import { subscribe, unsubscribe } from '../../utils/event';

export interface HealthRiskAssessment {
  risk_key?: string;
  display_name?: string;
  severity?: string | null;
  priority?: string | null;
  score?: number | null;
  assessment_status?: string;
  domain_type?: string;
  evidence?: Array<{
    input?: string;
    value?: number | string | null;
    unit?: string | null;
    status?: string;
    weight?: number;
    component?: number;
    contribution?: number;
    share_percent?: number;
  }>;
  missing_inputs?: Array<{ token?: string; reason?: string }>;
  source_as_of?: string | null;
  calculated_at?: string | null;
}

export function isCalculatedRisk(item: HealthRiskAssessment): boolean {
  return item.assessment_status === 'calculated' && item.score != null;
}

export const RISKS_SCORES_AGE_SECTION = 'Risks, Scores & Age';

export const RISKS_SCORES_AGE_ALIASES: Record<string, string> = {
  'Health Risks': RISKS_SCORES_AGE_SECTION,
  'Health Scores': RISKS_SCORES_AGE_SECTION,
};

export type ReportDomainType = 'RISK' | 'SCORING' | 'AGING';

export function shouldShowReportGroup(
  activeTypes: string[] | null,
  type: ReportDomainType,
): boolean {
  if (activeTypes == null) return false;
  return activeTypes.map((item) => item.toUpperCase()).includes(type);
}

export function resolveReportActiveTypes(
  snapshotTypes: string[] | null,
  fallbackTypes: string[] | null = null,
): string[] {
  const normalize = (items: string[]) =>
    [...new Set(items.map((item) => item.toUpperCase()).filter(Boolean))];
  if (snapshotTypes != null) return normalize(snapshotTypes);
  if (fallbackTypes != null) return normalize(fallbackTypes);
  return [];
}

export function assessmentsForActiveTypes(
  rows: HealthRiskAssessment[],
  activeTypes: string[],
): HealthRiskAssessment[] {
  if (!activeTypes.length) return [];
  const types = new Set(activeTypes.map((item) => item.toUpperCase()));
  return rows.filter((row) =>
    types.has(String(row.domain_type || 'RISK').toUpperCase()),
  );
}

export function resolveReportSection(name: string): string {
  return RISKS_SCORES_AGE_ALIASES[name] || name;
}

export function isScoreModel(item: HealthRiskAssessment): boolean {
  return String(item.domain_type || 'RISK').toUpperCase() === 'SCORING';
}

export function isAgeModel(item: HealthRiskAssessment): boolean {
  return String(item.domain_type || '').toUpperCase() === 'AGING';
}

export function presentRisks(
  assessments: HealthRiskAssessment[],
): HealthRiskAssessment[] {
  return assessments.filter(
    (item) =>
      isCalculatedRisk(item) && !isScoreModel(item) && !isAgeModel(item),
  );
}

export function presentScores(
  assessments: HealthRiskAssessment[],
): HealthRiskAssessment[] {
  return assessments.filter(
    (item) =>
      isCalculatedRisk(item) &&
      isScoreModel(item) &&
      Number(item.score) > 0,
  );
}

export function presentAges(
  assessments: HealthRiskAssessment[],
): HealthRiskAssessment[] {
  return assessments.filter(
    (item) => isCalculatedRisk(item) && isAgeModel(item),
  );
}

export const FORMULA_ISSUE_MARK =
  'Formula screening, not a diagnosis.';

export function scorePercentValue(
  score: number | null | undefined,
): number | null {
  if (score == null || Number.isNaN(score)) return null;
  return score > 1 ? score : score * 100;
}

export function isElevatedRisk(item: HealthRiskAssessment): boolean {
  if (!isCalculatedRisk(item)) return false;
  const severity = String(item.severity || '').toLowerCase();
  if (
    /high|moderat|severe|critical|urgent/.test(severity)
  ) {
    return true;
  }
  if (/low|optimal|none|minimal|normal/.test(severity)) {
    return false;
  }
  const percent = scorePercentValue(item.score);
  return percent != null && percent >= 20;
}

export function isLowHealthScore(item: HealthRiskAssessment): boolean {
  if (!isCalculatedRisk(item) || !isScoreModel(item)) return false;
  const severity = String(item.severity || '').toLowerCase();
  if (/poor|low|need|deficit|critical|severe/.test(severity)) {
    if (/high|optimal|excellent|good/.test(severity)) {
      return /low|poor/.test(severity);
    }
    return true;
  }
  if (/high|optimal|excellent|good|normal/.test(severity)) return false;
  const percent = scorePercentValue(item.score);
  return percent != null && percent < 50;
}

export function isAcceleratedAge(item: HealthRiskAssessment): boolean {
  if (!isCalculatedRisk(item) || !isAgeModel(item)) return false;
  const severity = String(item.severity || '').toLowerCase();
  return /older|accelerat|high|poor/.test(severity);
}

export function planAffectingRisks(
  assessments: HealthRiskAssessment[],
): HealthRiskAssessment[] {
  return assessments.filter((item) => {
    if (isScoreModel(item)) return isLowHealthScore(item);
    if (isAgeModel(item)) return isAcceleratedAge(item);
    return isElevatedRisk(item);
  });
}

export function formulaIssueBody(item: HealthRiskAssessment): string {
  const name = String(item.display_name || item.risk_key || 'Clinic risk').trim();
  const severity = String(item.severity || 'Calculated').trim();
  if (isAgeModel(item)) {
    const years = item.score;
    const ageText =
      years == null || Number.isNaN(Number(years))
        ? '—'
        : Number.isInteger(years) || Math.abs(Number(years) - Math.round(Number(years))) < 0.05
          ? String(Math.round(Number(years)))
          : Number(years).toFixed(2);
    return `${name} — ${severity} (age ${ageText}). ${FORMULA_ISSUE_MARK}`;
  }
  const percent = scorePercentValue(item.score);
  const scoreText =
    percent == null
      ? '—'
      : Number.isInteger(percent) || Math.abs(percent - Math.round(percent)) < 0.05
        ? String(Math.round(percent))
        : percent.toFixed(2);
  return `${name} — ${severity} (score ${scoreText}). ${FORMULA_ISSUE_MARK}`;
}

export function isFormulaRiskIssue(text: string | undefined): boolean {
  return String(text || '')
    .toLowerCase()
    .includes(FORMULA_ISSUE_MARK.toLowerCase());
}

function riskMatchTokens(item: HealthRiskAssessment): string[] {
  const blob = `${item.display_name || ''} ${item.risk_key || ''}`;
  return blob
    .toLowerCase()
    .replace(/_/g, ' ')
    .match(/[a-z0-9]+/g)
    ?.filter(
      (word) =>
        word.length >= 4 &&
        !/\d/.test(word) &&
        !['risk', 'assessment', 'score', 'health', 'the', 'of', 'and'].includes(
          word,
        ),
    ) ?? [];
}

function issueMatchesDefinedRisk(text: string, tokens: string[]): boolean {
  if (!tokens.length) return false;
  const hay = text.toLowerCase();
  if (tokens.every((token) => hay.includes(token))) return true;
  return tokens.some((token) => token.length >= 8 && hay.includes(token));
}

export function mergeFormulaRisksIntoType2(
  type2: {
    'Key areas to address': Record<string, string[]>;
    category_labels?: Record<string, string>;
  },
  assessments: HealthRiskAssessment[],
): {
  'Key areas to address': Record<string, string[]>;
  category_labels?: Record<string, string>;
} {
  const categories = [
    'critical_urgent',
    'important_strategic',
    'important_long_term',
    'optional_enhancements',
  ] as const;
  const tokenSets = assessments.map(riskMatchTokens);
  const kept: Record<string, string[]> = {
    critical_urgent: [],
    important_strategic: [],
    important_long_term: [],
    optional_enhancements: [],
  };
  const keyAreas = type2['Key areas to address'] || {};
  for (const cat of categories) {
    for (const item of keyAreas[cat] || []) {
      const raw = String(item).replace(/^Issue\s+\d+:\s*/i, '').trim();
      if (!raw || isFormulaRiskIssue(raw)) continue;
      if (tokenSets.some((tokens) => issueMatchesDefinedRisk(raw, tokens))) {
        continue;
      }
      kept[cat].push(raw);
    }
  }

  const formulaRows: Array<{ cat: string; body: string }> = [];
  const seen = new Set<string>();
  for (const item of planAffectingRisks(assessments)) {
    const body = formulaIssueBody(item);
    if (seen.has(body)) continue;
    seen.add(body);
    const severity = String(item.severity || '').toLowerCase();
    let cat = 'important_long_term';
    if (isScoreModel(item)) {
      const percent = scorePercentValue(item.score);
      cat =
        /poor|critical|severe/.test(severity) ||
        (percent != null && percent < 20)
          ? 'critical_urgent'
          : 'important_strategic';
    } else {
      cat = /high|severe|critical|urgent/.test(severity)
        ? 'critical_urgent'
        : /moderat|medium/.test(severity)
          ? 'important_strategic'
          : 'important_long_term';
    }
    formulaRows.push({ cat, body });
  }

  const numbered: Record<string, string[]> = {
    critical_urgent: [],
    important_strategic: [],
    important_long_term: [],
    optional_enhancements: [],
  };
  let issueNum = 1;
  for (const row of formulaRows) {
    numbered[row.cat].push(`Issue ${issueNum}: ${row.body}`);
    issueNum += 1;
  }
  for (const cat of categories) {
    for (const body of kept[cat]) {
      numbered[cat].push(`Issue ${issueNum}: ${body}`);
      issueNum += 1;
    }
  }
  return {
    category_labels: type2.category_labels,
    'Key areas to address': numbered,
  };
}

export function formatRiskScore(score: number | null | undefined): string {
  if (score == null || Number.isNaN(score)) return '—';
  return Number.isInteger(score) ? String(score) : score.toFixed(2);
}

/** Bar fill for 0–1 formulas or 0–100 bands. */
export function scoreBarPercent(score: number | null | undefined): number {
  if (score == null || Number.isNaN(score)) return 0;
  const raw = score > 1 ? score : score * 100;
  return Math.max(0, Math.min(100, raw));
}

export const RISK_SEGMENT_COLORS = [
  '#0F766E',
  '#F59E0B',
  '#EF4444',
  '#6366F1',
  '#10B981',
  '#F97316',
  '#0EA5E9',
  '#A855F7',
];

export interface RiskContribution {
  label: string;
  value: number | string | null;
  unit?: string | null;
  points: number;
  share: number;
  color: string;
}

export function riskContributions(
  item: HealthRiskAssessment,
): RiskContribution[] {
  const rows = item.evidence || [];
  const withShare = rows.filter(
    (row) => row.contribution != null || row.share_percent != null,
  );
  if (withShare.length === 0) return [];
  const seen = new Set<string>();
  const unique = withShare.filter((row) => {
    const key = String(row.input || 'Input');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const total = unique.reduce(
    (sum, row) => sum + Number(row.contribution || 0),
    0,
  );
  return unique.map((row, index) => {
    const points = Number(row.contribution || 0);
    return {
      label: String(row.input || 'Input'),
      value: row.value ?? null,
      unit: row.unit,
      points,
      share: total ? Math.round((1000 * points) / total) / 10 : 0,
      color: RISK_SEGMENT_COLORS[index % RISK_SEGMENT_COLORS.length],
    };
  });
}

export function shouldHideHealthRisksSection({
  hasVisibleData,
  loading,
  hasActiveType,
}: {
  hasVisibleData: boolean;
  loading: boolean;
  hasActiveType: boolean;
}): boolean {
  return !hasVisibleData && (loading || !hasActiveType);
}

export function useHealthRiskAssessments(
  memberId: number | null,
  enabled = true,
) {
  const [loading, setLoading] = useState(Boolean(enabled && memberId != null));
  const [error, setError] = useState(false);
  const [assessments, setAssessments] = useState<HealthRiskAssessment[]>([]);
  const [activeTypes, setActiveTypes] = useState<string[] | null>(null);
  const [snapshotTick, setSnapshotTick] = useState(0);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    hasLoadedRef.current = false;
    setActiveTypes(null);
    setAssessments([]);
  }, [memberId]);

  useEffect(() => {
    if (!enabled) return undefined;
    const onScoringComplete = (event?: Event) => {
      const detail = (event as CustomEvent)?.detail ?? {};
      if (detail.silent === true) return;
      if (
        detail.member_id != null &&
        memberId != null &&
        Number(detail.member_id) !== Number(memberId)
      ) {
        return;
      }
      if (detail.domain && detail.domain !== 'risk_assessments') return;
      setSnapshotTick((tick) => tick + 1);
    };
    const onCompileReload = (event?: Event) => {
      const detail = (event as CustomEvent)?.detail ?? {};
      if (detail.silent === true) return;
      if (detail.fullReload !== true) return;
      onScoringComplete(event);
    };
    subscribe('processingDomainReady', onScoringComplete);
    subscribe('labReportDeleted', onScoringComplete);
    subscribe('syncReport', onCompileReload);
    return () => {
      unsubscribe('processingDomainReady', onScoringComplete);
      unsubscribe('labReportDeleted', onScoringComplete);
      unsubscribe('syncReport', onCompileReload);
    };
  }, [enabled, memberId]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    if (memberId == null) {
      setLoading(true);
      return;
    }
    let cancelled = false;
    if (!hasLoadedRef.current) setLoading(true);
    setError(false);
    getCurrentSnapshot(memberId, snapshotTick)
      .then((snapshot) => {
        if (cancelled) return;
        hasLoadedRef.current = true;
        setAssessments(snapshot.assessments);
        setActiveTypes(snapshot.activeTypes);
      })
      .catch(() => {
        if (!cancelled) {
          if (!hasLoadedRef.current) {
            setAssessments([]);
            setActiveTypes([]);
          }
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, memberId, snapshotTick]);

  return { loading, error, assessments, activeTypes };
}

interface HealthRiskSnapshot {
  assessments: HealthRiskAssessment[];
  activeTypes: string[];
}

const inFlightGets = new Map<string, Promise<HealthRiskSnapshot>>();

function getCurrentSnapshot(
  memberId: number,
  requestKey = 0,
): Promise<HealthRiskSnapshot> {
  const cacheKey = `${memberId}:${requestKey}`;
  const existing = inFlightGets.get(cacheKey);
  if (existing) return existing;
  const request = HealthRiskArchitectureApi.getCurrentAssessments(memberId)
    .then((res) => {
      const rows = Array.isArray(res.data?.assessments)
        ? (res.data.assessments as HealthRiskAssessment[])
        : [];
      const snapshotTypes = Array.isArray(res.data?.active_types)
        ? (res.data.active_types as unknown[]).map((item) =>
            String(item).toUpperCase(),
          )
        : null;
      const activeTypes = resolveReportActiveTypes(
        snapshotTypes,
        rows.map((row) => String(row.domain_type || 'RISK')),
      );
      return {
        assessments:
          snapshotTypes != null
            ? assessmentsForActiveTypes(rows, activeTypes)
            : rows,
        activeTypes,
      };
    })
    .finally(() => {
      inFlightGets.delete(cacheKey);
    });
  inFlightGets.set(cacheKey, request);
  return request;
}

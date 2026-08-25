import { useEffect, useState } from 'react';
import HealthRiskArchitectureApi from '../../api/HealthRiskArchitecture';

export interface HealthRiskAssessment {
  risk_key?: string;
  display_name?: string;
  severity?: string | null;
  priority?: string | null;
  score?: number | null;
  assessment_status?: string;
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

export function presentRisks(
  assessments: HealthRiskAssessment[],
): HealthRiskAssessment[] {
  return assessments.filter(isCalculatedRisk);
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

export function planAffectingRisks(
  assessments: HealthRiskAssessment[],
): HealthRiskAssessment[] {
  return assessments.filter(isElevatedRisk);
}

export function formulaIssueBody(item: HealthRiskAssessment): string {
  const name = String(item.display_name || item.risk_key || 'Clinic risk').trim();
  const severity = String(item.severity || 'Calculated').trim();
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
    const cat = /high|severe|critical|urgent/.test(severity)
      ? 'critical_urgent'
      : /moderat|medium/.test(severity)
        ? 'important_strategic'
        : 'important_long_term';
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
  const total = withShare.reduce(
    (sum, row) => sum + Number(row.contribution || 0),
    0,
  );
  return withShare.map((row, index) => {
    const points = Number(row.contribution || 0);
    return {
      label: String(row.input || 'Input'),
      value: row.value ?? null,
      unit: row.unit,
      points,
      share:
        row.share_percent != null
          ? Number(row.share_percent)
          : total
            ? Math.round((1000 * points) / total) / 10
            : 0,
      color: RISK_SEGMENT_COLORS[index % RISK_SEGMENT_COLORS.length],
    };
  });
}

export function useHealthRiskAssessments(
  memberId: number | null,
  enabled = true,
) {
  const [loading, setLoading] = useState(Boolean(enabled && memberId != null));
  const [error, setError] = useState(false);
  const [assessments, setAssessments] = useState<HealthRiskAssessment[]>([]);

  useEffect(() => {
    if (!enabled || memberId == null) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    const applyRows = (payload: { assessments?: HealthRiskAssessment[] }) => {
      const rows = Array.isArray(payload?.assessments) ? payload.assessments : [];
      setAssessments(rows);
      return rows;
    };
    HealthRiskArchitectureApi.getCurrentAssessments(memberId)
      .then((res) => {
        if (cancelled) return [];
        return applyRows(res.data || {});
      })
      .then((rows) => {
        if (cancelled || rows.some((item) => item.assessment_status === 'calculated')) {
          return null;
        }
        return HealthRiskArchitectureApi.calculateAssessments(memberId);
      })
      .then((res) => {
        if (cancelled || !res) return;
        applyRows(res.data || {});
      })
      .catch(() => {
        if (!cancelled) {
          setAssessments([]);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, memberId]);

  return { loading, error, assessments };
}

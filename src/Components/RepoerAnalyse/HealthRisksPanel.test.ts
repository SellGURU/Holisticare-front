import { describe, expect, it } from 'vitest';
import {
  formatRiskScore,
  formulaIssueBody,
  isElevatedRisk,
  isFormulaRiskIssue,
  isLowHealthScore,
  mergeFormulaRisksIntoType2,
  planAffectingRisks,
  presentAges,
  presentRisks,
  presentScores,
  resolveReportSection,
  RISKS_SCORES_AGE_SECTION,
  riskContributions,
  scoreBarPercent,
  shouldShowReportGroup,
} from './healthRiskAssessments';

function incompleteCopy(missing: Array<{ token?: string }>) {
  if (!missing.length) {
    return 'Assessment incomplete. Missing data is not the same as low or no risk.';
  }
  return `Assessment incomplete: missing ${missing
    .map((row) => row.token)
    .filter(Boolean)
    .join(', ')}. Missing data is not the same as low or no risk.`;
}

describe('HealthRisksPanel copy', () => {
  it('does not call missing data no risk', () => {
    const text = incompleteCopy([{ token: 'LDL' }]);
    expect(text.toLowerCase()).toContain('not the same as low or no risk');
    expect(text).toContain('incomplete');
    expect(text).toContain('LDL');
  });

  it('maps old risk and score menu names to one section', () => {
    expect(resolveReportSection('Health Risks')).toBe(RISKS_SCORES_AGE_SECTION);
    expect(resolveReportSection('Health Scores')).toBe(
      RISKS_SCORES_AGE_SECTION,
    );
    expect(resolveReportSection('Client Summary')).toBe('Client Summary');
  });

  it('hides report groups that are not active in Intelligence Model', () => {
    expect(shouldShowReportGroup(['SCORING'], 'RISK')).toBe(false);
    expect(shouldShowReportGroup(['SCORING'], 'SCORING')).toBe(true);
    expect(shouldShowReportGroup(['SCORING'], 'AGING')).toBe(false);
    expect(shouldShowReportGroup([], 'RISK')).toBe(false);
    expect(shouldShowReportGroup(['RISK'], 'RISK', false)).toBe(true);
    expect(shouldShowReportGroup(null, 'RISK')).toBe(false);
    expect(shouldShowReportGroup(null, 'RISK', true)).toBe(true);
  });
});

describe('Holistic Plan present risks', () => {
  it('shows only calculated scores, not insufficient', () => {
    const shown = presentRisks([
      {
        display_name: 'Cardiovascular Risk',
        assessment_status: 'calculated',
        score: 82,
        severity: 'High',
      },
      {
        display_name: 'Kidney Risk',
        assessment_status: 'insufficient_data',
        score: null,
      },
      {
        display_name: 'Liver Health Score',
        assessment_status: 'calculated',
        score: 18,
        severity: 'Low',
        domain_type: 'SCORING',
      },
    ]);
    expect(shown).toHaveLength(1);
    expect(shown[0].display_name).toBe('Cardiovascular Risk');
  });

  it('keeps age clocks out of the risk list', () => {
    expect(
      presentRisks([
        {
          display_name: 'Cardiovascular Risk',
          assessment_status: 'calculated',
          score: 82,
        },
        {
          display_name: 'Phenotypic Age',
          assessment_status: 'calculated',
          score: 54,
          domain_type: 'AGING',
        },
      ]).map((item) => item.display_name),
    ).toEqual(['Cardiovascular Risk']);
    expect(
      presentAges([
        {
          display_name: 'Phenotypic Age',
          assessment_status: 'calculated',
          score: 54,
          domain_type: 'AGING',
        },
        {
          display_name: 'Phenotypic Age',
          assessment_status: 'insufficient_data',
          score: null,
          domain_type: 'AGING',
        },
      ]).map((item) => item.display_name),
    ).toEqual(['Phenotypic Age']);
  });

  it('formats score and bar for 0-1 and 0-100', () => {
    expect(formatRiskScore(82)).toBe('82');
    expect(formatRiskScore(0.35)).toBe('0.35');
    expect(scoreBarPercent(82)).toBe(82);
    expect(scoreBarPercent(0.35)).toBe(35);
  });

  it('omits scores that are missing required labs', () => {
    expect(
      presentScores([
        {
          display_name: 'Glycemic Health Score',
          assessment_status: 'insufficient_data',
          score: null,
          domain_type: 'SCORING',
        },
        {
          display_name: 'Lipid Health Score',
          assessment_status: 'calculated',
          score: 42,
          domain_type: 'SCORING',
        },
      ]).map((item) => item.display_name),
    ).toEqual(['Lipid Health Score']);
  });

  it('omits health scores of zero', () => {
    expect(
      presentScores([
        {
          display_name: 'Cardiovascular Health Score',
          assessment_status: 'calculated',
          score: 0,
          domain_type: 'SCORING',
        },
        {
          display_name: 'Liver Health Score',
          assessment_status: 'calculated',
          score: 18,
          domain_type: 'SCORING',
        },
      ]).map((item) => item.display_name),
    ).toEqual(['Liver Health Score']);
  });

  it('keeps health scores on the score list and in plan when low', () => {
    const rows = [
      {
        display_name: 'Liver Health Score',
        assessment_status: 'calculated' as const,
        score: 18,
        severity: 'Low',
        domain_type: 'SCORING',
      },
      {
        display_name: 'Metabolic Score',
        assessment_status: 'calculated' as const,
        score: 88,
        severity: 'Optimal',
        domain_type: 'SCORING',
      },
    ];
    expect(presentScores(rows)).toHaveLength(2);
    expect(isLowHealthScore(rows[0])).toBe(true);
    expect(isLowHealthScore(rows[1])).toBe(false);
    expect(planAffectingRisks(rows).map((item) => item.display_name)).toEqual([
      'Liver Health Score',
    ]);
  });
});

describe('formula issues for Holistic Plan', () => {
  it('only elevated calculated risks become issues', () => {
    expect(
      isElevatedRisk({
        assessment_status: 'calculated',
        score: 100,
        severity: 'very High',
      }),
    ).toBe(true);
    expect(
      isElevatedRisk({
        assessment_status: 'calculated',
        score: 8,
        severity: 'Low',
      }),
    ).toBe(false);
    expect(
      planAffectingRisks([
        {
          display_name: 'Cardiovascular Risk',
          assessment_status: 'calculated',
          score: 100,
          severity: 'very High',
        },
        {
          display_name: 'Kidney Risk',
          assessment_status: 'insufficient_data',
        },
      ]),
    ).toHaveLength(1);
  });

  it('replaces LLM cardiovascular wording with the formula issue', () => {
    const merged = mergeFormulaRisksIntoType2(
      {
        'Key areas to address': {
          critical_urgent: [
            'Issue 1: Cardiovascular health – elevated lipids suggest high risk',
          ],
          important_strategic: ['Issue 2: Sleep quality support'],
          important_long_term: [],
          optional_enhancements: [],
        },
      },
      [
        {
          display_name: 'Cardiovascular Risk',
          risk_key: 'cardiovascular_risk_9d38d2',
          assessment_status: 'calculated',
          score: 100,
          severity: 'very High',
        },
      ],
    );
    const flat = Object.values(merged['Key areas to address']).flat();
    expect(flat.some((item) => isFormulaRiskIssue(item))).toBe(true);
    expect(flat.some((item) => item.includes('Sleep quality support'))).toBe(
      true,
    );
    expect(
      flat.some((item) => item.includes('elevated lipids suggest high risk')),
    ).toBe(false);
    expect(
      formulaIssueBody({
        display_name: 'Cardiovascular Risk',
        severity: 'very High',
        score: 100,
      }),
    ).toContain('Cardiovascular Risk — very High (score 100)');
  });
});

describe('risk contribution chart rows', () => {
  it('maps evidence shares for the donut', () => {
    const rows = riskContributions({
      evidence: [
        { input: 'LDL Cholesterol', contribution: 30, share_percent: 30, value: 4.2 },
        { input: 'HDL Cholesterol', contribution: 25, share_percent: 25, value: 0.8 },
      ],
    });
    expect(rows).toHaveLength(2);
    expect(rows[0].label).toBe('LDL Cholesterol');
    expect(rows[0].share).toBe(54.5);
    expect(rows[1].share).toBe(45.5);
  });

  it('keeps one row per marker when if_ duplicates both branches', () => {
    const rows = riskContributions({
      evidence: [
        { input: 'LDL Cholesterol', contribution: 25, value: 4.2 },
        { input: 'HDL Cholesterol', contribution: 30, value: 0.8 },
        { input: 'Triglycerides', contribution: 45, value: 3 },
        { input: 'LDL Cholesterol', contribution: 45, value: 4.2 },
        { input: 'HDL Cholesterol', contribution: 30, value: 0.8 },
        { input: 'Triglycerides', contribution: 25, value: 3 },
      ],
    });
    expect(rows.map((row) => row.label)).toEqual([
      'LDL Cholesterol',
      'HDL Cholesterol',
      'Triglycerides',
    ]);
    expect(rows.map((row) => row.share)).toEqual([25, 30, 45]);
  });
});

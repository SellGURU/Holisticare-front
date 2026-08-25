import { describe, expect, it } from 'vitest';
import {
  formatRiskScore,
  formulaIssueBody,
  isElevatedRisk,
  isFormulaRiskIssue,
  mergeFormulaRisksIntoType2,
  planAffectingRisks,
  presentRisks,
  riskContributions,
  scoreBarPercent,
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
    ]);
    expect(shown).toHaveLength(1);
    expect(shown[0].display_name).toBe('Cardiovascular Risk');
  });

  it('formats score and bar for 0-1 and 0-100', () => {
    expect(formatRiskScore(82)).toBe('82');
    expect(formatRiskScore(0.35)).toBe('0.35');
    expect(scoreBarPercent(82)).toBe(82);
    expect(scoreBarPercent(0.35)).toBe(35);
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
    expect(rows[0].share).toBe(30);
  });
});

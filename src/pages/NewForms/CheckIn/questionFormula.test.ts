import { describe, expect, it } from 'vitest';
import {
  buildScoringBiomarkerAddUrl,
  fillableQuestions,
  isUnrecognizedCatalogBiomarkerError,
  mapClinicCatalog,
  parseScoringBiomarkerAddParams,
  missingScoringCatalogBiomarkers,
  pruneOptionScores,
  resolveQuestionId,
  toQuestionId,
  uniqueQuestionId,
  unknownFormulaIds,
} from './questionFormula';

describe('questionFormula ids', () => {
  it('builds a snake_case id from question text', () => {
    expect(toQuestionId('What is your weight?')).toBe('what_is_your_weight');
  });

  it('keeps an existing valid id on edit', () => {
    expect(
      resolveQuestionId('q_weight', 'Weight in kg', [{ id: 'q_height' }], 1),
    ).toBe('q_weight');
  });

  it('avoids colliding with sibling ids', () => {
    expect(
      uniqueQuestionId('q_weight', new Set(['q_weight', 'q_weight_2'])),
    ).toBe('q_weight_3');
  });
});

describe('unknownFormulaIds', () => {
  it('ignores allowed functions and known question ids', () => {
    expect(
      unknownFormulaIds(
        'sum(q_gad_1, q_gad_2) / 21',
        new Set(['q_gad_1', 'q_gad_2']),
      ),
    ).toEqual([]);
  });

  it('flags unknown variables before save', () => {
    expect(
      unknownFormulaIds(
        'q_weight / ((q_height / 100) ** 2)',
        new Set(['q_weight']),
      ),
    ).toEqual(['q_height']);
  });

  it('does not treat quoted text as a variable', () => {
    expect(
      unknownFormulaIds(
        'if_(q_smoke == "Yes", "Smoker", "Non-smoker")',
        new Set(['q_smoke']),
      ),
    ).toEqual([]);
  });
});

describe('fillableQuestions', () => {
  it('drops the scoring sentinel used for derived biomarkers', () => {
    expect(
      fillableQuestions([
        { question: 'Age' },
        { __scoring__: [{ name: 'BMI', formula: 'width / 2' }] },
      ]),
    ).toEqual([{ question: 'Age' }]);
  });
});

describe('pruneOptionScores', () => {
  it('drops scores whose labels were removed', () => {
    expect(
      pruneOptionScores(['Not at all', 'Several days'], {
        'Not at all': 0,
        'Several days': 1,
        Gone: 9,
      }),
    ).toEqual({ 'Not at all': 0, 'Several days': 1 });
  });
});

describe('missingScoringCatalogBiomarkers', () => {
  const catalog = [{ name: 'Anxiety Level', unit: '' }];

  it('returns every scoring map that is not in the catalog', () => {
    expect(
      missingScoringCatalogBiomarkers(
        [
          {
            name: 'FSFI Total Score',
            formula: 'sum(q1)',
            map_to_biomarker: 'Female Sexual Function Index',
            unit: 'points',
          },
          {
            name: 'Sexual Health Composite Score',
            formula: 'sum(q1)',
            map_to_biomarker: 'Sexual Health Composite Score',
            unit: 'points',
          },
          {
            name: 'GAD-7',
            formula: 'sum(q1)',
            map_to_biomarker: 'Anxiety Level',
          },
        ],
        catalog,
      ),
    ).toEqual([
      {
        ruleIndex: 0,
        ruleName: 'FSFI Total Score',
        mapTo: 'Female Sexual Function Index',
        unit: 'points',
      },
      {
        ruleIndex: 1,
        ruleName: 'Sexual Health Composite Score',
        mapTo: 'Sexual Health Composite Score',
        unit: 'points',
      },
    ]);
  });

  it('skips insight-only rules and duplicates', () => {
    expect(
      missingScoringCatalogBiomarkers(
        [
          {
            name: 'FSFI',
            formula: 'sum(q1)',
            map_to_biomarker: 'Female Sexual Function Index',
            is_biomarker: false,
          },
          {
            name: 'Copy',
            formula: 'sum(q1)',
            map_to_biomarker: 'Female Sexual Function Index',
          },
          {
            name: 'Again',
            formula: 'sum(q1)',
            map_to_biomarker: 'Female Sexual Function Index',
          },
        ],
        catalog,
      ),
    ).toEqual([
      {
        ruleIndex: 1,
        ruleName: 'Copy',
        mapTo: 'Female Sexual Function Index',
        unit: '',
      },
    ]);
  });
});

describe('buildScoringBiomarkerAddUrl', () => {
  it('encodes each missing name as a query param', () => {
    expect(
      buildScoringBiomarkerAddUrl([
        { mapTo: 'Female Sexual Function Index', unit: 'points' },
        { mapTo: 'Sexual Health Composite Score', unit: 'points' },
      ]),
    ).toBe(
      '/biomarkers?addNames=Female+Sexual+Function+Index&units=points&addNames=Sexual+Health+Composite+Score&units=points',
    );
  });
});

describe('parseScoringBiomarkerAddParams', () => {
  it('reads repeated addNames and units', () => {
    expect(
      parseScoringBiomarkerAddParams(
        new URLSearchParams(
          'addNames=Female+Sexual+Function+Index&units=points&addNames=Sexual+Health+Composite+Score&units=points',
        ),
      ),
    ).toEqual([
      { name: 'Female Sexual Function Index', unit: 'points' },
      { name: 'Sexual Health Composite Score', unit: 'points' },
    ]);
  });
});

describe('isUnrecognizedCatalogBiomarkerError', () => {
  it('matches the lab-import scoring save error', () => {
    expect(
      isUnrecognizedCatalogBiomarkerError(
        "Scoring rule 1: 'Female Sexual Function Index' is not recognized by the system. Please select a valid biomarker from the 'System Biomarker' menu.",
      ),
    ).toBe(true);
  });
});

describe('mapClinicCatalog', () => {
  it('keeps disabled items so existing mappings can stay selected', () => {
    const mapped = mapClinicCatalog([
      { Biomarker: 'Hidden', unit: 'mg', is_enabled: false },
      { Biomarker: 'Live', unit: 'mg', is_enabled: true },
      { Biomarker: 'Legacy', unit: 'mg' },
    ]);
    expect(mapped.map((item) => item.name)).toEqual([
      'Hidden',
      'Legacy',
      'Live',
    ]);
    expect(mapped.find((item) => item.name === 'Hidden')?.is_enabled).toBe(
      false,
    );
    expect(mapped.find((item) => item.name === 'Legacy')?.is_enabled).toBe(
      true,
    );
  });

  it('prefers the enabled duplicate when names collide', () => {
    const mapped = mapClinicCatalog([
      { Biomarker: 'CRP', unit: 'mg', is_enabled: false },
      { Biomarker: 'CRP', unit: 'mg/L', is_enabled: true },
    ]);
    expect(mapped).toHaveLength(1);
    expect(mapped[0]).toMatchObject({
      name: 'CRP',
      unit: 'mg/L',
      is_enabled: true,
    });
  });
});

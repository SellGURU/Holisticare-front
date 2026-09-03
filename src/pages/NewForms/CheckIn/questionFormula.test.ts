import { describe, expect, it } from 'vitest';
import {
  fillableQuestions,
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
      unknownFormulaIds('q_weight / ((q_height / 100) ** 2)', new Set(['q_weight'])),
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

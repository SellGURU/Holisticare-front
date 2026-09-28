import { describe, expect, it } from 'vitest';
import {
  extractQuestionnaireTokens,
  filterInsertableItems,
  formulaHasUnknownReferences,
  formulaSuggestTriggerAtCaret,
  groupQuestionnairesByForm,
  insertNamespacedToken,
  readableFormulaLabel,
  toInsertableQuestionnaires,
  unknownQuestionnaireTokens,
} from './formulaTokens';

describe('formulaTokens', () => {
  it('extracts questionnaire tokens without breaking biomarker names', () => {
    expect(
      extractQuestionnaireTokens(
        'Biomarker.LDL + if_(Questionnaire.q_smoke__form1 == "Yes", 1, 0)',
      ),
    ).toEqual(['q_smoke__form1']);
  });

  it('flags unknown questionnaire tokens only when multi-source is on', () => {
    const formula = 'Questionnaire.q_smoke__form1';
    expect(
      unknownQuestionnaireTokens(formula, ['q_smoke__form1']),
    ).toEqual([]);
    expect(unknownQuestionnaireTokens(formula, [])).toEqual(['q_smoke__form1']);
    expect(
      formulaHasUnknownReferences(formula, ['LDL'], {
        multiSourceEnabled: false,
        profile: [],
        questionnaires: [],
      }),
    ).toBe(true);
    expect(
      formulaHasUnknownReferences(formula, ['LDL'], {
        multiSourceEnabled: true,
        profile: [],
        questionnaires: [{ token: 'q_smoke__form1' }],
      }),
    ).toBe(false);
  });

  it('inserts a questionnaire token at a partial prefix', () => {
    const formula = 'round(Questionnaire.q_sm';
    const result = insertNamespacedToken(
      formula,
      formula.length,
      'Questionnaire',
      'q_smoke__form1',
    );
    expect(result.next).toBe('round(Questionnaire.q_smoke__form1');
  });

  it('opens questionnaire suggestions from free aliases', () => {
    expect(formulaSuggestTriggerAtCaret('quest', 5)?.namespace).toBe(
      'Questionnaire',
    );
    expect(formulaSuggestTriggerAtCaret('questionnaire', 13)?.namespace).toBe(
      'Questionnaire',
    );
    expect(formulaSuggestTriggerAtCaret('پرسش', 4)?.namespace).toBe(
      'Questionnaire',
    );
    expect(formulaSuggestTriggerAtCaret('q.', 2)?.namespace).toBe(
      'Questionnaire',
    );
    expect(formulaSuggestTriggerAtCaret('Questionnaire.', 14)?.namespace).toBe(
      'Questionnaire',
    );
    expect(formulaSuggestTriggerAtCaret('q', 1)).toBeNull();
  });

  it('replaces an alias with the canonical questionnaire token', () => {
    const result = insertNamespacedToken(
      'if_(quest',
      9,
      'Questionnaire',
      'q_smoke__form1',
    );
    expect(result.next).toBe('if_(Questionnaire.q_smoke__form1');
  });

  it('searches questionnaire items by question label and form title', () => {
    const items = toInsertableQuestionnaires([
      {
        token: 'q_smoke__form1',
        question_label: 'Do you smoke?',
        form_title: 'Intake',
        value_type: 'string',
        question_id: 'q_smoke',
      },
    ]);
    expect(filterInsertableItems(items, 'smoke').map((item) => item.token)).toEqual([
      'q_smoke__form1',
    ]);
    expect(filterInsertableItems(items, 'intake').map((item) => item.token)).toEqual([
      'q_smoke__form1',
    ]);
    expect(filterInsertableItems(items, 'q_smoke').map((item) => item.token)).toEqual([
      'q_smoke__form1',
    ]);
    expect(groupQuestionnairesByForm(items)[0].form).toBe('Intake');
    expect(
      readableFormulaLabel('Questionnaire', 'q_smoke__form1', items),
    ).toBe('Intake · Do you smoke?');
  });
});

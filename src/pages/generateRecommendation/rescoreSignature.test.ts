import { describe, expect, it } from 'vitest';
import { serializeRescoreSignature } from './rescoreSignature';

describe('serializeRescoreSignature (REC-F04)', () => {
  it('returns null when revision evidence is missing (conservative rescore)', () => {
    expect(
      serializeRescoreSignature({
        key_areas_to_address: {
          'Key areas to address': { critical_urgent: ['Issue 1: A'] },
        },
        suggestion_tab: [{ Title: 'Walk', checked: true }],
      }),
    ).toBeNull();
  });

  it('changes when key areas or scoring suggestion fields change', () => {
    const base = {
      key_areas_to_address: {
        'Key areas to address': { critical_urgent: ['Issue 1: A'] },
      },
      suggestion_tab: [{ Title: 'Walk', checked: true, Initial_Score: 8 }],
      biomarker_insight: ['bio'],
      client_insight: ['note'],
    };
    const sig1 = serializeRescoreSignature(base);
    const sig2 = serializeRescoreSignature({
      ...base,
      key_areas_to_address: {
        'Key areas to address': { critical_urgent: ['Issue 1: B'] },
      },
    });
    const sig3 = serializeRescoreSignature({
      ...base,
      suggestion_tab: [{ Title: 'Walk', checked: false, Initial_Score: 8 }],
    });
    expect(sig1).not.toBeNull();
    expect(sig1).not.toEqual(sig2);
    expect(sig1).not.toEqual(sig3);
  });

  it('is stable when rescoring inputs are unchanged', () => {
    const plan = {
      key_areas_to_address: {
        'Key areas to address': { important_strategic: ['Issue 2: Sleep'] },
      },
      suggestion_tab: [
        { Title: 'Magnesium', Type: 'Supplement', checked: true },
      ],
      biomarker_insight: ['low magnesium'],
      client_insight: ['fatigue'],
    };
    expect(serializeRescoreSignature(plan)).toBe(
      serializeRescoreSignature(plan),
    );
  });
});

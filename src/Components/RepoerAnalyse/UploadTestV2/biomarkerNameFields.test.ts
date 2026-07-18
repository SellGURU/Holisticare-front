import { describe, expect, it } from 'vitest';
import { preserveBiomarkerIds } from './biomarkerNameFields';

describe('preserveBiomarkerIds', () => {
  it('carries exact biomarker_id matches from previous snapshot', () => {
    const prev = [
      {
        biomarker_id: 'client-stable',
        original_biomarker_name: 'Vitamin D',
        value: 30,
        unit: 'ng/mL',
        biomarker: 'Vitamin D',
      },
    ];
    const next = [
      {
        biomarker_id: 'client-stable',
        original_biomarker_name: 'Vitamin D',
        value: 30,
        unit: 'ng/mL',
        biomarker: '25-Hydroxyvitamin D',
      },
    ];

    const result = preserveBiomarkerIds(prev, next);
    expect(result[0].biomarker_id).toBe('client-stable');
    expect(result[0].biomarker).toBe('25-Hydroxyvitamin D');
  });

  it('maps duplicate rows by ordinal without cross-assignment', () => {
    const prev = [
      {
        biomarker_id: 'client-a',
        original_biomarker_name: 'Neutrophils',
        value: 50,
        unit: '%',
      },
      {
        biomarker_id: 'client-b',
        original_biomarker_name: 'Neutrophils',
        value: 50,
        unit: '%',
      },
    ];
    const next = [
      {
        biomarker_id: 'server-1',
        original_biomarker_name: 'Neutrophils',
        value: 50,
        unit: '%',
      },
      {
        biomarker_id: 'server-2',
        original_biomarker_name: 'Neutrophils',
        value: 50,
        unit: '%',
      },
    ];

    const result = preserveBiomarkerIds(prev, next);
    expect(result.map((row) => row.biomarker_id)).toEqual([
      'client-a',
      'client-b',
    ]);
  });
});

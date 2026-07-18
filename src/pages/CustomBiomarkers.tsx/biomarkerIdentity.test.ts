import { describe, expect, it } from 'vitest';
import { dedupeCatalogBiomarkersList } from './biomarkerIdentity';

describe('dedupeCatalogBiomarkersList', () => {
  it('collapses duplicate identity rows and prefers configured custom entries', () => {
    const deduped = dedupeCatalogBiomarkersList([
      {
        Biomarker: 'ABO Group',
        'Benchmark areas': 'Hematology',
        biomarker_type: 'blood',
        unit: '',
        thresholds: {
          male: { '18-100': [{ low: null, high: null }] },
        },
      },
      {
        Biomarker: 'ABO Group',
        'Benchmark areas': 'Hematology',
        biomarker_type: 'blood',
        unit: '',
        source: 'custom',
        Definition: 'Configured custom ABO Group',
        thresholds: {
          male: { '18-100': [{ low: 1, high: 2 }] },
        },
      },
      {
        Biomarker: 'MooNa',
        'Benchmark areas': 'Hematology',
        biomarker_type: 'blood',
        unit: '',
        source: 'custom',
        thresholds: {
          male: { '18-100': [{ low: 10, high: 20 }] },
        },
      },
    ]);

    expect(deduped).toHaveLength(2);
    expect(
      deduped.filter((item) => item.Biomarker === 'ABO Group'),
    ).toHaveLength(1);
    expect(deduped.find((item) => item.Biomarker === 'ABO Group')?.source).toBe(
      'custom',
    );
  });

  it('keeps distinct biomarkers that only share a display name when units differ', () => {
    const deduped = dedupeCatalogBiomarkersList([
      {
        Biomarker: 'Glucose',
        'Benchmark areas': 'Diabetes & Glucose',
        biomarker_type: 'blood',
        unit: 'mg/dL',
        thresholds: {
          male: { '18-100': [{ low: 70, high: 99 }] },
        },
      },
      {
        Biomarker: 'Glucose',
        'Benchmark areas': 'Diabetes & Glucose',
        biomarker_type: 'blood',
        unit: 'mmol/L',
        thresholds: {
          male: { '18-100': [{ low: 3.9, high: 5.5 }] },
        },
      },
    ]);

    expect(deduped).toHaveLength(2);
  });
});

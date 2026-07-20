import { describe, expect, it } from 'vitest';
import {
  dedupeCatalogBiomarkersList,
  findCatalogNameTypeDuplicate,
} from './biomarkerIdentity';

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

  it('keeps same display name when biomarker types differ', () => {
    const deduped = dedupeCatalogBiomarkersList([
      {
        Biomarker: '3-Methylhistidine',
        'Benchmark areas': 'Amino Acids',
        biomarker_type: 'blood',
        unit: 'µmol/dL',
        thresholds: {
          male: { '18-100': [{ low: 1, high: 2 }] },
        },
      },
      {
        Biomarker: '3-Methylhistidine',
        'Benchmark areas': 'Urine Test Parameters',
        biomarker_type: 'urine',
        unit: 'mmol/mol creatinine',
        source: 'custom',
        thresholds: {
          male: { '18-100': [{ low: 3, high: 4 }] },
        },
      },
    ]);

    expect(deduped).toHaveLength(2);
    expect(deduped.map((item) => item.biomarker_type).sort()).toEqual([
      'blood',
      'urine',
    ]);
  });
});

describe('findCatalogNameTypeDuplicate', () => {
  const catalog = [
    {
      Biomarker: '3-Methylhistidine',
      biomarker_type: 'blood',
      biomarker_uid: 'uid-blood',
      unit: 'µmol/dL',
    },
    {
      Biomarker: '3-Methylhistidine',
      biomarker_type: 'urine',
      biomarker_uid: 'uid-urine',
      unit: 'mmol/mol creatinine',
    },
  ];

  it('allows same name with a different type', () => {
    expect(
      findCatalogNameTypeDuplicate(catalog, '3-Methylhistidine', 'dna'),
    ).toBeNull();
  });

  it('detects same name and same type', () => {
    const match = findCatalogNameTypeDuplicate(
      catalog,
      '3-Methylhistidine',
      'urine',
    );
    expect(match?.biomarker_uid).toBe('uid-urine');
  });

  it('matches case-insensitively on name', () => {
    const match = findCatalogNameTypeDuplicate(
      catalog,
      '3-methylhistidine',
      'Blood',
    );
    expect(match?.biomarker_uid).toBe('uid-blood');
  });

  it('excludes the current row by uid when editing', () => {
    expect(
      findCatalogNameTypeDuplicate(catalog, '3-Methylhistidine', 'blood', {
        excludeUid: 'uid-blood',
      }),
    ).toBeNull();
  });

  it('excludes the current row by index when uid is missing', () => {
    const withoutUid = [
      { Biomarker: 'Protein', biomarker_type: 'blood' },
      { Biomarker: 'Protein', biomarker_type: 'urine' },
    ];
    expect(
      findCatalogNameTypeDuplicate(withoutUid, 'Protein', 'blood', {
        excludeIndex: 0,
      }),
    ).toBeNull();
    expect(
      findCatalogNameTypeDuplicate(withoutUid, 'Protein', 'urine', {
        excludeIndex: 0,
      })?.biomarker_type,
    ).toBe('urine');
  });
});

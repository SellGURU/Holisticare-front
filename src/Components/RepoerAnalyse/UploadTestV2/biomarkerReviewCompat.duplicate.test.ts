import { describe, expect, it } from 'vitest';
import { findCatalogBiomarkerDuplicate } from './biomarkerReviewCompat';

describe('findCatalogBiomarkerDuplicate', () => {
  const catalog = [
    {
      Biomarker: 'Protein',
      biomarker_type: 'blood',
      unit: 'g/dL',
    },
    {
      Biomarker: 'Protein',
      biomarker_type: 'urine',
      unit: 'mg/dL',
    },
  ];

  it('allows creating the same name for a different type', () => {
    expect(findCatalogBiomarkerDuplicate(catalog, 'Protein', 'dna')).toBeNull();
  });

  it('blocks creating the same name for an existing type and unit', () => {
    const match = findCatalogBiomarkerDuplicate(
      catalog,
      'Protein',
      'urine',
      'mg/dL',
    );
    expect(match?.biomarker_type).toBe('urine');
    expect(match?.unit).toBe('mg/dL');
  });

  it('allows the same name and type when unit differs', () => {
    expect(
      findCatalogBiomarkerDuplicate(catalog, 'Protein', 'blood', 'mg/dL'),
    ).toBeNull();
  });

  it('defaults missing type to blood', () => {
    const match = findCatalogBiomarkerDuplicate(
      [{ Biomarker: 'Albumin', unit: 'g/dL' }],
      'Albumin',
      'blood',
      'g/dL',
    );
    expect(match?.Biomarker).toBe('Albumin');
  });
});

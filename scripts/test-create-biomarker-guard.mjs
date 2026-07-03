/**
 * Create-biomarker duplicate guard checks for lab review + CreateBiomarkerModal.
 * Run: npx tsx scripts/test-create-biomarker-guard.mjs
 */
import assert from 'node:assert/strict';
import {
  findCatalogBiomarkerDuplicate,
  shouldBlockCreateNewBiomarker,
} from '../src/Components/RepoerAnalyse/UploadTestV2/biomarkerReviewCompat.ts';

const catalog = [
  {
    biomarker: 'Mean Corpuscular Hemoglobin Concentration',
    Biomarker: 'Mean Corpuscular Hemoglobin Concentration',
    unit: 'g/L',
    biomarker_type: 'blood',
  },
  {
    biomarker: 'Protein, Total',
    Biomarker: 'Protein, Total',
    unit: 'g/dL',
    biomarker_type: 'blood',
  },
];

const mchcDuplicate = findCatalogBiomarkerDuplicate(
  catalog,
  'Mean Corpuscular Hemoglobin Concentration',
  'blood',
);
assert.ok(mchcDuplicate, 'MCHC should match catalog by name+type');
assert.equal(mchcDuplicate.unit, 'g/L');

const mchcDifferentUnit = findCatalogBiomarkerDuplicate(
  catalog,
  'Mean Corpuscular Hemoglobin Concentration',
  'blood',
);
assert.ok(
  mchcDifferentUnit,
  'Duplicate guard must block even when create unit differs (g/dL vs g/L)',
);

assert.equal(
  findCatalogBiomarkerDuplicate(catalog, 'Brand New Marker', 'blood'),
  null,
);

assert.equal(
  shouldBlockCreateNewBiomarker({
    catalog,
    extractedName: 'Mean Corpuscular Hemoglobin Concentration',
    biomarkerType: 'blood',
    suggestions: [],
  }),
  true,
);

assert.equal(
  shouldBlockCreateNewBiomarker({
    catalog,
    extractedName: 'MCHC',
    biomarkerType: 'blood',
    suggestions: [
      {
        system_biomarker: 'Mean Corpuscular Hemoglobin Concentration',
        confidence: 92,
      },
    ],
  }),
  false,
  'Abbreviation without catalog match should rely on normalized suggestion name',
);

assert.equal(
  shouldBlockCreateNewBiomarker({
    catalog: [],
    extractedName: 'MCHC',
    biomarkerType: 'blood',
    suggestions: [
      {
        system_biomarker: 'Mean Corpuscular Hemoglobin Concentration',
        confidence: 92,
      },
    ],
  }),
  false,
  'High-confidence suggestion alone does not block unless names normalize equally',
);

console.log('test-create-biomarker-guard.mjs: all assertions passed');

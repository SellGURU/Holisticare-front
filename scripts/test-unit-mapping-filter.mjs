/**
 * Unit mapping filter checks for Custom Biomarkers Manage Mappings modal.
 * Run: npx tsx scripts/test-unit-mapping-filter.mjs
 */
import assert from 'node:assert/strict';
import {
  filterUnitMappingsForBiomarker,
  migrateLegacyUnitMappingsForDuplicates,
} from '../src/pages/CustomBiomarkers.tsx/biomarkerIdentity.ts';

const vitaminDRow = {
  biomarker_uid: 'vitd-1',
  Biomarker: '25 OH Vitamin D',
  unit: 'nmol/L',
  'Benchmark areas': 'Vitamins',
  biomarker_type: 'blood',
};

const legacySeedMappings = [
  {
    biomarker: '25 OH Vitamin D',
    unit: 'ng/mL',
    to_unit: 'nmol/L',
    conversion_factor: 2.496,
  },
  {
    biomarker: '25 OH Vitamin D',
    unit: 'mmol/L',
    to_unit: 'nmol/L',
    conversion_factor: 1000000,
  },
];

const filtered = filterUnitMappingsForBiomarker(
  legacySeedMappings,
  vitaminDRow,
  [vitaminDRow],
);

assert.equal(
  filtered.length,
  2,
  'Legacy seed entries match by biomarker name and show all from-units',
);
assert.ok(
  filtered.some((entry) => entry.unit === 'ng/mL'),
  'ng/mL mapping included',
);
assert.ok(
  filtered.some((entry) => entry.unit === 'mmol/L'),
  'mmol/L mapping included',
);

const dedicatedMapping = {
  biomarker: '25 OH Vitamin D',
  biomarker_uid: 'vitd-1',
  biomarker_type: 'blood',
  benchmark_area: 'Vitamins',
  unit: 'ng/mL',
  to_unit: 'nmol/L',
  conversion_factor: 2.496,
};

const dedicatedPlusLegacy = filterUnitMappingsForBiomarker(
  [dedicatedMapping, legacySeedMappings[1]],
  vitaminDRow,
  [vitaminDRow],
);

assert.equal(
  dedicatedPlusLegacy.length,
  2,
  'Dedicated row mapping plus legacy name-only entries both appear',
);

const duplicateRows = [
  {
    biomarker_uid: 'protein-blood',
    Biomarker: 'Protein',
    unit: 'g/dL',
    'Benchmark areas': 'Liver Function',
    biomarker_type: 'blood',
  },
  {
    biomarker_uid: 'protein-urine',
    Biomarker: 'Protein',
    unit: '',
    'Benchmark areas': 'Urine Test Parameters',
    biomarker_type: 'urine',
  },
];

const bloodProteinOnly = filterUnitMappingsForBiomarker(
  [
    {
      biomarker: 'Protein',
      biomarker_uid: 'protein-blood',
      biomarker_type: 'blood',
      benchmark_area: 'Liver Function',
      unit: 'g/L',
      to_unit: 'g/dL',
      conversion_factor: 0.1,
    },
    {
      biomarker: 'Protein',
      biomarker_uid: 'protein-urine',
      biomarker_type: 'urine',
      benchmark_area: 'Urine Test Parameters',
      unit: 'mg/dL',
      to_unit: '',
      conversion_factor: 1,
    },
  ],
  duplicateRows[0],
  duplicateRows,
);

assert.equal(
  bloodProteinOnly.length,
  1,
  'Identity-scoped mappings stay on the matching catalog row only',
);
assert.equal(bloodProteinOnly[0].unit, 'g/L');

const legacyProteinMapping = {
  biomarker: 'Protein',
  unit: 'g/L',
  to_unit: 'g/dL',
  conversion_factor: 0.1,
};

const migrated = migrateLegacyUnitMappingsForDuplicates(
  duplicateRows,
  [legacyProteinMapping],
);

assert.equal(
  migrated.length,
  2,
  'Duplicate-name legacy unit mapping splits into per-row entries',
);

console.log('unit mapping filter tests passed');

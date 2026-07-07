/**
 * Backend-driven categorizeReviewRow checks.
 * Run: npx tsx scripts/test-categorize-review-row.mjs
 */
import assert from 'node:assert/strict';
import {
  categorizeReviewRow,
  countReviewRowCategories,
  getReviewRowMessage,
  buildSuppressedRowKey,
  buildSuppressionKeysForRow,
  isRowSuppressed,
  resolveEffectiveRowError,
  filterPersistedReviewFindingItems,
  pickCatalogEntryForRow,
} from '../src/Components/RepoerAnalyse/UploadTestV2/biomarkerReviewCompat.ts';
import { stripLabFootnoteMarkers } from '../src/Components/RepoerAnalyse/UploadTestV2/biomarkerNameFields.ts';

const emptySuppressed = new Set();
const emptyErrors = {};

const readyRow = {
  biomarker_id: 'ca-1',
  biomarker: 'Calcium',
  original_biomarker_name: 'Calcium',
  biomarker_type: 'blood',
  value: '9.4',
  unit: 'mg/dL',
  original_value: '9.4',
  original_unit: 'mg/dL',
};

const readyResult = categorizeReviewRow(
  readyRow,
  emptyErrors,
  emptySuppressed,
  0,
);
assert.equal(
  readyResult.category,
  'ready',
  'Resolved row with no errors is Ready',
);

const unmatchedRow = {
  biomarker_id: 'bac-1',
  biomarker: '',
  original_biomarker_name: 'Bacterial Count',
  biomarker_type: 'urine',
  value: '100',
  unit: '/hpf',
  original_value: '100',
  original_unit: '/hpf',
};

const unmatchedResult = categorizeReviewRow(
  unmatchedRow,
  emptyErrors,
  emptySuppressed,
  1,
);
assert.equal(unmatchedResult.category, 'review');
assert.equal(unmatchedResult.reviewReason, 'unmatched');

const unitErrorRow = {
  biomarker_id: 'baso-1',
  biomarker: 'Basophils',
  original_biomarker_name: 'Basophils',
  biomarker_type: 'blood',
  value: '0.05',
  unit: 'x10^9/L',
  original_value: '0.05',
  original_unit: 'x10^9/L',
};
const unitErrors = {
  'baso-1': "Unit 'x10^9/L' differs from system default '10^9/L'",
};

const unitErrorResult = categorizeReviewRow(
  unitErrorRow,
  unitErrors,
  emptySuppressed,
  2,
);
assert.equal(unitErrorResult.category, 'review');
assert.equal(unitErrorResult.reviewReason, 'unit_mismatch');
assert.equal(
  getReviewRowMessage(unitErrorResult, unitErrorRow, unitErrors['baso-1']),
  unitErrors['baso-1'],
);

const suppressedRow = {
  biomarker_id: 'sup-1',
  biomarker: 'Glucose',
  original_biomarker_name: 'Glucose',
  biomarker_type: 'blood',
  value: '90',
  unit: 'mg/dL',
};
const suppressedSet = new Set([buildSuppressedRowKey(suppressedRow)]);
const suppressedResult = categorizeReviewRow(
  suppressedRow,
  emptyErrors,
  suppressedSet,
  3,
);
assert.equal(suppressedResult.category, 'excluded');

const systemKeySuppressedSet = new Set([
  buildSuppressedRowKey(suppressedRow),
  'glucose|blood',
]);
assert.equal(
  isRowSuppressed(suppressedRow, systemKeySuppressedSet),
  true,
  'System biomarker key keeps row excluded',
);
const restoredSet = new Set(systemKeySuppressedSet);
buildSuppressionKeysForRow(suppressedRow).forEach((key) =>
  restoredSet.delete(key),
);
assert.equal(
  isRowSuppressed(suppressedRow, restoredSet),
  false,
  'Removing all suppression keys restores the row',
);

assert.equal(stripLabFootnoteMarkers('pH^{01}'), 'pH');

const suggestDeleteRow = {
  biomarker_id: 'del-1',
  biomarker: 'Duplicate Marker',
  original_biomarker_name: 'Duplicate Marker',
  biomarker_type: 'blood',
  value: '1',
  unit: 'mg/dL',
  suggest_delete: true,
};
const suggestDeleteResult = categorizeReviewRow(
  suggestDeleteRow,
  emptyErrors,
  emptySuppressed,
  4,
);
assert.equal(suggestDeleteResult.category, 'review');
assert.equal(suggestDeleteResult.reviewReason, 'suggest_delete');

const valueErrorRow = {
  biomarker_id: 'e745f2be',
  biomarker: 'Microscopic Examination',
  original_biomarker_name: 'Microscopic Examination',
  biomarker_type: 'urine',
  value: 'Microscopic follows if indicated.',
  unit: '',
  original_value: 'Microscopic follows if indicated.',
  original_unit: '',
};
const valueErrors = {
  e745f2be:
    "This value must be a number. Please enter a valid numeric value in 'Extracted Value'.",
};

const valueErrorResult = categorizeReviewRow(
  valueErrorRow,
  valueErrors,
  emptySuppressed,
  5,
);
assert.equal(valueErrorResult.category, 'review');
assert.equal(valueErrorResult.reviewReason, 'value_mismatch');

const counts = countReviewRowCategories(
  [
    readyRow,
    unmatchedRow,
    unitErrorRow,
    suppressedRow,
    suggestDeleteRow,
    valueErrorRow,
  ],
  { ...unitErrors, ...valueErrors },
  suppressedSet,
);
assert.equal(counts.ready, 1);
assert.equal(counts.review, 4);
assert.equal(counts.excluded, 1);

// Continue gate: any review row blocks progression
assert.ok(
  counts.review > 0,
  'Continue must stay disabled while review rows remain',
);

const ecwMisresolvedRow = {
  biomarker_id: 'ecw-liters-1',
  biomarker: 'Extracellular Water Percentage (ECW%)',
  original_biomarker_name: 'ECW',
  biomarker_type: 'blood',
  value: '23.6',
  unit: 'Liters',
  original_value: '23.6',
  original_unit: 'Liters',
};
const ecwUnitMismatchErrors = {
  'ecw-liters-1':
    "ECW (value \"23.6\", unit \"Liters\"): Unit 'Liters' differs from system default '%'. No conversion mapping found.",
};

const ecwReviewResult = categorizeReviewRow(
  ecwMisresolvedRow,
  ecwUnitMismatchErrors,
  emptySuppressed,
  6,
);
assert.equal(ecwReviewResult.category, 'review');
assert.equal(ecwReviewResult.reviewReason, 'unit_mismatch');

const ecwHandledRow = {
  ...ecwMisresolvedRow,
  biomarker: 'ECW',
  review_error_handled: true,
};
const ecwHandledResult = categorizeReviewRow(
  ecwHandledRow,
  ecwUnitMismatchErrors,
  emptySuppressed,
  6,
);
assert.equal(
  ecwHandledResult.category,
  'ready',
  'Handled ECW row must leave Review even if stale errors remain',
);
assert.equal(
  resolveEffectiveRowError(ecwHandledRow, ecwUnitMismatchErrors, 6),
  '',
);

const ecwExcludedResult = categorizeReviewRow(
  ecwMisresolvedRow,
  ecwUnitMismatchErrors,
  new Set([buildSuppressedRowKey(ecwMisresolvedRow)]),
  6,
);
assert.equal(
  ecwExcludedResult.category,
  'excluded',
  'Excluded ECW row must not stay in Review',
);

const filteredFindings = filterPersistedReviewFindingItems(
  [
    {
      biomarker_id: 'ecw-liters-1',
      display_detail: ecwUnitMismatchErrors['ecw-liters-1'],
    },
  ],
  [ecwHandledRow],
);
assert.equal(
  filteredFindings.length,
  0,
  'Persisted findings must not resurrect errors for handled rows',
);

const ecwCatalog = [
  {
    biomarker: 'ECW',
    unit: 'L',
    biomarker_type: 'blood',
    benchmark_area: 'Body Composition',
  },
  {
    biomarker: 'Extracellular Water Percentage (ECW%)',
    unit: '%',
    biomarker_type: 'blood',
    benchmark_area: 'Body Composition',
  },
];
const ecwCatalogPick = pickCatalogEntryForRow(ecwCatalog, {
  biomarker: 'ECW',
  original_unit: 'Liters',
  biomarker_type: 'blood',
});
assert.equal(
  ecwCatalogPick?.biomarker,
  'ECW',
  'Liters must match volume ECW catalog row, not ECW%',
);
assert.equal(ecwCatalogPick?.unit, 'L');

console.log('categorizeReviewRow tests passed');

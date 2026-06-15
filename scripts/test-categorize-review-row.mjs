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
} from '../src/Components/RepoerAnalyse/UploadTestV2/biomarkerReviewCompat.ts';

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
assert.equal(readyResult.category, 'ready', 'Resolved row with no errors is Ready');

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
  'baso-1':
    "Unit 'x10^9/L' differs from system default '10^9/L'",
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

const counts = countReviewRowCategories(
  [readyRow, unmatchedRow, unitErrorRow, suppressedRow, suggestDeleteRow],
  unitErrors,
  suppressedSet,
);
assert.equal(counts.ready, 1);
assert.equal(counts.review, 3);
assert.equal(counts.excluded, 1);

console.log('categorizeReviewRow tests passed');

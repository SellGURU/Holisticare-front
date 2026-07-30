import { describe, expect, it } from 'vitest';
import { sortLabFilesByTestDateDesc } from './help';

describe('sortLabFilesByTestDateDesc', () => {
  it('orders by test date descending', () => {
    const files = [
      { file_id: 'a', date_of_test: '2026-01-01' },
      { file_id: 'b', date_of_test: '2026-07-30' },
      { file_id: 'c', date_of_test: '2026-03-15' },
    ];
    expect(sortLabFilesByTestDateDesc(files).map((f) => f.file_id)).toEqual([
      'b',
      'c',
      'a',
    ]);
  });

  it('falls back to upload date when test date is missing', () => {
    const files = [
      { file_id: 'old', date_uploaded: '2026-01-01' },
      { file_id: 'new', date_of_test: '2026-06-01' },
    ];
    expect(sortLabFilesByTestDateDesc(files).map((f) => f.file_id)).toEqual([
      'new',
      'old',
    ]);
  });
});

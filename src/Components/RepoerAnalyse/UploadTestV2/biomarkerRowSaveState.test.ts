import { describe, expect, it } from 'vitest';
import {
  applyHydrationMappingBaselines,
  registerMappingDirty,
  resolveRowSaveActionState,
} from './biomarkerRowSaveState';

const baseInput = {
  useReviewUx: true,
  rowCategory: 'ready',
  hasRowReadySaveHandler: true,
  systemBiomarkerName: 'Vitamin D',
  baselineSystemBiomarker: 'Vitamin D',
  isUserMappingDirty: false,
};

describe('resolveRowSaveActionState', () => {
  it('hides Save/Undo on pre-mapped ready row at load', () => {
    expect(resolveRowSaveActionState(baseInput).shouldShowSaveUndo).toBe(false);
  });

  it('shows Save/Undo when user dirtied mapping and value changed', () => {
    expect(
      resolveRowSaveActionState({
        ...baseInput,
        systemBiomarkerName: '25-Hydroxyvitamin D',
        isUserMappingDirty: true,
      }).shouldShowSaveUndo,
    ).toBe(true);
  });

  it('hides Save/Undo when server updates biomarker while row is not user-dirty', () => {
    expect(
      resolveRowSaveActionState({
        ...baseInput,
        baselineSystemBiomarker: '',
        systemBiomarkerName: 'Vitamin D',
        isUserMappingDirty: false,
      }).shouldShowSaveUndo,
    ).toBe(false);
  });

  it('treats whitespace-only differences as equal when normalized', () => {
    expect(
      resolveRowSaveActionState({
        ...baseInput,
        baselineSystemBiomarker: 'Vitamin D',
        systemBiomarkerName: '  Vitamin D  ',
        isUserMappingDirty: true,
      }).shouldShowSaveUndo,
    ).toBe(false);
  });
});

describe('hydration finish vs user edit race', () => {
  it('never drops pending dirty id when hydration baselines are applied', () => {
    const rows = [
      { biomarker_id: 'row-a', biomarker: 'Vitamin D' },
      { biomarker_id: 'row-b', biomarker: 'Copper' },
    ];
    let pending = new Set<string>();
    let baselines: Record<string, string> = {};

    baselines = applyHydrationMappingBaselines(rows, baselines, pending);
    expect(baselines).toEqual({
      'row-a': 'Vitamin D',
      'row-b': 'Copper',
    });

    pending = registerMappingDirty(pending, 'row-a', true);
    baselines = applyHydrationMappingBaselines(rows, baselines, pending);

    expect(pending.has('row-a')).toBe(true);
    expect(baselines['row-a']).toBe('Vitamin D');
  });

  it('preserves user edit registered in same tick as hydration finish', () => {
    let pending = new Set<string>();
    const rows = [{ biomarker_id: 'row-a', biomarker: 'Vitamin D' }];

    pending = registerMappingDirty(pending, 'row-a', true);
    const baselines = applyHydrationMappingBaselines(rows, {}, pending);

    expect(pending.has('row-a')).toBe(true);
    expect(baselines).toEqual({});
    expect(
      resolveRowSaveActionState({
        ...baseInput,
        systemBiomarkerName: '25-Hydroxyvitamin D',
        baselineSystemBiomarker: 'Vitamin D',
        isUserMappingDirty: pending.has('row-a'),
      }).shouldShowSaveUndo,
    ).toBe(true);
  });
});

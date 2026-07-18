import { normalizeBiomarkerNameForMatch } from './biomarkerReviewCompat';

export type RowSaveActionInput = {
  useReviewUx: boolean;
  rowCategory: string;
  hasRowReadySaveHandler: boolean;
  systemBiomarkerName: string;
  baselineSystemBiomarker: string;
  isUserMappingDirty: boolean;
};

export const resolveRowSaveActionState = ({
  useReviewUx,
  rowCategory,
  hasRowReadySaveHandler,
  systemBiomarkerName,
  baselineSystemBiomarker,
  isUserMappingDirty,
}: RowSaveActionInput): { shouldShowSaveUndo: boolean } => {
  const normalizedCurrent = normalizeBiomarkerNameForMatch(systemBiomarkerName);
  const normalizedBaseline = normalizeBiomarkerNameForMatch(
    baselineSystemBiomarker,
  );
  const mappingChanged = normalizedCurrent !== normalizedBaseline;

  const shouldShowSaveUndo =
    useReviewUx &&
    rowCategory !== 'excluded' &&
    hasRowReadySaveHandler &&
    normalizedCurrent.length > 0 &&
    isUserMappingDirty &&
    mappingChanged;

  return { shouldShowSaveUndo };
};

export const applyHydrationMappingBaselines = (
  rows: Array<{ biomarker_id?: string; biomarker?: string }>,
  baselines: Record<string, string>,
  pendingMappingRowIds: Set<string>,
): Record<string, string> => {
  const next = { ...baselines };
  rows.forEach((row) => {
    const id = String(row.biomarker_id || '').trim();
    if (!id || pendingMappingRowIds.has(id)) return;
    next[id] = String(row.biomarker || '').trim();
  });
  return next;
};

export const registerMappingDirty = (
  pendingIds: Set<string>,
  biomarkerId: string,
  dirty: boolean,
): Set<string> => {
  if (!biomarkerId) return pendingIds;
  const next = new Set(pendingIds);
  if (dirty) {
    next.add(biomarkerId);
  } else {
    next.delete(biomarkerId);
  }
  return next;
};

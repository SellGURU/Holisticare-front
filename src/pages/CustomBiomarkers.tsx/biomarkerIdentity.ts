/* eslint-disable @typescript-eslint/no-explicit-any */

export type BiomarkerIdentityMeta = {
  biomarkerUid: string;
  originalBiomarkerName: string;
  originalBiomarkerType: string;
  originalUnit: string;
  originalBenchmarkArea: string;
  originalBiomarkerIndex: number;
};

const trim = (value: unknown) => String(value ?? '').trim();

const normalizeType = (value: unknown) => trim(value || 'blood').toLowerCase();

export const buildBiomarkerIdentityKey = (item: any) =>
  [
    trim(item?.Biomarker).toLowerCase(),
    trim(item?.unit).toLowerCase(),
    trim(item?.['Benchmark areas']).toLowerCase(),
    normalizeType(item?.biomarker_type),
  ].join('|');

export const createBiomarkerUid = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `biomarker-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const ensureBiomarkerUid = <T extends Record<string, any>>(
  item: T,
): T => {
  const uid = trim(item?.biomarker_uid);
  if (uid) {
    return { ...item, biomarker_uid: uid };
  }
  return { ...item, biomarker_uid: createBiomarkerUid() };
};

export const normalizeBiomarkersList = (items: any[]) =>
  (Array.isArray(items) ? items : []).map((item) =>
    ensureBiomarkerUid(structuredClone(item)),
  );

export const buildBiomarkerIdentityMeta = (
  item: any,
  biomarkerIndex: number,
): BiomarkerIdentityMeta => ({
  biomarkerUid: trim(item?.biomarker_uid),
  originalBiomarkerName: trim(item?.Biomarker),
  originalBiomarkerType: normalizeType(item?.biomarker_type),
  originalUnit: trim(item?.unit),
  originalBenchmarkArea: trim(item?.['Benchmark areas']),
  originalBiomarkerIndex: biomarkerIndex,
});

export const replaceBiomarkerByIdentity = (
  biomarkers: any[],
  meta: BiomarkerIdentityMeta,
  updatedItem: any,
) => {
  const uid = trim(meta.biomarkerUid);
  if (uid) {
    const uidIndex = biomarkers.findIndex(
      (item) => trim(item?.biomarker_uid) === uid,
    );
    if (uidIndex !== -1) {
      return biomarkers.map((item, index) =>
        index === uidIndex ? ensureBiomarkerUid(updatedItem) : item,
      );
    }
  }

  const identityKey = [
    trim(meta.originalBiomarkerName).toLowerCase(),
    trim(meta.originalUnit).toLowerCase(),
    trim(meta.originalBenchmarkArea).toLowerCase(),
    normalizeType(meta.originalBiomarkerType),
  ].join('|');

  const matchingIndexes = biomarkers
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => buildBiomarkerIdentityKey(item) === identityKey)
    .map(({ index }) => index);

  if (matchingIndexes.length === 1) {
    return biomarkers.map((item, index) =>
      index === matchingIndexes[0] ? ensureBiomarkerUid(updatedItem) : item,
    );
  }

  const index = meta.originalBiomarkerIndex;
  if (
    Number.isInteger(index) &&
    index >= 0 &&
    index < biomarkers.length &&
    matchingIndexes.length === 0
  ) {
    return biomarkers.map((item, itemIndex) =>
      itemIndex === index ? ensureBiomarkerUid(updatedItem) : item,
    );
  }

  return biomarkers;
};

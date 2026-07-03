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

const BIOMARKER_TYPE_OPTIONS = [
  'blood',
  'urine',
  'dna',
  'gut',
  'saliva',
  'stool',
  'other',
];

const TYPE_ALIASES: Record<string, string> = {
  more_info: 'blood',
  serum: 'blood',
  plasma: 'blood',
  whole_blood: 'blood',
  genetic: 'dna',
  genetics: 'dna',
  genetics_dna: 'dna',
  gut_health: 'gut',
  gastrointestinal: 'gut',
  fecal: 'stool',
  faecal: 'stool',
};

/** Match backend `_normalize_biomarker_type` so identity keys stay in sync. */
export const normalizeBiomarkerType = (value: unknown) => {
  const cleaned = trim(value)
    .toLowerCase()
    .replace(/ /g, '_')
    .replace(/-/g, '_');
  const normalized = TYPE_ALIASES[cleaned] || cleaned;
  return BIOMARKER_TYPE_OPTIONS.includes(normalized) ? normalized : 'blood';
};

export const buildBiomarkerIdentityKey = (item: any) =>
  [
    trim(item?.Biomarker).toLowerCase(),
    trim(item?.unit).toLowerCase(),
    trim(item?.['Benchmark areas']).toLowerCase(),
    normalizeBiomarkerType(item?.biomarker_type),
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
  originalBiomarkerType: normalizeBiomarkerType(item?.biomarker_type),
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
    normalizeBiomarkerType(meta.originalBiomarkerType),
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

  const duplicateNameCount = biomarkers.filter(
    (item) =>
      trim(item?.Biomarker).toLowerCase() ===
      trim(meta.originalBiomarkerName).toLowerCase(),
  ).length;

  const index = meta.originalBiomarkerIndex;
  if (
    duplicateNameCount <= 1 &&
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

export const applySavedBiomarkerUpdate = (
  biomarkers: any[],
  meta: BiomarkerIdentityMeta,
  savedBiomarker: any,
) =>
  replaceBiomarkerByIdentity(biomarkers, meta, {
    ...savedBiomarker,
    biomarker_uid:
      trim(savedBiomarker?.biomarker_uid) || trim(meta.biomarkerUid),
  });

export const isCustomBiomarker = (item: any) =>
  trim(item?.source).toLowerCase() === 'custom';

export const removeBiomarkerByIdentity = (
  biomarkers: any[],
  meta: BiomarkerIdentityMeta,
) => {
  const uid = trim(meta.biomarkerUid);
  if (uid) {
    const filtered = biomarkers.filter(
      (item) => trim(item?.biomarker_uid) !== uid,
    );
    if (filtered.length !== biomarkers.length) {
      return filtered;
    }
  }

  const identityKey = [
    trim(meta.originalBiomarkerName).toLowerCase(),
    trim(meta.originalUnit).toLowerCase(),
    trim(meta.originalBenchmarkArea).toLowerCase(),
    normalizeBiomarkerType(meta.originalBiomarkerType),
  ].join('|');

  const matchingIndexes = biomarkers
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => buildBiomarkerIdentityKey(item) === identityKey)
    .map(({ index }) => index);

  if (matchingIndexes.length === 1) {
    return biomarkers.filter((_, index) => index !== matchingIndexes[0]);
  }

  const index = meta.originalBiomarkerIndex;
  if (
    Number.isInteger(index) &&
    index >= 0 &&
    index < biomarkers.length &&
    matchingIndexes.length === 0
  ) {
    return biomarkers.filter((_, itemIndex) => itemIndex !== index);
  }

  return biomarkers;
};

const normalizeName = (value: unknown) => trim(value).toLowerCase();

export const getDuplicateBiomarkerNames = (biomarkers: any[]) => {
  const counts = new Map<string, number>();
  biomarkers.forEach((item) => {
    const name = normalizeName(item?.Biomarker);
    if (!name) return;
    counts.set(name, (counts.get(name) || 0) + 1);
  });
  return new Set(
    Array.from(counts.entries())
      .filter(([, count]) => count > 1)
      .map(([name]) => name),
  );
};

const mappingHasIdentityFields = (mapping: any) =>
  Boolean(
    trim(mapping?.biomarker_uid) ||
      trim(mapping?.biomarker_type) ||
      trim(mapping?.unit) ||
      trim(mapping?.benchmark_area),
  );

/** Unit-mapping rows use `unit` as the imported (from) unit, not catalog identity. */
const unitMappingHasIdentityFields = (mapping: any) =>
  Boolean(
    trim(mapping?.biomarker_uid) ||
      trim(mapping?.biomarker_type) ||
      trim(mapping?.benchmark_area),
  );

export const buildMappingIdentityKeyFromEntry = (entry: any) =>
  [
    normalizeName(entry?.standard_name || entry?.biomarker),
    trim(entry?.unit).toLowerCase(),
    trim(entry?.benchmark_area || entry?.['Benchmark areas']).toLowerCase(),
    normalizeBiomarkerType(entry?.biomarker_type),
  ].join('|');

export const buildMappingEntryFromBiomarker = (
  biomarker: any,
  variations: string[] = [],
) => ({
  standard_name: trim(biomarker?.Biomarker),
  biomarker_uid: trim(biomarker?.biomarker_uid),
  biomarker_type: normalizeBiomarkerType(biomarker?.biomarker_type),
  unit: trim(biomarker?.unit),
  benchmark_area: trim(biomarker?.['Benchmark areas']),
  variations,
});

const isLegacyNameMappingCandidate = (
  biomarker: any,
  allBiomarkers: any[],
  duplicateNames: Set<string>,
) => {
  const biomarkerName = normalizeName(biomarker?.Biomarker);
  if (!biomarkerName) return false;
  if (!duplicateNames.has(biomarkerName)) return true;

  const firstDuplicate = allBiomarkers.find(
    (item) => normalizeName(item?.Biomarker) === biomarkerName,
  );
  if (!firstDuplicate) return false;

  return (
    buildBiomarkerIdentityKey(firstDuplicate) ===
    buildBiomarkerIdentityKey(biomarker)
  );
};

export const mappingMatchesBiomarker = (
  mapping: any,
  biomarker: any,
  duplicateNames: Set<string>,
  allBiomarkers: any[] = [],
) => {
  const biomarkerUid = trim(biomarker?.biomarker_uid);
  const mappingUid = trim(mapping?.biomarker_uid);
  if (biomarkerUid && mappingUid && biomarkerUid === mappingUid) {
    return true;
  }

  if (mappingHasIdentityFields(mapping)) {
    return (
      buildMappingIdentityKeyFromEntry(mapping) ===
      buildBiomarkerIdentityKey(biomarker)
    );
  }

  const biomarkerName = normalizeName(biomarker?.Biomarker);
  if (
    !biomarkerName ||
    !isLegacyNameMappingCandidate(biomarker, allBiomarkers, duplicateNames)
  ) {
    return false;
  }

  return normalizeName(mapping?.standard_name) === biomarkerName;
};

export const findBiomarkerMapping = (
  mappings: any[],
  biomarker: any,
  allBiomarkers: any[],
) => {
  const duplicateNames = getDuplicateBiomarkerNames(allBiomarkers);
  return (
    mappings.find((mapping) =>
      mappingMatchesBiomarker(
        mapping,
        biomarker,
        duplicateNames,
        allBiomarkers,
      ),
    ) || null
  );
};

export const unitMappingMatchesBiomarker = (
  mapping: any,
  biomarker: any,
  duplicateNames: Set<string>,
  allBiomarkers: any[] = [],
) => {
  const biomarkerUid = trim(biomarker?.biomarker_uid);
  const mappingUid = trim(mapping?.biomarker_uid);
  if (biomarkerUid && mappingUid && biomarkerUid === mappingUid) {
    return true;
  }

  if (unitMappingHasIdentityFields(mapping)) {
    return (
      buildMappingIdentityKeyFromEntry({
        standard_name: mapping?.biomarker,
        unit: mapping?.to_unit,
        benchmark_area: mapping?.benchmark_area,
        biomarker_type: mapping?.biomarker_type,
        biomarker_uid: mapping?.biomarker_uid,
      }) === buildBiomarkerIdentityKey(biomarker)
    );
  }

  const biomarkerName = normalizeName(biomarker?.Biomarker);
  if (
    !biomarkerName ||
    !isLegacyNameMappingCandidate(biomarker, allBiomarkers, duplicateNames)
  ) {
    return false;
  }

  return normalizeName(mapping?.biomarker) === biomarkerName;
};

export const filterUnitMappingsForBiomarker = (
  mappings: any[],
  biomarker: any,
  allBiomarkers: any[],
) => {
  const duplicateNames = getDuplicateBiomarkerNames(allBiomarkers);
  return mappings.filter((mapping) =>
    unitMappingMatchesBiomarker(
      mapping,
      biomarker,
      duplicateNames,
      allBiomarkers,
    ),
  );
};

export const buildUnitMappingEntryFromBiomarker = (
  biomarker: any,
  entry: {
    unit: string;
    to_unit: string;
    conversion_factor?: number | null;
    offset?: number | null;
  },
) => ({
  biomarker: trim(biomarker?.Biomarker),
  biomarker_uid: trim(biomarker?.biomarker_uid),
  biomarker_type: normalizeBiomarkerType(biomarker?.biomarker_type),
  benchmark_area: trim(biomarker?.['Benchmark areas']),
  ...entry,
});

export const updateBiomarkerMappingsForBiomarker = (
  mappings: any[],
  biomarker: any,
  allBiomarkers: any[],
  updater: (current: any) => any,
) => {
  const existing = findBiomarkerMapping(mappings, biomarker, allBiomarkers);
  if (existing) {
    return mappings.map((mapping) =>
      mapping === existing ? updater(mapping) : mapping,
    );
  }

  const baseEntry = buildMappingEntryFromBiomarker(biomarker, [
    trim(biomarker?.Biomarker),
  ]);
  return [...mappings, updater(baseEntry)];
};

export const updateUnitMappingsForBiomarker = (
  mappings: any[],
  biomarker: any,
  allBiomarkers: any[],
  updater: (currentMatches: any[]) => any[],
) => {
  const duplicateNames = getDuplicateBiomarkerNames(allBiomarkers);
  const matches = mappings.filter((mapping) =>
    unitMappingMatchesBiomarker(
      mapping,
      biomarker,
      duplicateNames,
      allBiomarkers,
    ),
  );
  const rest = mappings.filter(
    (mapping) =>
      !unitMappingMatchesBiomarker(
        mapping,
        biomarker,
        duplicateNames,
        allBiomarkers,
      ),
  );
  return [...rest, ...updater(matches)];
};

const cloneVariations = (variations: string[] = []) =>
  variations
    .map((variation) => trim(variation))
    .filter(Boolean)
    .filter(
      (variation, index, list) =>
        list.findIndex(
          (item) => item.toLowerCase() === variation.toLowerCase(),
        ) === index,
    );

/**
 * Split legacy name-only mappings into per-row entries so duplicate biomarker
 * names keep their existing variations without sharing one mapping record.
 */
export const migrateLegacyMappingsForDuplicates = (
  biomarkers: any[],
  mappings: any[],
) => {
  const duplicateNames = getDuplicateBiomarkerNames(biomarkers);
  if (duplicateNames.size === 0) {
    return mappings;
  }

  let nextMappings = [...mappings];
  let changed = false;

  mappings.forEach((legacyMapping) => {
    if (mappingHasIdentityFields(legacyMapping)) return;

    const legacyName = normalizeName(legacyMapping?.standard_name);
    if (!legacyName || !duplicateNames.has(legacyName)) return;

    const variations = cloneVariations(legacyMapping?.variations);
    const duplicates = biomarkers.filter(
      (item) => normalizeName(item?.Biomarker) === legacyName,
    );

    duplicates.forEach((biomarker) => {
      const identityKey = buildBiomarkerIdentityKey(biomarker);
      const alreadyHasDedicatedEntry = nextMappings.some(
        (mapping) =>
          mappingHasIdentityFields(mapping) &&
          buildMappingIdentityKeyFromEntry(mapping) === identityKey,
      );
      if (alreadyHasDedicatedEntry) return;

      nextMappings.push(buildMappingEntryFromBiomarker(biomarker, variations));
      changed = true;
    });

    nextMappings = nextMappings.filter((mapping) => mapping !== legacyMapping);
    changed = true;
  });

  return changed ? nextMappings : mappings;
};

/** Split legacy unit mappings the same way for duplicate biomarker names. */
export const migrateLegacyUnitMappingsForDuplicates = (
  biomarkers: any[],
  mappings: any[],
) => {
  const duplicateNames = getDuplicateBiomarkerNames(biomarkers);
  if (duplicateNames.size === 0) {
    return mappings;
  }

  let nextMappings = [...mappings];
  let changed = false;

  mappings.forEach((legacyMapping) => {
    if (unitMappingHasIdentityFields(legacyMapping)) return;

    const legacyName = normalizeName(legacyMapping?.biomarker);
    if (!legacyName || !duplicateNames.has(legacyName)) return;

    const duplicates = biomarkers.filter(
      (item) => normalizeName(item?.Biomarker) === legacyName,
    );

    duplicates.forEach((biomarker) => {
      const identityKey = buildBiomarkerIdentityKey(biomarker);
      const alreadyHasDedicatedEntry = nextMappings.some((mapping) => {
        if (!unitMappingHasIdentityFields(mapping)) return false;
        return (
          buildMappingIdentityKeyFromEntry({
            standard_name: mapping?.biomarker,
            unit: mapping?.to_unit,
            benchmark_area: mapping?.benchmark_area,
            biomarker_type: mapping?.biomarker_type,
          }) === identityKey
        );
      });
      if (alreadyHasDedicatedEntry) return;

      nextMappings.push(
        buildUnitMappingEntryFromBiomarker(biomarker, {
          unit: trim(legacyMapping?.unit),
          to_unit: trim(legacyMapping?.to_unit),
          conversion_factor: legacyMapping?.conversion_factor ?? null,
          offset: legacyMapping?.offset ?? null,
        }),
      );
      changed = true;
    });

    nextMappings = nextMappings.filter((mapping) => mapping !== legacyMapping);
    changed = true;
  });

  return changed ? nextMappings : mappings;
};

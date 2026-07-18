from pathlib import Path

BASE = Path(r"c:\HCDevSourceCode\Holisticare-frontend\src\Components\RepoerAnalyse\UploadTestV2")

name_fields_path = BASE / "biomarkerNameFields.ts"
name_fields = name_fields_path.read_text(encoding="utf-8")
if "preserveBiomarkerIds" not in name_fields:
    import_block = "import { normalizeBiomarkerNameForMatch } from './biomarkerReviewCompat';\n\n"
    if "normalizeBiomarkerNameForMatch" not in name_fields:
        name_fields = import_block + name_fields

    preserve_fn = r'''
export type BiomarkerRowWithId = {
  biomarker_id?: string;
  backend_biomarker_id?: string;
  original_biomarker_name?: string;
  extracted_biomarker_name?: string;
  normalized_biomarker_name?: string;
  value?: unknown;
  original_value?: unknown;
  unit?: string;
  original_unit?: string;
};

const preferNonEmptyIdField = (...values: unknown[]) => {
  const found = values.find(
    (value) =>
      value !== undefined && value !== null && String(value).trim() !== '',
  );
  return found ?? '';
};

const backendRowIdentity = (row: BiomarkerRowWithId) =>
  trim(row.backend_biomarker_id) || trim(row.biomarker_id);

const rowContentValue = (row: BiomarkerRowWithId) =>
  String(preferNonEmptyIdField(row.original_value, row.value)).trim();

const rowContentUnit = (row: BiomarkerRowWithId) =>
  String(preferNonEmptyIdField(row.original_unit, row.unit) || '')
    .trim()
    .toLowerCase();

const rowContentName = (row: BiomarkerRowWithId) =>
  normalizeBiomarkerNameForMatch(resolveExactBiomarkerName(row));

const rowContentFingerprintBase = (row: BiomarkerRowWithId) =>
  `${rowContentName(row)}|${rowContentValue(row)}|${rowContentUnit(row)}`;

const ordinalKey = <T,>(
  rows: T[],
  index: number,
  baseKey: (row: T) => string,
): string => {
  const base = baseKey(rows[index]);
  let ordinal = 0;
  for (let i = 0; i < index; i += 1) {
    if (baseKey(rows[i]) === base) ordinal += 1;
  }
  return `${base}#${ordinal}`;
};

/**
 * Carry stable client `biomarker_id` values across step-one merges so row
 * components are not remounted when the backend re-sends ids.
 */
export const preserveBiomarkerIds = <T extends BiomarkerRowWithId>(
  prevRows: T[],
  nextRows: T[],
): T[] => {
  if (!prevRows.length || !nextRows.length) {
    return ensureUniqueBiomarkerIds(nextRows);
  }

  const output = nextRows.map((row) => ({ ...row }));
  const consumedPrev = new Set<number>();
  const matchedNext = new Set<number>();

  const tryAssign = (nextIndex: number, prevIndex: number) => {
    if (matchedNext.has(nextIndex) || consumedPrev.has(prevIndex)) return false;
    const prevId = trim(prevRows[prevIndex].biomarker_id);
    if (!prevId) return false;
    output[nextIndex] = { ...output[nextIndex], biomarker_id: prevId };
    consumedPrev.add(prevIndex);
    matchedNext.add(nextIndex);
    return true;
  };

  for ni in range(len(output)):
    next_id = trim(output[ni].biomarker_id) if False else None
  '''
    # fix - use JS in string only
    preserve_fn = '''
export type BiomarkerRowWithId = {
  biomarker_id?: string;
  backend_biomarker_id?: string;
  original_biomarker_name?: string;
  extracted_biomarker_name?: string;
  normalized_biomarker_name?: string;
  value?: unknown;
  original_value?: unknown;
  unit?: string;
  original_unit?: string;
};

const preferNonEmptyIdField = (...values: unknown[]) => {
  const found = values.find(
    (value) =>
      value !== undefined && value !== null && String(value).trim() !== '',
  );
  return found ?? '';
};

const backendRowIdentity = (row: BiomarkerRowWithId) =>
  trim(row.backend_biomarker_id) || trim(row.biomarker_id);

const rowContentValue = (row: BiomarkerRowWithId) =>
  String(preferNonEmptyIdField(row.original_value, row.value)).trim();

const rowContentUnit = (row: BiomarkerRowWithId) =>
  String(preferNonEmptyIdField(row.original_unit, row.unit) || '')
    .trim()
    .toLowerCase();

const rowContentName = (row: BiomarkerRowWithId) =>
  normalizeBiomarkerNameForMatch(resolveExactBiomarkerName(row));

const rowContentFingerprintBase = (row: BiomarkerRowWithId) =>
  `${rowContentName(row)}|${rowContentValue(row)}|${rowContentUnit(row)}`;

const ordinalKey = <T,>(
  rows: T[],
  index: number,
  baseKey: (row: T) => string,
): string => {
  const base = baseKey(rows[index]);
  let ordinal = 0;
  for (let i = 0; i < index; i += 1) {
    if (baseKey(rows[i]) === base) ordinal += 1;
  }
  return `${base}#${ordinal}`;
};

/**
 * Carry stable client `biomarker_id` values across step-one merges so row
 * components are not remounted when the backend re-sends ids.
 */
export const preserveBiomarkerIds = <T extends BiomarkerRowWithId>(
  prevRows: T[],
  nextRows: T[],
): T[] => {
  if (!prevRows.length || !nextRows.length) {
    return ensureUniqueBiomarkerIds(nextRows);
  }

  const output = nextRows.map((row) => ({ ...row }));
  const consumedPrev = new Set<number>();
  const matchedNext = new Set<number>();

  const tryAssign = (nextIndex: number, prevIndex: number) => {
    if (matchedNext.has(nextIndex) || consumedPrev.has(prevIndex)) return false;
    const prevId = trim(prevRows[prevIndex].biomarker_id);
    if (!prevId) return false;
    output[nextIndex] = { ...output[nextIndex], biomarker_id: prevId };
    consumedPrev.add(prevIndex);
    matchedNext.add(nextIndex);
    return true;
  };

  for (let ni = 0; ni < output.length; ni += 1) {
    const nextId = trim(output[ni].biomarker_id);
    if (!nextId) continue;
    for (let pi = 0; pi < prevRows.length; pi += 1) {
      if (consumedPrev.has(pi)) continue;
      if (trim(prevRows[pi].biomarker_id) !== nextId) continue;
      tryAssign(ni, pi);
      break;
    }
  }

  for (let ni = 0; ni < output.length; ni += 1) {
    if (matchedNext.has(ni)) continue;
    const nextKey = ordinalKey(output, ni, backendRowIdentity);
    for (let pi = 0; pi < prevRows.length; pi += 1) {
      if (consumedPrev.has(pi)) continue;
      const prevKey = ordinalKey(prevRows, pi, backendRowIdentity);
      if (prevKey !== nextKey) continue;
      if (tryAssign(ni, pi)) break;
    }
  }

  for (let ni = 0; ni < output.length; ni += 1) {
    if (matchedNext.has(ni)) continue;
    const nextKey = ordinalKey(output, ni, rowContentFingerprintBase);
    for (let pi = 0; pi < prevRows.length; pi += 1) {
      if (consumedPrev.has(pi)) continue;
      const prevKey = ordinalKey(prevRows, pi, rowContentFingerprintBase);
      if (prevKey !== nextKey) continue;
      if (tryAssign(ni, pi)) break;
    }
  }

  return ensureUniqueBiomarkerIds(output);
};

'''
    marker = "/**\n * Guarantee every row has a stable, unique `biomarker_id`."
    if marker not in name_fields:
        raise SystemExit("marker not found in biomarkerNameFields.ts")
    name_fields = name_fields.replace(marker, preserve_fn + marker, 1)
    name_fields_path.write_text(name_fields, encoding="utf-8")
    print("Updated biomarkerNameFields.ts")

test_name_fields = BASE / "biomarkerNameFields.test.ts"
test_name_fields.write_text("""import { describe, expect, it } from 'vitest';
import { preserveBiomarkerIds } from './biomarkerNameFields';

describe('preserveBiomarkerIds', () => {
  it('carries exact biomarker_id matches from previous snapshot', () => {
    const prev = [
      {
        biomarker_id: 'client-stable',
        original_biomarker_name: 'Vitamin D',
        value: 30,
        unit: 'ng/mL',
      },
    ];
    const next = [
      {
        biomarker_id: 'client-stable',
        original_biomarker_name: 'Vitamin D',
        value: 30,
        unit: 'ng/mL',
        biomarker: '25-Hydroxyvitamin D',
      },
    ];

    const result = preserveBiomarkerIds(prev, next);
    expect(result[0].biomarker_id).toBe('client-stable');
    expect(result[0].biomarker).toBe('25-Hydroxyvitamin D');
  });

  it('maps duplicate rows by ordinal without cross-assignment', () => {
    const prev = [
      {
        biomarker_id: 'client-a',
        original_biomarker_name: 'Neutrophils',
        value: 50,
        unit: '%',
      },
      {
        biomarker_id: 'client-b',
        original_biomarker_name: 'Neutrophils',
        value: 50,
        unit: '%',
      },
    ];
    const next = [
      {
        biomarker_id: 'server-1',
        original_biomarker_name: 'Neutrophils',
        value: 50,
        unit: '%',
      },
      {
        biomarker_id: 'server-2',
        original_biomarker_name: 'Neutrophils',
        value: 50,
        unit: '%',
      },
    ];

    const result = preserveBiomarkerIds(prev, next);
    expect(result.map((row) => row.biomarker_id)).toEqual(['client-a', 'client-b']);
  });
});
""", encoding="utf-8")
print("Wrote biomarkerNameFields.test.ts")

row_path = BASE / "BiomarkerRow.tsx"
row = row_path.read_text(encoding="utf-8")
if "resolveRowSaveActionState" not in row:
    row = row.replace(
        "} from './biomarkerNameFields';",
        "} from './biomarkerNameFields';\nimport { resolveRowSaveActionState } from './biomarkerRowSaveState';",
        1,
    )
if "baselineSystemBiomarker?" not in row:
    row = row.replace(
        "  onMappingDirtyChange?: (dirty: boolean) => void;\n  onRowReadySave?: (row: any) => void | Promise<void>;",
        "  onMappingDirtyChange?: (dirty: boolean) => void;\n  onRowReadySave?: (row: any) => void | Promise<void>;\n  baselineSystemBiomarker?: string;\n  isUserMappingDirty?: boolean;\n  onRowMappingBaselineCommit?: (\n    biomarkerId: string,\n    systemBiomarker: string,\n  ) => void;",
        1,
    )
if "baselineSystemBiomarker = ''" not in row:
    row = row.replace(
        "  onMappingDirtyChange,\n  onRowReadySave,",
        "  onMappingDirtyChange,\n  onRowReadySave,\n  baselineSystemBiomarker = '',\n  isUserMappingDirty = false,\n  onRowMappingBaselineCommit,",
        1,
    )
row = row.replace("  const baselineSystemBiomarkerRef = useRef('');\n", "")
row = row.replace(
    "\n  useEffect(() => {\n    baselineSystemBiomarkerRef.current = String(\n      biomarker.biomarker || '',\n    ).trim();\n  }, [biomarker.biomarker_id]);\n",
    "\n",
)
old_save_block = """  const isSystemBiomarkerDirty =
    normalizeBiomarkerNameForMatch(systemBiomarkerName) !==
    normalizeBiomarkerNameForMatch(baselineSystemBiomarkerRef.current);
  const shouldShowSaveButton =
    useReviewUx &&
    rowCategory !== 'excluded' &&
    Boolean(onRowReadySave) &&
    systemBiomarkerName.length > 0 &&
    isSystemBiomarkerDirty;"""
new_save_block = """  const { shouldShowSaveUndo } = resolveRowSaveActionState({
    useReviewUx,
    rowCategory,
    hasRowReadySaveHandler: Boolean(onRowReadySave),
    systemBiomarkerName,
    baselineSystemBiomarker,
    isUserMappingDirty,
  });"""
if old_save_block in row:
    row = row.replace(old_save_block, new_save_block)
row = row.replace("shouldShowSaveButton", "shouldShowSaveUndo")
row = row.replace(
    "      biomarker: baselineSystemBiomarkerRef.current,",
    "      biomarker: baselineSystemBiomarker,",
)
row = row.replace(
    "      await onRowReadySave(biomarker);\n      baselineSystemBiomarkerRef.current = systemBiomarkerName;\n      clearMappingDirty();",
    "      await onRowReadySave(biomarker);\n      onRowMappingBaselineCommit?.(\n        biomarker.biomarker_id,\n        systemBiomarkerName,\n      );\n      clearMappingDirty();",
)
old_type = """            onChange={(event) => {
              const nextType = event.target.value;
              updateAndStandardize(biomarker.biomarker_id, {
                biomarker_type: nextType,
              });
              markMappingDirty();"""
new_type = """            onChange={(event) => {
              const nextType = event.target.value;
              const currentType = String(biomarker.biomarker_type || 'blood')
                .trim()
                .toLowerCase();
              if (String(nextType).trim().toLowerCase() === currentType) {
                return;
              }
              updateAndStandardize(biomarker.biomarker_id, {
                biomarker_type: nextType,
              });
              markMappingDirty();"""
row = row.replace(old_type, new_type)
marker = "            onChange={(val: string) => {\n              const catalogEntry = pickCatalogEntryForRow("
if marker in row and "normalizeBiomarkerNameForMatch(val) ===" not in row.split(marker, 1)[1][:500]:
    row = row.replace(
        marker,
        """            onChange={(val: string) => {
              if (
                normalizeBiomarkerNameForMatch(val) ===
                normalizeBiomarkerNameForMatch(biomarker.biomarker)
              ) {
                return;
              }
              const catalogEntry = pickCatalogEntryForRow(""",
        1,
    )
old_unit = """                  onChange={(val: string) => {
                    const actualUnit = val === '(no unit)' ? '' : val;
                    logUnitOnChange(biomarker.biomarker_id, actualUnit);
                    updateAndStandardize(biomarker.biomarker_id, {
                      original_unit: actualUnit,
                    });
                    markMappingDirty();"""
new_unit = """                  onChange={(val: string) => {
                    const actualUnit = val === '(no unit)' ? '' : val;
                    const currentUnit = String(
                      preferNonEmpty(biomarker.original_unit, biomarker.unit) ||
                        '',
                    )
                      .trim()
                      .toLowerCase();
                    if (String(actualUnit).trim().toLowerCase() === currentUnit) {
                      return;
                    }
                    logUnitOnChange(biomarker.biomarker_id, actualUnit);
                    updateAndStandardize(biomarker.biomarker_id, {
                      original_unit: actualUnit,
                    });
                    markMappingDirty();"""
row = row.replace(old_unit, new_unit)
row_path.write_text(row, encoding="utf-8")
print("Updated BiomarkerRow.tsx")

section_path = BASE / "BiomarkersSection.tsx"
section = section_path.read_text(encoding="utf-8")
if "applyHydrationMappingBaselines" not in section:
    section = section.replace(
        "} from './biomarkerNameFields';",
        "} from './biomarkerNameFields';\nimport {\n  applyHydrationMappingBaselines,\n  registerMappingDirty,\n} from './biomarkerRowSaveState';",
        1,
    )
if "rowMappingBaselinesRef" not in section:
    section = section.replace(
        "  const [pendingMappingRowIds, setPendingMappingRowIds] = useState<Set<string>>(\n    new Set(),\n  );",
        "  const [pendingMappingRowIds, setPendingMappingRowIds] = useState<Set<string>>(\n    new Set(),\n  );\n  const pendingMappingRowIdsRef = useRef<Set<string>>(new Set());\n  const rowMappingBaselinesRef = useRef<Record<string, string>>({});\n  const prevReviewHydratingRef = useRef(reviewHydrating);",
        1,
    )
if "commitRowMappingBaseline" not in section:
    section = section.replace(
        "  const handleMappingDirtyChange = (biomarkerId: string, dirty: boolean) => {",
        """  const commitRowMappingBaseline = (
    biomarkerId: string,
    systemBiomarker: string,
  ) => {
    const id = String(biomarkerId || '').trim();
    if (!id) return;
    rowMappingBaselinesRef.current = {
      ...rowMappingBaselinesRef.current,
      [id]: String(systemBiomarker || '').trim(),
    };
  };

  const getRowMappingBaseline = (biomarkerId: string) =>
    rowMappingBaselinesRef.current[String(biomarkerId || '').trim()] ?? '';

  const handleMappingDirtyChange = (biomarkerId: string, dirty: boolean) => {""",
        1,
    )
old_dirty = """  const handleMappingDirtyChange = (biomarkerId: string, dirty: boolean) => {
    if (!biomarkerId) return;
    setPendingMappingRowIds((prev) => {
      const next = new Set(prev);
      if (dirty) {
        next.add(biomarkerId);
      } else {
        next.delete(biomarkerId);
      }
      return next;
    });
  };"""
new_dirty = """  const handleMappingDirtyChange = (biomarkerId: string, dirty: boolean) => {
    if (!biomarkerId) return;
    setPendingMappingRowIds((prev) => {
      const next = registerMappingDirty(prev, biomarkerId, dirty);
      pendingMappingRowIdsRef.current = next;
      return next;
    });
  };"""
if old_dirty in section:
    section = section.replace(old_dirty, new_dirty)
section = section.replace(
    "    setPendingMappingRowIds(new Set());\n    previousRowErrorKeysRef.current = [];",
    "    setPendingMappingRowIds(new Set());\n    pendingMappingRowIdsRef.current = new Set();\n    rowMappingBaselinesRef.current = {};\n    previousRowErrorKeysRef.current = [];",
    1,
)
hydration_effect = """
  useEffect(() => {
    const wasHydrating = prevReviewHydratingRef.current;
    prevReviewHydratingRef.current = reviewHydrating;
    if (!useReviewUx || wasHydrating !== true || reviewHydrating !== false) {
      return;
    }
    rowMappingBaselinesRef.current = applyHydrationMappingBaselines(
      biomarkers,
      rowMappingBaselinesRef.current,
      pendingMappingRowIdsRef.current,
    );
  }, [useReviewUx, reviewHydrating, biomarkers]);

"""
if "applyHydrationMappingBaselines(" not in section:
    anchor = "  }, [sessionFileId]);\n\n  useEffect(() => {\n    if (!useReviewUx || !sessionFileId) {"
    section = section.replace(anchor, "  }, [sessionFileId]);\n" + hydration_effect + "  useEffect(() => {\n    if (!useReviewUx || !sessionFileId) {", 1)
if "onRowMappingBaselineCommit" not in section:
    section = section.replace(
        "                            onMappingDirtyChange={(dirty) =>\n                              handleMappingDirtyChange(b.biomarker_id, dirty)\n                            }\n                            onRowReadySave={onRowReadySave}",
        "                            onMappingDirtyChange={(dirty) =>\n                              handleMappingDirtyChange(b.biomarker_id, dirty)\n                            }\n                            baselineSystemBiomarker={getRowMappingBaseline(\n                              b.biomarker_id,\n                            )}\n                            isUserMappingDirty={pendingMappingRowIds.has(\n                              b.biomarker_id,\n                            )}\n                            onRowMappingBaselineCommit={\n                              commitRowMappingBaseline\n                            }\n                            onRowReadySave={onRowReadySave}",
        1,
    )
section_path.write_text(section, encoding="utf-8")
print("Updated BiomarkersSection.tsx")

index_path = BASE / "index.tsx"
index = index_path.read_text(encoding="utf-8")
if "preserveBiomarkerIds" not in index:
    index = index.replace(
        "  ensureUniqueBiomarkerIds,\n  pinBiomarkerNameFields,",
        "  ensureUniqueBiomarkerIds,\n  preserveBiomarkerIds,\n  pinBiomarkerNameFields,",
        1,
    )
index = index.replace(
    "        setExtractedBiomarkers(displayRows);",
    "        setExtractedBiomarkers((prev) =>\n          sortReviewBiomarkerRows(preserveBiomarkerIds(prev, displayRows)),\n        );",
    1,
)
index = index.replace(
    "      setExtractedBiomarkers(displayRows);",
    "      setExtractedBiomarkers((prev) =>\n        sortReviewBiomarkerRows(preserveBiomarkerIds(prev, displayRows)),\n      );",
    1,
)
index_path.write_text(index, encoding="utf-8")
print("Updated index.tsx")

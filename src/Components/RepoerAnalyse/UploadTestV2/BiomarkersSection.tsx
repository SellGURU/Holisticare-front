/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Application from '../../../api/app';
import Select from '../../Select';
import SimpleDatePicker from '../../SimpleDatePicker';
import { publish, subscribe, unsubscribe } from '../../../utils/event';
import Toggle from '../Boxs/Toggle';
import BiomarkerRow from './BiomarkerRow';
import ProgressLoading from './ProgressLoading';
import Circleloader from '../../CircleLoader';
import Joyride, { CallBackProps, Step } from 'react-joyride';
import { TutorialReminderToast } from './showTutorialReminderToast';
import CreateBiomarkerModal from './CreateBiomarkerModal';
import CreateUnitModal from './CreateUnitModal';
import BiomarkersApi from '../../../api/Biomarkers';
import { showError } from '../../GlobalToast';
import type {
  BiomarkerOption,
  BiomarkerSuggestion,
} from '../../searchableSelect/SearchSelectWithSuggestions';
import useIsDemo from '../../../hooks/useIsDemo';
import {
  pinBiomarkerNameFields,
  resolveExactBiomarkerName,
  resolveNormalizedBiomarkerName,
} from './biomarkerNameFields';
import {
  isTextValueWithoutUnit,
  removeRowErrorKey,
  reviewRowErrorKey,
  categorizeReviewRow,
  countReviewRowCategories,
  getReviewRowMessage,
  rowMatchesCategoryFilter,
  buildSuppressedRowKey,
  buildSuppressionKeysForRow,
  buildSuppressedStateFromItems,
  mergeSuppressedRowsIntoReview,
  suppressedItemMatchesRow,
  inferRowBiomarkerType,
  normalizeBiomarkerNameForMatch,
  pickCatalogEntryForRow,
  resolveUnitForStandardize,
  type CategoryFilter,
  type SuppressedBiomarkerItem,
} from './biomarkerReviewCompat';

const DEFAULT_BIOMARKER_TYPES = [
  'blood',
  'urine',
  'dna',
  'gut',
  'saliva',
  'stool',
  'other',
];
const BIOMARKER_TYPE_LABELS: Record<string, string> = {
  blood: 'Blood',
  urine: 'Urine',
  dna: 'DNA',
  gut: 'Gut',
  saliva: 'Saliva',
  stool: 'Stool',
  other: 'Other',
};
const BIOMARKER_ROW_GRID =
  'minmax(180px,1.25fr) minmax(110px,0.8fr) minmax(220px,1.4fr) minmax(95px,0.7fr) minmax(110px,0.8fr) minmax(108px,1fr)';

const formatBiomarkerTypeLabel = (value: string) =>
  BIOMARKER_TYPE_LABELS[value] ||
  String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const biomarkersSteps: Step[] = [
  {
    target: '[data-tour="biomarker-table"]',
    content:
      'This table shows all biomarkers automatically extracted from the uploaded lab report.',
    placement: 'left-start',
  },
  {
    target: '[data-tour="extracted-biomarker"]',
    content:
      'This column displays the biomarker name detected from the uploaded document.',
  },
  {
    target: '[data-tour="system-biomarker"]',
    content:
      'Select the correct system biomarker. Its default system unit is shown there too so you can compare it against the extracted lab unit.',
  },
  {
    target: '[data-tour="extracted-value"]',
    content:
      'This is the value extracted from the lab report. Please verify its accuracy.',
  },
  {
    target: '[data-tour="extracted-unit"]',
    content:
      'Ensure the unit matches the original lab report before proceeding.',
  },
  {
    target: '[data-tour="delete-biomarker"]',
    content:
      'Use Exclude to move a biomarker off the analysis list, or Restore it from the Excluded filter.',
  },
];

interface BiomarkersSectionProps {
  biomarkers: any[];
  onChange: (updated: any[]) => void; // callback to update parent state
  uploadedFile: any;
  dateOfTest: Date | null;
  setDateOfTest: (date: Date | null) => void;
  fileType: string;
  loading: boolean;
  uploadPhase?: string;
  reviewSummary?: any;
  rowErrors?: any;
  setrowErrors: any;
  showOnlyErrors?: boolean;
  setShowOnlyErrors?: (showOnlyErrors: boolean) => void;
  progressBiomarkerUpload: number;
  useReviewUx?: boolean;
  onReviewCountsChange?: (counts: {
    ready: number;
    review: number;
    excluded: number;
  }) => void;
  onSuppressedSetChange?: (keys: Set<string>) => void;
  extractedCount?: number;
  reopeningExistingFile?: boolean;
  reviewCatalog?: BiomarkerOption[];
  onReviewCatalogRefresh?: () => void;
  isEditMode?: boolean;
  recheckLoading?: boolean;
  compileState?: 'idle' | 'saving' | 'done' | 'error';
  onRowReadySave?: (row: any) => void;
  reviewHydrating?: boolean;
  onDirtyIdsChange?: (ids: string[]) => void;
}

const BiomarkersSection: React.FC<BiomarkersSectionProps> = ({
  biomarkers,
  fileType,
  onChange,
  uploadedFile,
  dateOfTest,
  setDateOfTest,
  loading,
  uploadPhase,
  reviewSummary,
  rowErrors,
  setrowErrors,
  showOnlyErrors = false,
  setShowOnlyErrors,
  progressBiomarkerUpload,
  useReviewUx = false,
  onReviewCountsChange,
  onSuppressedSetChange,
  extractedCount,
  reopeningExistingFile = false,
  reviewCatalog = [],
  onReviewCatalogRefresh,
  isEditMode,
  recheckLoading = false,
  compileState = 'idle',
  onRowReadySave,
  reviewHydrating = false,
  onDirtyIdsChange,
}) => {
  const isDemo = useIsDemo();

  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const markDirty = (id: string) => {
    if (!id) return;
    setDirtyIds((prev) => {
      if (prev.has(id)) return prev;
      return new Set(prev).add(id);
    });
  };
  const clearDirtyIds = () => setDirtyIds(new Set());

  // Propagate dirty ids to parent
  useEffect(() => {
    onDirtyIdsChange?.(Array.from(dirtyIds));
  }, [dirtyIds, onDirtyIdsChange]);

  // Clear dirty tracking after a successful re-check (recheckLoading flips false)
  const prevRecheckLoading = useRef(recheckLoading);
  useEffect(() => {
    if (prevRecheckLoading.current && !recheckLoading) {
      clearDirtyIds();
    }
    prevRecheckLoading.current = recheckLoading;
  }, [recheckLoading]);

  // Clear dirty tracking after save
  const prevCompileState = useRef(compileState);
  useEffect(() => {
    if (prevCompileState.current !== 'done' && compileState === 'done') {
      clearDirtyIds();
    }
    prevCompileState.current = compileState;
  }, [compileState]);

  // const [changedRows, setChangedRows] = useState<string[]>([]);
  // const [mappedRows, setMappedRows] = useState<string[]>([]);
  // const [mappingStatus, setMappingStatus] = useState<
  //   Record<string, 'added' | 'removed' | null>
  // >({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentRowErrors = rowErrors || {};
  const rowErrorEntries = Object.entries(currentRowErrors);
  const activeErrorCount = rowErrorEntries.length;
  const preferNonEmpty = (...values: any[]) => {
    const found = values.find(
      (value) =>
        value !== undefined && value !== null && String(value).trim() !== '',
    );
    return found ?? '';
  };

  const getRowDisplayName = (index: number) => {
    const row = biomarkers[index] || {};
    return (
      resolveExactBiomarkerName(row) || row.biomarker || `Row ${index + 1}`
    );
  };

  const formatRowError = (row: any, message: string) => {
    const name = row?.original_biomarker_name || row?.biomarker || 'This row';
    const text = String(message || 'Invalid biomarker');
    if (text.toLowerCase().startsWith(String(name).toLowerCase())) {
      return text;
    }

    const value = preferNonEmpty(row?.original_value, row?.value);
    const unit = row?.original_unit ?? row?.unit;
    const context = [
      value !== undefined && value !== null && String(value).trim() !== ''
        ? `value "${value}"`
        : null,
      unit !== undefined && unit !== null && String(unit).trim() !== ''
        ? `unit "${unit}"`
        : null,
    ]
      .filter(Boolean)
      .join(', ');

    return `${name}${context ? ` (${context})` : ''}: ${text}`;
  };

  const handleValueChange = (id: string, newValue: string) => {
    if (isDemo) return;
    markDirty(id);
    // update local state immediately so UI feels responsive
    const updated = biomarkers.map((b) =>
      b.biomarker_id === id ? { ...b, original_value: newValue } : b,
    );
    onChange(updated);

    // clear previous timer if user is still typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // set new timer (3s)
    typingTimeoutRef.current = setTimeout(() => {
      updateAndStandardize(id, { original_value: newValue });
    }, 3000);
  };

  // Commit immediately (blur / Enter) instead of waiting for the 3s debounce.
  const commitValueChange = (id: string, newValue: string) => {
    if (isDemo) return;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    updateAndStandardize(id, { original_value: newValue });
  };
  // const handleValueChange = (index: number, newValue: number | string) => {
  //   const updated = biomarkers.map((b, i) =>
  //     i === index ? { ...b, original_value: newValue } : b,
  //   );
  //   onChange(updated);
  // };

  // const handleNameChange = (index: number, newName: string) => {
  //   const updated = biomarkers.map((b, i) =>
  //     i === index ? { ...b, biomarker: newName } : b,
  //   );
  //   onChange(updated);
  // };

  // const handleUnitChange = (index: number, newUnit: string) => {
  //   const updated = biomarkers.map((b, i) =>
  //     i === index ? { ...b, original_unit: newUnit } : b,
  //   );
  //   onChange(updated);
  // };

  // const handleTrashClick = (indexToUpdate: number) => {
  //   const updated = biomarkers.map((b, i) =>
  //     i === indexToUpdate ? { ...b, status: 'confirm' } : b,
  //   );
  //   onChange(updated);
  // };
  const deletedIndexRef = useRef<number | null>(null);

  const handleConfirm = (indexToDelete: number) => {
    if (isDemo) return;
    const deletedRow = biomarkers[indexToDelete];
    const deletedRowKey = deletedRow
      ? reviewRowErrorKey(deletedRow, indexToDelete)
      : '';
    deletedIndexRef.current = indexToDelete;

    const updated = biomarkers.filter((_, i) => i !== indexToDelete);
    if (updated.length === 0) {
      publish('DELETE_FILE_TRIGGER', {});
    }
    onChange(updated);

    if (deletedRowKey) {
      setrowErrors((prev: Record<string, string>) =>
        removeRowErrorKey(prev || {}, deletedRowKey),
      );
    }
  };

  // const handleCancel = (indexToUpdate: number) => {
  //   const updated = biomarkers.map((b, i) =>
  //     i === indexToUpdate ? { ...b, status: 'default' } : b,
  //   );
  //   onChange(updated);
  // };
  const dnaOptions = [
    'Moderately Compromised Outcome',
    'Enhanced Outcome',
    'Compromised Outcome',
    'Moderately Enhanced Outcome',
  ];
  const effectiveCatalog = reviewCatalog;
  const [biomarkerTypes, setBiomarkerTypes] = useState<string[]>(
    DEFAULT_BIOMARKER_TYPES,
  );
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>('default');
  const [suppressedSet, setSuppressedSet] = useState<Set<string>>(new Set());
  const [suppressedItems, setSuppressedItems] = useState<
    SuppressedBiomarkerItem[]
  >([]);
  const [suppressedMeta, setSuppressedMeta] = useState<
    Record<string, { reason?: string; excludedAt?: string }>
  >({});
  const categoryFilterInitialized = useRef(false);
  const [pendingMappingRowIds, setPendingMappingRowIds] = useState<Set<string>>(
    new Set(),
  );
  const previousRowErrorKeysRef = useRef<string[]>([]);
  const extractionSuccessFileRef = useRef<string | null>(null);
  const [showExtractionSuccess, setShowExtractionSuccess] = useState(false);
  const [suppressedHydrated, setSuppressedHydrated] = useState(!useReviewUx);

  const handleMappingDirtyChange = (biomarkerId: string, dirty: boolean) => {
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
  };

  const formatExcludedDate = (iso?: string | null) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const syncSuppressedFromApi = (items: SuppressedBiomarkerItem[]) => {
    const { suppressedSet: nextSet, suppressedMeta: nextMeta } =
      buildSuppressedStateFromItems(items, formatExcludedDate);
    setSuppressedItems(items || []);
    setSuppressedSet(nextSet);
    setSuppressedMeta(nextMeta);
    onSuppressedSetChange?.(nextSet);
  };

  const sessionFileId = uploadedFile?.file_id;

  useEffect(() => {
    if (
      !useReviewUx ||
      loading ||
      recheckLoading ||
      reopeningExistingFile ||
      isEditMode ||
      reviewHydrating ||
      !sessionFileId ||
      !biomarkers.length ||
      extractionSuccessFileRef.current === sessionFileId
    ) {
      return;
    }

    extractionSuccessFileRef.current = sessionFileId;
    setShowExtractionSuccess(true);
    const timeoutId = setTimeout(() => {
      setShowExtractionSuccess(false);
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, [
    useReviewUx,
    loading,
    recheckLoading,
    reopeningExistingFile,
    isEditMode,
    reviewHydrating,
    sessionFileId,
    biomarkers.length,
  ]);

  useEffect(() => {
    categoryFilterInitialized.current = false;
    setCategoryFilter('review');
    setPendingMappingRowIds(new Set());
    previousRowErrorKeysRef.current = [];
  }, [sessionFileId]);

  useEffect(() => {
    if (!useReviewUx || !sessionFileId) {
      setSuppressedHydrated(true);
      return;
    }
    setSuppressedHydrated(false);
    Application.listSuppressedBiomarkers()
      .then((res) => syncSuppressedFromApi(res?.data?.suppressed || []))
      .catch(() => {})
      .finally(() => setSuppressedHydrated(true));
  }, [useReviewUx, sessionFileId]);

  const reviewMetadataPending =
    useReviewUx && (reviewHydrating || !suppressedHydrated);

  const reviewBiomarkers = useMemo(
    () => mergeSuppressedRowsIntoReview(biomarkers, suppressedItems),
    [biomarkers, suppressedItems],
  );

  const reviewCategoryCounts = useMemo(
    () =>
      countReviewRowCategories(
        reviewBiomarkers,
        currentRowErrors,
        suppressedSet,
      ),
    [reviewBiomarkers, currentRowErrors, suppressedSet],
  );

  useEffect(() => {
    onReviewCountsChange?.(reviewCategoryCounts);
  }, [onReviewCountsChange, reviewCategoryCounts]);

  useEffect(() => {
    if (!useReviewUx || categoryFilterInitialized.current) return;
    if (!reviewBiomarkers.length || reviewMetadataPending) return;
    categoryFilterInitialized.current = true;
    setCategoryFilter(reviewCategoryCounts.review > 0 ? 'review' : 'ready');
  }, [
    useReviewUx,
    reviewBiomarkers.length,
    reviewCategoryCounts.review,
    reviewMetadataPending,
  ]);

  const rowCategoryResults = useMemo(
    () =>
      reviewBiomarkers.map((row, index) =>
        categorizeReviewRow(row, currentRowErrors, suppressedSet, index),
      ),
    [reviewBiomarkers, currentRowErrors, suppressedSet],
  );

  const handleExcludeReviewRow = async (row: any) => {
    if (isDemo) return;
    markDirty(row?.biomarker_id);
    const extractedName =
      resolveExactBiomarkerName(row) ||
      row.original_biomarker_name ||
      row.biomarker ||
      '';
    const biomarkerType = inferRowBiomarkerType(row);
    try {
      const res = await Application.suppressBiomarker({
        extracted_name: extractedName,
        system_biomarker: row.biomarker || null,
        biomarker_type: biomarkerType,
        reason: 'Excluded manually',
      });
      const rowKey = buildSuppressedRowKey(row);
      setSuppressedSet((prev) => {
        const next = new Set(prev);
        next.add(rowKey);
        onSuppressedSetChange?.(next);
        return next;
      });
      setSuppressedMeta((prev) => ({
        ...prev,
        [rowKey]: {
          reason: 'Excluded manually',
          excludedAt: formatExcludedDate(res?.data?.excluded_at),
        },
      }));
      setSuppressedItems((prev) => [
        ...prev.filter((item) => !suppressedItemMatchesRow(item, row)),
        {
          id: res?.data?.id,
          extracted_name: extractedName,
          system_biomarker: row.biomarker || null,
          biomarker_type: biomarkerType,
          reason: 'Excluded manually',
          excluded_at: res?.data?.excluded_at,
        },
      ]);
    } catch (err) {
      console.error('Failed to exclude biomarker:', err);
      showError(
        'Could not exclude biomarker',
        'Please try again or contact support.',
      );
    }
  };

  const handleRestoreExcludedRow = async (row: any) => {
    if (isDemo) return;
    markDirty(row?.biomarker_id);
    const matchedItem = suppressedItems.find((item) =>
      suppressedItemMatchesRow(item, row),
    );
    const extractedName =
      matchedItem?.extracted_name ||
      resolveExactBiomarkerName(row) ||
      row.original_biomarker_name ||
      row.biomarker ||
      '';
    const biomarkerType = inferRowBiomarkerType(row);
    const suppressionKeys = buildSuppressionKeysForRow(row);
    try {
      const res = await Application.unsuppressBiomarker({
        extracted_name: extractedName,
        biomarker_type: biomarkerType,
      });
      if (res?.data?.status === 'not_found') {
        showError(
          'Could not restore biomarker',
          'No exclusion record found for this row. Refreshing the list.',
        );
        const listRes = await Application.listSuppressedBiomarkers();
        syncSuppressedFromApi(listRes?.data?.suppressed || []);
        return;
      }
      setSuppressedSet((prev) => {
        const next = new Set(prev);
        suppressionKeys.forEach((key) => next.delete(key));
        onSuppressedSetChange?.(next);
        return next;
      });
      setSuppressedMeta((prev) => {
        const next = { ...prev };
        suppressionKeys.forEach((key) => {
          delete next[key];
        });
        return next;
      });
      setSuppressedItems((prev) =>
        prev.filter((item) => !suppressedItemMatchesRow(item, row)),
      );
      if (row.is_suppressed_only) {
        const { is_suppressed_only: _phantom, ...restoredRow } = row;
        onChange([...biomarkers, restoredRow]);
      }
    } catch (err) {
      console.error('Failed to restore biomarker:', err);
      showError(
        'Could not restore biomarker',
        'Please try again or contact support.',
      );
    }
  };

  const getDefaultUnitForBiomarker = (row: any) => {
    const biomarkerName = String(row?.biomarker || '')
      .trim()
      .toLowerCase();
    if (
      !biomarkerName ||
      isTextValueWithoutUnit(preferNonEmpty(row?.original_value, row?.value))
    ) {
      return '';
    }

    const extractedUnit = String(
      preferNonEmpty(row?.original_unit, row?.unit) || '',
    ).trim();
    if (extractedUnit) {
      return extractedUnit;
    }

    const possibleUnit = String(row?.possible_values?.units?.[0] || '').trim();
    if (possibleUnit) {
      return possibleUnit;
    }

    const exactOption = pickCatalogEntryForRow(effectiveCatalog, row);
    return String(exactOption?.unit || '').trim();
  };

  useEffect(() => {
    BiomarkersApi.getBiomarkerTypes()
      .then((res) => {
        const nextTypes = res?.data?.types;
        if (Array.isArray(nextTypes) && nextTypes.length > 0) {
          setBiomarkerTypes(nextTypes.map((type: any) => String(type)));
        }
      })
      .catch(() => {});
  }, []);

  // ── Suggestions state (keyed by stable row id, not biomarker name) ─────────
  const [suggestions, setSuggestions] = useState<
    Record<
      string,
      { matches: BiomarkerSuggestion[]; no_match_reason?: string | null }
    >
  >({});
  const [suggestionsLoading, setSuggestionsLoading] = useState<
    Record<string, boolean>
  >({});

  const fetchBiomarkerSuggestions = async (rows: any[]) => {
    const unresolvedRows = rows
      .map((row: any) => ({
        cache_key:
          row.biomarker_id ||
          `${row.original_biomarker_name || row.biomarker || ''}-${row.original_value || row.value || ''}-${row.original_unit || row.unit || ''}`,
        extracted_name: resolveExactBiomarkerName(row) || row.biomarker || '',
        normalized_name:
          resolveNormalizedBiomarkerName(row) || row.biomarker || '',
        extracted_value: String(preferNonEmpty(row.original_value, row.value)),
        extracted_unit: row.original_unit ?? row.unit ?? '',
        biomarker_type: row.biomarker_type || '',
      }))
      .filter((row: any) => row.extracted_name);

    const uncachedRows = unresolvedRows.filter(
      (row: any) =>
        !suggestions[row.cache_key] && !suggestionsLoading[row.cache_key],
    );

    if (uncachedRows.length === 0) return;

    setSuggestionsLoading((prev) => {
      const next = { ...prev };
      uncachedRows.forEach((row: any) => {
        next[row.cache_key] = true;
      });
      return next;
    });

    try {
      const suggestionRequestRows = uncachedRows.map((row: any) => ({
        extracted_name: row.extracted_name,
        normalized_name: row.normalized_name,
        extracted_value: row.extracted_value,
        extracted_unit: row.extracted_unit,
        biomarker_type: row.biomarker_type,
      }));
      const res = await Application.suggestBiomarkerMappings({
        biomarkers: suggestionRequestRows,
      });
      if (res?.data?.suggestions) {
        setSuggestions((prev) => {
          const next = { ...prev };
          uncachedRows.forEach((row: any) => {
            const rowSuggestion = res.data.suggestions[row.extracted_name];
            if (rowSuggestion) {
              next[row.cache_key] = rowSuggestion;
            }
          });
          return next;
        });
      }
    } catch {
      // Suggestions are non-critical; silently ignore failures
    } finally {
      setSuggestionsLoading((prev) => {
        const next = { ...prev };
        uncachedRows.forEach((row: any) => {
          delete next[row.cache_key];
        });
        return next;
      });
    }
  };

  // Reset suggestion cache whenever biomarkers change (new upload)
  useEffect(() => {
    setSuggestions({});
    setSuggestionsLoading({});
  }, [biomarkers.length]);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [createBiomarkerFor, setCreateBiomarkerFor] = useState<{
    biomarkerId: string;
    extractedName: string;
    extractedValue: string;
    extractedUnit: string;
    uploadedReferenceRange: string;
    suggestionMatches: BiomarkerSuggestion[];
  } | null>(null);

  const [createUnitFor, setCreateUnitFor] = useState<{
    biomarkerId: string;
    biomarkerName: string;
    extractedUnit: string;
    extractedValue: string;
    systemUnit: string;
    suggestionMatches: BiomarkerSuggestion[];
  } | null>(null);
  const gutOptions = ['Good for GUT', 'Bad for GUT'];
  const renderValueField = (b: any) => {
    if (fileType.toLowerCase() === 'dna') {
      return (
        <Select
          isSmall
          isSetting
          value={preferNonEmpty(b.original_value, b.value)}
          options={dnaOptions}
          onChange={(val: string) =>
            updateAndStandardize(b.biomarker_id, { original_value: val })
          }
        />
      );
    } else if (fileType.toLowerCase() === 'gut') {
      return (
        <Select
          isSmall
          isSetting
          value={preferNonEmpty(b.original_value, b.value)}
          options={gutOptions}
          onChange={(val: string) =>
            updateAndStandardize(b.biomarker_id, { original_value: val })
          }
        />
      );
    } else {
      return (
        <input
          type="text"
          value={preferNonEmpty(b.original_value, b.value)}
          className="text-center border border-Gray-50 w-[70px] md:w-[95px] outline-none rounded-md text-[8px] md:text-[12px] text-Text-Primary px-2 md:py-1 transition-colors focus:border-Primary-DeepTeal focus:ring-1 focus:ring-Primary-DeepTeal/30"
          disabled={isDemo}
          title={
            isDemo
              ? 'Demo version cannot add or edit data. Upgrade for full access.'
              : undefined
          }
          onChange={(e) => handleValueChange(b.biomarker_id, e.target.value)}
          onBlur={(e) => commitValueChange(b.biomarker_id, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        />
      );
    }
  };
  React.useEffect(() => {
    const updated = biomarkers.map((b) => {
      if (isTextValueWithoutUnit(preferNonEmpty(b.original_value, b.value))) {
        return b.original_unit === '' ? b : { ...b, original_unit: '' };
      }
      const extractedUnit = String(
        preferNonEmpty(b.original_unit, b.unit) || '',
      ).trim();
      if (!extractedUnit) {
        if (b.possible_values?.units?.length === 1) {
          return { ...b, original_unit: b.possible_values.units[0] };
        }
        const defaultUnit = getDefaultUnitForBiomarker(b);
        if (defaultUnit) {
          return { ...b, original_unit: defaultUnit };
        }
        return b;
      }
      if (!b.original_unit || b.original_unit === '') {
        return { ...b, original_unit: extractedUnit };
      }
      return b;
    });

    // only update if something actually changed
    if (JSON.stringify(updated) !== JSON.stringify(biomarkers)) {
      onChange(updated);
    }
  }, [effectiveCatalog, biomarkers, onChange]);
  const standardizeBiomarkers = async (payload: {
    biomarker: string;
    value: string;
    unit: string;
    bio_type: string;
  }): Promise<
    { success: true; data: any } | { success: false; error: string }
  > => {
    try {
      const res = await Application.standardizeBiomarkers(payload);
      return { success: true, data: res.data };
    } catch (err: any) {
      // Axios interceptor rejects with error.response.data directly, so err is {detail: "..."}
      // Handle multiple possible error structures
      let errorMessage = 'Standardization failed';
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.detail) {
        errorMessage = err.detail;
      } else if (err?.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      console.error('standardizeBiomarkers error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateAndStandardize = async (
    id: string,
    updatedField: Partial<any>,
  ) => {
    markDirty(id);
    // update local state immediately
    let updated = biomarkers.map((b) =>
      b.biomarker_id === id
        ? pinBiomarkerNameFields(
            {
              ...b,
              normalized_biomarker_name:
                b.normalized_biomarker_name ||
                resolveNormalizedBiomarkerName(b),
              ...updatedField,
            },
            b,
          )
        : b,
    );

    // Find the index for this biomarker (needed for rowErrors)
    const index = updated.findIndex((b) => b.biomarker_id === id);

    let current = updated.find((b) => b.biomarker_id === id);
    if (!current) {
      onChange(updated);
      return;
    }
    if (
      Object.keys(updatedField).length === 1 &&
      Object.prototype.hasOwnProperty.call(updatedField, 'biomarker_type')
    ) {
      onChange(updated);
      return;
    }
    const textValueDoesNotNeedUnit = isTextValueWithoutUnit(
      preferNonEmpty(current.original_value, current.value),
    );
    if (textValueDoesNotNeedUnit && current.original_unit !== '') {
      current = { ...current, original_unit: '' };
      updated = updated.map((b) =>
        b.biomarker_id === id ? { ...b, original_unit: '' } : b,
      );
    }

    const isInCatalogForType = effectiveCatalog.some(
      (option) =>
        normalizeBiomarkerNameForMatch(option.biomarker) ===
          normalizeBiomarkerNameForMatch(current.biomarker) &&
        String(option.biomarker_type || 'blood').toLowerCase() ===
          String(current.biomarker_type || 'blood').toLowerCase(),
    );

    // Show selection immediately while standardize runs in the background.
    onChange(updated);

    const rowKey = reviewRowErrorKey(current, index);

    if (!String(current.biomarker || '').trim() || !isInCatalogForType) {
      if (rowKey) {
        setrowErrors((prev: Record<string, string>) => ({
          ...prev,
          [rowKey]: formatRowError(
            current,
            'Please select a valid system biomarker for this type and extracted value.',
          ),
        }));
      }
      updated = updated.map((b) =>
        b.biomarker_id === id ? { ...b, review_error_handled: false } : b,
      );
      onChange(updated);
      return;
    }

    if (rowKey) {
      setrowErrors((prev: Record<string, string>) =>
        removeRowErrorKey(prev, rowKey),
      );
    }

    const rawValue = String(
      preferNonEmpty(current.original_value, current.value),
    );
    const unitForStandardize = textValueDoesNotNeedUnit
      ? ''
      : resolveUnitForStandardize(effectiveCatalog, current);

    if (
      !textValueDoesNotNeedUnit &&
      unitForStandardize &&
      unitForStandardize !==
        String(preferNonEmpty(current.original_unit, current.unit) || '').trim()
    ) {
      current = { ...current, original_unit: unitForStandardize };
      updated = updated.map((b) =>
        b.biomarker_id === id ? { ...b, original_unit: unitForStandardize } : b,
      );
      onChange(updated);
    }

    const payload = {
      biomarker: current.biomarker,
      value: rawValue,
      unit: unitForStandardize,
      bio_type:
        current.biomarker_type === 'gut'
          ? 'gut'
          : current.biomarker_type === 'dna'
            ? 'dna'
            : 'more_info',
      biomarker_type: String(current.biomarker_type || 'blood'),
    };

    const hadExistingError = Boolean(rowKey && currentRowErrors[rowKey]);
    const result = await standardizeBiomarkers(payload);

    if (result.success) {
      if (rowKey) {
        setrowErrors((prev: Record<string, string>) =>
          removeRowErrorKey(prev, rowKey),
        );
      }
      const prior = biomarkers.find((b) => b.biomarker_id === id) || current;
      updated = updated.map((b) =>
        b.biomarker_id === id
          ? pinBiomarkerNameFields(
              {
                ...b,
                ...result.data,
                // Keep the row's stable id; the standardize response derives
                // biomarker_id from content and could otherwise collide with
                // another row sharing a base name (e.g. "Neutrophils" vs
                // "Neutrophils %") and edit both rows at once.
                biomarker_id: id,
                review_error_handled: hadExistingError,
              },
              prior,
            )
          : b,
      );
    } else {
      if (rowKey) {
        const row = updated.find((b) => b.biomarker_id === id) || current;
        setrowErrors((prev: Record<string, string>) => ({
          ...prev,
          [rowKey]: formatRowError(row, result.error),
        }));
      }
      updated = updated.map((b) =>
        b.biomarker_id === id ? { ...b, review_error_handled: false } : b,
      );
    }

    onChange(updated);
  };
  // const [unitOptions, setUnitOptions] = React.useState<
  //   Record<number, string[]>
  // >({});

  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tableRef = useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const currentKeys = Object.keys(rowErrors || {});
    const previousKeys = previousRowErrorKeysRef.current;
    const addedKeys = currentKeys.filter((key) => !previousKeys.includes(key));
    previousRowErrorKeysRef.current = currentKeys;

    if (addedKeys.length === 0) {
      return;
    }

    const firstErrorKey = addedKeys[0];
    const targetIndex = biomarkers.findIndex(
      (row, index) => reviewRowErrorKey(row, index) === firstErrorKey,
    );
    if (targetIndex < 0) {
      return;
    }
    const el = rowRefs.current[targetIndex];
    const container = tableRef.current;

    if (el && container) {
      const elTop = el.offsetTop;
      container.scrollTo({
        top: elTop - container.clientHeight / 2,
        behavior: 'smooth',
      });
    }
  }, [rowErrors, biomarkers]);
  useEffect(() => {
    if (deletedIndexRef.current !== null) {
      const index = deletedIndexRef.current;
      deletedIndexRef.current = null; // reset

      // Scroll to the same index or the closest one that still exists
      const targetIndex =
        index < biomarkers.length ? index : biomarkers.length - 1;

      const el = rowRefs.current[targetIndex];
      const container = tableRef.current;

      if (el && container) {
        container.scrollTo({
          top: el.offsetTop - container.clientHeight / 2, // scroll to center that row
          behavior: 'smooth',
        });
      }
    }
  }, [biomarkers]);
  const visibleBiomarkerEntries = useMemo(
    () =>
      reviewBiomarkers
        .map((biomarker, originalIndex) => ({ biomarker, originalIndex }))
        .filter(({ biomarker, originalIndex }) => {
          const typeOk =
            !typeFilter ||
            String(biomarker?.biomarker_type || 'blood')
              .trim()
              .toLowerCase() === String(typeFilter).trim().toLowerCase();
          if (!typeOk) return false;

          if (useReviewUx) {
            if (pendingMappingRowIds.has(biomarker.biomarker_id)) {
              return true;
            }
            const category =
              rowCategoryResults[originalIndex]?.category || 'ready';
            return rowMatchesCategoryFilter(
              categoryFilter,
              category,
              reviewCategoryCounts.review,
            );
          }

          if (showOnlyErrors) {
            const rowKey = reviewRowErrorKey(biomarker, originalIndex);
            return Boolean(currentRowErrors[rowKey]);
          }
          return true;
        }),
    [
      reviewBiomarkers,
      typeFilter,
      useReviewUx,
      rowCategoryResults,
      categoryFilter,
      reviewCategoryCounts.review,
      pendingMappingRowIds,
      showOnlyErrors,
      currentRowErrors,
    ],
  );
  // const handleMappingToggle = async (id: string) => {
  //   const row = biomarkers.filter((b) => b.biomarker_id === id)[0];
  //   const extracted = row.original_biomarker_name;
  //   const system = row.biomarker;

  //   if (!extracted || !system) {
  //     console.warn('Missing biomarker names for mapping');
  //     return;
  //   }

  //   try {
  //     if (mappedRows.includes(id)) {
  //       // 🔴 Remove mapping
  //       await Application.remove_mapping({
  //         extracted_biomarker: extracted,
  //         system_biomarker: system,
  //       });
  //       setMappedRows((prev) => prev.filter((i) => i !== id));

  //       // Show red div for 5 seconds
  //       setMappingStatus((prev) => ({ ...prev, [id]: 'removed' }));
  //       setTimeout(() => {
  //         setMappingStatus((prev) => ({ ...prev, [id]: null }));
  //       }, 5000);
  //     } else {
  //       // 🟢 Add mapping
  //       await Application.add_mapping({
  //         extracted_biomarker: extracted,
  //         system_biomarker: system,
  //       });
  //       setMappedRows((prev) => [...prev, id]);

  //       // Show green div for 5 seconds
  //       setMappingStatus((prev) => ({ ...prev, [id]: 'added' }));
  //       setTimeout(() => {
  //         setMappingStatus((prev) => ({ ...prev, [id]: null }));
  //       }, 5000);
  //     }
  //   } catch (err) {
  //     console.error('Mapping toggle failed:', err);
  //   }
  // };
  useEffect(() => {
    const listener = () => {
      // setMappedRows([]);
      // setChangedRows([]);
      // setMappingStatus({});
    };

    subscribe('RESET_MAPPING_ROWS', listener);

    return () => unsubscribe('RESET_MAPPING_ROWS', listener);
  }, []);
  // Tutorial (Joyride tour + reminder toast) is disabled for this screen.
  const [run, setRun] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [errorsExpanded, setErrorsExpanded] = useState(false);
  const handleViewTutorial = (value: boolean) => {
    if (value) {
      localStorage.setItem('showTutorialAgain', 'true');
    } else {
      localStorage.setItem('showTutorialAgain', 'false');
    }
  };
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === 'finished' || status === 'skipped') {
      localStorage.setItem('biomarkersTourSeen', 'true');
      setRun(false);
    }
  };

  const dismissTutorialReminder = () => {
    if (!showReminder) return;
    setShowReminder(false);
    localStorage.setItem('tutorialSeen', 'true');
  };

  return (
    <>
      {run && (
        <Joyride
          steps={biomarkersSteps}
          run={run}
          continuous
          scrollToFirstStep
          showSkipButton
          disableOverlayClose
          styles={{
            options: {
              arrowColor: '#fff',
              backgroundColor: '#fff',
              primaryColor: '#0f766e',
              textColor: '#1f2937',
              zIndex: 10000,
            },
            tooltip: {
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            },
          }}
          callback={handleJoyrideCallback}
          locale={{
            last: 'Done',
          }}
        />
      )}
      <TutorialReminderToast
        visible={showReminder}
        onViewTutorial={(value) => {
          handleViewTutorial(value);
          setRun(value);
        }}
        setRun={setRun}
        onClose={() => {
          setShowReminder(false);
          localStorage.setItem('tutorialSeen', 'true');
        }}
      />
      <div
        // style={{ height: window.innerHeight - 400 + 'px' }}
        className={`w-full flex-1 min-h-0 ${uploadedFile ? 'flex flex-col' : 'hidden'} rounded-2xl border border-Gray-50 p-2 md:p-3 shadow-300 text-xs text-Text-Primary overflow-hidden`}
        data-tour="biomarkers-section"
      >
        {uploadedFile?.status === 'error' ? (
          <div className="flex min-h-[240px] h-[clamp(240px,38vh,420px)] items-center justify-center flex-col px-4 text-center text-xs font-medium text-Text-Primary">
            <img src="/icons/EmptyState-biomarkers.svg" alt="" />
            <div className="-mt-5 text-red-500">
              {uploadedFile?.errorMessage ||
                'Failed to extract biomarkers from this file. Please try uploading it again.'}
            </div>
          </div>
        ) : isEditMode && loading && uploadedFile?.status !== 'uploading' ? (
          <div className="flex min-h-[240px] h-[clamp(240px,38vh,420px)] w-full flex-col items-center justify-center gap-4 px-4 text-center">
            <Circleloader />
            <div className="text-xs font-medium text-Text-Primary">
              Loading biomarkers…
            </div>
            <div className="text-[10px] text-Text-Quadruple">
              Fetching the saved data for this report.
            </div>
          </div>
        ) : loading ||
          recheckLoading ||
          uploadedFile?.status === 'uploading' ? (
          <div className="flex min-h-[240px] h-[clamp(240px,38vh,420px)] w-full flex-col items-center gap-5 overflow-hidden px-2 pt-6">
            {reopeningExistingFile || recheckLoading ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3">
                <Circleloader />
                {recheckLoading ? (
                  <div className="text-xs font-medium text-Text-Primary">
                    Re-checking biomarkers…
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <ProgressLoading
                  maxProgress={progressBiomarkerUpload}
                  phase={uploadPhase}
                  extractedCount={extractedCount}
                ></ProgressLoading>
                <div
                  aria-hidden
                  className="flex w-full flex-1 min-h-0 flex-col gap-1.5 overflow-hidden opacity-70"
                >
                  {Array.from({ length: 4 }).map((_, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="grid w-full items-center gap-3 rounded-lg border border-Gray-25 bg-Gray-15 px-3 py-2.5 animate-pulse"
                      style={{
                        gridTemplateColumns: '1.3fr 0.7fr 1.4fr 0.7fr 0.8fr',
                        animationDelay: `${rowIndex * 120}ms`,
                      }}
                    >
                      <div className="h-2.5 rounded bg-Gray-100" />
                      <div className="h-2.5 rounded bg-Gray-50" />
                      <div className="h-2.5 rounded bg-Gray-100" />
                      <div className="h-2.5 rounded bg-Gray-50" />
                      <div className="h-2.5 rounded bg-Gray-50" />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : reviewMetadataPending ? (
          <div className="flex min-h-[240px] h-[clamp(240px,38vh,420px)] w-full flex-col items-center justify-center gap-3 px-4 text-center">
            <Circleloader />
            <div className="text-xs font-medium text-Text-Primary">
              Preparing review grid…
            </div>
            <div className="text-[10px] text-Text-Quadruple">
              Loading review status and exclusions.
            </div>
          </div>
        ) : showExtractionSuccess ? (
          <div className="flex min-h-[240px] h-[clamp(240px,38vh,420px)] w-full flex-col items-center justify-center gap-3 px-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#DEF7EC]">
              <img
                src="/icons/tick-circle-green-new.svg"
                alt=""
                className="size-7"
              />
            </div>
            <div className="text-sm font-medium text-Text-Primary">
              {extractedCount ?? biomarkers.length} biomarkers extracted
            </div>
            <div className="text-[10px] text-Text-Quadruple">
              Preparing your review grid...
            </div>
          </div>
        ) : biomarkers.length === 0 ? (
          <div className="flex min-h-[240px] h-[clamp(240px,38vh,420px)] items-center justify-center flex-col text-xs font-medium text-Text-Primary">
            <img src="/icons/EmptyState-biomarkers.svg" alt="" />
            <div className="-mt-5">No data provided yet.</div>
          </div>
        ) : (
          <div className="relative flex-1 min-h-0 flex flex-col gap-2">
            {/* ── Compact single-row toolbar ───────────────────────────── */}
            <div className="shrink-0 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-Gray-50 bg-gradient-to-r from-[#F6FAFB] to-white px-3 py-2 shadow-100">
              {useReviewUx ? (
                <>
                  <span className="text-[10px] md:text-xs font-semibold text-Text-Primary whitespace-nowrap">
                    Biomarkers
                  </span>
                  <span className="text-[9px] md:text-[10px] text-Text-Secondary whitespace-nowrap">
                    {reviewCategoryCounts.ready} Ready ·{' '}
                    {reviewCategoryCounts.review} Review ·{' '}
                    {reviewCategoryCounts.excluded} Excluded
                  </span>
                  {compileState !== 'idle' ? (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] md:text-[10px] font-medium whitespace-nowrap ${
                        compileState === 'done'
                          ? 'bg-[#DEF7EC] text-green-800'
                          : compileState === 'error'
                            ? 'bg-[#FFF5F8] text-Red'
                            : 'bg-Primary-DeepTeal/10 text-Primary-DeepTeal'
                      }`}
                    >
                      {compileState === 'done'
                        ? 'Done'
                        : compileState === 'error'
                          ? 'Save/compile needs retry'
                          : 'Saving and compiling health plan...'}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('ready')}
                    className={`rounded-full px-2.5 py-0.5 text-[9px] md:text-[10px] font-medium transition-colors ${
                      categoryFilter === 'ready'
                        ? 'bg-[#DEF7EC] text-green-800 border border-green-200'
                        : 'bg-white text-Text-Secondary border border-Gray-50 hover:bg-Gray-15'
                    }`}
                  >
                    ✓ Ready ({reviewCategoryCounts.ready})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('review')}
                    className={`rounded-full px-2.5 py-0.5 text-[9px] md:text-[10px] font-medium transition-colors ${
                      categoryFilter === 'review' ||
                      categoryFilter === 'default'
                        ? 'bg-[#FFFBEB] text-[#B45309] border border-[#FCD34D]'
                        : 'bg-white text-Text-Secondary border border-Gray-50 hover:bg-Gray-15'
                    }`}
                  >
                    ⚠ Review ({reviewCategoryCounts.review})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('excluded')}
                    className={`rounded-full px-2.5 py-0.5 text-[9px] md:text-[10px] font-medium transition-colors ${
                      categoryFilter === 'excluded'
                        ? 'bg-Gray-50 text-Text-Secondary border border-Gray-100'
                        : 'bg-white text-Text-Secondary border border-Gray-50 hover:bg-Gray-15'
                    }`}
                  >
                    — Excluded ({reviewCategoryCounts.excluded})
                  </button>
                  {(reviewSummary?.duplicate_count ?? 0) > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[9px] md:text-[10px] text-orange-600 font-medium whitespace-nowrap">
                      {reviewSummary.duplicate_count} duplicate
                      {reviewSummary.duplicate_count !== 1 ? 's' : ''}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1.5 text-[10px] md:text-xs font-semibold text-Text-Primary whitespace-nowrap">
                    <span className="inline-flex size-5 items-center justify-center rounded-md bg-Primary-DeepTeal/10 text-Primary-DeepTeal">
                      <img
                        src="/icons/tick-circle-upload.svg"
                        alt=""
                        className="size-3.5"
                      />
                    </span>
                    Biomarkers
                    <span className="rounded-full bg-Gray-50 px-1.5 py-0.5 text-[9px] font-medium text-Text-Quadruple">
                      {reviewSummary?.biomarker_count ?? biomarkers.length}
                    </span>
                  </span>
                  {activeErrorCount > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-[#FFF5F8] border border-[#F3B8C8] px-2 py-0.5 text-[9px] md:text-[10px] text-Red font-medium whitespace-nowrap">
                      <img
                        src="/icons/info-circle-red.svg"
                        alt=""
                        className="size-3"
                      />
                      {activeErrorCount} error
                      {activeErrorCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  {(reviewSummary?.duplicate_count ?? 0) > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[9px] md:text-[10px] text-orange-600 font-medium whitespace-nowrap">
                      {reviewSummary.duplicate_count} duplicate
                      {reviewSummary.duplicate_count !== 1 ? 's' : ''}
                    </span>
                  )}
                </>
              )}

              <div className="flex-1" />

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="h-7 cursor-pointer rounded-lg border border-Gray-50 bg-white px-2 text-[9px] text-Text-Primary outline-none transition-colors hover:border-Gray-100 focus:border-Primary-DeepTeal md:text-[10px]"
              >
                <option value="">All types</option>
                {biomarkerTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatBiomarkerTypeLabel(type)}
                  </option>
                ))}
              </select>

              {!useReviewUx && setShowOnlyErrors ? (
                <div className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-Gray-50 bg-white px-2 py-1">
                  <Toggle
                    checked={showOnlyErrors}
                    setChecked={setShowOnlyErrors}
                  />
                  <span className="text-[9px] md:text-[10px] text-Text-Primary">
                    Errors only
                  </span>
                </div>
              ) : null}

              <div className="flex items-center text-[9px] md:text-[10px] text-Text-Quadruple whitespace-nowrap">
                Date of Test:
                <SimpleDatePicker
                  key={'biomarkerUpload'}
                  textStyle
                  isUploadFile
                  date={dateOfTest}
                  setDate={setDateOfTest}
                  placeholder="Select Date"
                  ClassName="ml-1.5 border border-Gray-50 !rounded-2xl px-2 py-0.5 text-Text-Primary"
                />
              </div>
            </div>

            {!useReviewUx && activeErrorCount > 0 && (
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => setErrorsExpanded((prev) => !prev)}
                  className="w-full flex items-center gap-2 rounded-xl border border-[#F3B8C8] bg-[#FFF5F8] px-3 py-1.5 text-left hover:bg-[#ffe9f0] transition-colors"
                >
                  <img
                    src="/icons/info-circle-red.svg"
                    alt=""
                    className="size-3.5 shrink-0"
                  />
                  <span className="flex-1 text-[9px] md:text-[10px] font-medium text-Red">
                    {activeErrorCount} error{activeErrorCount !== 1 ? 's' : ''}{' '}
                    to review
                  </span>
                  <img
                    src="/icons/arrow-down.svg"
                    alt=""
                    className={`size-3.5 shrink-0 transition-transform duration-200 ${errorsExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
                {errorsExpanded && (
                  <div className="mt-1 max-h-[120px] overflow-y-auto rounded-xl border border-[#F3B8C8] bg-[#FFF5F8] px-3 py-2 space-y-1.5 text-[9px] md:text-[10px] text-Text-Primary">
                    {rowErrorEntries.map(([key, error]) => {
                      const index = Number(key);
                      const row = biomarkers[index] || {};
                      const isHandled = Boolean(row.review_error_handled);
                      return (
                        <div
                          key={key}
                          className="flex flex-wrap items-center gap-x-2 gap-y-0.5"
                        >
                          <span className="font-medium">
                            {getRowDisplayName(index)}:
                          </span>
                          <span className="text-Text-Secondary">
                            {String(error)}
                          </span>
                          {isHandled && (
                            <span className="rounded-full bg-[#DEF7EC] px-2 py-0.5 text-[8px] font-medium text-green-700">
                              Mapped
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div
              className="relative flex flex-col flex-1 min-h-0 w-full min-w-0 text-xs border border-Gray-50 rounded-[12px] overflow-hidden shadow-100 bg-white"
              data-tour="biomarker-table"
            >
              <div className="flex-1 min-h-0 w-full overflow-x-auto overflow-y-hidden">
                <div className="w-full min-w-[820px] h-full flex flex-col min-h-0">
                  <div
                    ref={tableRef}
                    className="flex-1 min-h-0 overflow-y-auto w-full [scrollbar-gutter:stable]"
                  >
                    <div className="border-b border-Gray-50 bg-[#F8FAFB] px-4 py-2 text-[9px] leading-relaxed text-Text-Secondary">
                      {useReviewUx ? (
                        <>
                          <span className="font-medium text-Primary-DeepTeal">
                            Ready
                          </span>{' '}
                          rows are included in analysis. Use{' '}
                          <span className="font-medium text-Primary-DeepTeal">
                            Exclude
                          </span>{' '}
                          to move biomarkers off the list instead of deleting
                          them.
                        </>
                      ) : (
                        <>
                          Use{' '}
                          <span className="font-medium text-Primary-DeepTeal">
                            Save
                          </span>{' '}
                          to store the PDF name → system biomarker mapping for
                          future uploads.
                        </>
                      )}
                    </div>

                    {/* Table Header */}
                    <div
                      className="grid w-full sticky top-0 z-20 py-2.5 px-4 font-semibold uppercase tracking-wide text-Text-Secondary text-[8px] md:text-[10px] bg-gradient-to-b from-[#EDF3F5] to-[#E4EDF0] border-b border-Gray-100 shadow-[0_1px_2px_rgba(24,39,75,0.06)]"
                      style={{
                        gridTemplateColumns: BIOMARKER_ROW_GRID,
                      }}
                    >
                      <div
                        className="text-left"
                        data-tour="extracted-biomarker"
                      >
                        Extracted Biomarker
                      </div>
                      <div className="text-center">Type</div>
                      <div className="text-center" data-tour="system-biomarker">
                        System Biomarker
                      </div>
                      <div className="text-center" data-tour="extracted-value">
                        Extracted Value
                      </div>
                      <div className="text-center" data-tour="extracted-unit">
                        Extracted Unit
                      </div>
                      <div
                        className="text-center leading-tight"
                        data-tour="delete-biomarker"
                      >
                        <span className="block">Actions</span>
                        <span className="block font-normal normal-case tracking-normal text-[7px] text-Text-Quadruple">
                          {useReviewUx ? 'save / exclude' : 'save / delete'}
                        </span>
                      </div>
                    </div>

                    {visibleBiomarkerEntries.map(
                      ({ biomarker: b, originalIndex }) => {
                        const suggestionKey =
                          b.biomarker_id ||
                          `${b.original_biomarker_name || b.biomarker || ''}-${b.original_value || b.value || ''}-${b.original_unit || b.unit || ''}`;
                        const rowSuggestions = suggestions[suggestionKey];
                        const rowType = String(b.biomarker_type || 'blood')
                          .trim()
                          .toLowerCase();
                        const rowAvailableBiomarkers = effectiveCatalog.filter(
                          (option) =>
                            String(option.biomarker_type || 'blood')
                              .trim()
                              .toLowerCase() === rowType,
                        );
                        const selectedSystemMeta = effectiveCatalog.find(
                          (option) =>
                            normalizeBiomarkerNameForMatch(option.biomarker) ===
                              normalizeBiomarkerNameForMatch(b.biomarker) &&
                            String(option.biomarker_type || 'blood')
                              .trim()
                              .toLowerCase() === rowType,
                        );
                        const rowErrorKey = reviewRowErrorKey(b, originalIndex);
                        const categoryResult =
                          rowCategoryResults[originalIndex] ||
                          categorizeReviewRow(
                            b,
                            currentRowErrors,
                            suppressedSet,
                            originalIndex,
                          );
                        const excludedMetaEntry = buildSuppressionKeysForRow(b)
                          .map((key) => suppressedMeta[key])
                          .find(Boolean);
                        const reviewMessage = getReviewRowMessage(
                          categoryResult,
                          b,
                          currentRowErrors[rowErrorKey],
                        );
                        return (
                          <BiomarkerRow
                            key={b.biomarker_id}
                            refRenceEl={(el: any) =>
                              (rowRefs.current[originalIndex] = el)
                            }
                            isHaveError={Boolean(currentRowErrors[rowErrorKey])}
                            errorText={currentRowErrors[rowErrorKey]}
                            biomarker={b}
                            index={originalIndex}
                            showOnlyErrors={showOnlyErrors}
                            useReviewUx={useReviewUx}
                            rowCategory={categoryResult.category}
                            reviewMessage={reviewMessage}
                            excludedReason={excludedMetaEntry?.reason}
                            excludedAt={excludedMetaEntry?.excludedAt}
                            onExcludeReview={() => handleExcludeReviewRow(b)}
                            onRestoreExcluded={() =>
                              handleRestoreExcludedRow(b)
                            }
                            onMappingDirtyChange={(dirty) =>
                              handleMappingDirtyChange(b.biomarker_id, dirty)
                            }
                            onRowReadySave={onRowReadySave}
                            allAvilableBiomarkers={rowAvailableBiomarkers}
                            biomarkerTypes={biomarkerTypes}
                            formatBiomarkerTypeLabel={formatBiomarkerTypeLabel}
                            handleConfirmDelete={() => {
                              handleConfirm(originalIndex);
                            }}
                            renderValueField={renderValueField}
                            updateAndStandardize={updateAndStandardize}
                            suggestionMatches={rowSuggestions?.matches || []}
                            isSuggestionsLoading={Boolean(
                              suggestionsLoading[suggestionKey],
                            )}
                            onDropdownOpen={dismissTutorialReminder}
                            onBiomarkerMenuOpen={() => {
                              fetchBiomarkerSuggestions([b]);
                            }}
                            onCreateNewBiomarker={() => {
                              if (isDemo) return;
                              setCreateBiomarkerFor({
                                biomarkerId: b.biomarker_id,
                                extractedName:
                                  b.original_biomarker_name ||
                                  b.biomarker ||
                                  '',
                                extractedValue: String(
                                  preferNonEmpty(b.original_value, b.value),
                                ),
                                extractedUnit: b.original_unit || b.unit || '',
                                uploadedReferenceRange:
                                  b.uploaded_reference_range ||
                                  b.reference_range ||
                                  b.reference_interval ||
                                  b.lab_ref_range ||
                                  '',
                                suggestionMatches:
                                  rowSuggestions?.matches || [],
                              });
                            }}
                            onCreateNewUnit={() => {
                              if (isDemo) return;
                              setCreateUnitFor({
                                biomarkerId: b.biomarker_id,
                                biomarkerName: b.biomarker || '',
                                extractedUnit: b.original_unit || '',
                                extractedValue: String(
                                  preferNonEmpty(b.original_value, b.value),
                                ),
                                systemUnit:
                                  selectedSystemMeta?.unit || b.unit || '',
                                suggestionMatches:
                                  rowSuggestions?.matches || [],
                              });
                            }}
                          />
                        );
                      },
                    )}
                    {visibleBiomarkerEntries.length === 0 && (
                      <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                        <img
                          src="/icons/EmptyState-biomarkers.svg"
                          alt=""
                          className="size-16 opacity-70"
                        />
                        <div className="text-[11px] font-medium text-Text-Primary">
                          {useReviewUx
                            ? categoryFilter === 'excluded'
                              ? 'No excluded biomarkers. Items you exclude will appear here.'
                              : categoryFilter === 'review' ||
                                  categoryFilter === 'default'
                                ? 'No biomarkers need review.'
                                : 'No ready biomarkers match this filter.'
                            : showOnlyErrors
                              ? 'No biomarkers with errors.'
                              : 'No biomarkers match this filter.'}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTypeFilter('');
                            if (useReviewUx) {
                              setCategoryFilter('all');
                            } else {
                              setShowOnlyErrors?.(false);
                            }
                          }}
                          className="rounded-full border border-Primary-DeepTeal px-3 py-1 text-[10px] font-medium text-Primary-DeepTeal transition-colors hover:bg-Primary-DeepTeal/10"
                        >
                          Clear filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {useReviewUx && biomarkers.length > 0 ? (
                <div className="shrink-0 z-10 border-t border-Gray-50 bg-[#F8FAFB] px-4 py-2.5 text-[10px] text-Text-Secondary">
                  <div className="font-medium text-Text-Primary">
                    ✓ {reviewCategoryCounts.ready} Ready · ⚠{' '}
                    {reviewCategoryCounts.review} will be skipped · —{' '}
                    {reviewCategoryCounts.excluded} Excluded
                  </div>
                  <div className="mt-0.5 text-[9px] text-Text-Quadruple">
                    Only Ready biomarkers will be included in analysis.
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Create New Biomarker Modal */}
      {createBiomarkerFor && (
        <CreateBiomarkerModal
          extractedName={createBiomarkerFor.extractedName}
          extractedValue={createBiomarkerFor.extractedValue}
          extractedUnit={createBiomarkerFor.extractedUnit}
          biomarkerType={
            biomarkers.find(
              (b) => b.biomarker_id === createBiomarkerFor.biomarkerId,
            )?.biomarker_type || 'blood'
          }
          biomarkerTypeOptions={biomarkerTypes}
          uploadedReferenceRange={createBiomarkerFor.uploadedReferenceRange}
          suggestions={createBiomarkerFor.suggestionMatches}
          onClose={() => setCreateBiomarkerFor(null)}
          onCreated={(newName) => {
            onReviewCatalogRefresh?.();
            // Auto-select the new biomarker on the triggering row
            if (createBiomarkerFor.biomarkerId) {
              updateAndStandardize(createBiomarkerFor.biomarkerId, {
                biomarker: newName,
              });
            }
            setCreateBiomarkerFor(null);
          }}
        />
      )}

      {/* Create New Unit Modal */}
      {createUnitFor && (
        <CreateUnitModal
          biomarkerName={createUnitFor.biomarkerName}
          extractedUnit={createUnitFor.extractedUnit}
          extractedValue={createUnitFor.extractedValue}
          systemUnit={createUnitFor.systemUnit}
          suggestions={createUnitFor.suggestionMatches}
          onClose={() => setCreateUnitFor(null)}
          onCreated={(newUnit) => {
            // Auto-select the new unit on the triggering row
            if (createUnitFor.biomarkerId) {
              updateAndStandardize(createUnitFor.biomarkerId, {
                original_unit: newUnit,
              });
            }
            setCreateUnitFor(null);
          }}
        />
      )}
    </>
  );
};

export default BiomarkersSection;

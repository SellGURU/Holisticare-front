/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tooltip } from 'react-tooltip';
import TooltipTextAuto from '../../TooltipText/TooltipTextAuto';
import SearchSelectWithSuggestions, {
  BiomarkerOption,
  BiomarkerSuggestion,
} from '../../searchableSelect/SearchSelectWithSuggestions';
import SelectWithCreate from '../../Select/SelectWithCreate';
import { useEffect, useMemo, useState } from 'react';
import Application from '../../../api/app';
import {
  collectMappingNameVariations,
  resolveExactBiomarkerName,
  resolveNormalizedBiomarkerName,
} from './biomarkerNameFields';
import { resolveRowSaveActionState } from './biomarkerRowSaveState';
import {
  normalizeBiomarkerNameForMatch,
  pickCatalogEntryForRow,
  shouldBlockCreateNewBiomarker,
  isSafeUnitRelabel,
  mergeUnitOptionSources,
  parseUnitMismatchDetail,
  type CategorizeReviewRowResult,
  type ReviewReason,
  isSystemBiomarkerValidForRow,
  formatBiomarkerNotRecognizedMessage,
  mapBiomarkerRecognitionErrorMessage,
  filterSuggestionsForRowCatalog,
  isBiomarkerNotRecognizedErrorText,
} from './biomarkerReviewCompat';
import { logUnitOnChange } from '../../../utils/labUnitDebug';

interface BiomarkerRowProps {
  refRenceEl: any;
  index: number;
  showOnlyErrors?: boolean;
  biomarker: any;
  errorText: string;
  isHaveError: boolean;
  allAvilableBiomarkers: Array<BiomarkerOption>;
  validationCatalog?: Array<BiomarkerOption>;
  biomarkerTypes: string[];
  formatBiomarkerTypeLabel: (value: string) => string;
  renderValueField: (biomarker: any) => any;
  handleConfirmDelete: () => void;
  updateAndStandardize: (
    biomarkerId: string,
    updatedField: Partial<any>,
  ) => void;
  suggestionMatches?: BiomarkerSuggestion[];
  isSuggestionsLoading?: boolean;
  onCreateNewBiomarker?: () => void;
  onCreateNewUnit?: () => void;
  onBiomarkerMenuOpen?: () => void;
  onDropdownOpen?: () => void;
  useReviewUx?: boolean;
  rowCategory?: CategorizeReviewRowResult['category'];
  reviewMessage?: string;
  reviewReason?: ReviewReason;
  isStandardizingUnit?: boolean;
  clinicDefaultUnit?: string;
  catalogUnits?: string[];
  specimenHint?: string | null;
  onUseClinicDefault?: () => void;
  onExcludeReview?: () => void;
  onRestoreExcluded?: () => void;
  onMappingDirtyChange?: (dirty: boolean) => void;
  onRowReadySave?: (row: any) => void | Promise<void>;
  baselineSystemBiomarker?: string;
  isUserMappingDirty?: boolean;
  onRowMappingBaselineCommit?: (
    biomarkerId: string,
    systemBiomarker: string,
  ) => void;
  excludedReason?: string;
  excludedAt?: string;
  hiddenByFilter?: boolean;
}

const preferNonEmpty = (...values: unknown[]) => {
  const found = values.find(
    (value) =>
      value !== undefined && value !== null && String(value).trim() !== '',
  );
  return found ?? '';
};

const extractApiError = (err: unknown, fallback: string): string => {
  if (!err) return fallback;
  if (typeof err === 'string') {
    try {
      const parsed = JSON.parse(err);
      if (typeof parsed?.detail === 'string') return parsed.detail;
    } catch {
      return err;
    }
    return err;
  }
  const record = err as Record<string, unknown>;
  const response = record.response as Record<string, unknown> | undefined;
  const responseData = response?.data as Record<string, unknown> | undefined;
  const nestedDetail = responseData?.detail ?? record.detail;
  if (typeof nestedDetail === 'string') return nestedDetail;
  if (typeof record.message === 'string') return record.message;
  return fallback;
};

export default function BiomarkerRow({
  index,
  updateAndStandardize,
  showOnlyErrors,
  biomarker,
  renderValueField,
  errorText,
  isHaveError,
  allAvilableBiomarkers,
  validationCatalog,
  biomarkerTypes,
  formatBiomarkerTypeLabel,
  refRenceEl,
  handleConfirmDelete,
  suggestionMatches = [],
  isSuggestionsLoading = false,
  onCreateNewBiomarker,
  onCreateNewUnit,
  onBiomarkerMenuOpen,
  onDropdownOpen,
  useReviewUx = false,
  rowCategory = 'ready',
  reviewMessage = '',
  reviewReason,
  isStandardizingUnit = false,
  clinicDefaultUnit = '',
  catalogUnits = [],
  specimenHint = null,
  onUseClinicDefault,
  onExcludeReview,
  onRestoreExcluded,
  onMappingDirtyChange,
  onRowReadySave,
  baselineSystemBiomarker = '',
  isUserMappingDirty = false,
  onRowMappingBaselineCommit,
  excludedReason,
  excludedAt,
  hiddenByFilter = false,
}: BiomarkerRowProps) {
  const [, setIsChenged] = useState(false);
  const [isMapped, setIsMapped] = useState(false);
  const [savedMappings, setSavedMappings] = useState<
    Array<{ extracted_biomarker: string; system_biomarker: string }>
  >([]);
  const [mappingStatus, setMappingStatus] = useState<any>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [systemBiomarkerBlockError, setSystemBiomarkerBlockError] = useState<
    string | null
  >(null);
  const [isSavingMapping, setIsSavingMapping] = useState(false);
  const [isSavingRow, setIsSavingRow] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [fetchedApiUnits, setFetchedApiUnits] = useState<string[]>([]);
  const [copiedExactName, setCopiedExactName] = useState(false);

  const markMappingDirty = () => {
    setIsChenged(true);
    onMappingDirtyChange?.(true);
  };

  const clearMappingDirty = () => {
    setIsChenged(false);
    onMappingDirtyChange?.(false);
  };

  const normalizedName = resolveNormalizedBiomarkerName(biomarker);
  const pdfNameFromDocument = resolveExactBiomarkerName(biomarker);
  const showPdfNameLine = pdfNameFromDocument.length > 0;
  const displayValue = preferNonEmpty(
    biomarker.original_value,
    biomarker.value,
  );
  const valueText = String(displayValue).trim();
  const isTextValueWithoutUnit = valueText.length > 0 && !/\d/.test(valueText);

  const copyExactPdfName = async () => {
    if (!pdfNameFromDocument) return;
    try {
      await navigator.clipboard.writeText(pdfNameFromDocument);
      setCopiedExactName(true);
      setTimeout(() => setCopiedExactName(false), 1500);
    } catch {
      setCopiedExactName(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await Application.getAllBiomarkerUnits({
        biomarker_name: biomarker.biomarker,
      });
      if (res && Array.isArray(res.data.units)) {
        setFetchedApiUnits(res.data.units);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const effectiveExtractedUnit = String(
    preferNonEmpty(biomarker.original_unit, biomarker.unit) || '',
  ).trim();

  const hasBiomarkerError = Boolean(
    isHaveError && errorText && errorText.includes('System Biomarker'),
  );
  const hasUnitError = Boolean(
    isHaveError && errorText && errorText.includes('Extracted Unit'),
  );
  const isErrorHandled = Boolean(isHaveError && biomarker.review_error_handled);
  const normalizedErrorText = String(errorText || '').toLowerCase();
  const isExtractedUnitError = Boolean(
    !isTextValueWithoutUnit &&
      biomarker.biomarker &&
      (hasUnitError ||
        normalizedErrorText.includes('unit') ||
        normalizedErrorText.includes('cannot be provided')),
  );
  const isUnitRequiredError = reviewReason === 'unit_required';
  const isUnitMismatchError = reviewReason === 'unit_mismatch';

  // Build the effective suggestions list:
  // For successfully mapped rows, include the current mapping as a top suggestion
  // so the user can easily return to it after exploring other options.
  const rowTypeOptions = allAvilableBiomarkers;
  const catalogForValidation = validationCatalog?.length
    ? validationCatalog
    : allAvilableBiomarkers;
  const isSystemBiomarkerSelectable = (optionName: string) =>
    isSystemBiomarkerValidForRow(catalogForValidation, biomarker, optionName);
  const isSystemBiomarkerError = Boolean(
    hasBiomarkerError ||
      systemBiomarkerBlockError ||
      (biomarker.biomarker &&
        !isSystemBiomarkerSelectable(biomarker.biomarker)) ||
      normalizedErrorText.includes('invalid biomarker type') ||
      normalizedErrorText.includes('biomarker is not recognized') ||
      normalizedErrorText.includes('biomarker name') ||
      isBiomarkerNotRecognizedErrorText(errorText),
  );
  const invalidCurrentSystemBiomarkerMessage =
    biomarker.biomarker && !isSystemBiomarkerSelectable(biomarker.biomarker)
      ? formatBiomarkerNotRecognizedMessage(
          biomarker,
          String(biomarker.biomarker),
        )
      : '';
  const systemBiomarkerInlineMessage =
    systemBiomarkerBlockError ||
    invalidCurrentSystemBiomarkerMessage ||
    (isSystemBiomarkerError && !isErrorHandled && errorText
      ? mapBiomarkerRecognitionErrorMessage(biomarker, errorText)
      : '');
  const compatibleSuggestions = suggestionMatches.reduce<BiomarkerSuggestion[]>(
    (acc, suggestion) => {
      const key = suggestion.system_biomarker.toLowerCase();
      if (!acc.some((item) => item.system_biomarker.toLowerCase() === key)) {
        acc.push(suggestion);
      }
      return acc;
    },
    [],
  );
  const rowValidSuggestions = filterSuggestionsForRowCatalog(
    catalogForValidation,
    biomarker,
    compatibleSuggestions,
  );
  const hiddenCrossTypeSuggestionCount =
    compatibleSuggestions.length - rowValidSuggestions.length;

  const effectiveSuggestions: BiomarkerSuggestion[] = (() => {
    const list = [...rowValidSuggestions];
    const currentBiomarker = biomarker.biomarker;
    const currentUnit = biomarker.unit || biomarker.original_unit || '';
    const currentMeta = rowTypeOptions.find(
      (option) =>
        normalizeBiomarkerNameForMatch(option.biomarker) ===
          normalizeBiomarkerNameForMatch(currentBiomarker) &&
        String(option.unit || '').toLowerCase() ===
          String(currentUnit || '').toLowerCase(),
    );
    if (
      currentBiomarker &&
      currentMeta &&
      !hasBiomarkerError &&
      !list.some(
        (s) =>
          s.system_biomarker.toLowerCase() === currentBiomarker.toLowerCase(),
      )
    ) {
      list.unshift({
        system_biomarker: currentBiomarker,
        confidence: 100,
        reason: 'Current system match',
        benchmark_area:
          currentMeta.benchmark_area || biomarker['Benchmark areas'] || '',
        unit: currentUnit,
        value_type: currentMeta.value_type,
      });
    }
    return list;
  })();

  const extractedNameForCreate = String(
    preferNonEmpty(biomarker.original_biomarker_name, biomarker.biomarker) ||
      '',
  ).trim();
  const blockCreateNewBiomarker = shouldBlockCreateNewBiomarker({
    catalog: rowTypeOptions,
    extractedName: extractedNameForCreate,
    biomarkerType: biomarker.biomarker_type || 'blood',
    suggestions: effectiveSuggestions,
  });

  const matchingSystemOptions = rowTypeOptions.filter(
    (option) =>
      normalizeBiomarkerNameForMatch(option.biomarker) ===
      normalizeBiomarkerNameForMatch(biomarker.biomarker),
  );
  const selectedSystemMeta =
    matchingSystemOptions.find(
      (option) =>
        String(option.unit || '').toLowerCase() ===
        String(biomarker.original_unit || biomarker.unit || '').toLowerCase(),
    ) ||
    matchingSystemOptions.find(
      (option) =>
        String(option.unit || '').toLowerCase() ===
        String(biomarker.unit || '').toLowerCase(),
    ) ||
    matchingSystemOptions[0];

  const displayUnit = (() => {
    if (biomarker.original_unit === '') {
      return '(no unit)';
    }
    if (effectiveExtractedUnit) {
      return effectiveExtractedUnit;
    }
    return '';
  })();

  const unitOptions = useMemo(() => {
    const parsed = parseUnitMismatchDetail(errorText);
    return mergeUnitOptionSources(
      effectiveExtractedUnit,
      clinicDefaultUnit,
      parsed?.extractedUnit,
      parsed?.clinicDefaultUnit,
      biomarker.possible_values?.units,
      fetchedApiUnits,
      catalogUnits,
      selectedSystemMeta?.unit,
    ).map((unit) => (unit === '' ? '(no unit)' : unit));
  }, [
    effectiveExtractedUnit,
    clinicDefaultUnit,
    errorText,
    biomarker.possible_values?.units,
    fetchedApiUnits,
    catalogUnits,
    selectedSystemMeta?.unit,
  ]);

  const showSafeClinicDefaultAction = Boolean(
    isUnitMismatchError &&
      clinicDefaultUnit &&
      onUseClinicDefault &&
      isSafeUnitRelabel(effectiveExtractedUnit, clinicDefaultUnit),
  );
  const showSelectClinicDefaultAction = Boolean(
    isUnitMismatchError &&
      !isErrorHandled &&
      clinicDefaultUnit &&
      onUseClinicDefault &&
      !showSafeClinicDefaultAction &&
      !isSafeUnitRelabel(effectiveExtractedUnit, clinicDefaultUnit),
  );
  const unitChangeRejected = Boolean(biomarker.unit_change_rejected);
  const showUnitRejectedBadge = Boolean(
    isUnitMismatchError &&
      !isErrorHandled &&
      (unitChangeRejected || isHaveError),
  );
  const currentUnitInOptions = unitOptions.some(
    (option) =>
      option !== '(no unit)' &&
      (option === displayUnit ||
        isSafeUnitRelabel(option, displayUnit) ||
        option.toLowerCase() === displayUnit.toLowerCase()),
  );
  const unitDropdownValue =
    isUnitMismatchError &&
    !isErrorHandled &&
    showUnitRejectedBadge &&
    !currentUnitInOptions
      ? ''
      : isExtractedUnitError &&
          !isErrorHandled &&
          !effectiveExtractedUnit &&
          unitOptions.length !== 1
        ? ''
        : displayUnit;

  useEffect(() => {
    if (!biomarker.biomarker || isTextValueWithoutUnit) {
      return;
    }
    void fetchUnits();
  }, [biomarker.biomarker]);

  useEffect(() => {
    if (isTextValueWithoutUnit || !biomarker.biomarker) {
      return;
    }
    if (String(biomarker.original_unit ?? '').trim()) {
      return;
    }
    const autoUnit =
      effectiveExtractedUnit ||
      (unitOptions.length === 1 && unitOptions[0] !== '(no unit)'
        ? String(unitOptions[0])
        : '') ||
      (biomarker.possible_values?.units?.length === 1
        ? String(biomarker.possible_values.units[0])
        : '') ||
      String(selectedSystemMeta?.unit || '').trim();
    if (!autoUnit) {
      return;
    }
    updateAndStandardize(biomarker.biomarker_id, {
      original_unit: autoUnit,
    });
  }, [
    biomarker.biomarker,
    biomarker.biomarker_id,
    biomarker.original_unit,
    effectiveExtractedUnit,
    unitOptions.join('|'),
    selectedSystemMeta?.unit,
  ]);

  const mappingAliases = useMemo(() => {
    const system = String(biomarker.biomarker || '').trim();
    if (!system) return [];

    return collectMappingNameVariations(biomarker)
      .filter((name) => name.toLowerCase() !== system.toLowerCase())
      .map((extracted) => ({
        extracted_biomarker: extracted,
        system_biomarker: system,
      }));
  }, [
    biomarker.biomarker,
    biomarker.original_biomarker_name,
    biomarker.normalized_biomarker_name,
    biomarker.extracted_biomarker_name,
  ]);
  const pdfBiomarkerName = resolveExactBiomarkerName(biomarker);
  const systemBiomarkerName = String(biomarker.biomarker || '').trim();
  const saveMappingPayloads = useMemo(() => {
    if (mappingAliases.length > 0) return mappingAliases;
    if (!pdfBiomarkerName || !systemBiomarkerName) return [];
    return [
      {
        extracted_biomarker: pdfBiomarkerName,
        system_biomarker: systemBiomarkerName,
      },
    ];
  }, [mappingAliases, pdfBiomarkerName, systemBiomarkerName]);
  const namesAlreadyMatch =
    pdfBiomarkerName.length > 0 &&
    systemBiomarkerName.length > 0 &&
    pdfBiomarkerName.toLowerCase() === systemBiomarkerName.toLowerCase();
  const { shouldShowSaveUndo: shouldShowSaveButton } = resolveRowSaveActionState({
    useReviewUx,
    rowCategory,
    hasRowReadySaveHandler: Boolean(onRowReadySave),
    systemBiomarkerName,
    baselineSystemBiomarker,
    isUserMappingDirty,
  });
  const saveTooltipId = `save-row-${biomarker.biomarker_id || index}`;

  const handleSaveClick = async () => {
    if (!onRowReadySave || isSavingRow) return;
    setIsSavingRow(true);
    setSaveError(null);
    try {
      const shouldSaveClinicMapping =
        !namesAlreadyMatch && !isMapped && saveMappingPayloads.length > 0;

      if (shouldSaveClinicMapping) {
        await handleSaveMapping();
      }

      await onRowReadySave(biomarker);
      onRowMappingBaselineCommit?.(biomarker.biomarker_id, systemBiomarkerName);
      clearMappingDirty();
    } catch (err) {
      const detail = extractApiError(err, 'Failed to save biomarker.');
      setSaveError(mapBiomarkerRecognitionErrorMessage(biomarker, detail));
    } finally {
      setIsSavingRow(false);
    }
  };

  const handleSaveMapping = async () => {
    if (isSavingMapping) return;

    if (isMapped) {
      const mappingsToRemove =
        savedMappings.length > 0 ? savedMappings : saveMappingPayloads;
      if (mappingsToRemove.length === 0) {
        setSaveError('No saved mapping to remove.');
        return;
      }

      setIsSavingMapping(true);
      setSaveError(null);
      try {
        for (const mapping of mappingsToRemove) {
          await Application.remove_mapping(mapping);
        }
        setIsMapped(false);
        setSavedMappings([]);
        setMappingStatus('removed');
        setTimeout(() => setMappingStatus(null), 5000);
      } catch (err) {
        setSaveError(extractApiError(err, 'Failed to remove mapping.'));
        throw err;
      } finally {
        setIsSavingMapping(false);
      }
      return;
    }

    if (namesAlreadyMatch) {
      setIsMapped(true);
      clearMappingDirty();
      return;
    }

    if (saveMappingPayloads.length === 0) {
      setSaveError('Select a system biomarker before saving.');
      throw new Error('Select a system biomarker before saving.');
    }

    setIsSavingMapping(true);
    setSaveError(null);
    try {
      for (const mapping of saveMappingPayloads) {
        await Application.add_mapping(mapping);
      }
      setIsMapped(true);
      setSavedMappings(saveMappingPayloads);
      clearMappingDirty();
      setMappingStatus('added');
      setTimeout(() => setMappingStatus(null), 5000);
    } catch (err) {
      setSaveError(extractApiError(err, 'Failed to save mapping.'));
      throw err;
    } finally {
      setIsSavingMapping(false);
    }
  };

  const rowBorderClass = useReviewUx
    ? rowCategory === 'ready'
      ? 'border-l-4 border-l-[#12B76A]'
      : rowCategory === 'review'
        ? 'border-l-4 border-l-[#F59E0B] bg-[#FFFBEB]/60'
        : rowCategory === 'excluded'
          ? 'border-l-4 border-l-Gray-100 bg-Gray-15 opacity-80'
          : ''
    : '';

  const rowBackgroundClass = useReviewUx
    ? rowCategory === 'ready'
      ? index % 2 === 0
        ? 'bg-white hover:bg-[#F1F7F8]'
        : 'bg-[#F8FAFB] hover:bg-[#F1F7F8]'
      : rowCategory === 'review'
        ? 'hover:bg-[#FFF7ED]'
        : 'hover:bg-Gray-25'
    : isErrorHandled
      ? 'bg-[#ECFDF3]'
      : isHaveError
        ? 'bg-[#FFD8E480]'
        : index % 2 === 0
          ? 'bg-white hover:bg-[#F1F7F8]'
          : 'bg-[#F8FAFB] hover:bg-[#F1F7F8]';

  if (hiddenByFilter) {
    return null;
  }

  return (
    <>
      <div
        ref={refRenceEl}
        key={biomarker.biomarker_id}
        className={`${!useReviewUx && showOnlyErrors && !isHaveError ? 'hidden' : ''} ${rowBorderClass} ${rowBackgroundClass} group grid px-4 py-2 border-b border-Gray-50 items-start text-[8px] md:text-xs text-Text-Primary transition-colors duration-150`}
        style={{
          gridTemplateColumns:
            'minmax(180px,1.25fr) minmax(110px,0.8fr) minmax(220px,1.4fr) minmax(95px,0.7fr) minmax(110px,0.8fr) minmax(108px,1fr)',
        }}
      >
        {/* Column 1: Extracted Biomarker */}
        <div className="min-w-0 pt-1">
          <div className="flex min-h-[40px] flex-col justify-center gap-1">
            <div className="flex min-w-0 items-center gap-1 font-medium">
              {useReviewUx && rowCategory === 'ready' ? (
                <span className="text-[#12B76A] shrink-0" aria-hidden>
                  ✓
                </span>
              ) : null}
              <TooltipTextAuto maxWidth="180px">
                <span
                  className={
                    rowCategory === 'excluded'
                      ? 'italic text-Text-Secondary'
                      : ''
                  }
                >
                  {normalizedName || '—'}
                </span>
              </TooltipTextAuto>
              {!useReviewUx && isHaveError && (
                <>
                  <img
                    data-tooltip-id={`tooltip-${index}`}
                    src={
                      isErrorHandled
                        ? '/icons/tick-circle-green-new.svg'
                        : '/icons/info-circle-red.svg'
                    }
                    alt="Error"
                    className="w-4 h-4 shrink-0"
                  />
                  <Tooltip
                    id={`tooltip-${index}`}
                    place="top"
                    className="!bg-[#F9DEDC] !bg-opacity-100 !max-w-[250px] !opacity-100 !leading-5 !text-wrap !shadow-100 !text-Text-Primary !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
                  >
                    {errorText}
                  </Tooltip>
                </>
              )}
            </div>
            {showPdfNameLine && (
              <div className="flex min-w-0 items-center gap-1 text-[9px] text-Text-Secondary">
                <span className="shrink-0">Exact (PDF):</span>
                <TooltipTextAuto maxWidth="150px">
                  {pdfNameFromDocument}
                </TooltipTextAuto>
                <button
                  type="button"
                  onClick={copyExactPdfName}
                  className="shrink-0 rounded p-0.5 hover:bg-Gray-50"
                  title="Copy exact PDF biomarker name"
                >
                  <img
                    src={
                      copiedExactName
                        ? '/icons/copy-success.svg'
                        : '/icons/copy.svg'
                    }
                    alt="Copy exact PDF biomarker name"
                    className="h-3.5 w-3.5"
                  />
                </button>
              </div>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-Text-Secondary">
            <span>Value: {String(displayValue || '—')}</span>
            <span>
              Unit:{' '}
              {biomarker.original_unit === ''
                ? '(no unit)'
                : biomarker.original_unit || biomarker.unit || '—'}
            </span>
          </div>
        </div>

        {/* Column 2: Biomarker Type */}
        <div className="flex min-w-0 flex-col items-center justify-start gap-0.5 pt-1">
          <select
            value={biomarker.biomarker_type || 'blood'}
            onChange={(event) => {
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
              markMappingDirty();
              setIsMapped(false);
              setSavedMappings([]);
              setSaveError(null);
            }}
            className="h-7 w-full max-w-[100px] rounded-xl border border-Gray-50 bg-white px-2 text-center text-[8px] text-Text-Primary outline-none focus:border-Primary-DeepTeal md:text-[10px]"
          >
            {biomarkerTypes.map((type) => (
              <option key={type} value={type}>
                {formatBiomarkerTypeLabel(type)}
              </option>
            ))}
          </select>
          {specimenHint &&
            String(biomarker.biomarker_type || 'blood').toLowerCase() !==
              specimenHint && (
              <span className="max-w-[100px] text-center text-[7px] leading-tight text-orange-600">
                Switch type to {formatBiomarkerTypeLabel(specimenHint)}
              </span>
            )}
        </div>

        {/* Column 3: System Biomarker with suggestions */}
        <div className="min-w-0 w-full pt-1">
          <SearchSelectWithSuggestions
            isStaff
            isLarge
            isSetting
            value={
              isSystemBiomarkerError && !isErrorHandled && !biomarker.biomarker
                ? ''
                : biomarker.biomarker || ''
            }
            placeholder={
              isSystemBiomarkerError && !isErrorHandled
                ? '...'
                : 'Select an option'
            }
            options={rowTypeOptions}
            isError={isSystemBiomarkerError && !isErrorHandled}
            suggestions={effectiveSuggestions}
            isSuggestionsLoading={isSuggestionsLoading}
            isOptionSelectable={isSystemBiomarkerSelectable}
            hiddenSuggestionsNote={
              hiddenCrossTypeSuggestionCount > 0
                ? 'Some suggested names belong to other test types and were hidden.'
                : undefined
            }
            onCreateNew={
              blockCreateNewBiomarker ? undefined : onCreateNewBiomarker
            }
            onMenuOpen={() => {
              onDropdownOpen?.();
              onBiomarkerMenuOpen?.();
            }}
            onChange={(val: string) => {
              if (
                normalizeBiomarkerNameForMatch(val) ===
                normalizeBiomarkerNameForMatch(biomarker.biomarker)
              ) {
                return;
              }
              if (!isSystemBiomarkerSelectable(val)) {
                setSystemBiomarkerBlockError(
                  formatBiomarkerNotRecognizedMessage(biomarker, val),
                );
                setSaveError(null);
                return;
              }
              setSystemBiomarkerBlockError(null);
              const catalogEntry = pickCatalogEntryForRow(
                allAvilableBiomarkers,
                {
                  ...biomarker,
                  biomarker: val,
                },
              );
              const nextFields: Partial<any> = { biomarker: val };
              if (!isTextValueWithoutUnit) {
                const extractedUnit = String(
                  preferNonEmpty(biomarker.original_unit, biomarker.unit) || '',
                ).trim();
                if (!extractedUnit && catalogEntry?.unit) {
                  nextFields.original_unit = catalogEntry.unit;
                } else if (
                  !extractedUnit &&
                  biomarker.possible_values?.units?.length === 1
                ) {
                  nextFields.original_unit = biomarker.possible_values.units[0];
                }
              }
              updateAndStandardize(biomarker.biomarker_id, nextFields);
              markMappingDirty();
              setIsMapped(false);
              setSavedMappings([]);
              setSaveError(null);
            }}
          />
          <div className="mt-1 flex min-h-[20px] flex-col items-center justify-center gap-0.5 text-[9px] text-Text-Secondary">
            {biomarker.biomarker ? (
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                {selectedSystemMeta?.benchmark_area && (
                  <span className="truncate">
                    {selectedSystemMeta.benchmark_area}
                  </span>
                )}
                <span>
                  Default unit/type:{' '}
                  {selectedSystemMeta?.unit || biomarker.unit || '(no unit)'}
                  {selectedSystemMeta?.value_type
                    ? ` | ${selectedSystemMeta.value_type}`
                    : ''}
                </span>
              </div>
            ) : (
              <span>
                {blockCreateNewBiomarker
                  ? 'This biomarker already exists in your catalog — select it or add a unit mapping.'
                  : 'Select a system biomarker to see area and default unit.'}
              </span>
            )}
            {useReviewUx && systemBiomarkerInlineMessage ? (
              <p className="mt-1 max-w-[260px] text-center text-[9px] leading-snug text-orange-700">
                {systemBiomarkerInlineMessage}
              </p>
            ) : null}
          </div>
        </div>

        {/* Column 4: Extracted Value — centered under header like the column title */}
        <div className="flex min-w-0 justify-center pt-1">
          {renderValueField(biomarker)}
        </div>

        {/* Column 5: Extracted Unit with create action */}
        <div className="flex min-w-0 flex-col items-center justify-start gap-0.5 pt-1">
          <div className="relative w-full max-w-[100px] 2xl:max-w-[140px]">
            {isTextValueWithoutUnit ? (
              <div className="flex min-h-[28px] items-center justify-center rounded-2xl border border-Gray-50 bg-[#FDFDFD] px-3 py-1 text-center text-[8px] text-Text-Secondary md:text-[10px]">
                Not required
              </div>
            ) : (
              <>
                <SelectWithCreate
                  isLarge
                  isSetting
                  disabled={isStandardizingUnit}
                  value={unitDropdownValue}
                  placeholder={
                    showUnitRejectedBadge
                      ? 'Select a valid unit'
                      : isUnitRequiredError && !isErrorHandled
                        ? 'Select unit'
                        : isExtractedUnitError && !isErrorHandled
                          ? 'Select unit'
                          : !displayUnit
                            ? 'Select unit'
                            : 'Select an option'
                  }
                  validation={
                    (isExtractedUnitError && !isErrorHandled) ||
                    showUnitRejectedBadge
                  }
                  options={unitOptions}
                  onMenuOpen={() => {
                    onDropdownOpen?.();
                    void fetchUnits();
                  }}
                  onCreateNew={
                    biomarker.biomarker ? onCreateNewUnit : undefined
                  }
                  onChange={(val: string) => {
                    const actualUnit = val === '(no unit)' ? '' : val;
                    const currentUnit = String(
                      preferNonEmpty(biomarker.original_unit, biomarker.unit) ||
                        '',
                    )
                      .trim()
                      .toLowerCase();
                    if (
                      String(actualUnit).trim().toLowerCase() === currentUnit
                    ) {
                      return;
                    }
                    logUnitOnChange(biomarker.biomarker_id, actualUnit);
                    updateAndStandardize(biomarker.biomarker_id, {
                      original_unit: actualUnit,
                    });
                    markMappingDirty();
                    setIsMapped(false);
                    setSavedMappings([]);
                    setSaveError(null);
                  }}
                />
                {isStandardizingUnit ? (
                  <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center">
                    <div className="h-3 w-3 animate-spin rounded-full border border-Primary-DeepTeal border-t-transparent" />
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        {/* Column 6: Actions */}
        <div
          className={`flex min-w-0 flex-col items-center justify-start gap-1 pt-1 ${
            shouldShowSaveButton ? 'items-end' : 'items-center'
          }`}
        >
          {isConfirmDelete ? (
            <div className="flex items-center justify-end w-full gap-1">
              <div className="text-Text-Quadruple text-[10px]">Sure?</div>
              <img
                src="/icons/tick-circle-green.svg"
                alt="Confirm"
                className="w-[16px] h-[16px] cursor-pointer"
                onClick={() => {
                  handleConfirmDelete();
                  setIsConfirmDelete(false);
                  setIsMapped(false);
                  clearMappingDirty();
                }}
              />
              <img
                src="/icons/close-circle-red.svg"
                alt="Cancel"
                className="w-[16px] h-[16px] cursor-pointer"
                onClick={() => setIsConfirmDelete(false)}
              />
            </div>
          ) : (
            <div className="relative flex w-full flex-col items-end gap-1">
              {mappingStatus === 'added' && (
                <div className="absolute right-0 bottom-full z-30 mb-1 flex w-[210px] items-center justify-center gap-1 rounded-[16px] bg-[#DEF7EC] px-[10px] py-1 text-[8px] text-Text-Primary shadow-100 animate-fadeOut">
                  <img src="/icons/tick-circle-green-new.svg" alt="" />
                  Mapping saved for future uploads.
                </div>
              )}
              {mappingStatus === 'removed' && (
                <div className="absolute right-0 bottom-full z-30 mb-1 flex w-[230px] items-center justify-center gap-1 rounded-[16px] bg-[#F9DEDC] px-[10px] py-1 text-[8px] text-Text-Primary shadow-100 animate-fadeOut">
                  <img src="/icons/info-circle-orange.svg" alt="" />
                  Mapping removed for this clinic.
                </div>
              )}

              <div className="flex items-center justify-end gap-1 flex-wrap">
                {useReviewUx && rowCategory === 'excluded' ? (
                  <button
                    type="button"
                    onClick={() => onRestoreExcluded?.()}
                    className="rounded-md border border-Gray-100 px-2 py-0.5 text-[8px] font-medium text-Primary-DeepTeal hover:bg-Primary-DeepTeal/10"
                  >
                    ↩ Restore
                  </button>
                ) : (
                  <>
                    {shouldShowSaveButton && (
                      <>
                        <button
                          type="button"
                          disabled={isSavingRow}
                          data-tooltip-id={saveTooltipId}
                          className="flex shrink-0 items-center gap-1 rounded-full bg-[#E8F4F6] px-2 py-0.5 text-[8px] font-medium text-Primary-DeepTeal ring-1 ring-Primary-DeepTeal/30 transition-all hover:bg-[#DEF7EC] disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => void handleSaveClick()}
                        >
                          <img
                            src="/icons/save-2.svg"
                            alt=""
                            className="h-3.5 w-3.5"
                          />
                          <span className="leading-tight">
                            {isSavingRow ? 'Saving...' : 'Save'}
                          </span>
                        </button>
                        <Tooltip
                          id={saveTooltipId}
                          place="top"
                          className="!bg-[#E8F4F6] !bg-opacity-100 !max-w-[260px] !opacity-100 !leading-5 !text-wrap !shadow-100 !text-Text-Primary !text-[10px] !rounded-[6px] !border !border-Gray-50 !z-[99999]"
                        >
                          Saves clinic PDF→system name mapping when names
                          differ, and persists this row&apos;s biomarker, value,
                          and unit. Does not navigate to the health plan.
                        </Tooltip>
                      </>
                    )}

                    {useReviewUx ? (
                      <button
                        type="button"
                        onClick={() => onExcludeReview?.()}
                        className="rounded-md border border-Gray-100 px-2 py-0.5 text-[8px] font-medium text-Text-Secondary hover:bg-Gray-50"
                        title="Move to excluded list"
                      >
                        Exclude ✗
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="shrink-0 rounded p-0.5 hover:bg-Gray-50"
                        title="Remove this biomarker row"
                        onClick={() => setIsConfirmDelete(true)}
                      >
                        <img
                          src="/icons/trash-blue.svg"
                          alt="Delete row"
                          className="h-4 w-4"
                        />
                      </button>
                    )}
                  </>
                )}
              </div>
              {saveError && (
                <p className="max-w-[140px] rounded-md bg-[#F9DEDC] px-2 py-1 text-right text-[8px] leading-tight text-Red">
                  {saveError}
                </p>
              )}
            </div>
          )}
        </div>

        {useReviewUx && rowCategory === 'review' && reviewMessage ? (
          <div className="col-span-full px-0 pb-1 pt-0 text-left text-[10px] leading-snug break-words">
            <div
              className={
                isUnitRequiredError
                  ? 'text-[#B45309]'
                  : isUnitMismatchError
                    ? 'text-[#B45309]'
                    : 'text-[#B45309]'
              }
            >
              ⚠ {reviewMessage}
            </div>
            {isUnitMismatchError && !isErrorHandled ? (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {onCreateNewUnit ? (
                  <button
                    type="button"
                    className="rounded-full border border-Primary-DeepTeal px-2.5 py-0.5 text-[9px] font-medium text-Primary-DeepTeal transition-colors hover:bg-Primary-DeepTeal/10"
                    onClick={onCreateNewUnit}
                  >
                    Define unit mapping
                  </button>
                ) : null}
                {showSafeClinicDefaultAction ? (
                  <button
                    type="button"
                    className="rounded-full border border-Gray-50 bg-white px-2.5 py-0.5 text-[9px] font-medium text-Text-Primary transition-colors hover:bg-Gray-15"
                    onClick={onUseClinicDefault}
                  >
                    Use clinic default ({clinicDefaultUnit})
                  </button>
                ) : null}
                {showSelectClinicDefaultAction ? (
                  <button
                    type="button"
                    className="rounded-full border border-Primary-DeepTeal px-2.5 py-0.5 text-[9px] font-medium text-Primary-DeepTeal transition-colors hover:bg-Primary-DeepTeal/10"
                    onClick={onUseClinicDefault}
                  >
                    Select {clinicDefaultUnit} (clinic default)
                  </button>
                ) : null}
                {showSelectClinicDefaultAction ? (
                  <span className="text-[9px] text-Text-Secondary">
                    Check the numeric value after switching unit.
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
        {useReviewUx && rowCategory === 'excluded' ? (
          <div className="col-span-full px-0 pb-1 pt-0 text-left text-[10px] leading-snug text-Text-Secondary break-words">
            {excludedReason ? (
              <span className="mr-2 rounded-full bg-Gray-50 px-2 py-0.5">
                {excludedReason}
              </span>
            ) : null}
            {excludedAt ? <span>Excluded {excludedAt}</span> : null}
          </div>
        ) : null}
        {!useReviewUx && isHaveError && (
          <div className="col-span-full px-0 pb-1 pt-0 text-left text-Red font-normal text-[10px] leading-snug break-words">
            <span>{errorText}</span>
            {isErrorHandled && (
              <span className="ml-2 inline-flex rounded-full bg-[#DEF7EC] px-2 py-0.5 text-[9px] font-medium text-green-700">
                Handled, click Continue to re-check
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
}

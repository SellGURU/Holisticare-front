/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tooltip } from 'react-tooltip';
import TooltipTextAuto from '../../TooltipText/TooltipTextAuto';
import SearchSelectWithSuggestions, {
  BiomarkerOption,
  BiomarkerSuggestion,
} from '../../searchableSelect/SearchSelectWithSuggestions';
import SelectWithCreate from '../../Select/SelectWithCreate';
import { useEffect, useState } from 'react';
import Application from '../../../api/app';

interface BiomarkerRowProps {
  refRenceEl: any;
  index: number;
  showOnlyErrors: boolean;
  biomarker: any;
  errorText: string;
  isHaveError: boolean;
  allAvilableBiomarkers: Array<BiomarkerOption>;
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
}

const inferExtractedValueKind = (value: unknown, unit?: string) => {
  const text = String(value ?? '').trim();
  const unitText = String(unit ?? '')
    .trim()
    .toLowerCase();
  if (!text) return 'unknown';
  if (/\d/.test(text)) return 'numeric';
  if (unitText === '%' || unitText === 'percent' || unitText === 'ratio') {
    return 'numeric';
  }
  return 'string';
};

const inferSystemValueKind = (valueType?: string, unit?: string) => {
  const type = String(valueType ?? '')
    .trim()
    .toLowerCase();
  const unitText = String(unit ?? '').trim();
  if (
    ['string', 'text', 'categorical', 'qualitative', 'boolean', 'choice'].some(
      (token) => type.includes(token),
    )
  ) {
    return 'string';
  }
  if (
    ['number', 'numeric', 'integer', 'float', 'decimal', 'range'].some(
      (token) => type.includes(token),
    )
  ) {
    return 'numeric';
  }
  if (unitText) return 'numeric';
  return 'unknown';
};

const isValueTypeCompatible = (
  extractedValue: unknown,
  extractedUnit: string,
  systemValueType?: string,
  systemUnit?: string,
) => {
  const extractedKind = inferExtractedValueKind(extractedValue, extractedUnit);
  const systemKind = inferSystemValueKind(systemValueType, systemUnit);
  if (extractedKind === 'unknown' || systemKind === 'unknown') return true;
  return extractedKind === systemKind;
};

const preferNonEmpty = (...values: unknown[]) => {
  const found = values.find(
    (value) =>
      value !== undefined && value !== null && String(value).trim() !== '',
  );
  return found ?? '';
};

const BiomarkerRow: React.FC<BiomarkerRowProps> = ({
  index,
  updateAndStandardize,
  showOnlyErrors,
  biomarker,
  renderValueField,
  errorText,
  isHaveError,
  allAvilableBiomarkers,
  biomarkerTypes,
  formatBiomarkerTypeLabel,
  refRenceEl,
  handleConfirmDelete,
  suggestionMatches = [],
  isSuggestionsLoading = false,
  onCreateNewBiomarker,
  onCreateNewUnit,
  onBiomarkerMenuOpen,
}) => {
  const [isChanged, setIsChenged] = useState(false);
  const [isMapped, setIsMapped] = useState(false);
  const [mappingStatus, setMappingStatus] = useState<any>(null);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [unitOptions, setUnitOptions] = useState<string[]>([]);
  const [copiedExactName, setCopiedExactName] = useState(false);
  const normalizedName =
    biomarker.normalized_biomarker_name ||
    biomarker.extracted_biomarker_name ||
    biomarker.original_biomarker_name ||
    biomarker.biomarker ||
    '';
  // Always use the string from the report for the PDF line and copy, when present
  const pdfNameFromDocument = String(
    biomarker.original_biomarker_name || '',
  ).trim();
  // Show the PDF sub-line whenever we have a document label, including unmapped rows
  // (where the title line may repeat the same name).
  const showPdfNameLine = pdfNameFromDocument.length > 0;
  const displayValue = preferNonEmpty(
    biomarker.original_value,
    biomarker.value,
  );
  const valueText = String(displayValue).trim();
  const extractedUnitText = String(
    biomarker.original_unit ?? biomarker.unit ?? '',
  ).trim();
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

  const buildUnitOptions = (units: string[]) => {
    const normalized = units
      .map((u: string) => (u === '' ? '(no unit)' : u))
      .filter((u, idx, list) => list.indexOf(u) === idx);
    setUnitOptions(normalized);
    return normalized;
  };

  const fetchUnits = async () => {
    try {
      const res = await Application.getAllBiomarkerUnits({
        biomarker_name: biomarker.biomarker,
      });
      if (res && Array.isArray(res.data.units)) {
        buildUnitOptions(res.data.units);
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
  const isSystemBiomarkerError = Boolean(
    hasBiomarkerError ||
      normalizedErrorText.includes('invalid biomarker type') ||
      normalizedErrorText.includes('biomarker is not recognized') ||
      normalizedErrorText.includes('biomarker name'),
  );
  const isExtractedUnitError = Boolean(
    !isTextValueWithoutUnit &&
      (hasUnitError ||
        normalizedErrorText.includes('unit') ||
        normalizedErrorText.includes('cannot be provided')),
  );

  // Build the effective suggestions list:
  // For successfully mapped rows, include the current mapping as a top suggestion
  // so the user can easily return to it after exploring other options.
  const compatibleSystemOptions = allAvilableBiomarkers.filter((option) =>
    isValueTypeCompatible(
      valueText,
      extractedUnitText,
      option.value_type,
      option.unit,
    ),
  );
  const compatibleSuggestions = suggestionMatches.filter((suggestion) =>
    isValueTypeCompatible(
      valueText,
      extractedUnitText,
      suggestion.value_type,
      suggestion.unit,
    ),
  );
  const isCurrentSystemAllowed =
    !biomarker.biomarker ||
    compatibleSystemOptions.some(
      (option) =>
        option.biomarker.toLowerCase() ===
        String(biomarker.biomarker || '').toLowerCase(),
    );

  const effectiveSuggestions: BiomarkerSuggestion[] = (() => {
    const list = [...compatibleSuggestions];
    const currentBiomarker = biomarker.biomarker;
    const currentUnit = biomarker.unit || biomarker.original_unit || '';
    const currentMeta = compatibleSystemOptions.find(
      (option) =>
        option.biomarker.toLowerCase() ===
          String(currentBiomarker || '').toLowerCase() &&
        String(option.unit || '').toLowerCase() ===
          String(currentUnit || '').toLowerCase(),
    );
    if (
      currentBiomarker &&
      currentMeta &&
      !hasBiomarkerError &&
      !list.some(
        (s) =>
          s.system_biomarker.toLowerCase() === currentBiomarker.toLowerCase() &&
          String(s.unit || '').toLowerCase() ===
            String(currentUnit || '').toLowerCase(),
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

  const matchingSystemOptions = compatibleSystemOptions.filter(
    (option) =>
      option.biomarker.toLowerCase() ===
      (biomarker.biomarker || '').toLowerCase(),
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
    if (biomarker.possible_values?.units?.length === 1) {
      return biomarker.possible_values.units[0];
    }
    if (unitOptions.length === 1) {
      return unitOptions[0];
    }
    return selectedSystemMeta?.unit || '';
  })();

  useEffect(() => {
    if (!biomarker.biomarker || isTextValueWithoutUnit) {
      return;
    }

    const seedUnits = [
      ...(Array.isArray(biomarker.possible_values?.units)
        ? biomarker.possible_values.units
        : []),
      selectedSystemMeta?.unit || '',
    ].filter(
      (unit) =>
        unit !== undefined && unit !== null && String(unit).trim() !== '',
    );
    if (seedUnits.length > 0) {
      buildUnitOptions(seedUnits);
    } else {
      void fetchUnits();
    }
  }, [
    biomarker.biomarker,
    biomarker.possible_values?.units?.join('|'),
    selectedSystemMeta?.unit,
  ]);

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

  const getMappingAliases = () => {
    const system = String(biomarker.biomarker || '').trim();
    if (!system) return [];

    const aliases = [
      biomarker.original_biomarker_name,
      biomarker.normalized_biomarker_name,
      biomarker.extracted_biomarker_name,
    ]
      .map((name) => String(name || '').trim())
      .filter(
        (name, idx, list) =>
          name &&
          name.toLowerCase() !== system.toLowerCase() &&
          list.findIndex(
            (item) => item.toLowerCase() === name.toLowerCase(),
          ) === idx,
      );

    return aliases.map((extracted) => ({
      extracted_biomarker: extracted,
      system_biomarker: system,
    }));
  };

  return (
    <>
      <div
        ref={refRenceEl}
        key={biomarker.biomarker_id}
        className={`${showOnlyErrors && !isHaveError ? 'hidden' : ''} ${
          isErrorHandled
            ? 'bg-[#ECFDF3]'
            : isHaveError
              ? 'bg-[#FFD8E480]'
              : index % 2 === 0
                ? 'bg-white'
                : 'bg-[#F8FAFB]'
        } grid px-4 py-2 border-b border-Gray-50 items-start text-[8px] md:text-xs text-Text-Primary`}
        style={{
          gridTemplateColumns:
            'minmax(180px,1.25fr) minmax(110px,0.8fr) minmax(220px,1.4fr) minmax(95px,0.7fr) minmax(110px,0.8fr) 52px',
        }}
      >
        {/* Column 1: Extracted Biomarker */}
        <div className="min-w-0 pt-1">
          <div className="flex min-h-[40px] flex-col justify-center gap-1">
            <div className="flex min-w-0 items-center gap-1">
              <TooltipTextAuto maxWidth="180px">
                {normalizedName || '—'}
              </TooltipTextAuto>
              {isHaveError && (
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
                <span className="shrink-0">PDF:</span>
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
        <div className="flex min-w-0 justify-center pt-1">
          <select
            value={biomarker.biomarker_type || 'blood'}
            onChange={(event) => {
              const nextType = event.target.value;
              updateAndStandardize(biomarker.biomarker_id, {
                biomarker_type: nextType,
              });
              setIsChenged(true);
              setIsMapped(false);
            }}
            className="h-7 w-full max-w-[100px] rounded-xl border border-Gray-50 bg-white px-2 text-center text-[8px] text-Text-Primary outline-none focus:border-Primary-DeepTeal md:text-[10px]"
          >
            {biomarkerTypes.map((type) => (
              <option key={type} value={type}>
                {formatBiomarkerTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>

        {/* Column 3: System Biomarker with suggestions */}
        <div className="min-w-0 w-full pt-1">
          <SearchSelectWithSuggestions
            isStaff
            isLarge
            isSetting
            value={
              (isSystemBiomarkerError && !isErrorHandled) ||
              !isCurrentSystemAllowed
                ? ''
                : biomarker.biomarker
            }
            placeholder={
              isSystemBiomarkerError && !isErrorHandled
                ? '...'
                : !isCurrentSystemAllowed
                  ? 'Select for this type'
                  : 'Select an option'
            }
            options={compatibleSystemOptions}
            isError={isSystemBiomarkerError && !isErrorHandled}
            suggestions={effectiveSuggestions}
            isSuggestionsLoading={isSuggestionsLoading}
            onCreateNew={onCreateNewBiomarker}
            onMenuOpen={onBiomarkerMenuOpen}
            onChange={(val: string) => {
              const selectedOption = compatibleSystemOptions.find(
                (option) =>
                  option.biomarker.toLowerCase() === val.toLowerCase() &&
                  String(option.unit || '').trim(),
              );
              const nextFields: Partial<any> = { biomarker: val };
              if (!isTextValueWithoutUnit) {
                const extractedUnit = String(
                  preferNonEmpty(biomarker.original_unit, biomarker.unit) || '',
                ).trim();
                if (!extractedUnit && selectedOption?.unit) {
                  nextFields.original_unit = selectedOption.unit;
                } else if (
                  !extractedUnit &&
                  biomarker.possible_values?.units?.length === 1
                ) {
                  nextFields.original_unit = biomarker.possible_values.units[0];
                }
              }
              updateAndStandardize(biomarker.biomarker_id, nextFields);
              setIsChenged(true);
              setIsMapped(false);
            }}
          />
          <div className="mt-1 flex min-h-[20px] flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[9px] text-Text-Secondary">
            {biomarker.biomarker ? (
              <>
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
              </>
            ) : (
              <span>
                Select a system biomarker to see area and default unit.
              </span>
            )}
          </div>
        </div>

        {/* Column 4: Extracted Value — centered under header like the column title */}
        <div className="flex min-w-0 justify-center pt-1">
          {renderValueField(biomarker)}
        </div>

        {/* Column 5: Extracted Unit with create action */}
        <div className="flex min-w-0 justify-center pt-1">
          <div className="w-full max-w-[100px] 2xl:max-w-[140px]">
            {isTextValueWithoutUnit ? (
              <div className="flex min-h-[28px] items-center justify-center rounded-2xl border border-Gray-50 bg-[#FDFDFD] px-3 py-1 text-center text-[8px] text-Text-Secondary md:text-[10px]">
                Not required
              </div>
            ) : (
              <SelectWithCreate
                isLarge
                isSetting
                value={
                  isExtractedUnitError &&
                  !isErrorHandled &&
                  !effectiveExtractedUnit &&
                  unitOptions.length !== 1
                    ? ''
                    : displayUnit
                }
                placeholder={
                  isExtractedUnitError && !isErrorHandled
                    ? 'Select unit'
                    : 'Select an option'
                }
                validation={isExtractedUnitError && !isErrorHandled}
                options={unitOptions}
                onMenuOpen={fetchUnits}
                onCreateNew={biomarker.biomarker ? onCreateNewUnit : undefined}
                onChange={(val: string) => {
                  const actualUnit = val === '(no unit)' ? '' : val;
                  updateAndStandardize(biomarker.biomarker_id, {
                    original_unit: actualUnit,
                  });
                }}
              />
            )}
          </div>
        </div>

        {/* Column 6: Actions */}
        <div
          className={`flex pt-1 items-start ${
            isChanged || isMapped ? 'justify-end' : 'justify-center'
          } gap-2`}
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
                  setIsChenged(false);
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
            <div className="relative flex items-center justify-end gap-1 h-full">
              {mappingStatus === 'added' && (
                <div className="absolute right-0 bottom-full mb-1 z-30 w-[175px] h-5 rounded-[16px] bg-[#DEF7EC] text-[8px] text-Text-Primary shadow-100 py-1 px-[10px] flex items-center justify-center text-nowrap gap-1 animate-fadeOut">
                  <img src="/icons/tick-circle-green-new.svg" alt="" />
                  Mapping saved for future uploads.
                </div>
              )}
              {mappingStatus === 'removed' && (
                <div className="absolute right-0 bottom-full mb-1 z-30 h-5 w-[220px] rounded-[16px] bg-[#F9DEDC] text-[8px] text-Text-Primary shadow-100 py-1 px-[10px] flex justify-center text-nowrap items-center gap-1 animate-fadeOut">
                  <img src="/icons/info-circle-orange.svg" alt="" />
                  This mapping will only be used for this upload.
                </div>
              )}
              {(isChanged || isMapped) && (
                <div
                  className={`cursor-pointer shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-medium transition-all ${
                    isMapped
                      ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600'
                      : 'bg-gray-100 text-Text-Secondary hover:bg-green-50 hover:text-green-700'
                  }`}
                  title={
                    isMapped
                      ? `Mapping saved: "${biomarker.original_biomarker_name}" → "${biomarker.biomarker}". Click to remove.`
                      : `Save mapping: "${biomarker.original_biomarker_name}" → "${biomarker.biomarker}" for future uploads.`
                  }
                  onClick={async () => {
                    const mappingAliases = getMappingAliases();
                    if (mappingAliases.length === 0) return;

                    if (isMapped) {
                      Promise.allSettled(
                        mappingAliases.map((mapping) =>
                          Application.remove_mapping(mapping),
                        ),
                      )
                        .then(() => {
                          setIsMapped(false);
                          setMappingStatus('removed');
                          setTimeout(() => setMappingStatus(null), 5000);
                        })
                        .catch(() => {});
                    } else {
                      Promise.allSettled(
                        mappingAliases.map((mapping) =>
                          Application.add_mapping(mapping),
                        ),
                      )
                        .then(() => {
                          setIsMapped(true);
                          setMappingStatus('added');
                          setTimeout(() => setMappingStatus(null), 5000);
                        })
                        .catch(() => {});
                    }
                  }}
                >
                  <img
                    src={
                      isMapped ? '/icons/save-2-fill.svg' : '/icons/save-2.svg'
                    }
                    alt=""
                    className="w-3.5 h-3.5"
                  />
                  <span className="hidden sm:inline">
                    {isMapped ? 'Mapped' : 'Save'}
                  </span>
                </div>
              )}
              <div
                className={`shrink-0 ${isChanged || isMapped ? 'pl-0' : 'pl-4 sm:pl-6'}`}
              >
                <img
                  src="/icons/trash-blue.svg"
                  alt="Delete"
                  className="cursor-pointer w-4 h-4 shrink-0"
                  onClick={() => setIsConfirmDelete(true)}
                />
              </div>
            </div>
          )}
        </div>

        {isHaveError && (
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
};

export default BiomarkerRow;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tooltip } from 'react-tooltip';
import TooltipTextAuto from '../../TooltipText/TooltipTextAuto';
import SearchSelectWithSuggestions, {
  BiomarkerOption,
  BiomarkerSuggestion,
} from '../../searchableSelect/SearchSelectWithSuggestions';
import SelectWithCreate from '../../Select/SelectWithCreate';
import { useState } from 'react';
import Application from '../../../api/app';

interface BiomarkerRowProps {
  refRenceEl: any;
  index: number;
  showOnlyErrors: boolean;
  biomarker: any;
  errorText: string;
  isHaveError: boolean;
  allAvilableBiomarkers: Array<BiomarkerOption>;
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

const BiomarkerRow: React.FC<BiomarkerRowProps> = ({
  index,
  updateAndStandardize,
  showOnlyErrors,
  biomarker,
  renderValueField,
  errorText,
  isHaveError,
  allAvilableBiomarkers,
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
  const [unitOptions, setUnitOptions] = useState([]);

  const fetchUnits = async () => {
    try {
      const res = await Application.getAllBiomarkerUnits({
        biomarker_name: biomarker.biomarker,
      });
      if (res && Array.isArray(res.data.units)) {
        const transformedUnits = res.data.units.map((u: string) =>
          u === '' ? '(no unit)' : u,
        );
        setUnitOptions(transformedUnits);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const hasBiomarkerError = Boolean(
    isHaveError && errorText && errorText.includes('System Biomarker'),
  );
  const hasUnitError = Boolean(
    isHaveError && errorText && errorText.includes('Extracted Unit'),
  );

  // Build the effective suggestions list:
  // For successfully mapped rows, include the current mapping as a top suggestion
  // so the user can easily return to it after exploring other options.
  const effectiveSuggestions: BiomarkerSuggestion[] = (() => {
    const list = [...suggestionMatches];
    const currentBiomarker = biomarker.biomarker;
    if (
      currentBiomarker &&
      !hasBiomarkerError &&
      !list.some(
        (s) => s.system_biomarker.toLowerCase() === currentBiomarker.toLowerCase(),
      )
    ) {
      list.unshift({
        system_biomarker: currentBiomarker,
        confidence: 100,
        reason: 'Current system match',
        benchmark_area: biomarker['Benchmark areas'] || '',
        unit: biomarker.unit || '',
      });
    }
    return list;
  })();

  const selectedSystemMeta = allAvilableBiomarkers.find(
    (option) =>
      option.biomarker.toLowerCase() === (biomarker.biomarker || '').toLowerCase(),
  );

  return (
    <>
      <div
        ref={refRenceEl}
        key={biomarker.biomarker_id}
        className={`${showOnlyErrors && !isHaveError ? 'hidden' : ''} ${
          isHaveError
            ? 'bg-[#FFD8E480]'
            : index % 2 === 0
              ? 'bg-white'
              : 'bg-[#F8FAFB]'
        } grid px-4 py-2 border-b border-Gray-50 items-start text-[8px] md:text-xs text-Text-Primary`}
        style={{
          gridTemplateColumns:
            'minmax(220px,1.3fr) minmax(240px,1.4fr) minmax(110px,0.8fr) minmax(130px,0.9fr) 60px',
        }}
      >
        {/* Column 1: Extracted Biomarker */}
        <div className="min-w-0 pt-1">
          <div className="flex min-h-[40px] items-center gap-1">
            <TooltipTextAuto maxWidth="180px">
              {biomarker.original_biomarker_name}
            </TooltipTextAuto>
            {isHaveError && (
              <>
                <img
                  data-tooltip-id={`tooltip-${index}`}
                  src="/icons/info-circle-red.svg"
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
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-Text-Secondary">
            <span>
              Value: {String(biomarker.original_value ?? biomarker.value ?? '—')}
            </span>
            <span>
              Unit:{' '}
              {biomarker.original_unit === ''
                ? '(no unit)'
                : biomarker.original_unit || biomarker.unit || '—'}
            </span>
          </div>
        </div>

        {/* Column 2: System Biomarker with suggestions */}
        <div className="min-w-0 w-full pt-1">
          <SearchSelectWithSuggestions
            isStaff
            isLarge
            isSetting
            value={hasBiomarkerError ? '' : biomarker.biomarker}
            placeholder={hasBiomarkerError ? '...' : 'Select an option'}
            options={allAvilableBiomarkers}
            isError={hasBiomarkerError}
            suggestions={effectiveSuggestions}
            isSuggestionsLoading={isSuggestionsLoading}
            onCreateNew={onCreateNewBiomarker}
            onMenuOpen={onBiomarkerMenuOpen}
            onChange={(val: string) => {
              updateAndStandardize(biomarker.biomarker_id, {
                biomarker: val,
              });
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
                  Default unit:{' '}
                  {selectedSystemMeta?.unit || biomarker.unit || '(no unit)'}
                </span>
              </>
            ) : (
              <span>
                Select a system biomarker to see area and default unit.
              </span>
            )}
          </div>
        </div>

        {/* Column 3: Extracted Value — centered under header like the column title */}
        <div className="flex min-w-0 justify-center pt-1">
          {renderValueField(biomarker)}
        </div>

        {/* Column 4: Extracted Unit with create action */}
        <div className="flex min-w-0 justify-center pt-1">
          <div className="w-full max-w-[100px] 2xl:max-w-[140px]">
            <SelectWithCreate
              isLarge
              isSetting
              value={
                hasUnitError
                  ? '...'
                  : biomarker.original_unit === ''
                    ? '(no unit)'
                    : biomarker.original_unit ||
                      biomarker.possible_values?.units?.[0]
              }
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
          </div>
        </div>

        {/* Column 5: Actions */}
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
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[175px] h-5 rounded-[16px] bg-[#DEF7EC] text-[8px] text-Text-Primary shadow-100 py-1 px-[10px] flex items-center justify-center text-nowrap gap-1 animate-fadeOut">
                  <img src="/icons/tick-circle-green-new.svg" alt="" />
                  Mapping saved for future uploads.
                </div>
              )}
              {mappingStatus === 'removed' && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-[220px] rounded-[16px] bg-[#F9DEDC] text-[8px] text-Text-Primary shadow-100 py-1 px-[10px] flex justify-center text-nowrap items-center gap-1 animate-fadeOut">
                  <img src="/icons/info-circle-orange.svg" alt="" />
                  This mapping will only be used for this upload.
                </div>
              )}
              {(isChanged || isMapped) && (
                <div
                  className={`cursor-pointer flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-medium transition-all ${
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
                    const extracted = biomarker.original_biomarker_name;
                    const system = biomarker.biomarker;
                    if (isMapped) {
                      Application.remove_mapping({
                        extracted_biomarker: extracted,
                        system_biomarker: system,
                      })
                        .then(() => {
                          setIsMapped(false);
                          setMappingStatus('removed');
                          setTimeout(() => setMappingStatus(null), 5000);
                        })
                        .catch(() => {});
                    } else {
                      Application.add_mapping({
                        extracted_biomarker: extracted,
                        system_biomarker: system,
                      })
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
                className={`${
                  isChanged || isMapped ? 'pl-0' : 'pl-4 sm:pl-6'
                }`}
              >
                <img
                  src="/icons/trash-blue.svg"
                  alt="Delete"
                  className="cursor-pointer w-4 h-4"
                  onClick={() => setIsConfirmDelete(true)}
                />
              </div>
            </div>
          )}
        </div>

        {isHaveError && (
          <div className="col-span-full px-0 pb-1 pt-0 text-left text-Red font-normal text-[10px] leading-snug break-words">
            {errorText}
          </div>
        )}
      </div>
    </>
  );
};

export default BiomarkerRow;

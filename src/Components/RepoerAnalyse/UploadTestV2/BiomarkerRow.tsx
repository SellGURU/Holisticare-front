/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tooltip } from 'react-tooltip';
import TooltipTextAuto from '../../TooltipText/TooltipTextAuto';
import SearchSelect from '../../searchableSelect';
import Select from '../../Select';
import { useState } from 'react';
import Application from '../../../api/app';

interface BiomarkerRowProps {
  refRenceEl: any;
  index: number;
  showOnlyErrors: boolean;
  biomarker: any;
  errorText: string;
  isHaveError: boolean;
  allAvilableBiomarkers: Array<string>;
  renderValueField: (biomarker: any) => any;
  handleConfirmDelete: () => void;
  updateAndStandardize: (
    biomarkerId: string,
    updatedField: Partial<any>,
  ) => void;
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
        // Transform empty string to "(no unit)" for display
        const transformedUnits = res.data.units.map((u: string) =>
          u === '' ? '(no unit)' : u,
        );
        setUnitOptions(transformedUnits);
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      <div
        ref={refRenceEl}
        key={biomarker.biomarker_id}
        className={`${showOnlyErrors && !isHaveError ? 'hidden' : ''} ${isHaveError ? 'bg-[#FFD8E480]' : index % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFB]'} grid py-1 px-4 border-b border-Gray-50 items-center text-[8px] md:text-xs text-Text-Primary`}
        style={{
          gridTemplateColumns: 'minmax(170px,1fr) minmax(220px,1fr) minmax(90px,1fr) minmax(120px,1fr) minmax(100px,1fr) minmax(100px,1fr) 60px',
        }}
      >
        <div className="text-left text-Text-Primary flex gap-1">
          <TooltipTextAuto maxWidth="160px">
            {biomarker.original_biomarker_name}
          </TooltipTextAuto>
          {isHaveError && (
            <>
              <img
                data-tooltip-id={`tooltip-${index}`}
                src="/icons/info-circle-red.svg"
                alt="Error"
                className="w-4 h-4"
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
        <div className="text-center">
          <SearchSelect
            isStaff
            isLarge
            isSetting
            value={
              isHaveError && errorText.includes('System Biomarker')
                ? '...'
                : biomarker.biomarker
            }
            options={allAvilableBiomarkers}
            onChange={(val: string) => {
              updateAndStandardize(biomarker.biomarker_id, {
                biomarker: val,
              });
              setIsChenged(true);
              setIsMapped(false);
              // onChangeMapped(val)
            }}
          />
        </div>
        <div className="text-center">{renderValueField(biomarker)}</div>

        <div className=" flex justify-center">
          <div className="w-full max-w-[100px] 2xl:max-w-[140px]">
            <Select
              isLarge
              isSetting
              value={
                isHaveError && errorText.includes('Extracted Unit')
                  ? '...'
                  : biomarker.original_unit === ''
                    ? '(no unit)'
                    : biomarker.original_unit ||
                      biomarker.possible_values?.units?.[0]
              }
              options={unitOptions}
              onMenuOpen={() => {
                fetchUnits();
              }}
              onChange={(val: string) => {
                // Convert "(no unit)" display back to empty string
                const actualUnit = val === '(no unit)' ? '' : val;
                updateAndStandardize(biomarker.biomarker_id, {
                  original_unit: actualUnit,
                });
              }}
            />
          </div>
        </div>

        <div className="text-center text-[#888888]">{biomarker.value}</div>
        <div className="text-center pl-3 sm:pl-0 text-[#888888]">
          {biomarker.unit}
        </div>
        <div
          className={`flex items-center ${
            isChanged || isMapped ? 'justify-end' : 'justify-center'
          }  gap-2  h-full`}
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
                onClick={() => {
                  setIsConfirmDelete(false);
                }}
              />
            </div>
          ) : (
            <div className="relative flex items-center justify-end   gap-1  h-full">
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
                <img
                  src={
                    isMapped ? '/icons/save-2-fill.svg' : '/icons/save-2.svg'
                  }
                  alt="Mapping toggle"
                  className="cursor-pointer w-4 h-4"
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
                          setTimeout(() => {
                            setMappingStatus(null);
                          }, 5000);
                        })
                        .catch(() => {});
                    } else {
                      Application.add_mapping({
                        extracted_biomarker: extracted,
                        system_biomarker: system,
                      })
                        .then(() => {
                          setIsMapped(true);

                          // Show green div for 5 seconds
                          setMappingStatus('added');
                          setTimeout(() => {
                            setMappingStatus(null);
                          }, 5000);
                        })
                        .catch(() => {});
                    }
                  }}
                />
              )}
              <div
                className={` ${
                  isChanged || isMapped ? 'pl-0' : ' pl-4 sm:pl-6'
                } `}
              >
                <img
                  src="/icons/trash-blue.svg"
                  alt="Delete"
                  className="cursor-pointer w-4 h-4 "
                  onClick={() => setIsConfirmDelete(true)}
                />
              </div>
            </div>
          )}
        </div>
        {isHaveError && (
          <div className="text-Red font-normal text-[10px] text-nowrap mt-1">
            {errorText}
          </div>
        )}
      </div>
    </>
  );
};

export default BiomarkerRow;

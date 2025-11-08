/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react';
import MainModal from '../../MainModal';
import { Tooltip } from 'react-tooltip';

interface PreviewModalProps {
  previewShowModal: boolean;
  handlePreviewCloseModal: () => void;
  handleOpenModal: () => void;
  pageType: string;
  selectedRow: any;
}

const PreviewModalLibraryTreePages: FC<PreviewModalProps> = ({
  previewShowModal,
  handlePreviewCloseModal,
  pageType,
  selectedRow,
  handleOpenModal,
}) => {
  const renderNutrient = (
    label: string,
    value: number | undefined,
    iconSrc: string,
  ) => {
    if (value === undefined) {
      return null; // or handle it with a default value
    }

    const valueStr = value.toString(); // Convert number to string
    const isOverflowing = valueStr.length > 2;

    return (
      <div className="flex items-center gap-1 select-none">
        <img src={iconSrc} alt="" className="w-[30px] h-[30px]" />
        <div className="text-xs text-Text-Fivefold flex items-center gap-[4px]">
          {label}:
          <div
            className="text-Text-Quadruple"
            data-tooltip-id={isOverflowing ? `${label}-tooltip` : undefined}
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '20px',
            }}
          >
            {valueStr}
          </div>
          gr
        </div>
        {isOverflowing && (
          <Tooltip
            id={`${label}-tooltip`}
            place="top"
            className="!bg-white !w-fit !text-wrap 
                     !text-[#888888] !shadow-100 !text-[8px] !rounded-[6px] !border !border-Gray-50 !p-2"
            style={{
              zIndex: 9999,
              pointerEvents: 'none',
            }}
          >
            {valueStr}
          </Tooltip>
        )}
      </div>
    );
  };
  return (
    <>
      <MainModal isOpen={previewShowModal} onClose={handlePreviewCloseModal}>
        <div
          className={`flex flex-col justify-between bg-white ${selectedRow?.Instruction?.length > 500 || selectedRow?.Description?.length > 500 ? 'max-w-[1000px]' : `w-[350px] xs:w-[400px] ${selectedRow?.Category === 'Diet' ? 'sm:w-[600px]' : 'sm:w-[500px]'}`} rounded-[16px] p-4`}
        >
          <div className="w-full h-full">
            <div className="flex items-center justify-between">
              <div className="flex justify-start items-center font-medium text-sm text-Text-Primary">
                {selectedRow?.Title}
              </div>
              <img
                onClick={() => {
                  // handlePreviewCloseModal();
                  handleOpenModal();
                }}
                src="/icons/edit-blue.svg"
                alt=""
                className="cursor-pointer w-6 h-6"
              />
            </div>
            <div className="w-full h-[1px] bg-Boarder my-3"></div>
            <div className="flex flex-col w-full gap-4 mt-6">
              {/* <div className="flex gap-7">
                <div className="font-medium text-Text-Primary text-xs">
                  Description
                </div>
                <div className="text-xs text-Text-Secondary text-justify leading-5">
                  {selectedRow?.Description}
                
                </div>
              </div> */}
              {selectedRow?.Parent_Title && (
                <div
                  className={`flex items-center ${selectedRow?.Category === 'Diet' ? 'gap-3' : 'gap-8'}`}
                >
                  <div className="font-medium text-Text-Primary text-xs">
                    Associated Intervention
                  </div>
                  <div className="text-xs text-Text-Secondary text-justify leading-5">
                    {selectedRow?.Parent_Title}
                  </div>
                </div>
              )}
              <div
                className={`flex ${selectedRow?.Category === 'Diet' ? 'gap-[87.5px]' : 'gap-8'}`}
              >
                <div className="font-medium text-Text-Primary text-xs">
                  Instruction
                </div>
                <div
                  className={`text-xs text-Text-Secondary text-justify leading-5 ${selectedRow?.Category === 'Diet' ? '' : 'ml-9'} `}
                >
                  {selectedRow?.Instruction}
                </div>
              </div>
              {pageType === 'Supplement' || pageType === 'Lifestyle' ? (
                <div className="flex gap-16 items-center">
                  <div className="font-medium text-Text-Primary text-xs">
                    {pageType === 'Supplement' ? 'Dose' : 'Value'}
                  </div>
                  <div className="text-xs ml-9 text-Text-Quadruple leading-5">
                    {pageType === 'Supplement'
                      ? selectedRow?.Dose
                      : selectedRow?.Value + ' ' + (selectedRow?.Unit || '')}
                  </div>
                </div>
              ) : (
                <div
                  className={`flex items-center ${selectedRow?.Category === 'Diet' ? 'gap-[74.5px]' : 'gap-8'} text-justify w-full`}
                >
                  <div className="font-medium text-Text-Primary text-xs text-nowrap">
                    Macros Goal
                  </div>
                  <div className="flex items-center flex-grow-[1] justify-between pr-2">
                    {renderNutrient(
                      'Carbs',
                      selectedRow?.['Total Macros'].Carbs ?? 0,
                      '/icons/carbs-preview.svg',
                    )}
                    {renderNutrient(
                      'Proteins',
                      selectedRow?.['Total Macros'].Protein ?? 0,
                      '/icons/proteins-preview.svg',
                    )}
                    {renderNutrient(
                      'Fats',
                      selectedRow?.['Total Macros'].Fats ?? 0,
                      '/icons/fats-preview.svg',
                    )}
                    {/* <div className="flex items-center gap-1">
                      <img
                        src="/icons/carbs-preview.svg"
                        alt=""
                        className="w-[30.72px] h-[30px]"
                      />
                      <div className="text-xs text-Text-Fivefold flex items-center gap-[4px]">
                        Carbs:
                        <div className="text-Text-Quadruple">
                          {selectedRow?.['Total Macros'].Carbs}
                        </div>
                        gr
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <img
                        src="/icons/proteins-preview.svg"
                        alt=""
                        className="w-[28.4px] h-[30px]"
                      />
                      <div className="text-xs text-Text-Fivefold flex items-center gap-[4px]">
                        Proteins:
                        <div className="text-Text-Quadruple">
                          {selectedRow?.['Total Macros'].Protein}
                        </div>
                        gr
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <img
                        src="/icons/fats-preview.svg"
                        alt=""
                        className="w-[28.94px] h-[30px]"
                      />
                      <div className="text-xs text-Text-Fivefold flex text-justify items-center gap-[4px]">
                        Fats:
                        <div className="text-Text-Quadruple">
                          {selectedRow?.['Total Macros'].Fats}
                        </div>
                        gr
                      </div>
                    </div> */}
                  </div>
                </div>
              )}
              <div
                className={`flex ${selectedRow?.Category === 'Diet' ? 'gap-[61px]' : 'gap-7'} items-center`}
              >
                <div className="font-medium text-Text-Primary text-xs">
                  Priority Weight
                </div>
                <div
                  className={`px-3 py-[2px] ${selectedRow?.Category === 'Diet' ? '' : 'ml-4'}  rounded-xl bg-[#FFD8E4] flex items-center justify-center`}
                >
                  <div className="text-[10px] text-Text-Primary">
                    {selectedRow?.Base_Score}
                  </div>
                  <div className="text-[10px] text-Text-Quadruple">/10</div>
                </div>
              </div>
              {selectedRow?.Ai_note && (
                <div
                  className={`flex ${selectedRow?.Category === 'Diet' ? 'gap-12' : 'gap-8'}`}
                >
                  <div className="font-medium text-Text-Primary text-xs text-nowrap">
                    Clinical Guidance
                  </div>
                  <div className="text-xs text-Text-Secondary text-justify leading-5">
                    {selectedRow?.Ai_note}
                  </div>
                </div>
              )}
            </div>
            <div className="w-full flex justify-end items-center p-2 mt-3">
              <div
                className="text-Disable text-sm font-medium cursor-pointer"
                onClick={handlePreviewCloseModal}
              >
                Close
              </div>
            </div>
          </div>
        </div>
      </MainModal>
    </>
  );
};

export default PreviewModalLibraryTreePages;

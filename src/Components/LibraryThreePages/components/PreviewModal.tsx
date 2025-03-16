/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react';
import MainModal from '../../MainModal';

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
  return (
    <>
      <MainModal isOpen={previewShowModal} onClose={handlePreviewCloseModal}>
        <div className="flex flex-col justify-between bg-white w-[500px] rounded-[16px] p-4">
          <div className="w-full h-full">
            <div className="flex items-center justify-between">
              <div className="flex justify-start items-center font-medium text-sm text-Text-Primary">
                {selectedRow?.Title}
              </div>
              <img
                onClick={() => {
                  handlePreviewCloseModal();
                  handleOpenModal();
                }}
                src="/icons/edit-blue.svg"
                alt=""
                className="cursor-pointer w-6 h-6"
              />
            </div>
            <div className="w-full h-[1px] bg-Boarder my-3"></div>
            <div className="flex flex-col w-full gap-4 mt-6">
              <div className="flex gap-7">
                <div className="font-medium text-Text-Primary text-xs">
                  Description
                </div>
                <div className="text-xs text-Text-Quadruple leading-5">
                  {/* {selectedRow?.Description} */}
                  Eat a balanced diet with a variety of fruits, vegetables, lean
                  proteins, healthy fats, and whole grains. Drink at least 8
                  glasses of water per day to stay hydrated. Limit processed
                  foods, sugary drinks, and excessive salt intake. Avoid
                  skipping meals; aim for three main meals and healthy snacks if
                  needed.
                </div>
              </div>
              <div className="flex gap-7 items-center">
                <div className="font-medium text-Text-Primary text-xs">
                  Base Score
                </div>
                <div className="px-3 py-[2px] rounded-xl bg-[#FFD8E4] flex items-center justify-center">
                  <div className="text-[10px] text-Text-Primary">
                    {selectedRow?.Base_Score}
                  </div>
                  <div className="text-[10px] text-Text-Quadruple">/10</div>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="font-medium text-Text-Primary text-xs">
                  Instruction
                </div>
                <div className="text-xs text-Text-Quadruple leading-5">
                  {selectedRow?.Instruction}
                </div>
              </div>
              {pageType === 'Supplement' || pageType === 'Lifestyle' ? (
                <div className="flex gap-16 items-center">
                  <div className="font-medium text-Text-Primary text-xs">
                    {pageType === 'Supplement' ? 'Dose' : 'Value'}
                  </div>
                  <div className="text-xs text-Text-Quadruple leading-5">
                    {pageType === 'Supplement'
                      ? selectedRow?.Dose
                      : selectedRow?.Value}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-5">
                  <div className="font-medium text-Text-Primary text-xs">
                    Macros Goal
                  </div>
                  <div className="flex items-center flex-grow-[1] justify-between pr-2">
                    <div className="flex items-center gap-1">
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
                      <div className="text-xs text-Text-Fivefold flex items-center gap-[4px]">
                        Fats:
                        <div className="text-Text-Quadruple">
                          {selectedRow?.['Total Macros'].Fats}
                        </div>
                        gr
                      </div>
                    </div>
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

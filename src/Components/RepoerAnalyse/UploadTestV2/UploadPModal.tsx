/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
import Toggle from '../../Toggle';
import FileUploaderSection from './FileUploaderSection';
import BiomarkersSection from './BiomarkersSection';
import { AddBiomarker } from './AddBiomarker';
import SpinnerLoader from '../../SpinnerLoader';

interface UploadPModalProps {
  OnBack: () => void;
  uploadedFile: FileUpload | null;
  onSave: () => void;
  isShare: boolean;
  errorMessage: string;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeleteFile: (file: any) => void;
  formatFileSize: (bytes: number) => string;
  fileInputRef: any;
  modifiedDateOfTest: Date;
  handleModifiedDateOfTestChange: (date: Date | null) => void;
  extractedBiomarkers: Array<any>;
  setExtractedBiomarkers: (updated: any) => void;
  addedBiomarkers: Array<any>;
  handleAddBiomarker: (newBiomarker: any) => void;
  handleTrashClick: (index: number) => void;
  handleConfirm: (index: number) => void;
  handleCancel: () => void;
  deleteIndex: number | null;
  addedDateOfTest: Date | null;
  handleAddedDateOfTestChange: (date: Date | null) => void;
  onClose: () => void;
  fileType: string;
  loading: boolean;
  rowErrors?: any;
  AddedRowErrors?: any;
  btnLoading: boolean;
  setrowErrors: any;
}

const UploadPModal: React.FC<UploadPModalProps> = ({
  fileType,
  OnBack,
  uploadedFile,
  onSave,
  isShare,
  errorMessage,
  handleFileChange,
  handleDeleteFile,
  formatFileSize,
  fileInputRef,
  modifiedDateOfTest,
  handleModifiedDateOfTestChange,
  extractedBiomarkers,
  setExtractedBiomarkers,
  addedBiomarkers,
  handleAddBiomarker,
  handleTrashClick,
  handleConfirm,
  handleCancel,
  deleteIndex,
  addedDateOfTest,
  handleAddedDateOfTestChange,
  onClose,
  loading,
  btnLoading,
  rowErrors,
  AddedRowErrors,
  setrowErrors,
}) => {
  const [activeMenu, setactiveMenu] = useState('Upload File');
  console.log(rowErrors);
  console.log(AddedRowErrors);
  const [isScaling, setIsScaling] = useState(false);
  useEffect(() => {
    const rowErrorCount = rowErrors ? Object.keys(rowErrors).length : 0;
    const addedErrorCount = AddedRowErrors
      ? Object.keys(AddedRowErrors).length
      : 0;

    if (rowErrorCount > 0 && addedErrorCount === 0) {
      setactiveMenu('Upload File');
    }
    if (addedErrorCount > 0 && rowErrorCount === 0) {
      setactiveMenu('Add Biomarker');
    }
  }, [rowErrors, AddedRowErrors]);
  const [showReview, setshowReview] = useState(false);
  useEffect(() => {
    if (
      (rowErrors && Object.keys(rowErrors).length > 0) ||
      (AddedRowErrors && Object.keys(AddedRowErrors).length > 0)
    ) {
      setshowReview(true);
    } else {
      setshowReview(false);
    }
  }, [rowErrors, AddedRowErrors, uploadedFile]);
  useEffect(() => {
    if (activeMenu !== 'Upload File') {
      setshowReview(false);
    }
  }, [activeMenu]);
  return (
    <>
      <div
        style={{ height: window.innerHeight - 40 + 'px' }}
        className="w-full rounded-[16px] y md:h-[89vh] top-4 flex justify-center absolute  left-0 text-Text-Primary px-2 md:px-6 xl:px-0 xl:pr-[95px]"
      >
        <div className="w-full h-full opacity-85  rounded-[12px] bg-Gray-50 backdrop-blur-md absolute"></div>
        <div
          style={{ height: window.innerHeight - 80 + 'px' }}
          className="bg-white p-2 md:p-6 rounded-md w-full overflow-auto md:overflow-hidden  h-fit z-[99]"
        >
          <div className="w-full flex items-center justify-between">
            <div className="flex gap-2 items-center text-xs text-Text-Primary font-medium">
              <div
                onClick={() => OnBack()}
                className="cursor-pointer size-8 rounded-md p-1 bg-white border border-Gray-50 shadow-100 flex items-center justify-center"
              >
                <img src="/icons/arrow-back.svg" alt="" />
              </div>
              Lab Data & Biomarkers
            </div>
            <ButtonPrimary
              disabled={
                (extractedBiomarkers.length == 0 &&
                  addedBiomarkers.length == 0) ||
                btnLoading
              }
              onClick={onSave}
              ClassName=" w-[127px] md:w-[167px]"
            >
              {btnLoading ? (
                <>
                  {' '}
                  <SpinnerLoader></SpinnerLoader>
                  Continue
                </>
              ) : (
                <>
                  <img
                    className="size-4"
                    src="/icons/arrow-right-white.svg"
                    alt=""
                  />
                  Continue{' '}
                </>
              )}
            </ButtonPrimary>
          </div>
          <div className="flex w-full relative justify-center mt-6">
            <Toggle
              active={activeMenu}
              setActive={setactiveMenu}
              value={['Upload File', 'Add Biomarker']}
            ></Toggle>
            {showReview ? (
              <div className="bg-[#FFD8E4] absolute right-0 bottom-0 text-[10px] text-Text-Primary w-[328px] rounded-[20px] h-[36px] py-2 px-4 flex justify-between items-center gap-2">
                <div className="flex items-cente gap-1">
                  <img src="/icons/info-circle-red-2.svg" alt="" />
                  Review required: some biomarkers contain errors.
                </div>

                <img
                  onClick={() => setshowReview(false)}
                  className="cursor-pointer size-4"
                  src="/icons/close-black.svg"
                  alt=""
                />
              </div>
            ) : null}
          </div>
          <div className={`w-full h-full flex flex-col mt-4 gap-2 ${activeMenu !== 'Upload File' ? 'hidden' : ''}`}>
            <FileUploaderSection
              isShare={isShare}
              isScaling={isScaling}
              errorMessage={errorMessage}
              handleFileChange={handleFileChange}
              uploadedFile={uploadedFile}
              handleDeleteFile={handleDeleteFile}
              formatFileSize={formatFileSize}
              fileInputRef={fileInputRef}
              onClose={onClose}
            />
            <BiomarkersSection
              rowErrors={rowErrors}
              isScaling={isScaling}
              setIsScaling={setIsScaling}
              setrowErrors={setrowErrors}
              loading={loading}
              fileType={fileType}
              dateOfTest={modifiedDateOfTest}
              setDateOfTest={handleModifiedDateOfTestChange}
              uploadedFile={uploadedFile}
              biomarkers={extractedBiomarkers}
              onChange={(updated) => setExtractedBiomarkers(updated)}
            />
          </div>
          <div className={activeMenu !== 'Add Biomarker' ? 'hidden' : ''}>
            <AddBiomarker
              biomarkers={addedBiomarkers}
              rowErrors={AddedRowErrors}
              onAddBiomarker={handleAddBiomarker}
              onTrashClick={handleTrashClick}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              deleteIndex={deleteIndex}
              dateOfTest={addedDateOfTest}
              setDateOfTest={handleAddedDateOfTestChange}
            ></AddBiomarker>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadPModal;

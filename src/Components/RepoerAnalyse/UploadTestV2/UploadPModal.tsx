/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
import Toggle from '../../Toggle';
import FileUploaderSection from './FileUploaderSection';
import BiomarkersSection from './BiomarkersSection';
import { AddBiomarker } from './AddBiomarker';

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
}

const UploadPModal: React.FC<UploadPModalProps> = ({
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
}) => {
  const [activeMenu, setactiveMenu] = useState('Upload File');
  return (
    <>
      <div className="w-full rounded-[16px] h-full md:h-[89vh] top-4 flex justify-center absolute left-0 text-Text-Primary pr-[95px]">
        <div className="w-full h-full opacity-85 rounded-[12px] bg-Gray-50 backdrop-blur-md absolute"></div>
        <div
          style={{ height: window.innerHeight - 80 + 'px' }}
          className="bg-white p-6 rounded-md w-full h-fit z-10"
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
              disabled={uploadedFile == null && addedBiomarkers.length == 0}
              onClick={onSave}
              style={{
                width: '167px',
              }}
            >
              <img
                className="size-4"
                src="/icons/arrow-right-white.svg"
                alt=""
              />
              Continue{' '}
            </ButtonPrimary>
          </div>
          <div className="flex w-full justify-center mt-6">
            <Toggle
              active={activeMenu}
              setActive={setactiveMenu}
              value={['Upload File', 'Add Biomarker']}
            ></Toggle>
          </div>
          {activeMenu === 'Upload File' ? (
            <div className="w-full h-full flex flex-col mt-8 gap-2">
              <FileUploaderSection
                isShare={isShare}
                errorMessage={errorMessage}
                handleFileChange={handleFileChange}
                uploadedFile={uploadedFile}
                handleDeleteFile={handleDeleteFile}
                formatFileSize={formatFileSize}
                fileInputRef={fileInputRef}
                onClose={onClose}
              />
              <BiomarkersSection
                dateOfTest={modifiedDateOfTest}
                setDateOfTest={handleModifiedDateOfTestChange}
                uploadedFile={uploadedFile}
                biomarkers={extractedBiomarkers}
                onChange={(updated) => setExtractedBiomarkers(updated)}
              />
            </div>
          ) : (
            <AddBiomarker
              biomarkers={addedBiomarkers}
              onAddBiomarker={handleAddBiomarker}
              onTrashClick={handleTrashClick}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              deleteIndex={deleteIndex}
              dateOfTest={addedDateOfTest}
              setDateOfTest={handleAddedDateOfTestChange}
            ></AddBiomarker>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadPModal;

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import useIsDemo from '../../../hooks/useIsDemo';

interface FileUploaderSectionProps {
  isShare: boolean | undefined;
  errorMessage: string;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFile: any | null; // ✅ single file instead of list
  handleDeleteFile: (file: any) => void;
  formatFileSize: (bytes: number) => string;
  fileInputRef: any;
  onClose: () => void;
  onDownload?: () => void;
  isEditMode?: boolean;
}

const FileUploaderSection: React.FC<FileUploaderSectionProps> = ({
  isShare,
  errorMessage,
  handleFileChange,
  uploadedFile,
  handleDeleteFile,
  formatFileSize,
  onClose: _onClose,
  fileInputRef,
  isEditMode,
  onDownload: _onDownload,
}) => {
  const isDemo = useIsDemo();
  if (uploadedFile) {
    const fileName = uploadedFile?.file?.name || '';
    const fileSize = formatFileSize(uploadedFile?.file?.size || 0);
    const isComplete = uploadedFile.status === 'completed';
    const hasWarning = Boolean(uploadedFile.warning);
    return (
      <div className="w-full shrink-0">
        <div className="flex items-center gap-2 md:gap-3 rounded-xl border border-Gray-50 bg-white px-3 py-1.5">
          <img src="/images/Pdf.png" alt="pdf" className="size-5 shrink-0 object-contain" />
          <span className="flex-1 min-w-0 text-[10px] md:text-xs font-medium text-Text-Primary truncate">
            {fileName || 'Lab Report'}
          </span>
          {fileSize && (
            <span className="text-[9px] md:text-[10px] text-Text-Secondary shrink-0 hidden sm:block">
              {fileSize}
            </span>
          )}
          {hasWarning && (
            <span className="flex items-center gap-1 text-[9px] text-amber-600 shrink-0">
              <img className="size-3.5" src="/icons/danger-fill.svg" alt="" />
              <span className="hidden md:inline">Not a clinic template</span>
            </span>
          )}
          {isComplete && (
            <span className="flex items-center gap-1 text-[9px] text-Primary-DeepTeal shrink-0">
              <img className="size-3.5" src="/icons/tick-circle-green-new.svg" alt="" />
              <span className="hidden md:inline">Extracted</span>
            </span>
          )}
          {!isEditMode && (
            <button
              type="button"
              disabled={isDemo}
              onClick={() => handleDeleteFile(uploadedFile.file_id)}
              className={`shrink-0 rounded-md p-1 hover:bg-red-50 transition-colors ${isDemo ? 'cursor-not-allowed opacity-50' : ''}`}
              title={isDemo ? 'Demo plan - upgrade to enable' : 'Remove file'}
            >
              <img src="/icons/trash-red.svg" alt="Remove" className="size-3.5 opacity-50 hover:opacity-80" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col md:flex-row   w-full justify-between rounded-2xl border p-2 md:p-4 bg-white shadow-200 border-Gray-50 gap-8 h-auto visible `}
    >
      {/* Left side - Upload area */}
      <div
        className={` text-xs md:text-sm w-full  font-medium text-Text-Primary`}
        data-tour="file-uploader"
      >
        File Uploader
        <div
          onClick={() => {
            if (isDemo) return;
            if (!isShare && !uploadedFile) {
              document.getElementById('uploadFile')?.click();
            }
          }}
          title={isDemo ? 'Demo plan - upgrade to enable' : undefined}
          className={`mt-1 rounded-2xl h-[120px] w-full py-4 px-6 bg-white border shadow-100 border-Gray-50 flex flex-col items-center justify-center ${isDemo ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        >
          <div className="w-full flex justify-center">
            <img src="/icons/upload-test.svg" alt="" />
          </div>
          <div className=" text-[10px] md:text-[12px] text-Text-Primary text-center mt-3">
            Drag and drop your test file here or click to upload.
          </div>
          <div className="text-[#888888] font-medium text-[10px] md:text-[12px] text-center">
            {`Accepted formats: .pdf, .doc, .docx, .png, .jpg, .jpeg, .webp.`}
          </div>
          {errorMessage && (
            <div className="text-red-500 text-[10px] md:text-[12px] text-center mt-1 w-[220px] xs:w-[300px] md:w-[500px]">
              {errorMessage}
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
            onChange={handleFileChange}
            disabled={isDemo}
            id="uploadFile"
            className="w-full absolute invisible h-full left-0 top-0"
          />
        </div>
      </div>

      {/* Right side - Uploaded file display */}
      <div
        className=" text-xs md:text-sm w-full   font-medium text-Text-Primary"
        data-tour="uploaded-file"
      >
        Uploaded File
        <div className="mt-1 rounded-2xl md:h-[100px] bg-white flex flex-col ">
          <div className="w-full flex flex-col items-center justify-center h-full">
            <img src="/icons/EmptyState-upload.svg" alt="" />
            <div className="text-xs font-medium text-Text-Primary -mt-8">
              No file uploaded yet.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploaderSection;

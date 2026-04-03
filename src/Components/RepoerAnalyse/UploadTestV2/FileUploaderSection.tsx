/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import FileBoxUploadingV2 from '../UploadTest/FileBoxUploadingV2'; // Ensure this path is correct

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
  onClose,
  fileInputRef,
  isEditMode,
  onDownload,
}) => {
  if (uploadedFile) {
    return (
      <div className="w-full mb-2 mt-1">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 rounded-2xl border border-Gray-50 bg-white px-3 py-2">
          <div className="text-[10px] md:text-xs font-medium text-Text-Primary shrink-0">
            Uploaded File
          </div>
          <div className="flex-1 min-w-0">
          <FileBoxUploadingV2
            onClose={onClose}
            onDownload={onDownload}
            onDelete={isEditMode ? undefined : () => handleDeleteFile(uploadedFile.file_id)}
            el={{
              ...uploadedFile,
              uploadedSize: uploadedFile.uploadedSize || 0,
              totalSize: uploadedFile?.file?.size,
              progress: uploadedFile.progress || 0.5,
              formattedSize: `${formatFileSize(
                uploadedFile.uploadedSize || 0,
              )} / ${formatFileSize(uploadedFile?.file?.size || 1)}`,
            }}
          />
          </div>
          {uploadedFile.progress >= 100 && (
            <div className="flex items-start gap-1 text-[10px] md:text-xs text-Text-Primary md:max-w-[320px]">
              <img
                className="size-4 shrink-0 mt-[1px]"
                src="/icons/danger-fill.svg"
                alt=""
              />
              <span>
                Review the extracted biomarkers below and confirm they are correct.
              </span>
            </div>
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
            if (!isShare && !uploadedFile) {
              document.getElementById('uploadFile')?.click();
            }
          }}
          className={`mt-1 rounded-2xl h-[120px] w-full py-4 px-6 bg-white border shadow-100 border-Gray-50 flex flex-col items-center justify-center cursor-pointer`}
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

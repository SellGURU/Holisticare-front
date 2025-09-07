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
}) => {
  return (
    <div className="flex flex-col  w-full justify-between rounded-2xl border p-4 bg-white shadow-200 border-Gray-50 gap-8 ">
      {/* Left side - Upload area */}
      <div
        className={`text-sm w-full  font-medium text-Text-Primary ${
          uploadedFile ? 'opacity-50 ' : ''
        }`}
      >
        File Uploader
        <div
          onClick={() => {
            if (!isShare && !uploadedFile) {
              document.getElementById('uploadFile')?.click();
            }
          }}
          className={`mt-1 rounded-2xl h-[160px] w-full py-4 px-6 bg-white border shadow-100 border-Gray-50 flex flex-col items-center justify-center ${uploadedFile ? 'cursor-auto' : ' cursor-pointer'}`}
        >
          <div className="w-full flex justify-center">
            <img src="/icons/upload-test.svg" alt="" />
          </div>
          <div className="text-[12px] text-Text-Primary text-center mt-3">
            Drag and drop your test file here or click to upload.
          </div>
          <div className="text-[#888888] font-medium text-[12px] text-center">
            {`Accepted formats: .pdf, .docx.`}
          </div>
          {errorMessage && (
            <div className="text-red-500 text-[12px] text-center mt-1 w-[220px] xs:w-[300px] md:w-[500px]">
              {errorMessage}
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            // accept=".pdf, .docx"
            onChange={handleFileChange}
            id="uploadFile"
            className="w-full absolute invisible h-full left-0 top-0"
          />
        </div>
      </div>

      {/* Right side - Uploaded file display */}
      <div className="text-sm w-full   font-medium text-Text-Primary">
        Uploaded File
        <div className="mt-1 rounded-2xl h-[130px] bg-white flex flex-col overflow-y-auto">
          {!uploadedFile ? (
            <div className="w-full flex flex-col items-center justify-center h-full">
              <img src="/icons/EmptyState-upload.svg" alt="" />
              <div className="text-xs font-medium text-Text-Primary -mt-8">
                No file uploaded yet.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 mt-[2px] gap-2 ">
              <FileBoxUploadingV2
                onClose={onClose}
                onDelete={() => handleDeleteFile(uploadedFile)}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploaderSection;

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import FileBoxUploadingV2 from '../UploadTest/FileBoxUploadingV2'; // Ensure this path is correct

interface FileUploaderSectionProps {
  isShare: boolean | undefined;
  errorMessage: string;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFiles: any[];
  handleDeleteFile: (file: any) => void;
  formatFileSize: (bytes: number) => string;
  fileInputRef: any;
}

const FileUploaderSection: React.FC<FileUploaderSectionProps> = ({
  isShare,
  errorMessage,
  handleFileChange,
  uploadedFiles,
  handleDeleteFile,
  formatFileSize,
  fileInputRef,
}) => {
  return (
    <div className="flex w-full justify-between rounded-2xl border p-4 bg-white shadow-200 border-Gray-50 gap-2">
      <div
        className={`text-sm w-[50%] font-medium text-Text-Primary ${uploadedFiles.length == 1 && 'opacity-50'}`}
      >
        File Uploader
        <div
          onClick={() => {
            if (!isShare) {
              if (uploadedFiles.length == 0)
                document.getElementById('uploadFile')?.click();
            }
          }}
          className="mt-1 rounded-2xl h-[130px] w-full py-4 px-6 bg-white border shadow-100 border-Gray-50 flex flex-col items-center justify-center "
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
            accept=".pdf, .docx"
            onChange={handleFileChange}
            id="uploadFile"
            className="w-full absolute invisible h-full left-0 top-0"
          />
        </div>
      </div>
      <div className="text-sm w-[50%] font-medium text-Text-Primary">
        Uploaded Files
        <div className="mt-1 rounded-2xl h-[130px] bg-white flex flex-col overflow-y-auto">
          {uploadedFiles.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center h-full">
              <img src="/icons/EmptyState-upload.svg" alt="" />
              <div className="text-xs font-medium text-Text-Primary -mt-8">
                No file uploaded yet.
              </div>
            </div>
          ) : (
            <div className=" grid grid-cols-1 mt-[2px] gap-2 overflow-y-auto">
              {uploadedFiles.map((fileUpload, index) => (
                <div key={index}>
                  <FileBoxUploadingV2
                    onDelete={() => {
                      // Call the handler function passed down from the parent
                      handleDeleteFile(fileUpload);
                    }}
                    el={{
                      ...fileUpload,
                      uploadedSize: fileUpload.uploadedSize || 0,
                      totalSize: fileUpload?.file?.size,
                      progress: fileUpload.progress || 0.5,
                      formattedSize: `${formatFileSize(
                        fileUpload.uploadedSize || 0,
                      )} / ${formatFileSize(fileUpload?.file?.size || 1)}`,
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploaderSection;

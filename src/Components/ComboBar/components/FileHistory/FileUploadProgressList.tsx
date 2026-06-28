/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react';
import FileUploadProgressItem from './FileUploadProgressItem';

interface FileUploadProgressListProps {
  uploadedFiles: any[];
}

const FileUploadProgressList: FC<FileUploadProgressListProps> = ({
  uploadedFiles,
}) => {
  return (
    <div
      className="flex justify-center w-full items-start"
    >
      <div className="mt-1 w-full space-y-2">
        {uploadedFiles.map((fileUpload, index) => (
          <div key={fileUpload.file_id + '-' + index}>
            <FileUploadProgressItem file={fileUpload} />
          </div>
        ))}
        {uploadedFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10">
            <img src="/icons/document-text-rectangle.svg" alt="" />
            <div className="text-xs text-Text-Primary font-medium -mt-4">
              No data found.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadProgressList;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import FileUploadProgressItem from './FileUploadProgressItem';

interface FileUploadProgressListProps {
  uploadedFiles: any[];
}

const FileUploadProgressList: FC<FileUploadProgressListProps> = ({
  uploadedFiles,
}) => {
  const [containerMaxHeight, setContainerMaxHeight] = useState<number>(0);
  useEffect(() => {
    const calculateHeight = () => {
      const topSpacing = 80;
      const addFileButtonHeight = 32;
      const gapBetweenItems = 12;
      const tableHeaderHeight = 48;
      const bottomSpacing = 55;

      const offset =
        topSpacing +
        addFileButtonHeight +
        gapBetweenItems +
        tableHeaderHeight +
        bottomSpacing;

      const height = window.innerHeight - offset;
      setContainerMaxHeight(height);
    };

    calculateHeight();

    window.addEventListener('resize', calculateHeight);
    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, []);
  return (
    <div
      className="flex justify-center w-full items-start overflow-auto"
      style={{ maxHeight: containerMaxHeight }}
    >
      <div className="mt-[2px] w-full space-y-[2px] ">
        {uploadedFiles.map((fileUpload, index) => (
          <div key={index}>
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

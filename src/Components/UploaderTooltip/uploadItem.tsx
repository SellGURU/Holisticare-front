/* eslint-disable @typescript-eslint/no-explicit-any */

interface UploadItemProps {
  file: any;
}
const formatFileSize = (bytes: number): string => {
  const kb = bytes / 1024;
  return `${kb.toFixed(1)} KB`;
};

const UploadItem: React.FC<UploadItemProps> = ({ file }) => {
  return (
    <>
      <div
        className=" bg-white border border-Gray-50 mb-1 p-1 md:p-3 min-h-[48px] w-full rounded-[12px]  text-Text-Primary text-[10px]"
        style={{ borderColor: file.status == 'error' ? '#ff0005' : '#e9edf5 ' }}
      >
        <div className="flex justify-between items-center w-full">
          <div
            className="text-[10px]  text-Text-Primary sfileect-none  overflow-hidden whitespace-nowrap text-filelipsis"
            title={file.file_name}
          >
            {file.file_name || file.file.name}
          </div>
          {file.file_id && (
            <div className="flex w-[55px] justify-center gap-1">
              {/* <img
                    className="cursor-pointer"
                    src="/icons/eye-green.svg"
                    alt=""
                    /> */}
            </div>
          )}
        </div>
        {file.progress && file.status == 'uploading' && (
          <>
            <div className="w-full flex justify-between">
              <div>
                <div className="text-Text-Secondary text-[10px] md:text-[10px] mt-1">
                  {formatFileSize(file.uploadedSize || 0)} /{' '}
                  {formatFileSize(file?.file?.size || 1)}
                </div>
              </div>
              <div>
                <div className="text-Text-Secondary text-[10px] md:text-[10px] mt-1">
                  {file.progress < 50 ? ' ' : ' '} {Math.round(file.progress)}%
                </div>
              </div>
            </div>
            <div className="w-full h-[8px] rounded-[12px] bg-gray-200 mt-1 flex justify-start items-center">
              <div
                className="bg-Primary-DeepTeal h-[5px] rounded-[12px]"
                style={{ width: file.progress + '%' }}
              ></div>
            </div>
          </>
        )}
        {file.status === 'error' && (
          <div className="flex items-center gap-2 mt-2">
            {/* <img src="/icons/error.svg" alt="Error" className="w-4 h-4" /> */}
            <div className="text-red-500 text-[10px]">
              {file.errorMessage || 'Failed to upload file. Please try again.'}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UploadItem;

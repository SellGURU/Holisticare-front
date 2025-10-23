import { useEffect, useState } from 'react';
import TooltipTextAuto from '../../TooltipText/TooltipTextAuto';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface FileBoxProps {
  el: any;
  onDelete?: () => void;
  onClose: () => void;
}

const FileBoxUploadingV2: React.FC<FileBoxProps> = ({
  el,
  onDelete,
  onClose,
}) => {
  //   const formatDate = (dateString: string) => {
  //     const date = new Date(dateString);
  //     const months = [
  //       'Jan',
  //       'Feb',
  //       'Mar',
  //       'Apr',
  //       'May',
  //       'Jun',
  //       'Jul',
  //       'Aug',
  //       'Sep',
  //       'Oct',
  //       'Nov',
  //       'Dec',
  //     ];

  //     const day = date.getDate();
  //     const month = months[date.getMonth()];
  //     const year = date.getFullYear();

  //     return `${day} ${month} ${year}`;
  //   };
  const [isuploaded, setIsUploded] = useState(
    el.status == 'completed' ? true : false,
  );
  useEffect(() => {
    setIsUploded(el.status == 'completed' ? true : false);
  }, [el.status]);
const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'pdf':
      return '/images/Pdf.png';
    case 'doc':
    case 'docx':
      return '/icons/docx.png'; // <-- make sure you have this file in /public/images/
    default:
      return '/images/Pdf.png'; // fallback icon
  }
};

const fileName = el.file_name || el.file.name;
const fileIcon = getFileIcon(fileName);
  return (
    <>
      <div
        className=" bg-white border border-Gray-50 mb-1 py-1 px-4 h-[52px] w-full rounded-[12px]  text-Text-Primary text-[10px]"
        style={{ borderColor: el.status == 'error' ? '#FC5474' : '#e9edf5 ' }}
      >
        {isuploaded ? (
          <div className="flex justify-between items-center">
            <div className="flex justify-start gap-2">
              <img className="object-contain w-[30px] h-[40px]" src={fileIcon} alt="" />
              <div>
                <div className=" text-[10px] md:text-[12px] text-Text-Primary font-[600]">
                  <TooltipTextAuto maxWidth="400px">
                    {el.file_name || el.file.name}
                  </TooltipTextAuto>
                </div>
                <div className="flex items-center gap-3">
                  <div className=" text-[10px] md:text-[12px] text-Text-Secondary">
                    {(el.file.size / 1024).toFixed(2)} KB
                  </div>
                  {el.warning && (
                    <div className="text-[10px] md:text-[12px] text-Text-Quadruple flex items-center gap-1">
                      <img
                        src="/icons/danger-new.svg"
                        alt=""
                        className="w-4 h-4"
                      />
                      The uploaded file is not one of the clinic's Templates.
                    </div>
                  )}
                </div>
              </div>
            </div>
            <img
              onClick={onDelete}
              className="cursor-pointer w-6 h-6"
              src="/icons/delete.svg"
              alt=""
            />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center w-full">
              {/* <div className="text-[10px]  text-Text-Primary select-none  ">
                <TooltipTextAuto maxWidth="400px">
                  {el.file_name || el.file.name}
                </TooltipTextAuto>
              </div> */}

              {/* <div className="w-[70px] text-center">
                {formatDate(
                el.date_uploaded ? el.date_uploaded : new Date().toDateString(),
                )}
            </div> */}
              {el.status == 'error' ? (
                <>
                  <div className="flex gap-1 items-center justify-between w-full h-[43px]">
                    <div className="flex items-center gap-1">
                      <img src="/icons/danger-red.svg" alt="" />
                      <div className="font-semibold text-Text-Primary  md:text-xs text-[10px]">
                        {el.file.name}
                        <span className="text-[#888888]  ml-2">
                          {(el.file.size / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      </div>
                    </div>
                    <div className="flex w-auto justify-center ">
                      <img
                        onClick={onClose}
                        src="/icons/close-red.svg"
                        alt="Error"
                        className="w-4 h-4 cursor-pointer"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex w-[55px] justify-center gap-1"></div>
                </>
              )}
            </div>
            {el.progress && (
              <>
                {el.status == 'uploading' && (
                  <>
                    <div className="w-full flex justify-between">
                      <div>
                        <div className="text-Text-Secondary text-[10px] md:text-[10px] mt-1">
                          {el.progress < 50 ? ' ' : ''}{' '}
                          {Math.round(
                            el.progress > 10 ? el.progress - 2 : el.progress,
                          )}
                          %
                        </div>
                        {/* <div className="text-Text-Secondary text-[10px] md:text-[10px] mt-1">
                          {el.formattedSize}
                        </div> */}
                      </div>
                      <div></div>
                    </div>
                    <div className="w-full h-[8px] rounded-[12px] bg-gray-200 mt-1 flex justify-start items-center">
                      <div
                        className="bg-Primary-DeepTeal h-[5px] rounded-[12px]"
                        style={{ width: el.progress + '%' }}
                      ></div>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
      {el.status === 'error' && (
        <div className="flex items-center gap-2 -mt-2 pl-5">
          {/* <img src="/icons/error.svg" alt="Error" className="w-4 h-4" /> */}
          <div className="text-Red text-[10px]">
            {el.errorMessage || 'Failed to upload file. Please try again.'}
          </div>
        </div>
      )}
    </>
  );
};

export default FileBoxUploadingV2;

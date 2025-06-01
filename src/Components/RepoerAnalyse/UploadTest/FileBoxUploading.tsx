import { useEffect, useState } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface FileBoxProps {
  el: any;
  onDelete?: () => void;
}

const FileBoxUploading: React.FC<FileBoxProps> = ({ el, onDelete }) => {

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
  return (
    <>
      <div
        className=" bg-white border border-Gray-50 mb-1 p-1 md:p-3 min-h-[48px] w-full rounded-[12px]  text-Text-Primary text-[10px]"
        style={{ borderColor: el.status == 'error' ? '#ff0005' : '#e9edf5 ' }}
      >
        {isuploaded ?
        <div className='flex justify-between items-center'>
            <div className="flex justify-start gap-2">
              <img className="object-contain" src="/images/Pdf.png" alt="" />
              <div>
                <div className=" text-[10px] md:text-[12px] text-Text-Primary font-[600]">
                  {el.file_name || el.file.name}
                </div>
                <div className=" text-[10px] md:text-[12px] text-Text-Secondary">
                  {(el.file.size / 1024).toFixed(2)} KB
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
        :
        <>
            <div className="flex justify-between items-center w-full">
            <div
                className="text-[10px] w-[75px] text-Text-Primary select-none  overflow-hidden whitespace-nowrap text-ellipsis"
                title={el.file_name}
            >
                {el.file_name || el.file.name}
            </div>

            {/* <div className="w-[70px] text-center">
                {formatDate(
                el.date_uploaded ? el.date_uploaded : new Date().toDateString(),
                )}
            </div> */}
            {el.status == 'error' ? (
                <>
                <div className="flex w-auto justify-center gap-1">
                    <img
                    onClick={onDelete}
                    src="/icons/close-red.svg"
                    alt="Error"
                    className="w-6 h-6 cursor-pointer"
                    />
                </div>
                </>
            ) : (
                <>
                <div className="flex w-[55px] justify-center gap-1">

                </div>
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
                        {el.formattedSize}
                        </div>
                    </div>
                    <div>
                        <div className="text-Text-Secondary text-[10px] md:text-[10px] mt-1">
                        {el.progress < 50 ? ' ' : ''} {Math.round(el.progress)}%
                        </div>
                    </div>
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
            {el.status === 'error' && (
            <div className="flex items-center gap-2 mt-2">
                {/* <img src="/icons/error.svg" alt="Error" className="w-4 h-4" /> */}
                <div className="text-red-500 text-[10px]">
                {el.errorMessage || 'Failed to upload file. Please try again.'}
                </div>
            </div>
            )}
        </>
        }
      </div>
    </>
  );
};

export default FileBoxUploading;

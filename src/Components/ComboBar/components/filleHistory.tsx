/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import Application from '../../../api/app';
import { useParams } from 'react-router-dom';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
import FileBox from './FileBox';
import FileBoxUpload from './FileBoxUpload';
export const FilleHistory = () => {
  const [data, setData] = useState<any>(null);
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<any>(null);
  const [upLoadingFiles, setUploadingFiles] = useState<Array<any>>([]);
  useEffect(() => {
    // setIsLoading(true);
    Application.getFilleList({ member_id: id })
      .then((res) => {
        if (res.data) {
          setData(res.data);
        } else {
          throw new Error('Unexpected data format');
        }
      })
      .catch((err) => {
        console.error(err);
        // setError("Failed to fetch client data");
      })
      .finally(() => {
        // setIsLoading(false);
      });
  }, [id]);
  // const formatDate = (dateString: string) => {
  //   const date = new Date(dateString);
  //   const months = [
  //     'Jan',
  //     'Feb',
  //     'Mar',
  //     'Apr',
  //     'May',
  //     'Jun',
  //     'Jul',
  //     'Aug',
  //     'Sep',
  //     'Oct',
  //     'Nov',
  //     'Dec',
  //   ];

  //   const day = date.getDate();
  //   const month = months[date.getMonth()];
  //   const year = date.getFullYear();

  //   return `${day} ${month} ${year}`;
  // };
  return (
    <div className=" w-full">
      <div
        onClick={() => {
          document.getElementById('uploadFile')?.click();
        }}
        className=" mb-3 text-[14px] flex cursor-pointer justify-center items-center gap-1 bg-white border-Primary-DeepTeal border rounded-xl border-dashed px-8 h-8 w-full text-Primary-DeepTeal "
      >
        <img className="w-6 h-6" src="/icons/add-blue.svg" alt="" />
        Add File
      </div>
      <div className="">
        <div className="w-full text-[12px] px-2 xs:px-3 md:px-5 py-3 h-[48px] border border-Gray-50 bg-backgroundColor-Main text-Primary-DeepTeal font-medium  flex justify-between items-center rounded-[12px]">
          <div>File Name</div>
          <div>Upload Date</div>
          <div>Action</div>
        </div>

        <>
          {data?.length > 0 ? (
            <>
              <div className="flex justify-center w-full items-start overflow-auto max-h-[450px]">
                <div className="w-full mt-2">
                  {upLoadingFiles.map((el: any) => {
                    return (
                      <FileBoxUpload
                        file={el}
                        onSuccess={(fileWithId) => {
                          setData((prevFiles: any) => [
                            ...prevFiles,
                            fileWithId,
                          ]);
                          setUploadingFiles((prevUploadingFiles) =>
                            prevUploadingFiles.filter((file) => file !== el),
                          );
                        }}
                      ></FileBoxUpload>
                    );
                  })}
                  {data?.map((el: any) => {
                    return <FileBox el={el}></FileBox>;
                  })}
                </div>
              </div>
              {/* <div className="w-full mt-5 flex justify-center">
                <ButtonPrimary
                  onClick={() => {
                    document.getElementById('uploadFile')?.click();
                  }}
                  size="small"
                >
                  <img src="/icons/add-square.svg" alt="" />
                  Add File
                </ButtonPrimary>
              </div> */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf, .csv, .xls, .xlsx, .jpeg, .jpg, .png, .tiff, .txt"
                multiple
                onChange={(e: any) => {
                  const fileList = Array.from(e.target.files);
                  // setFiles([...files, ...upLoadingFiles.filter((el) => el.id)]);
                  // setUploadingFiles([]);
                  setTimeout(() => {
                    setUploadingFiles(fileList);
                  }, 200);
                  fileInputRef.current.value = '';
                }}
                id="uploadFile"
                className="w-full absolute invisible h-full left-0 top-0"
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px]">
              <img
                className=" object-contain"
                src="/icons/document-text.svg"
                alt=""
              />
              <div className="text-[12px] text-[#383838]">No Data Found</div>
            </div>
          )}
        </>
      </div>
    </div>
  );
};

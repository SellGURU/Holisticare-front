/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import Application from '../../../api/app';
import { useParams } from 'react-router-dom';
// import { ButtonPrimary } from '../../Button/ButtonPrimary';
import FileBox from './FileBox';
import FileBoxUpload from './FileBoxUpload';
import { publish } from '../../../utils/event';

export const FilleHistory = () => {
  const [data, setData] = useState<any>(null);
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<any>(null);
  const [upLoadingFiles, setUploadingFiles] = useState<Array<any>>([]);
  const [error, setError] = useState<string>('');
  useEffect(() => {
    console.log(upLoadingFiles);
    if (upLoadingFiles.filter((el: any) => !el.isFileExists).length > 0) {
      publish('fileIsUploading', {
        isUploading: true,
        files: upLoadingFiles.filter((el: any) => !el.isFileExists),
      });
    } else {
      publish('fileIsUploading', { isUploading: false });
    }
  }, [upLoadingFiles]);

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

  const validateFile = (file: File): boolean => {
    // Check file type
    const validFormats = ['.pdf', '.docx'];
    console.log(file);
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validFormats.includes(fileExtension)) {
      setError(
        `File ${file.name} has an unsupported format. Supported formats: PDF and DOCX files`,
      );
      return false;
    }

    return true;
  };

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
    <div className=" w-full">
      {error && <div className="mb-3 text-red-500 text-[10px]">{error}</div>}
      <div
        onClick={() => {
          fileInputRef.current?.click();
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
              <div
                className="flex justify-center w-full items-start overflow-auto"
                style={{ maxHeight: containerMaxHeight }}
              >
                <div className="w-full mt-2">
                  {upLoadingFiles.map((el: any) => {
                    return (
                      <FileBoxUpload
                        file={el}
                        isFileExists={el.isFileExists}
                        onSuccess={(fileWithId) => {
                          setData((prevFiles: any) => [
                            ...prevFiles,
                            fileWithId,
                          ]);
                          setUploadingFiles((prevUploadingFiles) =>
                            prevUploadingFiles.filter((file) => file !== el),
                          );
                        }}
                        onCancel={(file) => {
                          setUploadingFiles((prev) =>
                            prev.filter((f) => f !== file),
                          );
                        }}
                      />
                    );
                  })}
                  {data?.reverse()?.map((el: any) => {
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
                accept=".pdf, .xls, .xlsx"
                multiple
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setError(''); // Clear previous errors
                  const fileList = Array.from(e.target.files || []);

                  // Validate each file
                  const validFiles = fileList
                    .map((file) => {
                      // Check if file already exists in data
                      const fileExists = data?.some(
                        (existingFile: any) =>
                          existingFile.file_name.toLowerCase() ===
                          file.name.toLowerCase(),
                      );

                      // Add isFileExists to the file object itself
                      (file as any).isFileExists = fileExists;
                      return file;
                    })
                    .filter((file) => validateFile(file));
                  if (validFiles.length > 0) {
                    setTimeout(() => {
                      setUploadingFiles(validFiles);
                    }, 200);
                  }

                  fileInputRef.current.value = '';
                }}
                id="uploadFileBoxes"
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

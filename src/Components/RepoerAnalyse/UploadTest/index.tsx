/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from 'react';
import Uploading from './uploading';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import Application from '../../../api/app';
import { publish } from '../../../utils/event';

interface UploadTestProps {
  memberId: any;
  onGenderate: () => void;
  isShare?: boolean;
}

const UploadTest: React.FC<UploadTestProps> = ({
  memberId,
  onGenderate,
  isShare,
}) => {
  const fileInputRef = useRef<any>(null);
  const [files, setFiles] = useState<Array<any>>([]);
  const [upLoadingFiles, setUploadingFiles] = useState<Array<any>>([]);
  const handleDeleteFile = (fileToDelete: any) => {
    console.log(fileToDelete);

    Application.deleteLapReport({ file_id: fileToDelete.id })
      .then(() => {
        setFiles(files.filter((file) => file !== fileToDelete));
      })
      .catch((err) => {
        console.error('Error deleting the file:', err);
      });
  };
  const handleCancelUpload = (fileToCancel: any) => {
    setUploadingFiles(upLoadingFiles.filter((file) => file !== fileToCancel));
  };
  console.log(files);

  return (
    <>
      <div className=" w-full  rounded-[16px] h-full md:h-[89vh] top-4 flex justify-center  absolute left-0">
        <div className="w-full h-full opacity-85 rounded-[12px] bg-Gray-50 backdrop-blur-md absolute"></div>
        <div
          style={{ height: window.innerHeight - 60 + 'px' }}
          className=" w-[260px] h-fit overflow-auto  xs:w-[344px] md:w-[530px] relative z-10 px-2"
        >
          <div className="w-full flex justify-center text-Text-Primary font-medium mt-5 md:mt-14">
            No Data Available Yet!
          </div>
          <div className={isShare ? 'opacity-20' : ''}>
            <div className=" text-[10px] xs:text-[12px] text-Text-Primary  text-center mt-1 ">
              It looks like you haven’t uploaded any test results or completed
              any questionary yet. To view detailed insights, please upload your
              test results or complete the questionnaires now.
            </div>

            <div
              onClick={() => {
                if (!isShare) {
                  document.getElementById('uploadFile')?.click();
                }
              }}
              className="w-full shadow-100  mt-4 h-[182px] bg-white rounded-[12px] border border-Gray-50"
            >
              <div className="w-full flex justify-center mt-6">
                <img src="/icons/upload-test.svg" alt="" />
              </div>
              <div className="text-[12px] text-Text-Primary text-center mt-3">
                Drag and drop your test file here or click to upload.
              </div>
              <div className="text-Text-Secondary text-[12px] text-center mt-2 w-[220px] xs:w-[300px] md:w-[500px]">
                {`Supported formats: PDF, CSV, Excel and Text files. (Max file size: 10MB)`}
              </div>
              <div className="w-full mt-3 flex justify-center">
                <div className="text-Primary-DeepTeal cursor-pointer text-[12px] underline">
                  Upload Test Results
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf, .csv, .xls, .xlsx, .jpeg, .jpg, .png, .tiff, .txt"
                multiple
                onChange={(e: any) => {
                  const fileList = Array.from(e.target.files);
                  console.log(upLoadingFiles);
                  setFiles([...files, ...upLoadingFiles.filter((el) => el.id)]);
                  setUploadingFiles([]);
                  setTimeout(() => {
                    setUploadingFiles(fileList);
                  }, 200);
                  fileInputRef.current.value = '';
                  // fileList.forEach((file:any) => {
                  //     convertToBase64(file).then((res) => {
                  //         Application.addLabReport({
                  //             member_id:memberId,
                  //             report:{
                  //                 "file name":res.name,
                  //                 "base64 string":res.url
                  //             }
                  //         }).then(() => {
                  //             setFiles([...files,file])
                  //         })
                  //     })
                  // });
                }}
                id="uploadFile"
                className="w-full absolute invisible h-full left-0 top-0"
              />
            </div>

            <div className="mt-1 grid grid-cols-1 max-h-[200px] gap-2 py-2 px-2 overflow-y-auto">
              {files.map((el: any) => {
                return (
                  <>
                    <div className="w-full flex justify-between items-center px-4 py-2 h-[52px] bg-white shadow-200 rounded-[16px] ">
                      <div className="flex justify-start gap-2">
                        <img
                          className="object-contain"
                          src="/images/Pdf.png"
                          alt=""
                        />
                        <div>
                          <div className=" text-[10px] md:text-[12px] text-Text-Primary font-[600]">
                            {el.name}
                          </div>
                          <div className=" text-[10px] md:text-[12px] text-Text-Secondary">
                            {(el.size / 1024).toFixed(2)} KB
                          </div>
                        </div>
                      </div>
                      <img
                        onClick={() => handleDeleteFile(el)}
                        className="w-6 h-6 cursor-pointer"
                        src="/icons/delete.svg"
                        alt=""
                      />
                    </div>
                  </>
                );
              })}
              {upLoadingFiles.map((el: any) => {
                return (
                  <>
                    <Uploading
                      memberId={memberId}
                      file={el}
                      onSuccess={(fileWithId) => {
                        setFiles((prevFiles) => [...prevFiles, fileWithId]);
                        setUploadingFiles((prevUploadingFiles) =>
                          prevUploadingFiles.filter((file) => file !== el),
                        );
                      }}
                      onCancel={() => handleCancelUpload(el)}
                    ></Uploading>
                  </>
                );
              })}
            </div>

            <div className="flex justify-center items-center w-full">
              <div className="h-[1px] bg-Text-Triarty w-[180px] relative"></div>
              <div className=" text-Text-Primary text-[10px] ">
                <div className=" px-3">Additionally</div>
              </div>
              <div className="h-[1px] bg-Text-Triarty w-[180px] relative"></div>
            </div>
            <div className="w-full mt-6 flex justify-center">
              <div
                onClick={() => {
                  publish('QuestionaryTrackingCall', {});
                  // Application.questionaryLink({})
                  //   .then((res) => {
                  //     const url = res.data['Personal Information'];
                  //     if (url) {
                  //       window.open(url, '_blank');
                  //     }
                  //   })
                  //   .catch((err) => {
                  //     console.error('Error fetching the link:', err);
                  //   });
                }}
                className="text-Primary-DeepTeal cursor-pointer text-[12px] underline"
              >
                Complete Questionnaire
              </div>
            </div>

            <div className="flex justify-center mt-5">
              <ButtonSecondary
                disabled={files.length == 0}
                onClick={() => {
                  onGenderate();
                }}
              >
                <img src="/icons/tick-square.svg" alt="" />
                Develop Health Plan
              </ButtonSecondary>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadTest;

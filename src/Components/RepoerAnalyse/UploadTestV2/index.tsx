import React, { useState } from 'react';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
import Toggle from '../../Toggle';

export const UploadTestV2 = () => {
  const [step, setstep] = useState(1);
  const [activeMenu, setactiveMenu] = useState('Upload File');
  return (
    <>
      {step == 0 ? (
        <div className=" w-full  rounded-[16px] h-full md:h-[89vh] top-4 flex justify-center  absolute left-0 text-Text-Primary">
          <div className="w-full h-full opacity-85 rounded-[12px] bg-Gray-50 backdrop-blur-md absolute"></div>
          <div
            style={{ height: window.innerHeight - 60 + 'px' }}
            className="z-10 relative px-2 flex flex-col items-center justify-center"
          >
            <div className="flex flex-col gap-6 w-full">
              <div className="flex items-center flex-col gap-4">
                <div className="text-base font-medium text-Text-Primary ">
                  Provide Data to Generate Health Plan
                </div>
                <div className="text-xs text-Text-Primary  text-center">
                  Choose one or both methods below to provide a personalized
                  plan.
                </div>
              </div>
              <div className="flex w-full items-center gap-6">
                <div
                  onClick={() => {
                    setstep(1);
                  }}
                  className="w-[477px] cursor-pointer h-[269px] rounded-2xl border p-6 flex flex-col items-center gap-[12px] relative bg-white shadow-100 border-Gray-50"
                >
                  <div className="text-[#000000] text-xs font-medium mt-3">
                    Upload Lab Report or Add Biomarkers
                  </div>
                  <img
                    className="mt-3"
                    src="/icons/document-upload-new.svg"
                    alt=""
                  />
                  <div className="text-xs mt-3">
                    Upload your client's lab test file and edit or add
                    biomarkers manually.
                  </div>
                  <div className="text-xs font-medium underline text-Primary-DeepTeal cursor-pointer absolute bottom-6">
                    Enter or Upload Biomarkers
                  </div>
                </div>
                <div className="w-[477px] cursor-pointer h-[269px] rounded-2xl border p-6 flex flex-col items-center gap-[12px] relative bg-white shadow-100 border-Gray-50">
                  <div className="text-[#000000] text-xs font-medium mt-3">
                    Fill Health Questionnaire
                  </div>
                  <img
                    className="mt-5"
                    src="/icons/task-square-new.svg"
                    alt=""
                  />
                  <div className="text-xs mt-3">
                    Provide data (lifestyle, medical history, ...) for a more
                    accurate plan.
                  </div>
                  <div className="text-xs font-medium underline text-Primary-DeepTeal cursor-pointer absolute bottom-6">
                    Fill Questionnaire
                  </div>
                </div>
              </div>
              <div className="w-full flex justify-center mt-4">
                <ButtonSecondary
                  style={{
                    width: '250px',
                    borderRadius: '20px',
                  }}
                  // disabled={
                  //   showReport || questionaryLength
                  //     ? false
                  //     : uploadedFiles.filter((el) => el.status == 'completed')
                  //         .length == 0
                  // }
                  // onClick={() => {
                  //   onGenderate();
                  // }}
                >
                  <img src="/icons/tick-square.svg" alt="" />
                  Develop Health Plan
                </ButtonSecondary>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className=" w-full  rounded-[16px] h-full md:h-[89vh] top-4 flex justify-center  absolute left-0 text-Text-Primary pr-[95px]">
          <div className="w-full h-full opacity-85 rounded-[12px] bg-Gray-50 backdrop-blur-md absolute"></div>
          <div
            style={{ height: window.innerHeight - 80 + 'px' }}
            className="bg-white p-6 rounded-md w-full h-fit z-10"
          >
            <div className="w-full flex items-center justify-between">
              <div className="flex gap-2 items-center text-xs text-Text-Primary font-medium">
                <div
                  onClick={() => setstep(0)}
                  className=" cursor-pointer size-8 rounded-md p-1 bg-white border border-Gray-50 shadow-100 flex items-center justify-center"
                >
                  <img src="/icons/arrow-back.svg" alt="" />
                </div>
                Lab Data & Biomarkers
              </div>
              <ButtonPrimary
                style={{
                  width: '167px',
                }}
              >
                <img src="/icons/tick-square.svg" alt="" />
                Save Changes
              </ButtonPrimary>
            </div>
            <div className="flex w-full justify-center mt-6">
              <Toggle
                active={activeMenu}
                setActive={setactiveMenu}
                value={['Upload File', 'Add Biomarker']}
              ></Toggle>
            </div>
            {activeMenu == 'Upload File' ? (
              <div className="w-full flex flex-col mt-8 gap-2">
                <div className="flex w-full justify-between rounded-2xl border p-4 bg-white shadow-200 border-Gray-50 gap-2">
                  <div className="text-sm w-[50%]  font-medium text-Text-Primary">
                    File Uploader
                    <div
                      onClick={() => {
                        document.getElementById('uploadFile')?.click();
                      }}
                      className="mt-1 rounded-2xl h-[130px] w-full
                        py-4 px-6 bg-white border shadow-100 border-Gray-50 flex flex-col items-center justify-center "
                    >
                      <div className="w-full flex justify-center">
                        <img src="/icons/upload-test.svg" alt="" />
                      </div>
                      <div className="text-[12px] text-Text-Primary text-center mt-3">
                        Drag and drop your test file here or click to upload.
                      </div>
                      <div className="text-[#888888] font-medium text-[12px] text-center  ">
                        {`Accepted formats: .pdf, .docx.`}
                      </div>
                      {/* {errorMessage && (
                <div className="text-red-500 text-[12px] text-center mt-1 w-[220px] xs:w-[300px] md:w-[500px]">
                  {errorMessage}
                </div>
              )} */}
                      <input
                        type="file"
                        // ref={fileInputRef}
                        accept=".pdf, .docx"
                        multiple
                        // onChange={handleFileChange}
                        id="uploadFile"
                        className="w-full absolute invisible h-full left-0 top-0"
                      />
                    </div>
                  </div>
                  <div className="text-sm w-[50%] font-medium text-Text-Primary">
                    Uploaded Files
                    <div
                      className="mt-1 rounded-2xl h-[130px] 
                        py-4 px-6 bg-white  flex flex-col items-center justify-center"
                    >
                      <div className="w-full flex flex-col items-center">
                        <img src="/icons/EmptyState-upload.svg" alt="" />
                        <div className="text-xs font-medium text-Text-Primary -mt-8">
                          No file uploaded yet.
                        </div>
                      </div>

                      {/* {errorMessage && (
                <div className="text-red-500 text-[12px] text-center mt-1 w-[220px] xs:w-[300px] md:w-[500px]">
                  {errorMessage}
                </div>
              )} */}
                    </div>
                  </div>
                </div>
                <div className="w-full min-h-[290px] rounded-2xl border border-Gray-50 p-4 shadow-300 text-sm font-medium text-Text-Primary">
                  List of Biomarkers
                  <div className=" flex items-center pt-8 justify-center flex-col text-xs font-medium text-Text-Primary">
                    <img src="/icons/EmptyState-biomarkers.svg" alt="" />
                    <div className='-mt-5'>
                    No data provided yet.
                    </div>
                
                  </div>
                </div>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

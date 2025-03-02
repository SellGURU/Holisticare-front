/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from 'react';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import TextField from '../../TextField';
import AddQuestionCheckIn from './AddQuestionCheckIn';

interface CheckInModalContentProps {
  setShowModal: (value: boolean) => void;
  checkInList: Array<any>;
  setCheckInList: (value: any) => void;
}

const CheckInModalContent: FC<CheckInModalContentProps> = ({
  setShowModal,
  checkInList,
  setCheckInList,
}) => {
  console.log('checkInList => ', checkInList);
  const [addMode, setAddMode] = useState<boolean>(false);
  const [sureRemoveIndex, setSureRemoveIndex] = useState<number | null>(null);

  const handleRemove = (index: number) => {
    setCheckInList((prevList: any[]) => prevList.filter((_, i) => i !== index));
    setSureRemoveIndex(null);
  };
  return (
    <>
      <div className="flex flex-col justify-between bg-white w-[664px] rounded-[20px] p-4">
        <div className="w-full h-full">
          <div className="flex justify-start items-center">
            <div className="text-Text-Primary font-medium">
              Create a Check-In Form
            </div>
          </div>
          <div className="w-full h-[1px] bg-Boarder my-3"></div>
          <div className="w-full mt-6">
            <TextField
              type="text"
              name="formtitle"
              label="Form Title"
              placeholder="Enter community name..."
            />
          </div>
          <div className="w-full text-xs text-Text-Primary font-medium mt-6">
            Questions
          </div>
          <div
            className={`flex flex-col w-full ${addMode || checkInList?.length ? 'mt-3' : 'mt-10'} items-center justify-center`}
          >
            {checkInList?.length ? (
              <div className="max-h-[300px] min-h-[60px] overflow-y-auto w-full">
                <div className="flex flex-col items-center justify-center gap-1 w-full">
                  {checkInList?.map((item: any, index: number) => {
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between w-full h-[36px] py-2 px-4 bg-backgroundColor-Card rounded-xl border border-Gray-50"
                      >
                        <div className="text-Text-Quadruple text-[10px] w-[60%]">
                          {String(index + 1).padStart(2, '0')}
                          {'  '}
                          {item.title}
                        </div>
                        <div className="flex items-center justify-between w-[40%]">
                          <div className="text-Orange text-[8px] flex items-center justify-center w-[41%]">
                            {item.required ? (
                              <img
                                src="./icons/danger-new.svg"
                                alt=""
                                className="w-[12px] h-[12px] mr-1"
                              />
                            ) : (
                              ''
                            )}
                            {item.required ? 'Required' : ''}
                          </div>
                          <div className="text-Text-Quadruple text-[10px] w-[30%] flex items-center justify-center text-nowrap">
                            {item.type}
                          </div>
                          <div
                            className={`flex items-center justify-end ${sureRemoveIndex === index ? 'w-[35%]' : 'w-[24%]'}`}
                          >
                            {sureRemoveIndex === index ? (
                              <div className="flex items-center justify-center gap-1">
                                <div className="text-Text-Quadruple text-xs">
                                  Sure?
                                </div>
                                <img
                                  src="/icons/tick-circle-green.svg"
                                  alt=""
                                  className="w-[20px] h-[20px] cursor-pointer"
                                  onClick={() => handleRemove(index)}
                                />
                                <img
                                  src="/icons/close-circle-red.svg"
                                  alt=""
                                  className="w-[20px] h-[20px] cursor-pointer"
                                  onClick={() => setSureRemoveIndex(null)}
                                />
                              </div>
                            ) : (
                              <>
                                <img
                                  src="./icons/edit-blue.svg"
                                  alt=""
                                  className="w-[16px] h-[16px] cursor-pointer"
                                />
                                <img
                                  src="./icons/trash-blue.svg"
                                  alt=""
                                  className="w-[16px] h-[16px] ml-2 cursor-pointer"
                                  onClick={() => setSureRemoveIndex(index)}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              ''
            )}
            {!addMode && checkInList?.length ? (
              <div
                className="flex items-center justify-center text-xs cursor-pointer text-Primary-DeepTeal font-medium border-2 border-dashed rounded-xl w-full h-[36px] bg-backgroundColor-Card border-Primary-DeepTeal mb-4 mt-2"
                onClick={() => {
                  setAddMode(true);
                }}
              >
                <img
                  src="/icons/add-blue.svg"
                  alt=""
                  width="16px"
                  height="16px"
                />
                Add Question
              </div>
            ) : (
              ''
            )}
            {addMode && (
              <>
                <AddQuestionCheckIn
                  setAddMode={setAddMode}
                  setCheckInList={setCheckInList}
                />
              </>
            )}
            {!addMode && !checkInList?.length ? (
              <>
                <img
                  src="./icons/document-text-rectangle.svg"
                  alt="document-text-rectangle"
                />
                <div className="text-Text-Primary text-xs">
                  No Questions Found.
                </div>
                <ButtonSecondary
                  ClassName="rounded-[20px] w-[147px] !py-[3px] mt-3 text-nowrap mb-8"
                  onClick={() => setAddMode(true)}
                >
                  <img src="/icons/add.svg" alt="" width="20px" height="20px" />
                  Add Question
                </ButtonSecondary>
              </>
            ) : (
              ''
            )}
          </div>
        </div>
        <div className="w-full flex justify-end items-center p-2">
          <div
            className="text-Disable text-sm font-medium mr-4 cursor-pointer"
            onClick={() => {
              setShowModal(false);
              setAddMode(false);
            }}
          >
            Cancel
          </div>
          <div className="text-Primary-DeepTeal text-sm font-medium">Save</div>
        </div>
      </div>
    </>
  );
};

export default CheckInModalContent;

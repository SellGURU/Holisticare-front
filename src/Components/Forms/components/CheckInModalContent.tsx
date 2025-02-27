import { FC, useState } from 'react';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import TextField from '../../TextField';
import AddQuestionCheckIn from './AddQuestionCheckIn';

interface CheckInModalContentProps {
  setShowModal: (value: boolean) => void;
}

const CheckInModalContent: FC<CheckInModalContentProps> = ({
  setShowModal,
}) => {
  const [addMode, setAddMode] = useState<boolean>(false);
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
            className={`flex flex-col w-full ${addMode ? 'mt-3' : 'mt-10'} items-center justify-center`}
          >
            {addMode ? (
              <>
                <AddQuestionCheckIn setAddMode={setAddMode} />
              </>
            ) : (
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

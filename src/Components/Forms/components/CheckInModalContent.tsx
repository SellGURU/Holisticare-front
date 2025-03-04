/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from 'react';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import TextField from '../../TextField';
import AddQuestionCheckIn from './AddQuestionCheckIn';
import ItemInListModal from './ItemInListModal';

interface CheckInModalContentProps {
  setShowModal: (value: boolean) => void;
  checkInList: Array<any>;
  setCheckInList: (value: any) => void;
  setCheckInLists: (value: any) => void;
}

const CheckInModalContent: FC<CheckInModalContentProps> = ({
  setShowModal,
  checkInList,
  setCheckInList,
  setCheckInLists,
}) => {
  console.log('checkInList => ', checkInList);
  const [addMode, setAddMode] = useState<boolean>(false);
  const [sureRemoveIndex, setSureRemoveIndex] = useState<number | null>(null);

  const handleRemove = (index: number) => {
    setCheckInList((prevList: any[]) => prevList.filter((_, i) => i !== index));
    setSureRemoveIndex(null);
  };

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editItemSelected, setEditItemSelected] = useState('');
  const [editCheckboxChecked, setEditCheckboxChecked] = useState(false);
  const [mainTitle, setMainTitle] = useState('');

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setAddMode(true);
    setEditTitle(checkInList[index].title);
    setEditItemSelected(checkInList[index].type);
    setEditCheckboxChecked(checkInList[index].required);
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
              value={mainTitle}
              onChange={(e) => setMainTitle(e.target.value)}
            />
          </div>
          <div className="w-full text-xs text-Text-Primary font-medium mt-6">
            Questions
          </div>
          <div
            className={`flex flex-col w-full ${addMode || checkInList?.length ? 'mt-3' : 'mt-10'} items-center justify-center`}
          >
            {checkInList?.length ? (
              <div
                className={`${addMode ? 'max-h-[150px]' : 'max-h-[200px]'} min-h-[60px] overflow-y-auto w-full`}
              >
                <div className="flex flex-col items-center justify-center gap-1 w-full">
                  {checkInList?.map((item: any, index: number) => {
                    return (
                      <ItemInListModal
                        key={index}
                        index={index}
                        handleEdit={handleEdit}
                        handleRemove={handleRemove}
                        item={item}
                        setSureRemoveIndex={setSureRemoveIndex}
                        sureRemoveIndex={sureRemoveIndex}
                      />
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
                  editIndex={editIndex}
                  setEditIndex={setEditIndex}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  editItemSelected={editItemSelected}
                  setEditItemSelected={setEditItemSelected}
                  editCheckboxChecked={editCheckboxChecked}
                  setEditCheckboxChecked={setEditCheckboxChecked}
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
          <div
            className={`${mainTitle && checkInList.length > 0 ? 'text-Primary-DeepTeal' : 'text-Text-Fivefold'} text-sm font-medium cursor-pointer`}
            onClick={() => {
              setCheckInLists((prev: any) => [
                ...prev,
                {
                  item: checkInList,
                  title: mainTitle,
                  questions: checkInList.length,
                  no: prev.length + 1,
                },
              ]);
              setShowModal(false);
              setAddMode(false);
              setCheckInList([]);
            }}
          >
            Save
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckInModalContent;

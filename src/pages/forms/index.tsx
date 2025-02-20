import { useState } from 'react';
import SearchBox from '../../Components/SearchBox';
import Toggle from '../../Components/Toggle';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary';
import { MainModal } from '../../Components';
import TextField from '../../Components/TextField';

const Forms = () => {
  const [active, setActive] = useState<string>('Check-In');
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <div className="px-6 pt-8">
        <div className="w-full flex justify-between items-center">
          <div className="text-Text-Primary font-medium opacity-[87%]">
            Forms
          </div>
          <SearchBox
            ClassName="rounded-xl !h-6 !py-[0px] !px-3 !shadow-[unset]"
            placeHolder="Search in Forms ..."
            onSearch={() => {}}
          />
        </div>
        <div className="w-full h-[1px] bg-white my-3 mt-5"></div>
        <div className="w-full flex justify-center items-center flex-col">
          <Toggle
            active={active}
            setActive={setActive}
            value={['Check-In', 'Questionary']}
          />
          <img
            src="/icons/plant-device-floor.svg"
            alt="plant-device-floor"
            width="284.53px"
            height="190px"
            className="mt-16"
          />
          <div className="text-Text-Primary text-base font-medium mt-9">
            No check-in form existed yet.
          </div>
          <ButtonSecondary
            ClassName="rounded-[20px] w-[229px] mt-9"
            onClick={() => setShowModal(true)}
          >
            <img src="/icons/firstline.svg" alt="" />
            Create New
          </ButtonSecondary>
        </div>
      </div>
      <MainModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
        }}
      >
        <div className="flex flex-col justify-between bg-white w-[664px] h-[512px] rounded-[20px] p-4">
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
            <div className="flex flex-col w-full mt-10 items-center justify-center">
              <img
                src="./icons/document-text-rectangle.svg"
                alt="document-text-rectangle"
              />
              <div className="text-Text-Primary text-xs">
                No Questions Found.
              </div>
              <ButtonSecondary
                ClassName="rounded-[20px] w-[147px] !py-[3px] mt-3 text-nowrap"
                onClick={() => setShowModal(true)}
              >
                <img src="/icons/add.svg" alt="" width="20px" height="20px" />
                Add Question
              </ButtonSecondary>
            </div>
          </div>
          <div className="w-full flex justify-end items-center p-2">
            <div
              className="text-Disable text-sm font-medium mr-4 cursor-pointer"
              onClick={() => {
                setShowModal(false);
              }}
            >
              Cancel
            </div>
            <div className="text-Primary-DeepTeal text-sm font-medium">
              Save
            </div>
          </div>
        </div>
      </MainModal>
    </>
  );
};

export default Forms;

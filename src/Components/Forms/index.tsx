/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react';
import { ButtonSecondary } from '../Button/ButtosSecondary';
import MainModal from '../MainModal';
import SearchBox from '../SearchBox';
import Toggle from '../Toggle';
import CheckInModalContent from './components/CheckInModalContent';
import SvgIcon from '../../utils/svgIcon';

interface FormsProps {
  active: string;
  setActive: (value: string) => void;
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  checkInList: Array<any>;
  setCheckInList: (value: any) => void;
}

const FormsComponents: FC<FormsProps> = ({
  active,
  setActive,
  showModal,
  setShowModal,
  checkInList,
  setCheckInList,
}) => {
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
            <SvgIcon src="/icons/firstline.svg" color="#FFF" />
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
        <CheckInModalContent
          setShowModal={setShowModal}
          checkInList={checkInList}
          setCheckInList={setCheckInList}
        />
      </MainModal>
    </>
  );
};

export default FormsComponents;

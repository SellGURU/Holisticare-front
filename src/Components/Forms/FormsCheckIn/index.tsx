/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react';
import SvgIcon from '../../../utils/svgIcon';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import MainModal from '../../MainModal';
import CheckInModalContent from './components/CheckInModalContent';
import TableNoPaginateForForms from './components/TableNoPaginate';
import ScheduleModalContent from './components/ScheduleModalContent';

interface FormsProps {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  editModeModal: boolean;
  setEditModeModal: (value: boolean) => void;
  checkInList: Array<any>;
  setCheckInList: (value: any) => void;
  checkInLists: Array<any>;
  setCheckInLists: (value: any) => void;
  setCheckInListEditValue: (value: any) => void;
  checkInListEditValue: any;
  mainTitle: string;
  setMainTitle: (value: string) => void;
  repositionModeModal: boolean;
  setRepositionModeModal: (value: boolean) => void;
  showModalSchedule: boolean;
  setShowModalSchedule: (value: boolean) => void;
  selectDays: Array<any>;
  setSelectDays: (value: any) => void;
  duration: string;
  setDuration: (value: string) => void;
  earlier: number;
  setEarlier: (value: number) => void;
  time: string;
  setTime: (value: string) => void;
}

const FormsCheckIn: FC<FormsProps> = ({
  showModal,
  setShowModal,
  checkInList,
  setCheckInList,
  checkInLists,
  setCheckInLists,
  editModeModal,
  setEditModeModal,
  checkInListEditValue,
  setCheckInListEditValue,
  mainTitle,
  setMainTitle,
  repositionModeModal,
  setRepositionModeModal,
  setShowModalSchedule,
  showModalSchedule,
  selectDays,
  setSelectDays,
  duration,
  earlier,
  setDuration,
  setEarlier,
  setTime,
  time,
}) => {
  return (
    <>
      {checkInLists.length > 0 ? (
        <div className="flex flex-col w-full mt-4">
          <div className="w-full flex items-center justify-between mb-3">
            <div className="text-Text-Primary font-medium text-sm">
              Check-In Forms
            </div>
            <ButtonSecondary
              ClassName="rounded-[20px] w-[152px]"
              onClick={() => {
                setCheckInList([]);
                setMainTitle('');
                setEditModeModal(false);
                setShowModal(true);
                setRepositionModeModal(false);
              }}
            >
              <SvgIcon src="/icons/firstline.svg" color="#FFF" />
              Create New
            </ButtonSecondary>
          </div>
          <TableNoPaginateForForms
            classData={checkInLists}
            setCheckInLists={setCheckInLists}
            setCheckInListEditValue={setCheckInListEditValue}
            setEditModeModal={setEditModeModal}
            setShowModal={setShowModal}
            setRepositionModeModal={setRepositionModeModal}
            setShowModalSchedule={setShowModalSchedule}
          />
        </div>
      ) : (
        <>
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
            onClick={() => {
              setShowModal(true);
            }}
          >
            <SvgIcon src="/icons/firstline.svg" color="#FFF" />
            Create New
          </ButtonSecondary>
        </>
      )}
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
          setCheckInLists={setCheckInLists}
          editModeModal={editModeModal}
          checkInListEditValue={checkInListEditValue}
          setEditModeModal={setEditModeModal}
          mainTitle={mainTitle}
          setMainTitle={setMainTitle}
          repositionModeModal={repositionModeModal}
          setRepositionModeModal={setRepositionModeModal}
        />
      </MainModal>
      <MainModal
        isOpen={showModalSchedule}
        onClose={() => {
          setShowModalSchedule(false);
        }}
      >
        <ScheduleModalContent
          setShowModal={setShowModalSchedule}
          selectDays={selectDays}
          setSelectDays={setSelectDays}
          setDuration={setDuration}
          setEarlier={setEarlier}
          duration={duration}
          earlier={earlier}
          setTime={setTime}
          time={time}
          setCheckInLists={setCheckInLists}
          checkInListEditValue={checkInListEditValue}
        />
      </MainModal>
    </>
  );
};

export default FormsCheckIn;

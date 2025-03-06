/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import FormsCheckIn from '../../Components/Forms/FormsCheckIn';
import FormsQuestionary from '../../Components/Forms/FormsQuestionary';
import SearchBox from '../../Components/SearchBox';
import Toggle from '../../Components/Toggle';

const Forms = () => {
  const [active, setActive] = useState<string>('Check-In');
  // state for check-in
  const [showModal, setShowModal] = useState(false);
  const [showModalSchedule, setShowModalSchedule] = useState(false);
  const [editModeModal, setEditModeModal] = useState(false);
  const [repositionModeModal, setRepositionModeModal] = useState(false);
  const [checkInListModal, setCheckInListModal] = useState<Array<any>>([]);
  const [checkInLists, setCheckInLists] = useState<Array<any>>([]);
  const [checkInListEditValue, setCheckInListEditValue] = useState(null);
  const [mainTitle, setMainTitle] = useState('');
  const [selectDays, setSelectDays] = useState([]);
  const [duration, setDuration] = useState('Am');
  const [earlier, setEarlier] = useState(30);
  const [time, setTime] = useState('');
  // state for questionary
  const [showModalQuestionary, setShowModalQuestionary] = useState(false);
  const [editModeModalQuestionary, setEditModeModalQuestionary] =
    useState(false);
  const [repositionModeModalQuestionary, setRepositionModeModalQuestionary] =
    useState(false);
  const [questionaryListModal, setQuestionaryListModal] = useState<Array<any>>(
    [],
  );
  const [questionaryLists, setQuestionaryLists] = useState<Array<any>>([]);
  const [questionaryListEditValue, setQuestionaryListEditValue] =
    useState(null);
  const [mainTitleQuestionary, setMainTitleQuestionary] = useState('');
  const [step, setStep] = useState(1);
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
          {active === 'Check-In' ? (
            <FormsCheckIn
              showModal={showModal}
              setShowModal={setShowModal}
              editModeModal={editModeModal}
              setEditModeModal={setEditModeModal}
              checkInList={checkInListModal}
              setCheckInList={setCheckInListModal}
              checkInLists={checkInLists}
              setCheckInLists={setCheckInLists}
              setCheckInListEditValue={setCheckInListEditValue}
              checkInListEditValue={checkInListEditValue}
              setMainTitle={setMainTitle}
              mainTitle={mainTitle}
              repositionModeModal={repositionModeModal}
              setRepositionModeModal={setRepositionModeModal}
              setShowModalSchedule={setShowModalSchedule}
              showModalSchedule={showModalSchedule}
              setSelectDays={setSelectDays}
              selectDays={selectDays}
              setDuration={setDuration}
              setEarlier={setEarlier}
              duration={duration}
              earlier={earlier}
              setTime={setTime}
              time={time}
            />
          ) : (
            <FormsQuestionary
              setShowModalQuestionary={setShowModalQuestionary}
              showModalQuestionary={showModalQuestionary}
              editModeModalQuestionary={editModeModalQuestionary}
              setEditModeModalQuestionary={setEditModeModalQuestionary}
              repositionModeModalQuestionary={repositionModeModalQuestionary}
              setRepositionModeModalQuestionary={
                setRepositionModeModalQuestionary
              }
              questionaryListModal={questionaryListModal}
              setQuestionaryListModal={setQuestionaryListModal}
              questionaryLists={questionaryLists}
              setQuestionaryLists={setQuestionaryLists}
              questionaryListEditValue={questionaryListEditValue}
              setQuestionaryListEditValue={setQuestionaryListEditValue}
              setMainTitleQuestionary={setMainTitleQuestionary}
              mainTitleQuestionary={mainTitleQuestionary}
              setStep={setStep}
              step={step}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Forms;

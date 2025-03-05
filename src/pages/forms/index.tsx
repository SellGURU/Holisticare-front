/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import FormsCheckIn from '../../Components/Forms/FormsCheckIn';
import FormsQuestionary from '../../Components/Forms/FormsQuestionary';
import SearchBox from '../../Components/SearchBox';
import Toggle from '../../Components/Toggle';

const Forms = () => {
  const [active, setActive] = useState<string>('Check-In');
  const [showModal, setShowModal] = useState(false);
  const [showModalSchedule, setShowModalSchedule] = useState(false);
  const [editModeModal, setEditModeModal] = useState(false);
  const [repositionModeModal, setRepositionModeModal] = useState(false);
  const [checkInListModal, setCheckInListModal] = useState<Array<any>>([]);
  const [checkInLists, setCheckInLists] = useState<Array<any>>([
    {
      item: [
        {
          title: 'test 1',
          type: 'Scale',
          required: false,
        },
      ],
      title: 'test 1',
      questions: 1,
      no: 1,
    },
    {
      item: [
        {
          title: 'test 1',
          type: 'Scale',
          required: false,
        },
      ],
      title: 'test 2',
      questions: 1,
      no: 2,
    },
  ]);
  const [checkInListEditValue, setCheckInListEditValue] = useState(null);
  const [mainTitle, setMainTitle] = useState('');
  const [selectDays, setSelectDays] = useState([]);
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
            />
          ) : (
            <FormsQuestionary />
          )}
        </div>
      </div>
    </>
  );
};

export default Forms;

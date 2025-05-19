import { useState } from 'react';
import SearchBox from '../../Components/SearchBox';
import Toggle from '../../Components/Toggle';
import CheckInForm from './CheckIn/CheckinForm';

const NewForms = () => {
  const [active, setActive] = useState('Check-in');
  const [search, setSearch] = useState('');
  return (
    <>
      <div className="fixed w-full z-30 bg-bg-color px-6 pt-8 pb-2 pr-[200px]">
        <div className="w-full flex justify-between items-center">
          <div className="text-Text-Primary font-medium opacity-[87%]">
            Custom Form
          </div>
          <SearchBox
            ClassName="rounded-xl !h-6 !py-[0px] !px-3 !shadow-[unset]"
            placeHolder="Search in Forms ..."
            onSearch={(e) => setSearch(e)}
          />
        </div>
        <div className="w-full flex justify-center mt-4">
          <Toggle
            active={active}
            setActive={setActive}
            value={['Check-in', 'Questionary']}
          />
        </div>
      </div>
      <div className="px-6 pt-8 mt-[75px] ">
        <div className="w-full flex mb-16 justify-center items-center flex-col">
          {active === 'Check-in' ? (
            <>
              <CheckInForm search={search}></CheckInForm>
            </>
          ) : (
            <>
              <CheckInForm search={search} isQuestionary></CheckInForm>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default NewForms;

import { useState } from 'react';
import SearchBox from '../../Components/SearchBox';
import Toggle from '../../Components/Toggle';
import CheckInForm from './CheckIn/CheckinForm';

const NewForms = () => {
  const [active, setActive] = useState('Check-In');
  const [search, setSearch] = useState('');
  return (
    <>
      <div className="fixed w-full z-30 bg-bg-color px-6 pt-8 pb-2 pr-[200px]">
        <div className="w-full flex justify-between items-center">
          <div className="text-Text-Primary font-medium opacity-[87%]">
            Custom Forms
          </div>
          <SearchBox
            ClassName="rounded-xl !h-6 !py-[0px] !px-3 !shadow-[unset]"
            placeHolder="Search in Forms ..."
            onSearch={(e) => setSearch(e)}
          />
        </div>
        <div className="w-full h-[1px] bg-white my-3 mt-5"></div>
        <div className="w-full flex justify-center ">
          <Toggle
            active={active}
            setActive={setActive}
            value={['Check-In', 'Questionary']}
          />
        </div>
      </div>
      <div className="px-6 pt-8 mt-20 ">
        <div className="w-full flex mb-16 justify-center items-center flex-col">
          {active === 'Check-In' ? (
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

import { useState } from 'react';
import SearchBox from '../../Components/SearchBox';
import Toggle from '../../Components/Toggle';
import CheckInForm from './CheckIn/CheckinForm';

const NewForms = () => {
  const [active, setActive] = useState('Check-In');
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
            <>
              <CheckInForm></CheckInForm>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
};

export default NewForms;

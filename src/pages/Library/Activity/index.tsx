import { useState } from 'react';
import Toggle from '../../../Components/Toggle';
import SearchBox from '../../../Components/SearchBox';
import ActivityHandler from './ActivityHandler';

const Activity = () => {
  const [active, setActive] = useState<'Activity' | 'Exercise'>('Activity');
  const [dataList] = useState([]);
  return (
    <>
      <div>
        <div className="fixed w-full z-30 bg-bg-color px-6 pt-8 pb-2 pr-[200px]">
          <div className="w-full flex justify-center ">
            <Toggle
              active={active}
              setActive={(data) => {
                setActive(data as 'Exercise' | 'Activity');
              }}
              value={['Activity', 'Exercise']}
            />
          </div>
          <div className="w-full flex justify-between mt-3 items-center">
            <div className="text-Text-Primary font-medium opacity-[87%]">
              {active}
            </div>
            {dataList.length > 0 && (
              <SearchBox
                ClassName="rounded-xl !h-6 !py-[0px] !px-3 !shadow-[unset]"
                placeHolder={`Search in ${active.toLowerCase()}...`}
                onSearch={() => {}}
              />
            )}
          </div>
        </div>
        <div className="pt-[100px]">
          {active == 'Activity' ? (
            <ActivityHandler data={dataList}></ActivityHandler>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
};

export default Activity;

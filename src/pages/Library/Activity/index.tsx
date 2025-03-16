import { useState } from 'react';
import Toggle from '../../../Components/Toggle';
import SearchBox from '../../../Components/SearchBox';
import ActivityHandler from './ActivityHandler';
import { Exercise } from './Exercise';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';

const Activity = () => {
  const [active, setActive] = useState<'Activity' | 'Exercise'>('Activity');
  const [dataList, setDataList] = useState<Array<any>>([])
    const [showAdd, setShowAdd] = useState(false);
  ;
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
            <div className="flex items-center gap-2">
              {dataList.length > 0 && (
                <SearchBox
                  ClassName="rounded-xl h-6 !py-[0px] !px-3 !shadow-[unset]"
                  placeHolder={`Search in ${active.toLowerCase()}...`}
                  onSearch={() => {}}
                />
              )}
              {dataList.length > 0 && active == "Exercise" && (
                <ButtonSecondary
                                 onClick={() => {
                                   setShowAdd(true);
                                 }}
                                 ClassName="rounded-full min-w-[180px]"
                               >
                                 <img src="./icons/add-square.svg" alt="" />
                                 Add Exercise
                               </ButtonSecondary>
              )}
            </div>
          </div>
        </div>
        <div className="pt-[100px] px-6">
          {active == 'Activity' ? (
            <ActivityHandler data={dataList}></ActivityHandler>
          ) : (
            <Exercise data={dataList} setData={setDataList} showAdd={showAdd} setShowAdd={setShowAdd}></Exercise>
          )}
        </div>
      </div>
    </>
  );
};

export default Activity;

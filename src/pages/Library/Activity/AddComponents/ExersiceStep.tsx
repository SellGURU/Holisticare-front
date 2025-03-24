import { useState } from 'react';
import SearchBox from '../../../../Components/SearchBox';
import TabNavigation from './TabNavigation';

const ExersiceStep = () => {
  const [exercises] = useState([{ title: '' }]);
  return (
    <>
      <div className="w-full mt-6">
        <TabNavigation />
        <div className="flex w-full items-center justify-between">
          <div
            className={`w-[530px] h-[432px] border border-Gray-50 rounded-xl flex flex-col items-center ${!exercises.length && 'justify-center'} p-3 overflow-y-auto`}
          >
            {exercises.length == 0 && (
              <>
                <img src="/icons/amico.svg" alt="" />
                <div className="font-medium text-xs text-Text-Primary mt-8">
                  No exercise existed yet.
                </div>
              </>
            )}
            {exercises.map((exercise, index) => {
              return (
                <div
                  key={index}
                  className="w-full h-[172px] border border-Gray-50 rounded-2xl bg-backgroundColor-Card p-3"
                >
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative">
                        <img
                          src="/images/activity/activity-demo.png"
                          alt=""
                          className="w-8 h-8 bg-cover rounded-lg mr-1"
                        />
                        <img
                          src="/icons/youtube.svg"
                          alt=""
                          className="w-[15.48px] h-[16px] absolute top-[8px] left-[9px]"
                        />
                      </div>
                      <div className="text-xs text-Text-Primary">Squats</div>
                    </div>
                    <img
                      src="/icons/more.svg"
                      alt=""
                      className="w-4 h-4 cursor-pointer"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="w-[314px] h-[432px] rounded-xl bg-backgroundColor-Main flex flex-col p-3">
            <div className="flex w-full items-center justify-between mt-1">
              <div className="font-medium text-sm text-Text-Primary">
                Exercise
              </div>
              <div className="flex items-center gap-1 text-Primary-DeepTeal font-medium text-xs cursor-pointer">
                <img src="/icons/add-blue.svg" alt="" className="w-5 h-5" />
                Add Exercise
              </div>
            </div>
            <SearchBox
              ClassName="rounded-2xl !h-8 !min-w-full border border-Gray-50 !py-[0px] !px-3 !shadow-[unset] !bg-white mt-3"
              placeHolder="Search ..."
              onSearch={() => {}}
            />
            <div className="flex flex-col overflow-y-auto w-full min-h-[300px] gap-1 mt-1">
              <div className="w-full h-[40px] bg-white px-2 py-1 rounded-xl flex items-center justify-between">
                <div className="flex items-center justify-center gap-[5px]">
                  <div className="relative">
                    <img
                      src="/images/activity/activity-demo.png"
                      alt=""
                      className="w-8 h-8 bg-cover rounded-lg mr-1"
                    />
                    <img
                      src="/icons/video-octagon.svg"
                      alt=""
                      className="w-[17.79px] h-[17.79px] absolute top-[7px] left-[7px]"
                    />
                  </div>
                  <div className="text-xs text-Text-Primary">Squats</div>
                  <div className="text-[8px] text-Text-Quadruple">
                    (2 Videos)
                  </div>
                </div>
                <img
                  src="/icons/add-blue.svg"
                  alt=""
                  className="w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExersiceStep;

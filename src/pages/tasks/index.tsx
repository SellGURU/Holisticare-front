/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import Circleloader from '../../Components/CircleLoader';
import BoxActivity from './components/BoxActivity';
import { useParams } from 'react-router-dom';
import Mobile from '../../api/mobile';
import BoxTexts from './components/BoxTexts';
import BoxTitleText from './components/BoxTitleText';
import BoxValue from './components/BoxValue';
import Frequency from './components/Frequency';
import RenderNutrient from './components/RenderNutrient';
import Times from './components/Times';
// import { mockData } from './mockData';

const Tasks = () => {
  const { encode, id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    setIsLoading(true);

    Mobile.getTasks({
      encoded_mi: encode as string,
      task_id: id as string,
    })
      .then((data) => {
        setData(data.data);
        setIsLoading(false);
      })
      .catch(() => {});
  }, []);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollUp = () => {
    scrollRef.current?.scrollBy({ top: -100, behavior: 'smooth' });
  };

  const scrollDown = () => {
    scrollRef.current?.scrollBy({ top: 100, behavior: 'smooth' });
  };

  return (
    <>
      <div
        className="w-full py-3 px-4 h-[100vh] overflow-y-scroll"
        ref={scrollRef}
      >
        {isLoading ? (
          <>
            <div className="flex justify-center items-center mt-20">
              <Circleloader></Circleloader>
            </div>
          </>
        ) : (
          <div className="flex flex-col w-full h-full gap-2">
            <BoxTitleText title="Description" text={data?.Description || ''} />
            <BoxTitleText title="Instruction" text={data?.Instruction || ''} />
            <Frequency
              type={data?.Frequency_Type || 'daily'}
              data={data?.Frequency_Dates || []}
            />
            <Times times={data?.Times || []} />
            {data?.Category === 'Diet' && (
              <div className="w-full p-3 rounded-xl border border-Gray-15 bg-backgroundColor-Secondary flex flex-col gap-2">
                <div className="text-xs font-medium text-Text-Primary">
                  Macros Goal
                </div>
                <div className="flex items-center flex-grow-[1] justify-between">
                  {RenderNutrient(
                    'Carbs',
                    data?.Total_macros?.Carbs || 0,
                    '/icons/carbs-preview.svg',
                  )}
                  {RenderNutrient(
                    'Proteins',
                    data?.Total_macros?.Protein || 0,
                    '/icons/proteins-preview.svg',
                  )}
                  {RenderNutrient(
                    'Fats',
                    data?.Total_macros?.Fats || 0,
                    '/icons/fats-preview.svg',
                  )}
                </div>
              </div>
            )}
            {data?.Category === 'Supplement' && (
              <BoxTitleText title="Dose" text={data?.Dose || ''} />
            )}
            {data?.Category === 'Lifestyle' && (
              <BoxValue
                title="Value"
                value={data?.Value || 0}
                setVal={() => {}}
              />
            )}
            {data?.Category === 'Activity' &&
            data?.Activity_Location?.length > 0 ? (
              <BoxTexts texts={data?.Activity_Location || []} />
            ) : (
              ''
            )}
            {data?.Category === 'Activity' && <BoxActivity activities={data} />}
          </div>
        )}
      </div>
      <div className="fixed top-4 right-4 flex flex-col gap-2 z-50">
        <button
          onClick={scrollUp}
          className="bg-white border border-gray-300 shadow-md rounded-full p-2 hover:bg-gray-100 transition"
        >
          <img
            src="/icons/arrow-up.svg"
            alt="Scroll Up"
            className="w-4 h-4 rotate-90"
          />
        </button>
      </div>
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        <button
          onClick={scrollDown}
          className="bg-white border border-gray-300 shadow-md rounded-full p-2 hover:bg-gray-100 transition"
        >
          <img
            src="/icons/arrow-down-blue.svg"
            alt="Scroll Down"
            className="w-4 h-4"
          />
        </button>
      </div>
    </>
  );
};

export default Tasks;

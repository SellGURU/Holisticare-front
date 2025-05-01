/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import Application from '../../../api/app';
import { useParams } from 'react-router-dom';
import Circleloader from '../../CircleLoader';
// type Step = {
//   title: string;
//   explains: string[];
// };

// type Section = {
//   status: string;
//   steps: Step[];
// };
const resolveStatusColor = (state: string) => {
  switch (state) {
    case 'Completed':
      return '#06C78D';
    case 'On Going':
      return '#3C79D6';
    case 'Paused':
      return '#E84040';
    case 'Up Coming':
      return '#FFC123';
    default:
      return '#3C79D6'; // Fallback color
  }
};
// const steps: Section[] = [
//   {
//     status: 'On Going',

//     steps: [
//       {
//         title: 'Step Title',
//         explains: ['Explain 1', 'Explain 2', 'Explain 3'],
//       },
//       {
//         title: 'Step Title',
//         explains: ['Explain 1', 'Explain 2', 'Explain 3'],
//       },
//       {
//         title: 'Step Title',
//         explains: ['Explain 1', 'Explain 2', 'Explain 3'],
//       },
//       {
//         title: 'Step Title',
//         explains: ['Explain 1', 'Explain 2', 'Explain 3'],
//       },
//       {
//         title: 'Step Title',
//         explains: ['Explain 1', 'Explain 2', 'Explain 3'],
//       },
//       {
//         title: 'Step Title',
//         explains: ['Explain 1', 'Explain 2', 'Explain 3'],
//       },
//       {
//         title: 'Step Title',
//         explains: ['Explain 1', 'Explain 2', 'Explain 3'],
//       },
//       {
//         title: 'Step Title',
//         explains: ['Explain 1', 'Explain 2', 'Explain 3'],
//       },
//       { title: 'Step Title', explains: ['Explain 1', 'Explain 2'] },
//       {
//         title: 'Step Title',
//         explains: ['Explain 1', 'Explain 2', 'Explain 3', 'Explain 4'],
//       },
//       { title: 'Step Title', explains: ['Explain 1'] },
//     ],
//   },
//   {
//     status: 'Upcoming',

//     steps: [
//       {
//         title: 'Step Title',
//         explains: ['Explain 1', 'Explain 2', 'Explain 3'],
//       },
//       { title: 'Step Title', explains: ['Explain 1', 'Explain 2'] },
//       {
//         title: 'Step Title',
//         explains: ['Explain 1', 'Explain 2', 'Explain 3'],
//       },
//     ],
//   },
// ];

const TimelineStep: React.FC<{
  title: string;
  explains: string[];
  status: string;
  index: number;
}> = ({ title, explains, status, index }) => (
  <>
    <div className=" w-full  relative mt-4    mb-14 text-xs">
      <div className={` relative  w-full`}>
        <div
          className="  w-6 h-6 rounded-full flex items-center justify-center z-20 "
          style={{ backgroundColor: resolveStatusColor(status) }}
        >
          <img className="  w-4 h-4" src="/icons/tick-square.svg" alt="" />
        </div>

        <div
          className={` absolute -mt-5 ${
            index % 2 == 0 ? 'left-[24px]' : 'right-[24px]'
          } -z-[1]  `}
        >
          <div
            className={` bg-Primary-DeepTeal text-nowrap max-w-[130px] rounded-lg px-1 text-white text-[10px]`}
          >
            {title}
          </div>

          <div
            className={`relative top-1  ${
              index % 2 == 0 ? '-right-4 ' : 'left-20 '
            }`}
          >
            {index % 2 == 0 ? (
              <img src="/icons/Vector 389.svg" alt="" />
            ) : (
              <img src="/icons/Vector 393.svg" alt="" />
            )}
          </div>

          <div
            className={`flex flex-col mt-1  ${
              index % 2 == 0 ? '-right-[90px] ' : '-left-[90px] '
            }} `}
          >
            {explains.map((explain, index) => (
              <div
                key={index}
                className=" flex items-start ml-2 text-[8px] text-Text-Secondary"
              >
                {/* <div className="w-[3px] min-w-[3px] min-h-[3px] h-[3px] bg-Orange rounded-full"></div>{' '} */}
                <div>{explain}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </>
);

const TimeLine: React.FC = () => {
  const [isLaoding, setIsLoading] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [steps, setSteps] = useState<Array<any>>([]);
  const transformData = (events: any[]): any[] => {
    const groupedData: Record<string, any> = {};

    events.forEach(({ event_title, event_description, State }) => {
      if (!groupedData[State]) {
        groupedData[State] = { status: State, steps: [] };
      }
      groupedData[State].steps.push({
        title: event_title,
        explains: event_description,
        status: State,
      });
    });

    return Object.values(groupedData);
  };
  useEffect(() => {
    setIsLoading(true);
    Application.showTimeLine({
      member_id: id,
    }).then((res) => {
      setIsLoading(false);
      setSteps(transformData(res.data.Events));
    });
  }, []);
  console.log(steps);
  
  return (
    <>
      {isLaoding ? (
        <div className="w-full flex justify-center items-center h-[220px]">
          <Circleloader></Circleloader>
        </div>
      ) : (
        <div className="flex flex-col items-center  text-xs max-h-[530px] md:max-h-[600px] overflow-auto overflow-x-hidden">
          {steps.map((section, index) => (
            <div key={index} className="flex flex-col items-center  relative ">
              <div
                className={`px-2.5 py-1 text-[10px] rounded-full text-Text-Primary  ${
                  section.status === 'On Going'
                    ? 'bg-[#8ECAE6]'
                    : section.status === 'Completed' ? 'bg-[#DEF7EC]' : 'bg-[#F9DEDC]'
                } flex items-center gap-1`}
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: resolveStatusColor(section.status),
                  }}
                ></div>
                {section.status}
              </div>

              {/* <div className='h-full bg-red-600 w-2 absolute left-[46%] top-6 '></div> */}
              <div className="relative ">
                <div
                  style={{
                    backgroundColor: resolveStatusColor(section.status),
                  }}
                  className={`absolute block  w-[3px] h-[120%] right-3 
            ml-5  -z-[1]`}
                ></div>
                {section.steps.map((step: any, index: number) => (
                  <TimelineStep
                    key={index}
                    title={step.title}
                    explains={step.explains}
                    status={section.status}
                    index={index}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default TimeLine;

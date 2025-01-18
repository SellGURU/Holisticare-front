import React from 'react';

type Step = {
  title: string;
  explains: string[];
};

type Section = {
  status: string;
  steps: Step[];
};
const resolveStatusColor = (state: string) => {
  switch (state) {
    case 'Completed':
      return '#55DD4A';
    case 'On Going':
      return '#3C79D6';
    case 'Paused':
      return '#E84040';
    case 'Upcoming':
      return '#FFC123';
    default:
      return '#3C79D6'; // Fallback color
  }
};
const steps: Section[] = [
  {
    status: 'On Going',

    steps: [
      {
        title: 'Step Title',
        explains: ['Explain 1', 'Explain 2', 'Explain 3'],
      },
      {
        title: 'Step Title',
        explains: ['Explain 1', 'Explain 2', 'Explain 3'],
      },
      {
        title: 'Step Title',
        explains: ['Explain 1', 'Explain 2', 'Explain 3'],
      },
      {
        title: 'Step Title',
        explains: ['Explain 1', 'Explain 2', 'Explain 3'],
      },
      {
        title: 'Step Title',
        explains: ['Explain 1', 'Explain 2', 'Explain 3'],
      },
      {
        title: 'Step Title',
        explains: ['Explain 1', 'Explain 2', 'Explain 3'],
      },
      {
        title: 'Step Title',
        explains: ['Explain 1', 'Explain 2', 'Explain 3'],
      },
      {
        title: 'Step Title',
        explains: ['Explain 1', 'Explain 2', 'Explain 3'],
      },
      { title: 'Step Title', explains: ['Explain 1', 'Explain 2'] },
      {
        title: 'Step Title',
        explains: ['Explain 1', 'Explain 2', 'Explain 3', 'Explain 4'],
      },
      { title: 'Step Title', explains: ['Explain 1'] },
    ],
  },
  {
    status: 'Upcoming',

    steps: [
      {
        title: 'Step Title',
        explains: ['Explain 1', 'Explain 2', 'Explain 3'],
      },
      { title: 'Step Title', explains: ['Explain 1', 'Explain 2'] },
      {
        title: 'Step Title',
        explains: ['Explain 1', 'Explain 2', 'Explain 3'],
      },
    ],
  },
];

const TimelineStep: React.FC<{
  title: string;
  explains: string[];
  status: string;
  index: number;
}> = ({ title, explains, status, index }) => (
  <>
    <div className=" w-full  relative mt-2    mb-4 text-xs">
      <div className={` relative  w-full`}>
        <div
          className="  w-6 h-6 rounded-full flex items-center justify-center z-20 "
          style={{ backgroundColor: resolveStatusColor(status) }}
        >
          <img className="  w-4 h-4" src="/icons/tick-square.svg" alt="" />
        </div>

        <div
          className={` absolute -mt-5 ${
            index % 2 == 0 ? 'ml-3' : '-ml-16'
          } -z-[1] text-nowrap bg-Primary-DeepTeal rounded-lg px-4 text-white text-[10px]`}
        >
          {title}
        </div>

        <div
          className={`relative top-0 ${
            index % 2 == 0 ? '-right-12 ' : '-left-10 '
          }`}
        >
          {index % 2 == 0 ? (
            <img src="/icons/Vector 389.svg" alt="" />
          ) : (
            <img src="/icons/Vector 393.svg" alt="" />
          )}
        </div>
      </div>
      <div
        className={`flex flex-col absolute z-50  top-7 ${
          index % 2 == 0 ? '-right-[90px] ' : '-left-[90px] '
        }} `}
      >
        {explains.map((explain, index) => (
          <div
            key={index}
            className=" flex items-center gap-1 text-[8px] text-Text-Secondary"
          >
            <div className="w-[3px] h-[3px] bg-Orange rounded-full"></div>{' '}
            {explain}
          </div>
        ))}
      </div>
    </div>
  </>
);

const TimeLine: React.FC = () => {
  return (
    <div className="flex flex-col items-center  text-xs max-h-[600px] overflow-auto ">
      {steps.map((section, index) => (
        <div key={index} className="flex flex-col items-center mb-6  relative ">
          <div
            className={`px-2.5 py-1 text-[10px] rounded-full text-Text-Primary  ${
              section.status === 'On Going' ? 'bg-[#8ECAE6]' : 'bg-[#F9DEDC]'
            } flex items-center gap-1`}
          >
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: resolveStatusColor(section.status) }}
            ></div>
            {section.status}
          </div>

          {/* <div className='h-full bg-red-600 w-2 absolute left-[46%] top-6 '></div> */}
          <div className="relative ">
            <div
              style={{ backgroundColor: resolveStatusColor(section.status) }}
              className={`absolute block  w-[3px] h-[120%] right-3 
        ml-5  -z-[1]`}
            ></div>
            {section.steps.map((step, index) => (
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
  );
};

export default TimeLine;

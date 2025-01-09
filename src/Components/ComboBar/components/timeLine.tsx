import React from "react";

type Step = {
  title: string;
  explains: string[];
};

type Section = {
  status: string;
  color: string;
  steps: Step[];
};
const resolveStatusColor = (state: string) => {
  switch (state) {
    case "Completed":
      return "#55DD4A";
    case "On Going":
      return "#3C79D6";
    case "Paused":
      return "#E84040";
    case "Upcoming":
      return "#FFC123";
    default:
      return "#3C79D6"; // Fallback color
  }
};
const steps: Section[] = [
  {
    status: "On Going",
    color: "bg-blue-500",
    steps: [
      {
        title: "Step Title",
        explains: ["Explain 1", "Explain 2", "Explain 3"],
      },
      { title: "Step Title", explains: ["Explain 1", "Explain 2"] },
      {
        title: "Step Title",
        explains: ["Explain 1", "Explain 2", "Explain 3", "Explain 4"],
      },
      { title: "Step Title", explains: ["Explain 1"] },
    ],
  },
  {
    status: "Upcoming",
    color: "bg-orange-400",
    steps: [
      {
        title: "Step Title",
        explains: ["Explain 1", "Explain 2", "Explain 3"],
      },
      { title: "Step Title", explains: ["Explain 1", "Explain 2"] },
      {
        title: "Step Title",
        explains: ["Explain 1", "Explain 2", "Explain 3"],
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
  <div className=" w-full relative min-h-[100px]   mb-4 text-xs">
    <div className={`flex items-center relative`}>
      {index % 2 !== 0 && (
        <div
          className={`bg-Primary-DeepTeal rounded-tl-lg rounded-bl-lg pl-1 text-white text-[10px] pr-4 -mr-3    `}
        >
          {title}
        </div>
      )}
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center z-10 "
        style={{ backgroundColor: resolveStatusColor(status) }}
      >
        <img className="w-4 h-4" src="/icons/tick-square.svg" alt="" />
      </div>
      {index % 2 == 0 && (
        <div
          className={`bg-Primary-DeepTeal rounded-tr-lg rounded-br-lg pl-4 text-white text-[10px] pr-1 -ml-3   `}
        >
          {title}
        </div>
      )}
      <div className="absolute top-6 right-0">
        <img src="/icons/Vector 389.svg" alt="" />
      </div>
    </div>
    <div className="flex flex-col absolute z-50 -right-[70px] top-7 ">
      <div>
        {explains.map((explain, index) => (
          <div key={index} className="ml-4">
            • {explain}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TimeLine: React.FC = () => {
  return (
    <div className="flex flex-col items-center p-5 text-xs ovey ">
      {steps.map((section, index) => (
        <div
          key={index}
          className="flex flex-col items-center mb-8 relative "
        >
          <div
            className={`px-2.5 py-1 rounded-full text-Text-Primary  ${
              section.status === "On Going" ? "bg-[#8ECAE6]" : "bg-[#F9DEDC]"
            } flex items-center gap-1`}
          >
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: resolveStatusColor(section.status) }}
            ></div>
            {section.status}
          </div>
          {/* <div className='h-full bg-red-600 w-2 absolute left-[46%] top-6 '></div> */}

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
      ))}
    </div>
  );
};

export default TimeLine;

//  w-full  h-[75vh] pb-20 md:h-full overflow-y-scroll  bg-white rounded-2xl shadow-200 p-4
import React from 'react';
import { Info } from 'lucide-react';

type Reference = {
  text: string;
  filename: string;
};

type HealthMessage = {
  response_text: string;
  references: Reference[];
  looking_forwards: string[];
  biomarker_insight: string[];
  client_insight: string[];
};

// type TooltipProps = {
//   text: React.ReactNode;
//   children: React.ReactNode; // اینجا مشکل حل شد ✅
// };

const Tooltip: React.FC<{
  text: React.ReactNode;
  children: React.ReactNode;
}> = ({ text, children }) => {
  return (
    <div className="relative group inline-block">
      {children}
      <div
        className="
          absolute left-[-300px] text-justify bg-white text-Text-Secondary transform -translate-x-1/2 mt-2
          opacity-0 group-hover:opacity-100 
          pointer-events-none
          transition-opacity duration-200
          w-[800px] max-h-[520px]   text-xs 
          rounded-lg shadow-lg p-3 z-50
        "
      >
        {text}
      </div>
    </div>
  );
};

type Props = {
  data: HealthMessage;
};

const PlayGproundShow: React.FC<Props> = ({ data }) => {
  return (
    <>
      <div className="flex gap-6 absolute right-10 bg-white top-14">
        {/* References */}
        <Tooltip
          text={
            <ul className="list-disc list-inside text-Text-Secondary bg-white space-y-1">
              {data.references.map((ref, i) => (
                <li key={i}>
                  <span className="font-semibold">{ref.filename}:</span>{' '}
                  {ref.text}
                </li>
              ))}
            </ul>
          }
        >
          <button className="flex items-center text-[14px] gap-1  text-Text-Secondary hover:text-Text-Primary">
            <Info size={14} /> References
          </button>
        </Tooltip>

        {/* سایر اطلاعات */}
        <Tooltip
          text={
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold">Biomarker Insights:</h4>
                <ul className="list-disc list-inside">
                  {data.biomarker_insight?.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Client Insights:</h4>
                <ul className="list-disc list-inside">
                  {data.client_insight?.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Looking Forwards:</h4>
                <ul className="list-disc list-inside">
                  {data.looking_forwards?.map((l, i) => <li key={i}>{l}</li>)}
                </ul>
              </div>
            </div>
          }
        >
          <button className="flex items-center text-[14px] gap-1  text-Text-Secondary hover:text-Text-Primary">
            <Info size={14} /> More Info
          </button>
        </Tooltip>
      </div>
      <div className="w-full  h-[75vh] pb-20 md:h-full overflow-y-scroll  bg-white rounded-2xl shadow-200 p-4">
        {/* response_text */}
        <div>
          <div className="">
            <h2 className="text-lg font-bold mb-2">Practitioner Comment</h2>
          </div>

          <div className="prose text-Text-Primary text-[12px] text-justify whitespace-pre-line">
            {data.response_text}
          </div>
        </div>

        {/* دکمه‌ها */}
      </div>
    </>
  );
};

export default PlayGproundShow;

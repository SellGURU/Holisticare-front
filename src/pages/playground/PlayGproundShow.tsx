/* eslint-disable @typescript-eslint/no-explicit-any */
//  w-full  h-[75vh] pb-20 md:h-full overflow-y-scroll  bg-white rounded-2xl shadow-200 p-4
import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { MainModal } from '../../Components';
// import { MainModal } from '../../Components';

type Reference = {
  text: string;
  filename: string;
};

type HealthMessage = {
  Agent: string;
  date_created: string; // ISO Date
  Email: string;
  Age: number;
  Gender: 'male' | 'female' | string;
  Conditions: string[] | null;
  Medications: string[] | null;
  'Filled Questionnaires': any[]; // اگر فرم ساختار خاصی دارد میشه تایپ دقیق‌تری گذاشت
  'Looking Forwards': string[];
  'Biomarker Insights': string[];
  'Client Insights': string[];
  response_text: string;
  references: Array<Reference>;
};

// type TooltipProps = {
//   text: React.ReactNode;
//   children: React.ReactNode; // اینجا مشکل حل شد ✅
// };

const Tooltip: React.FC<{
  text: React.ReactNode;
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="relative group inline-block">
      {children}
      {/* <div
        className="
          absolute left-[-350px] text-justify overflow-hidden bg-white text-Text-Secondary transform -translate-x-1/2 mt-2
          opacity-0 group-hover:opacity-100 
          pointer-events-none
          transition-opacity duration-200
          w-[900px] max-h-[520px]   text-xs 
          rounded-lg shadow-lg p-3 z-50
        "
      >
        {text}
      </div> */}
    </div>
  );
};

type Props = {
  data: HealthMessage;
};

const PlayGproundShow: React.FC<Props> = ({ data }) => {
  const [isOpenMoreInfo, setIsOpenMoreInfo] = useState(false);
  const [isOpenMoreInfoReferences, setIsOpenMoreInfoReferences] =
    useState(false);
  return (
    <>
      <div className="flex gap-6 absolute right-10 bg-white top-14">
        {/* References */}
        <Tooltip text={<></>}>
          <button
            onClick={() => setIsOpenMoreInfoReferences(true)}
            className="flex items-center text-[14px] gap-1  text-Text-Secondary hover:text-Text-Primary"
          >
            <Info size={14} /> References
          </button>
        </Tooltip>
        <Tooltip text={<></>}>
          <button
            onClick={() => setIsOpenMoreInfo(true)}
            className="flex items-center text-[14px] gap-1  text-Text-Secondary hover:text-Text-Primary"
          >
            <Info size={14} /> More Info
          </button>
        </Tooltip>
      </div>
      <div className="w-full  h-[75vh] pb-20 md:h-full overflow-y-scroll  bg-white rounded-2xl shadow-200 p-4">
        {/* response_text */}
        <div>
          <div className="">
            <h2 className="text-lg font-bold mb-2">{data.Agent}</h2>
          </div>

          <div className="prose text-Text-Primary text-[12px] text-justify whitespace-pre-line">
            {data.response_text}
          </div>
        </div>

        {/* دکمه‌ها */}
      </div>
      <MainModal
        isOpen={isOpenMoreInfo}
        onClose={() => {
          setIsOpenMoreInfo(false);
        }}
      >
        <>
          <div className=" w-[800px] h-[500px] text-Text-Primary text-[14px] overflow-y-scroll bg-white rounded-lg p-4">
            <div className="space-y-3">
              {Object.entries(data).map(([key, value]) => {
                // اگر null یا undefined باشه
                if (key === 'references') return null;
                if (value == null) return null;

                // اگر آرایه یا رشته باشه و خالی باشه
                if (
                  (Array.isArray(value) || typeof value === 'string') &&
                  value.length === 0
                ) {
                  return null;
                }

                return (
                  <div key={key}>
                    <h4 className="font-semibold">{key}:</h4>
                    <ul className="list-disc list-inside">
                      {Array.isArray(value) ? (
                        value.map((v, i) => <li key={i}>{String(v)}</li>)
                      ) : (
                        <li>{String(value)}</li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      </MainModal>

      <MainModal
        isOpen={isOpenMoreInfoReferences}
        onClose={() => {
          setIsOpenMoreInfoReferences(false);
        }}
      >
        <div className=" w-[800px] h-[500px] overflow-y-scroll bg-white rounded-lg p-4">
          <ul className="list-disc list-inside text-Text-Primary text-[14px] text-justify bg-white space-y-1">
            {data.references.map((ref, i) => (
              <li key={i}>
                <span className="font-semibold">{ref.filename}:</span>{' '}
                {ref.text}
              </li>
            ))}
          </ul>
        </div>
      </MainModal>
    </>
  );
};

export default PlayGproundShow;

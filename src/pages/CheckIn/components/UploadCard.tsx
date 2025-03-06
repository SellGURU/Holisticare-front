/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState } from "react";
import { useState } from 'react';
import ItemUpload from './ItemUpload';
import SvgIcon from '../../../utils/svgIcon';

interface UploadCardProps {
  question: string;
  value?: number;
  index?: number;
  onSubmit?: (values: any) => void;
}

const UploadCard: React.FC<UploadCardProps> = ({
  index,
  question,
  onSubmit,
}) => {
  const [frontal, setFrotal] = useState('');
  const [back, setBack] = useState('');
  const [side, setSide] = useState('');
  const [isCanUpload, setISCanUpload] = useState(false);
  const submit = () => {
    setISCanUpload(false);
    if (onSubmit) {
      onSubmit({
        frontal: frontal,
        Back: back,
        side: side,
      });
    }
  };
  return (
    <>
      <div className="bg-[#FCFCFC] p-3 w-full h-full rounded-[12px] border border-gray-50">
        <div className="flex justify-between items-center">
          <div className="text-[12px] text-Text-Primary">
            {index}. {question}
          </div>

          <div
            onClick={() => setISCanUpload(true)}
            className="cursor-pointer flex justify-end items-center gap-1"
          >
            <img src="./icons/upload.svg" alt="" />
            <span className="text-Primary-EmeraldGreen text-[10px] font-medium">
              Upload
            </span>
          </div>
        </div>
        {isCanUpload ? (
          <>
            <div className="w-full bg-white rounded-[8px] p-2 mt-4">
              <div className="flex justify-between">
                <div className="text-[12px] text-[#B0B0B0]">Jan 27, 2024</div>
                <div className="flex justify-end items-center gap-2">
                  <div
                    onClick={() => {
                      setISCanUpload(false);
                    }}
                    className="w-6 flex justify-center items-center h-6 border-[1.6px] border-[#FC5474] rounded-[8px]"
                  >
                    <SvgIcon color="#FC5474" src="./icons/close.svg" />
                  </div>
                  <div
                    onClick={() => {
                      submit();
                    }}
                    className="w-6 flex cursor-pointer justify-center items-center h-6 border-[1.6px] border-Primary-EmeraldGreen bg-Primary-EmeraldGreen rounded-[8px]"
                  >
                    <SvgIcon color="#FFFFFF" src="./icons/tick-green.svg" />
                    {/* <img src="./icons/tick-green.svg" alt="" /> */}
                  </div>
                </div>
              </div>
              <div className="w-full gap-4 flex justify-center items-center mt-2">
                <ItemUpload
                  onUpload={(strem) => {
                    setFrotal(strem);
                  }}
                  name="Frontal"
                ></ItemUpload>
                <ItemUpload
                  onUpload={(strem) => {
                    setBack(strem);
                  }}
                  name="Back"
                ></ItemUpload>
                <ItemUpload
                  onUpload={(strem) => {
                    setSide(strem);
                  }}
                  name="Side"
                ></ItemUpload>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mt-4 text-[#B0B0B0] text-[10px]">No Files yet.</div>
          </>
        )}
      </div>
    </>
  );
};

export default UploadCard;

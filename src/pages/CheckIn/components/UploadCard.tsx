/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import ItemUpload from './ItemUpload';
import SvgIcon from '../../../utils/svgIcon';

interface UploadCardProps {
  question: string;
  value?: { frontal?: string; back?: string; side?: string };
  index?: number;
  onSubmit?: (values: any) => void;
  hideQuestions?: boolean;
  isPreview?: boolean;
}

const UploadCard: React.FC<UploadCardProps> = ({
  index,
  question,
  value,
  onSubmit,
  hideQuestions,
  isPreview,
}) => {
  useEffect(() => {
    setBack(value?.back || '');
    setFrontal(value?.frontal || '');
    setSide(value?.side || '');
  }, [value]);
  const [frontal, setFrontal] = useState(value?.frontal || '');
  const [back, setBack] = useState(value?.back || '');
  const [side, setSide] = useState(value?.side || '');
  const [isCanUpload, setISCanUpload] = useState(false);

  useEffect(() => {
    if (onSubmit) {
      onSubmit({ frontal, back, side });
    }
  }, [frontal, back, side]);

  const submit = () => {
    setISCanUpload(false);
    if (onSubmit) {
      onSubmit({
        frontal,
        back,
        side,
      });
    }
  };

  const hasFiles = frontal || back || side;

  return (
    <div className="bg-[#FCFCFC] p-3 w-full  rounded-[12px] border border-gray-50">
      <div className="flex justify-between items-center">
        {!hideQuestions && (
          <div className="text-[12px] text-Text-Primary">
            {index}. {question}
          </div>
        )}
        <div
          onClick={() => {
            if (!isPreview) {
              setISCanUpload(true);
            }
          }}
          className="cursor-pointer flex justify-end items-center gap-1"
        >
          <img src="/icons/upload.svg" alt="" />
          <span className="text-Primary-EmeraldGreen text-[10px] font-medium">
            Upload
          </span>
        </div>
      </div>
      {isCanUpload ? (
        <>
          <div className="w-full bg-white rounded-[8px]  p-2 mt-4">
            <div className="flex justify-between">
              <div className="text-[12px] text-[#B0B0B0]">Jan 27, 2024</div>
              <div className="flex justify-end items-center gap-2">
                <div
                  onClick={() => setISCanUpload(false)}
                  className="w-6 flex justify-center items-center h-6 border-[1.6px] border-[#FC5474] rounded-[8px]"
                >
                  <SvgIcon color="#FC5474" src="/icons/close.svg" />
                </div>
                <div
                  onClick={submit}
                  className="w-6 flex cursor-pointer justify-center items-center h-6 border-[1.6px] border-Primary-EmeraldGreen bg-Primary-EmeraldGreen rounded-[8px]"
                >
                  <SvgIcon color="#FFFFFF" src="/icons/tick-green.svg" />
                </div>
              </div>
            </div>
            <div className="w-full gap-4 flex justify-center items-center mt-2">
              <ItemUpload
                onUpload={(strem) => setFrontal(strem)}
                name="Frontal"
              />
              <ItemUpload onUpload={(strem) => setBack(strem)} name="Back" />
              <ItemUpload onUpload={(strem) => setSide(strem)} name="Side" />
            </div>
          </div>
        </>
      ) : hasFiles ? (
        // Preview section
        <div className="mt-2 flex w-full justify-between">
          {frontal && (
            <div className="mb-2">
              <span className="text-[10px]">Frontal: </span>
              <img src={frontal} alt="Frontal" className="w-[50px] h-[50px]" />
            </div>
          )}
          {back && (
            <div className="mb-2">
              <span className="text-[10px]">Back: </span>
              <img src={back} alt="Back" className="w-[50px] h-[50px]" />
            </div>
          )}
          {side && (
            <div className="mb-2">
              <span className="text-[10px]">Side: </span>
              <img src={side} alt="Side" className="w-[50px] h-[50px]" />
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 text-[#B0B0B0] text-[10px]">No Files yet.</div>
      )}
    </div>
  );
};

export default UploadCard;

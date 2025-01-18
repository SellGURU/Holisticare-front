/* eslint-disable @typescript-eslint/no-explicit-any */
import useModalAutoClose from '../../hooks/UseModalAutoClose';
// import GenerateWithAiModal from "@/pages/aiStudio/GenerateWithAiModal"
import React, { useRef, useState } from 'react';
import { BeatLoader } from 'react-spinners';
// import { ButtonSecondary } from "../Button/ButtosSecondary"
import GenerateWithAiModal from '../GenerateWithAiModal';
interface MiniAnallyseButtonProps {
  disabled?: boolean;
  onResolve?: (value: string) => void;
  isLoading?: boolean;
}
const MiniAnallyseButton: React.FC<MiniAnallyseButtonProps> = ({
  disabled,
  isLoading,
  onResolve,
}) => {
  //  const [isLoading ,] = useState(false)
  const [showAiReport, setShowAiReport] = useState(false);
  // const [,setPramt] = useState("")
  const modalAiGenerateRef = useRef(null);
  useModalAutoClose({
    refrence: modalAiGenerateRef,
    close: () => {
      setShowAiReport(false);
    },
  });
  console.log(showAiReport);

  return (
    <>
      <div className="relative">
        <div
          className="h-8 bg-Primary-EmeraldGreen cursor-pointer w-8 max-w-8 max-h-8 min-h-8  flex items-center justify-center rounded-md"
          onClick={() => {
            setShowAiReport(true);
          }}
        >
          {!isLoading && <img className="" src="/icons/stars.svg" alt="" />}
        </div>
        {isLoading ? (
          <div className="absolute w-[16px] flex pt-2 pl-[2px] top-1">
            <BeatLoader size={5} color="#ffffff"></BeatLoader>
          </div>
        ) : (
          <>
            <img
              src="/icons/stars.svg"
              onClick={() => {
                if (!disabled) {
                  setShowAiReport(true);
                }
              }}
              className={` w-[16px] left-2 cursor-pointer absolute top-2  ${disabled ? 'opacity-35' : ''}`}
              alt=""
            />
          </>
        )}
        {showAiReport && (
          <div className="absolute z-30 right-[-0px] top-10 ">
            <GenerateWithAiModal
              isBenchMark={false}
              isLimite={false}
              onSuccess={(val: any) => {
                setShowAiReport(false);
                // setPramt(val)
                // beGenerateWithAi(val)
                if (onResolve) {
                  onResolve(val);
                }
              }}
              refEl={modalAiGenerateRef}
            ></GenerateWithAiModal>
          </div>
        )}
      </div>
    </>
  );
};

export default MiniAnallyseButton;

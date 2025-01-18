/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef, useState } from 'react';
import { BeatLoader } from 'react-spinners';
import { ButtonSecondary } from '../Button/ButtosSecondary';
import GenerateWithAiModal from '../GenerateWithAiModal';
import useModalAutoClose from '../../hooks/UseModalAutoClose';

interface AnalyseButtonProps {
  text: string;
  onAnalyse?: () => void;
}

const AnalyseButton: React.FC<AnalyseButtonProps> = ({ text }) => {
  const [isloadingGenerate] = useState(false);
  const [showAiReport, setShowAiReport] = useState(false);
  const modalAiGenerateRef = useRef(null);
  useModalAutoClose({
    refrence: modalAiGenerateRef,
    close: () => {
      setShowAiReport(false);
    },
  });
  return (
    <>
      <ButtonSecondary
        onClick={() => {
          // if (onAnalyse) {
          //   onAnalyse();
          // } else {
          //   setIsLoadingGenerate(true);
          // }
          setShowAiReport(true);
          // setShowGenerateWithAi(true)
        }}
      >
        {isloadingGenerate ? (
          <div className="px-3 w-full flex justify-center items-center">
            <BeatLoader size={8} color="#fff"></BeatLoader>
          </div>
        ) : (
          <>
            <img src="/icons/stars.svg" alt="" />{' '}
            <div className="min-w-[90px] font-normal">{text}</div>
          </>
        )}
      </ButtonSecondary>
      {showAiReport && (
        <div className="absolute left-[-150px] top-10 z-40">
          <GenerateWithAiModal
            isBenchMark={false}
            isLimite={false}
            onSuccess={(_val: any) => {
              setShowAiReport(false);
              // setPramt(val)
              // beGenerateWithAi(val)
            }}
            refEl={modalAiGenerateRef}
          ></GenerateWithAiModal>
        </div>
      )}
    </>
  );
};

export default AnalyseButton;

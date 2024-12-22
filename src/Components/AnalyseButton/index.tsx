import { useState } from "react";
import { BeatLoader } from "react-spinners";
import { ButtonSecondary } from "../Button/ButtosSecondary";

interface AnalyseButtonProps {
  text: string;
  onAnalyse?: () => void;
}

const AnalyseButton: React.FC<AnalyseButtonProps> = ({ text, onAnalyse }) => {
  const [isloadingGenerate, setIsLoadingGenerate] = useState(false);
  return (
    <>
      <ButtonSecondary
        onClick={() => {
          if (onAnalyse) {
            onAnalyse();
          } else {
            setIsLoadingGenerate(true);
          }
          // setShowGenerateWithAi(true)
        }}
        
      >
        {isloadingGenerate ? (
          <div className="px-3 w-full flex justify-center items-center">
            <BeatLoader size={8} color="#fff"></BeatLoader>
          </div>
        ) : (
          <>
            <img src="/icons/stars.svg" alt="" />{" "}
            <div className="min-w-[90px] font-normal">{text}</div>
          </>
        )}
      </ButtonSecondary>
    </>
  );
};

export default AnalyseButton;

/* eslint-disable @typescript-eslint/no-explicit-any */
import Application from '../../../api/app';
import GenerateWithAiModal from '../../../Components/GenerateWithAiModal';
import { useEffect, useRef, useState } from 'react';
import { BeatLoader } from 'react-spinners';
import { Button, TextArea } from 'symphony-ui';

interface TextBoxAiProps {
  value: string;
  onChange?: (val: string) => void;
  label: string;
  isNeedFocus?: boolean;
  isRecomandation?: boolean;
  isDescript?: boolean;
  isUpchange?: boolean;
  isBenchMark?: boolean;
  benchMark?: string;
}

const TextBoxAi: React.FC<TextBoxAiProps> = ({
  value,
  benchMark,
  isDescript,
  isBenchMark,
  isUpchange,
  onChange,
  label,
  isNeedFocus,
}) => {
  const [isActiveAi, setIsActiveAi] = useState(false);
  const modalAiGenerateRef = useRef(null);
  const [showAiReport, setShowAiReport] = useState(false);
  const [, setPramt] = useState('');
  const [localVal, setLocalVal] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const beGenerateWithAi = (pre: string) => {
    setIsLoading(true);
    if (pre == 'Generate by Knowledge') {
      Application.treatment_by_knowledge({
        text: localVal[0],
        benchmark_area: benchMark,
      })
        .then((res) => {
          setLocalVal(res.data);
          setIsLoading(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      Application.UpdateTreatmentPlanWithAi({
        ai_generation_mode: pre,
        input_text: isDescript
          ? [localVal]
          : localVal.includes(',')
            ? localVal.split(',')
            : [localVal],
      }).then((res) => {
        setLocalVal(res.data.map((e: any) => e));
        setIsLoading(false);
      });
    }
  };
  useEffect(() => {
    if (onChange) {
      onChange(localVal);
    }
  }, [localVal]);
  useEffect(() => {
    setLocalVal(value);
  }, [isUpchange]);
  return (
    <>
      <div
        onMouseLeave={() => {
          setIsActiveAi(false);
          setShowAiReport(false);
        }}
        onMouseEnter={() => {
          setIsActiveAi(true);
        }}
        className={`${
          !isNeedFocus && !isDescript ? 'w-[450px]' : 'w-full'
        } relative `}
      >
        <TextArea
          onBlur={() => {}}
          onChange={(e) => {
            setLocalVal(e.target.value);
          }}
          value={localVal}
          label={label}
          theme={isNeedFocus || isDescript ? 'Aurora-S' : 'Aurora'}
          name=""
          inValid={false}
        ></TextArea>
        <div className="w-[32px] absolute top-3 right-8 h-[32px]">
          {isActiveAi && (
            <>
              {!isNeedFocus && (
                <>
                  <Button
                    onClick={() => {
                      setShowAiReport(true);
                    }}
                    theme="Aurora-pro"
                  >
                    <img className="Aurora-icons-stars invisible" alt="" />
                  </Button>
                  {isLoading ? (
                    <div className="absolute w-[16px] flex pt-2 pl-[2px] top-1">
                      <BeatLoader size={5} color="green"></BeatLoader>
                    </div>
                  ) : (
                    <>
                      <img
                        onClick={() => {
                          setShowAiReport(true);
                        }}
                        className="Aurora-icons-stars w-[16px] left-2 cursor-pointer absolute top-1"
                        alt=""
                      />
                    </>
                  )}
                  {showAiReport && (
                    <div className="absolute left-[-200px] top-10 z-40">
                      <GenerateWithAiModal
                        isBenchMark={isBenchMark}
                        isLimite={isNeedFocus || isDescript}
                        onSuccess={(val) => {
                          setShowAiReport(false);
                          setPramt(val);
                          beGenerateWithAi(val);
                        }}
                        refEl={modalAiGenerateRef}
                      ></GenerateWithAiModal>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
export default TextBoxAi;

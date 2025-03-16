import { useEffect, useState } from 'react';
import Checkbox from '../../../Components/ComboBar/components/CheckBox';

interface MultiChoiceCardProps {
  question: string;
  value: string;
  index?: number;
  options: Array<string>;
  onSubmit?: (value: string) => void;
  onChange?: (value: Array<string>) => void;
}
const MultiChoice: React.FC<MultiChoiceCardProps> = ({
  options,
  question,
  value,
  index,
  onChange,
}) => {
  const [resolvedValue, setResolvedValue] = useState<Array<string>>([value]);
  useEffect(() => {
    if (onChange) {
      onChange(resolvedValue.filter((el) => el != ''));
    }
  }, [resolvedValue]);
  return (
    <>
      <div className="bg-[#FCFCFC] p-3 w-full  h-full rounded-[12px] border border-gray-50">
        <div className="text-[12px] text-Text-Primary">
          {index}. {question}
        </div>

        <div className="flex flex-wrap gap-3 mt-1">
          {options.map((el) => {
            return (
              <>
                <div
                  onClick={() => {
                    if (resolvedValue.includes(el)) {
                      setResolvedValue((pre) => {
                        return pre.filter((va) => va != el);
                      });
                    } else {
                      setResolvedValue((pre) => {
                        return [...pre, el];
                      });
                    }
                  }}
                  className="flex gap-1 items-center"
                >
                  <Checkbox checked={resolvedValue.includes(el)}></Checkbox>
                  <div
                    className={`text-[10px] cursor-pointer ${resolvedValue.includes(el) ? 'text-Text-Primary' : 'text-Text-Secondary'} `}
                  >
                    {el}
                  </div>
                </div>
              </>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MultiChoice;

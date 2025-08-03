import { useEffect, useState } from 'react';

interface CheckBoxSelectionProps {
  isActive: boolean;
  toggle: () => void;
  onChange: (options: Array<string>) => void;
  values: Array<string>;
  showValidation?: boolean;
}

const CheckBoxSelection: React.FC<CheckBoxSelectionProps> = ({
  isActive,
  toggle,
  onChange,
  values,
  showValidation = false,
}) => {
  const [options, setOptions] = useState(values);
  const [error, setError] = useState(false);

  const addOption = () => {
   
      setOptions([...options, '']);
    
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  useEffect(() => {
    onChange(options);
    // Check if there are at least 2 non-empty options
    const nonEmptyOptions = options.filter((opt) => opt.trim() !== '');
    setError(showValidation && nonEmptyOptions.length < 2);
  }, [options, showValidation]);

  return (
    <div className="flex flex-col gap-2 w-[49%] min-h-[40px]">
      <div
        className={`flex flex-col items-center justify-start w-full min-h-[40px] h-fit rounded-xl px-3 py-2 border ${
          isActive ? 'border-Primary-EmeraldGreen' : 'border-Gray-50'
        } ${error ? 'border-Red' : ''}`}
      >
        <div
          className="cursor-pointer flex items-start w-full"
          onClick={() => {
            toggle();
          }}
        >
          <div className="w-8 h-6 rounded-lg bg-Primary-DeepTeal flex items-center justify-center bg-opacity-10">
            <img src="/icons/task-square.svg" alt="" />
          </div>
          <div className="flex flex-col ml-2">
            <div className="text-Text-Primary text-[10px] font-normal">
              Checkboxes
            </div>
            <div className="text-Text-Fivefold text-[8px] text-nowrap font-normal">
              Choose from Checkboxes
            </div>
          </div>
        </div>
        {isActive && (
          <div className="w-full mt-2 max-h-[150px] overflow-y-auto pr-2">
            <div className=" gap-1  grid grid-cols-2  w-full">
              {options.map((option, index) => {
                return (
                  <div
                    className="flex items-center justify-center gap-1"
                    key={index}
                  >
                    {/* <div className="w-3 h-3 rounded-[2px] border border-Primary-DeepTeal"></div> */}
                    <input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      className={`bg-backgroundColor-Card border 
                       rounded-2xl py-1 px-2 text-[8px] w-[130px]`}
                    />
                  </div>
                );
              })}
              <div
                className={`text-[10px] font-medium text-Primary-DeepTeal flex items-center justify-start text-nowrap cursor-pointer ml-1 mt-1`}
                onClick={addOption}
              >
                <img
                  src="/icons/add-blue.svg"
                  alt=""
                  className="w-4 h-4 mr-[1px]"
                />{' '}
                Add New
              </div>
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="text-[10px] text-Red  ">
          This field must have at least 2 options.
        </div>
      )}
    </div>
  );
};

export default CheckBoxSelection;

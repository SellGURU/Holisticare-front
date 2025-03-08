import { useEffect, useState } from "react";

interface CheckBoxSelectionProps {
    isActive:boolean
    toggle:() => void
    onChange:(options:Array<string>) =>void
}
const CheckBoxSelection:React.FC<CheckBoxSelectionProps> = ({isActive,toggle,onChange}) => {
    const [options, setOptions] = useState(['', '']);
    const addOption = () => {
        setOptions([...options, '']);
    };
    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };    
    useEffect(() => {
        onChange(options)
    },[options])
    return (
        <>
        <div
          className={`flex w-[99.5%] rounded-xl px-3 py-1.5 border ${isActive ? 'border-Primary-EmeraldGreen' : 'border-Gray-50'}`}
        >
          <div
            className="cursor-pointer flex items-start w-[35%]"
            onClick={() => {
                toggle()
            }}
          >
            <div className="w-8 h-6 rounded-lg bg-Primary-DeepTeal flex items-center justify-center bg-opacity-10">
              <img src="/icons/task-square.svg" alt="" />
            </div>
            <div className="flex flex-col ml-2">
              <div className="text-Text-Primary text-[10px] font-normal">
                Checkboxes
              </div>
              <div className="text-Text-Fivefold text-[8px] font-normal">
                Choose from Checkboxes
              </div>
            </div>
          </div>
          <div className="flex items-start w-[65%]">
            <div className="flex flex-wrap gap-1 w-full">
              {options.map((option, index) => {
                return (
                  <div
                    className="flex items-center justify-center gap-1"
                    key={index}
                  >
                    <div className="w-3 h-3 rounded-[2px] border border-Primary-DeepTeal"></div>
                    <input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      className="bg-backgroundColor-Card border border-Gray-50 rounded-2xl py-1 px-2 text-[8px] w-[130px]"
                    />
                  </div>
                );
              })}
            </div>
            <div
              className="text-[10px] font-medium text-Primary-DeepTeal flex items-center justify-center text-nowrap cursor-pointer ml-1 mt-1"
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
        </>
    )
}

export default CheckBoxSelection
/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Button } from "symphony-ui"
import MiniAnallyseButton from '../../../Components/MiniAnalyseButton';
interface PillarsBoxProps {
  data: any;
  name: string;
  onChnageText: () => void;
}
const PillarsBox: React.FC<PillarsBoxProps> = ({ data, name }) => {
  // const [currentData,setCurrentData]
  const resolveIcon = (value: string) => {
    if (value == 'Diet') {
      return './images/report/treatment/apple.svg';
    }
    if (value == 'Mind') {
      return './images/report/treatment/mental-disorder.svg';
    }
    if (value == 'Activity') {
      return './images/report/treatment/weight.svg';
    }
    if (value == 'Supplement') {
      return './images/report/treatment/pil.svg';
    }
  };
  console.log(data);
  return (
    <>
      <div className="w-full bg-light-min-color dark:bg-[#2F2F2F] rounded-[6px] p-4 mt-4">
        <div className="w-full flex justify-center gap-2 items-start">
          <div className="w-[60px] mr-3">
            <div className="w-full flex justify-center">
              <div className="w-[32px] flex justify-center items-center h-[32px] bg-light-overlay dark:bg-[#333333] rounded-[8px]">
                <img className="w-[24px]" src={resolveIcon(name)} alt="" />
              </div>
            </div>
            <div className="text-[#FFFFFFDE] mt-1 tet-[10px] font-[500] text-center text-[10px]">
              {name}
            </div>
          </div>
          <div className="flex-grow">
            {data.map((el: any) => {
              return (
                <div className="w-full dark:bg-[#1E1E1E] bg-gray-200 mb-4 rounded-[6px] flex justify-start items-center p-4 h-[56px]">
                  {/* <TextField theme="Aurora" value={el.text} inValid={false} name="" onBlur={() => {}} onChange={() => {}} type="text"></TextField> */}
                  <input
                    onChange={() => {}}
                    className="dark:bg-[#1E1E1E] w-full py-4 outline-none bg-gray-200  text-light-primary-text dark:text-[#FFFFFFDE] text-[12px] "
                    type="text"
                    value={el.text}
                  />
                  {/* <div className=" text-light-primary-text dark:text-[#FFFFFFDE] text-[12px] ">{el.text}</div> */}
                </div>
              );
            })}
          </div>
          <div className="w-[32px] relative  h-[32px]">
            <MiniAnallyseButton></MiniAnallyseButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default PillarsBox;

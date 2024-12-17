/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Toggle from "./Toggle";
import StatusChart from "../StatusChart";
import { FiExternalLink } from "react-icons/fi";
import { publish } from "../../../utils/event";
import Legends from "../Legends";
// import Legends from "../Legends"
import { Tooltip } from "react-tooltip";
import StatusBarChart from "./StatusBarChart";
interface RefrenceBoxProps {
  data: any;
}

const RefrenceBox: React.FC<RefrenceBoxProps> = ({ data }) => {
  const [isCheced, setIsCheced] = useState(false);
  const isLongName = data.name.length > 20;
  console.log(data.name);
  
  // const labels:Array<string> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  // const dataPoints = [50, 75, 60, 90, 80, 100, 95];
  return (
    <>
      <div id={data.name} className="w-full h-[188px] pt-3 px-4 border bg-white border-gray-50 shadow-100 rounded-[6px]">
        <div className="flex justify-between items-center">
          <div
            {...(isLongName && {
              "data-tooltip-id": "name",
              "data-tooltip-content": data.name,
            })}
            className="text-Text-Primary TextStyle-Headline-5  items-center cursor-default gap-2 flex justify-start  "
          >
            {data.name.substring(0, 20)}
            {isLongName && <Tooltip id="name" />}

            <div className="flex justify-start ml-2 items-center cursor-pointer TextStyle-Button  text-Primary-DeepTeal ">
              More Info
              <img
                src="./icons/user-navbar/info-circle.svg"
                className="w-4 invert dark:invert-0 cursor-pointer h-4 ml-1"
                alt=""
              />
            </div>
            <div
              onClick={() => {
                document.getElementById(data.subcategory)?.scrollIntoView({
                  behavior: "smooth",
                });
                publish("openDetiledCard", { id: data.subcategory });
              }}
              className="text-Primary-DeepTeal flex justify-center items-center gap-1 text-[12px] cursor-pointer"
            >
              Group
              <FiExternalLink></FiExternalLink>
            </div>
          </div>
          <div className="flex gap-2 justify-end items-center">
            <div className="text-Text-Primary TextStyle-Button ">
              Historical Chart
            </div>
            <Toggle
              setChecked={(value) => {
                setIsCheced(value);
              }}
              checked={isCheced}
            ></Toggle>
          </div>
        </div>
        <div className="mt-[20px] flex justify-between">
          <div className="text-Text-Primary TextStyle-Headline-6">
            Current Value
          </div>
          <div className="flex justify-end items-center gap-2">
            <Legends></Legends>
            <div className="w-[70px] flex justify-between items-center p-2 h-[32px] rounded-[6px]  bg-backgroundColor-Main border-gray-50">
              <div className="text-Primary-DeepTeal text-[10px]">{data.unit}</div>
              <div className="w-[16px]">
                <img src="./Themes/Aurora/icons/arrow-Combo-left.svg" alt="" />
              </div>
            </div>
            {isCheced && (
              <div className="w-[94px] flex justify-between items-center p-2 h-[32px] rounded-[6px] bg-backgroundColor-Main border-gray-50">
                <div className="text-Primary-DeepTeal text-[10px]">6 Month</div>
                <div className="w-[16px]">
                  <img
                    src="./Themes/Aurora/icons/arrow-Combo-left.svg"
                    alt=""
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        {isCheced ? (
          <>
            <div className="mt-1 relative">
              <StatusChart
                mode={data.chart_bounds["Needs Focus"].length>1 && data.chart_bounds["Ok"].length>1 ?'multi':'line'}
                statusBar={data.chart_bounds}
                labels={[...data.date].reverse()}
                dataPoints={[...data.values].reverse()}
              ></StatusChart>

            </div>
          </>
        ) : (
          <>
            <div className="mt-16">
                <StatusBarChart data={data}></StatusBarChart>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default RefrenceBox;

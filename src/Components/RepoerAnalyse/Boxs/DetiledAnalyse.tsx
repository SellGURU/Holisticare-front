/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import StatusChart from "../StatusChart";
import { subscribe } from "../../../utils/event";
import Legends from "../Legends";
import StatusBarChart from "./StatusBarChart";
import resolveAnalyseIcon from "../resolveAnalyseIcon";
import Toggle from "./Toggle";

interface DetiledAnalyseProps {
  data: any;
  refrences: any;
}

const DetiledAnalyse: React.FC<DetiledAnalyseProps> = ({ data, refrences }) => {
  const [isOpen, setIsOpen] = useState(true);
  console.log(refrences);
  const [isCheced, setIsCheced] = useState(false);
  // const labels:Array<string> = data["Out of Reference"].length>0? data["Out of Reference"][0].history.label: ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  // const dataPoints = data["Out of Reference"].length>0? data["Out of Reference"][0].history.values:[50, 75, 60, 90, 80, 100, 95];
  const [activeBox, setActiveBOx] = useState<any>(
    refrences?.biomarkers[0].name?refrences?.biomarkers[0].name:''
  );
  // const resolveStatusColor =() => {
  //     if(data.status == 'Normal') {
  //         return '#06C78D'
  //     }
  //     if(data.status == 'At risk') {
  //         return '#FBAD37'
  //     }
  //     if(data.status == 'Need action') {
  //         return '#FC5474'
  //     }
  // }
  const [active, setActive] = useState<any>(refrences?.biomarkers[0]);
  subscribe("openDetiledCard", (ev) => {
    // console.log(ev)
    if (ev.detail.id == data.name) {
      setIsOpen(true);
    }
  });
  return (
    <>
      <div
        id={data.subcategory}
        className="w-full mb-4 py-4 px-6 bg-white border border-Gray-50 shadow-100 rounded-[6px] "
      >
        <div
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          className="flex cursor-pointer items-center justify-between"
        >
          <div className="flex items-center ">
            <div
              className="w-10 h-10 items-center rounded-full flex justify-center"
              style={{
                background: `conic-gradient(#7F39FB 0% ${data.status[0]}%,#06C78D ${data.status[0]}% ${data.status[1]+data.status[0]}%,#FBAD37 ${
              data.status[1]+data.status[0]
            }% ${data.status[1] + data.status[2]+data.status[0]}%,#FC5474 ${
              data.status[2] +data.status[1] +data.status[0]
            }% 100%)`,
              }}
            >
              <div
                className="w-9 h-9  flex justify-center bg-white items-center  rounded-full"
                style={{}}
              >
                <img
                  className=""
                  src={resolveAnalyseIcon(data.subcategory)}
                  alt=""
                />
              </div>
            </div>
            <div className="ml-2">
              <div className="TextStyle-Headline-5 text-Text-Primary flex items-center gap-2 ">
                {data.subcategory}
                {isOpen && <Legends></Legends>}
              </div>
              <div className="flex justify-start items-center">
                <div className="TextStyle-Body-3 text-Text-Secondary">
                  {data?.num_of_biomarkers} biomarkers
                </div>
                <div className="TextStyle-Body-3 text-Text-Secondary ml-2">
                  {data?.out_of_ref} {data.out_of_ref > 1 ?'Needs Focus':'Need Focus'}{" "}
                </div>
              </div>
            </div>
          </div>
          <div
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            className={`${isOpen ? "rotate-180" : ""} cursor-pointer`}
          >
            <img
              className="invert dark:invert-0"
              src="./Themes/Aurora/icons/arrow-Combo-left.svg"
              alt=""
            />
          </div>
        </div>
        {isOpen && (
          <>
            <div className="text-Text-Primary TextStyle-Headline-5 mt-4">
              Description
            </div>
            <div className=" h-[80px] overflow-y-auto text-Text-Secondary TextStyle-Body-2 mt-2 text-justify">
              {active?.more_info}
            </div>
            <div className="w-full  flex items-start gap-2 p-4 bg-backgroundColor-Card border border-Gray-50  rounded-[6px] min-h-[30px] mt-4">
              <div className=" w-[330px] h-[150px] overflow-y-scroll pr-2 ">
                {refrences?.biomarkers.map((value: any) => {
                  return (
                    <>
                      <div
                        onClick={() => {
                          setActiveBOx(value.name);
                          setActive(value);
                        }}
                        className={`w-full h-10 mb-2 cursor-pointer text-sm ${
                          activeBox == value.name
                            ? "border-Primary-EmeraldGreen "
                            : "border-Gray-50"
                        }  border items-center bg-white  rounded-[6px] flex justify-between px-4`}
                      >
                        <div className=" text-[12px]">{value.name}</div>
                        <img
                          className="rotate-[-90deg] invert dark:invert-0  w-4"
                          src="./Themes/Aurora/icons/arrow-Combo-left.svg"
                          alt=""
                        />
                      </div>
                    </>
                  );
                })}
              </div>
              {refrences?.biomarkers.length > 0 && (
                <div className="flex-grow gap-2 relative flex items-center justify-center">
                  <div className="absolute cursor-pointer top-4 right-4">
                    <div className="flex gap-2 justify-end items-center">
                      <div className="TextStyle-Headline-6  text-Text-Primary">
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
                  {!isCheced ?
                    <div className="w-full ">
                      <div className=" w-full p-4 border border-Gray-50 h-[159px] bg-white rounded-[6px]">
                        <div className=" mb-20 TextStyle-Headline-6 text-Text-Primary">
                          Current Value
                        </div>
                        {active &&
                          <StatusBarChart data={active}></StatusBarChart>
                        }
                      </div>
                    </div>
                  :
                    <div className="w-full">
                      <div className=" w-full border border-Gray-50 p-4 h-[159px] bg-white  rounded-[6px]">
                        <div className="TextStyle-Headline-6 text-Text-Primary mb-5">
                          Historical Data
                        </div>
                        <div className="mt-0 relative">
                          {active &&
                            <StatusChart
                              mode={
                                active.chart_bounds["Needs Focus"].length>1 && active.chart_bounds["Ok"].length>1 ?'multi':'line'
                              }
                              statusBar={active?.chart_bounds}
                              labels={[...active.date].reverse()}
                              dataPoints={[...active.values].reverse()}
                            ></StatusChart>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DetiledAnalyse;

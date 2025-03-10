// import { data } from "react-router-dom"
import { useEffect, useState } from 'react';
import StatusBarChart from '../../Components/RepoerAnalyse/Boxs/StatusBarChart';
import SvgIcon from '../../utils/svgIcon';
import { sortKeysWithValues } from '../../Components/RepoerAnalyse/Boxs/Help';
import TooltipText from '../../Components/TooltipText';
// import EditModal from '../generateTreatmentPlan/components/EditModal';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface BiomarkerItemProps {
  data: any;
}

const BiomarkerItem: React.FC<BiomarkerItemProps> = ({ data }) => {
  const [activeEdit, setActiveEdit] = useState(false);
  const resolveColor = (key: string) => {
    if (key == 'Needs Focus') {
      return '#FC5474';
    }
    if (key == 'Ok') {
      return '#FBAD37';
    }
    if (key == 'Good') {
      return '#06C78D';
    }
    if (key == 'Excellent') {
      return '#7F39FB';
    }
    return '#FBAD37';
  };
  const [values,setValues] = useState<Array<any>>([])
  const [Editvalues,setEditValues] = useState<Array<any>>([])
  useEffect(() => {
    // console.log(sortKeysWithValues(data.chart_bounds))
    setValues(sortKeysWithValues(data.chart_bounds))
  },[])
  const changeValue =(key:string,index:number,newValue:string) => {
    setActive("Edited")
    setValues((pre) => {
      const newData = pre.map((el) => {
        if(el.key == key){
          return {
            ...el,
            value:el.value.map((dr:any,inde:number) => {
              if(inde == index){
                return newValue
              }else {
                return dr
              }
            })
          }
        }else {
          return el
        }
      })
      setEditValues(newData)
      return newData
    })
  }
  const [active,setActive] = useState("Edited")
  return (
    <>
      <div className="w-full relative py-2 px-3  bg-[#F4F4F4] pt-2 rounded-[12px] border border-gray-50 min-h-[60px]">
        <div className="flex gap-6 w-full min-h-[60px] justify-start items-center">
          <div className="w-[200px]">
            <div className="text-[12px] font-medium text-Text-Primary">
              {data.name}
            </div>
            <div className="text-[10px] max-w-[100px] text-nowrap overflow-hidden text-ellipsis mt-1 text-Text-Secondary">
              {data.more_info}
            </div>
          </div>
          {!activeEdit && (
            <div className="w-[70%]">
              <StatusBarChart justView data={data}></StatusBarChart>
            </div>
          )}
          <div className="absolute right-4 top-2">
            {activeEdit ? (
              <div className="bg-backgroundColor-Card gap-4 flex justify-center items-center rounded-[6px] p-2 h-8">
                <div onClick={() => {
                  setActive("Edited")
                  setValues(Editvalues)
                }} className='flex justify-center cursor-pointer gap-1 items-center'>
                  <SvgIcon width='16px' height='16px' color={active == 'Edited'?"#005F73":"#888888"} src="./icons/edit-green.svg"></SvgIcon>
                  <div className={`text-[10px] ${active == 'Edited'?'text-[#005F73]':'text-[#888888]'} `}>Edited</div>
                </div>
                <div onClick={() => {
                  setActive("Original")
                  setValues(sortKeysWithValues(data.chart_bounds))
                }} className='flex justify-center cursor-pointer gap-1 items-center'>
                  <SvgIcon width='16px' height='16px' color={active == 'Original'?"#005F73":"#888888"} src="/icons/task-square.svg"></SvgIcon>
                  <div className={`text-[10px] ${active == 'Original'?'text-[#005F73]':'text-[#888888]'} `}>Original</div>
                </div>                
                <div
                  onClick={() => {
                    setActiveEdit(false);
                  }}
                >
                  <SvgIcon
                    color="#6CC24A"
                    src="./icons/tick-circle-background.svg"
                  ></SvgIcon>
                  {/* <img src="./icons/tick-circle-background.svg" alt="" /> */}
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  setActiveEdit(true);
                }}
              >
                <SvgIcon color="#005F73" src="./icons/edit-green.svg"></SvgIcon>
              </div>
            )}
            {/* <img  src="./icons/edit-green.svg" alt="" /> */}
          </div>
        </div>
        {activeEdit && (
          <div className="flex justify-center items-center px-4 mt-10">
            {sortKeysWithValues(data.chart_bounds).map((el, index: number) => {
              return (
                <>
                  {/* <div className='w-[48px] h-6 rounded-[8px] bg-white overflow-hidden border border-gray-50 mx-1'>
                    </div> */}
                  {index == 0 && (
                    <input
                      type="number"
                      value={values[0].value[0]}
                      onChange={(e) => {
                        changeValue(el.key,0,e.target.value)
                      }}                      
                      className="w-[48px] rounded-[8px] h-6 text-Text-Primary text-center bg-white border border-gray-50 mx-1 outline-none p-1 text-[8px]"
                    />
                  )}
                  <div
                    className={` relative border-l-2 flex-grow border-white  h-[8px] ${index == sortKeysWithValues(data.chart_bounds).length - 1 && 'rounded-r-[8px] border-l border-white'} ${index == 0 && 'rounded-l-[8px]'}`}
                    style={{
                      backgroundColor: resolveColor(el.key),
                    }}
                  >
                    <div className="absolute w-full px-1 text-[#005F73] flex justify-center left-[-4px] top-[-20px] opacity-40 text-[10px]">
                      <TooltipText
                        tooltipValue={
                          data.chart_bounds[el.key].label +
                          ' ' +
                          '(' +
                          el.value[0] +
                          (el.value[1] != undefined
                            ? ' - ' + el.value[1]
                            : '') +
                          ')'
                        }
                      >
                        <>
                          {data.chart_bounds[el.key].label +
                            ' ' +
                            '(' +
                            el.value[0] +
                            (el.value[1] != undefined
                              ? ' - ' + el.value[1]
                              : '') +
                            ')'}
                        </>
                      </TooltipText>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={values.filter((e) => e.key ==el.key)[0].value[1]}
                    onChange={(e) => {
                      changeValue(el.key,1,e.target.value)
                    }}
                    className="w-[48px] rounded-[8px] h-6 text-Text-Primary text-center bg-white border border-gray-50 mx-1 outline-none p-1 text-[8px]"
                  />
                </>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default BiomarkerItem;

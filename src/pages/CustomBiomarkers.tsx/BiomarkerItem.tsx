// import { data } from "react-router-dom"
import { useEffect, useState } from 'react';
import StatusBarChart from '../../Components/RepoerAnalyse/Boxs/StatusBarChart';
import SvgIcon from '../../utils/svgIcon';
import { sortKeysWithValues } from '../../Components/RepoerAnalyse/Boxs/Help';
import TooltipText from '../../Components/TooltipText';
import Select from '../../Components/Select';
// import EditModal from '../generateTreatmentPlan/components/EditModal';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface BiomarkerItemProps {
  data: any;
  OnSave: (values: any) => void;
}

const BiomarkerItem: React.FC<BiomarkerItemProps> = ({ data, OnSave }) => {
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
  const [values, setValues] = useState<Array<any>>([]);
  const [Editvalues, setEditValues] = useState<Array<any>>([]);
  const [activeBiomarker, setActiveBiomarker] = useState(data.age_groups[0]);
  const [gender, setGender] = useState(activeBiomarker.gender);
  const [ageRange, setAgeRange] = useState(
    activeBiomarker.min_age + '-' + activeBiomarker.max_age,
  );
  useEffect(() => {
    if (activeBiomarker) {
      setValues(sortKeysWithValues(activeBiomarker.chart_bounds));
    }
  }, [activeBiomarker]);
  useEffect(() => {
    // alert(gender)
    console.log(sortKeysWithValues(activeBiomarker.chart_bounds));
    setEditValues([]);
    setActiveBiomarker(
      data.age_groups.filter(
        (el: any) =>
          el.gender == gender && el.min_age + '-' + el.max_age == ageRange,
      )[0],
    );
  }, [gender, ageRange, data]);
  const changeValue = (key: string, index: number, newValue: any) => {
    setActive('Edited');
    setValues((pre) => {
      const newData = pre.map((el) => {
        if (el.key == key) {
          return {
            ...el,
            value: el.value.map((dr: any, inde: number) => {
              if (inde == index) {
                return newValue;
              } else {
                return dr;
              }
            }),
          };
        } else {
          return el;
        }
      });
      setEditValues(newData);
      return newData;
    });
  };
  const [active, setActive] = useState('Edited');
  const avilableGenders = () => {
    const resolvedValues: Array<string> = [];
    data.age_groups.map((el: any) => {
      if (!resolvedValues.includes(el.gender)) {
        resolvedValues.push(el.gender);
      }
    });
    return resolvedValues;
  };
  const avilableAges = () => {
    const resolvedValues: Array<string> = [];
    data.age_groups.map((el: any) => {
      if (!resolvedValues.includes(el.min_age + '-' + el.max_age)) {
        resolvedValues.push(el.min_age + '-' + el.max_age);
      }
    });
    return resolvedValues;
  };
  return (
    <>
      <div className="w-full relative py-2 px-3  bg-[#F4F4F4] pt-2 rounded-[12px] border border-gray-50 min-h-[60px]">
        <div className="flex gap-6 w-full min-h-[60px] justify-start items-start">
          <div className="w-[200px]">
            <div className="text-[12px] font-medium text-Text-Primary">
              {data.Biomarker}
            </div>
            <div className="text-[10px] max-w-[100px] text-nowrap overflow-hidden text-ellipsis mt-1 text-Text-Secondary">
              {/* {data.more_info} */}
            </div>
          </div>
          {!activeEdit && (
            <div className="w-[70%] mt-20 mb-3">
              <StatusBarChart justView data={activeBiomarker}></StatusBarChart>
            </div>
          )}
          <div className="absolute right-4 gap-2 flex justify-end items-center top-2">
            <div>
              <Select
                key="ages"
                onChange={(val) => {
                  setAgeRange(val);
                }}
                options={avilableAges()}
              ></Select>
            </div>
            <div>
              <Select
                key="gender"
                onChange={(val) => {
                  setGender(val);
                }}
                options={avilableGenders()}
              ></Select>
            </div>

            {activeEdit ? (
              <>
                {Editvalues.length > 0 && (
                  <div className="bg-backgroundColor-Card gap-4 flex justify-center items-center rounded-[6px] p-2 h-8">
                    <div
                      onClick={() => {
                        setActive('Edited');
                        setValues(Editvalues);
                      }}
                      className="flex justify-center cursor-pointer gap-1 items-center"
                    >
                      <SvgIcon
                        width="16px"
                        height="16px"
                        color={active == 'Edited' ? '#005F73' : '#888888'}
                        src="./icons/edit-green.svg"
                      ></SvgIcon>
                      <div
                        className={`text-[10px] ${active == 'Edited' ? 'text-[#005F73]' : 'text-[#888888]'} `}
                      >
                        Edited
                      </div>
                    </div>
                    <div
                      onClick={() => {
                        setActive('Original');
                        setValues(
                          sortKeysWithValues(activeBiomarker.chart_bounds),
                        );
                      }}
                      className="flex justify-center cursor-pointer gap-1 items-center"
                    >
                      <SvgIcon
                        width="16px"
                        height="16px"
                        color={active == 'Original' ? '#005F73' : '#888888'}
                        src="/icons/task-square.svg"
                      ></SvgIcon>
                      <div
                        className={`text-[10px] ${active == 'Original' ? 'text-[#005F73]' : 'text-[#888888]'} `}
                      >
                        Original
                      </div>
                    </div>
                    <div
                      onClick={() => {
                        setActiveEdit(false);
                        console.log(values);
                        const groupsData = data.age_groups.map((el: any) => {
                          if (
                            el.gender == gender &&
                            el.min_age + '-' + el.max_age == ageRange
                          ) {
                            return {
                              ...el,
                              chart_bounds: {
                                ...el.chart_bounds,
                                ...(el.chart_bounds.Ok && {
                                  Ok: {
                                    label: el.chart_bounds.Ok.label,
                                    range: [
                                      values.filter((e) => e.key == 'Ok')[0]
                                        .value,
                                    ],
                                  },
                                }),
                                ...(el.chart_bounds['Needs Focus'] && {
                                  'Needs Focus': {
                                    label:
                                      el.chart_bounds['Needs Focus']?.label,
                                    range: [
                                      values.filter(
                                        (e) => e.key == 'Needs Focus',
                                      )[0].value,
                                    ],
                                  },
                                }),
                                ...(el.chart_bounds['Good'] && {
                                  Good: {
                                    label: el.chart_bounds['Good']?.label,
                                    range: [
                                      values.filter((e) => e.key == 'Good')[0]
                                        .value,
                                    ],
                                  },
                                }),
                                ...(el.chart_bounds['Excellent'] && {
                                  Excellent: {
                                    label: el.chart_bounds['Excellent']?.label,
                                    range: [
                                      values.filter(
                                        (e) => e.key == 'Excellent',
                                      )[0].value,
                                    ],
                                  },
                                }),
                              },
                            };
                          } else {
                            return el;
                          }
                        });
                        OnSave({ ...data, age_groups: groupsData });
                      }}
                    >
                      <SvgIcon
                        color="#6CC24A"
                        src="./icons/tick-circle-background.svg"
                      ></SvgIcon>
                      {/* <img src="./icons/tick-circle-background.svg" alt="" /> */}
                    </div>
                  </div>
                )}
              </>
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
          <div
            className={`flex justify-center items-center px-4 ${sortKeysWithValues(activeBiomarker.chart_bounds)[0].value.length > 1 ? 'mt-10' : 'mt-3 mb-8'} `}
          >
            {sortKeysWithValues(activeBiomarker.chart_bounds)[0].value.length >
            1 ? (
              <>
                {sortKeysWithValues(activeBiomarker.chart_bounds).map(
                  (el, index: number) => {
                    return (
                      <>
                        {/* <div className='w-[48px] h-6 rounded-[8px] bg-white overflow-hidden border border-gray-50 mx-1'>
                      </div> */}
                        {index == 0 && (
                          <input
                            type="number"
                            value={values[0].value[0]}
                            onChange={(e) => {
                              changeValue(el.key, 0, Number(e.target.value));
                            }}
                            className="w-[48px] rounded-[8px] h-6 text-Text-Primary text-center bg-white border border-gray-50 mx-1 outline-none p-1 text-[8px]"
                          />
                        )}
                        <div
                          className={` relative border-l-2 flex-grow border-white  h-[8px] ${index == sortKeysWithValues(activeBiomarker.chart_bounds).length - 1 && 'rounded-r-[8px] border-l border-white'} ${index == 0 && 'rounded-l-[8px]'}`}
                          style={{
                            backgroundColor: resolveColor(el.key),
                          }}
                        >
                          <div className="absolute w-full px-1 text-[#005F73] flex justify-center left-[-4px] top-[-20px] opacity-40 text-[10px]">
                            <TooltipText
                              tooltipValue={
                                activeBiomarker.chart_bounds[el.key].label +
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
                                {activeBiomarker.chart_bounds[el.key].label +
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
                          value={
                            values.filter((e) => e.key == el.key)[0].value[1]
                          }
                          onChange={(e) => {
                            changeValue(el.key, 1, Number(e.target.value));
                            if (
                              sortKeysWithValues(activeBiomarker.chart_bounds)
                                .length -
                                1 >
                              index
                            ) {
                              changeValue(
                                sortKeysWithValues(
                                  activeBiomarker.chart_bounds,
                                )[index + 1].key,
                                0,
                                Number(e.target.value),
                              );
                            }
                          }}
                          className="w-[48px] rounded-[8px] h-6 text-Text-Primary text-center bg-white border border-gray-50 mx-1 outline-none p-1 text-[8px]"
                        />
                      </>
                    );
                  },
                )}
              </>
            ) : (
              <>
                {sortKeysWithValues(activeBiomarker.chart_bounds).map(
                  (el, index: number) => {
                    return (
                      <>
                        {/* <div className='w-[48px] h-6 rounded-[8px] bg-white overflow-hidden border border-gray-50 mx-1'>
                      </div> */}
                        <div
                          className={` relative border-l-2 flex-grow border-white  h-[8px] ${index == sortKeysWithValues(activeBiomarker.chart_bounds).length - 1 && 'rounded-r-[8px] border-l border-white'} ${index == 0 && 'rounded-l-[8px]'}`}
                          style={{
                            backgroundColor: resolveColor(el.key),
                          }}
                        >
                          <div className="absolute w-full px-1 text-[#005F73] flex justify-center left-[-4px] top-[-20px] opacity-40 text-[10px]">
                            <TooltipText
                              tooltipValue={
                                activeBiomarker.chart_bounds[el.key].label +
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
                                {activeBiomarker.chart_bounds[el.key].label +
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
                          <div className=" absolute top-3  w-full flex justify-center">
                            <input
                              type="text"
                              value={
                                values.filter((e) => e.key == el.key)[0]
                                  .value[0]
                              }
                              onChange={(e) => {
                                changeValue(el.key, 0, e.target.value);
                                // if (
                                //   sortKeysWithValues(activeBiomarker.chart_bounds)
                                //     .length -
                                //     1 >
                                //   index
                                // ) {
                                //   changeValue(
                                //     sortKeysWithValues(activeBiomarker.chart_bounds)[
                                //       index + 1
                                //     ].key,
                                //     0,
                                //     Number(e.target.value),
                                //   );
                                // }
                              }}
                              className="w-[100px] rounded-[8px] h-6 text-Text-Primary text-center bg-white border border-gray-50 mx-1 outline-none p-1 text-[8px]"
                            />
                          </div>
                        </div>
                      </>
                    );
                  },
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default BiomarkerItem;

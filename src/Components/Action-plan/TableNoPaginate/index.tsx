/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, Fragment, useEffect, useState } from 'react';
import ChoosingDaysWeek from '../../NewGenerateActionPlan/components/ChoosingDaysWeek';
import MonthShows from '../../NewGenerateActionPlan/components/MonthShows';

interface TableProps {
  classData: Array<any>;
}

const TableNoPaginateForActionPlan: FC<TableProps> = ({ classData }) => {
  const [data, setData] = useState(classData);
  useEffect(() => {
    setData(classData);
  }, [classData]);
  const grouped = data?.reduce((acc: any, item) => {
    const key = item.category.toLowerCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
  console.log(classData);

  const headers = ['Category', 'Title', 'Frequency',];
  return (
    <>
      {data && (
        <div className="w-full mt-8">
          <div
            className={`flex flex-col justify-between overflow-x-auto bg-white rounded-[16px] text-Text-Primary mt-[-12px] border border-Boarder shadow-200`}
          >
            {data?.length > 0 ? (
              <table
                className={`border-collapse table-auto text-sm text-left rtl:text-right w-full`}
              >
                <thead className="text-xs text-Text-Primary bg-backgroundColor-Main">
                  <tr className="text-nowrap text-Text-Primary">
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className={`px-4  pt-4 pb-3.5 text-xs font-medium cursor-pointer first:rounded-tl-[12px] last:rounded-tr-[12px]`}
                      >
                        <div className={`flex items-center  ${header== "Frequency" ? 'justify-center' : ''}`}>
                          <div className="flex items-center">{header}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white ">
                  {(Object.entries(grouped) as [string, any[]][]).map(
                    ([key, items]) => (
                      <Fragment key={key}>
                        {items.map((item, index) => {
                          console.log(item);

                          return (
                            <>
                            <tr className={`${item.client_notes.length > 0 ? 'border-t' : 'border-y'} border-Gray-50`} key={index}>
                              {/* Category */}
                              {index === 0 && (
                                <td
                                  rowSpan={items.length}
                                  className="px-4 py-3 align-top text-xs text-Text-Primary whitespace-nowrap"
                                >
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                </td>
                              )}
                              {/* Title */}
                              <td
                                className={`py-3 px-4 text-xs whitespace-nowrap ${index == 0 && 'align-top'}`}
                              >
                                <div
                                  style={{
                                    color: '#888888',
                                  }}
                                >
                                  {item.title}
                                </div>
                                {item.dose ? (
                                  <div className="flex mt-3">
                                    <div
                                      className="text-[10px]"
                                      style={{ color: '#B0B0B0' }}
                                    >
                                      Dose:
                                    </div>
                                    <div
                                      className="text-[10px]"
                                      style={{
                                        color: '#888888',
                                        marginLeft: '2px',
                                        width: '170px',
                                        textWrap: 'wrap',
                                      }}
                                    >
                                      {item.dose}
                                    </div>
                                  </div>
                                ) : item.value ? (
                                  <div className="flex items-center mt-3">
                                    <div
                                      className="text-[10px]"
                                      style={{ color: '#B0B0B0' }}
                                    >
                                      Value:
                                    </div>
                                    <div
                                      className="text-[10px]"
                                      style={{
                                        color: '#888888',
                                        marginLeft: '2px',
                                      }}
                                    >
                                      {item.value}
                                    </div>
                                  </div>
                                ) :
                                item.category === "Check-In"  ? (
                                
                                  <div   className="text-[10px]"
                                      style={{ color: '#B0B0B0' }}>
                                    Questions: {item.Questions}
                                  </div>
                                ):
                                 item.total_macros ? (
                                  <div className="flex items-center mt-3">
                                    <div
                                      className="text-[10px]"
                                      style={{ color: '#B0B0B0' }}
                                    >
                                      Carb:
                                    </div>
                                    <div
                                      className="text-[10px]"
                                      style={{
                                        color: '#888888',
                                        marginLeft: '3px',
                                      }}
                                    >
                                      {item.total_macros.Carbs}
                                    </div>
                                    <div
                                      className="text-[8px]"
                                      style={{
                                        color: '#B0B0B0',
                                        marginLeft: '3px',
                                      }}
                                    >
                                      gr
                                    </div>
                                    <div
                                      className="text-[10px]"
                                      style={{
                                        color: '#B0B0B0',
                                        marginLeft: '9px',
                                      }}
                                    >
                                      Protein:
                                    </div>
                                    <div
                                      className="text-[10px]"
                                      style={{
                                        color: '#888888',
                                        marginLeft: '3px',
                                      }}
                                    >
                                      {item.total_macros.Protein}
                                    </div>
                                    <div
                                      className="text-[8px]"
                                      style={{
                                        color: '#B0B0B0',
                                        marginLeft: '3px',
                                      }}
                                    >
                                      gr
                                    </div>
                                    <div
                                      className="text-[10px]"
                                      style={{
                                        color: '#B0B0B0',
                                        marginLeft: '9px',
                                      }}
                                    >
                                      Fat:
                                    </div>
                                    <div
                                      className="text-[10px]"
                                      style={{
                                        color: '#888888',
                                        marginLeft: '3px',
                                      }}
                                    >
                                      {item.total_macros.Fats}
                                    </div>
                                    <div
                                      className="text-[8px]"
                                      style={{
                                        color: '#B0B0B0',
                                        marginLeft: '3px',
                                      }}
                                    >
                                      gr
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center mt-3">
                                    {item.sections?.flatMap(
                                      (section: any, sectionIndex: number) =>
                                        section.Exercises?.map(
                                          (
                                            exercise: any,
                                            exerciseIndex: number,
                                          ) => (
                                            <div
                                              key={`${sectionIndex}-${exerciseIndex}`}
                                              className="px-2 py-1 rounded-2xl text-[10px] flex items-center justify-center mr-1"
                                              style={{
                                                backgroundColor: '#E9F0F2',
                                                color: '#005F73',
                                              }}
                                            >
                                              {exercise.Title}
                                            </div>
                                          ),
                                        ),
                                    )}
                                    {/* Show +2 indicator if total exercises > 2 */}
                                    {(item.sections?.flatMap(
                                      (s: any) => s.Exercises,
                                    )?.length || 0) > 2 && (
                                      <div
                                        className="px-2 py-1 rounded-2xl text-[10px] flex items-center justify-center"
                                        style={{
                                          backgroundColor: '#E9F0F2',
                                          color: '#005F73',
                                        }}
                                      >
                                        +2
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>
                              {/* Title */}
                              {/* <td
                              className={`py-3 text-xs text-Text-Quadruple whitespace-nowrap ${index == 0 && 'align-top'}`}
                            >
                              {item.title}
                            </td> */}

                              {/* Frequency */}
                              <td className="px-4 py-3 whitespace-nowrap flex flex-col gap-2 items-center">
                                {item.frequency_type === 'weekly' && (
                                  <>
                                    <div className="w-[76px] h-[24px] rounded-2xl bg-[#DEF7EC] flex items-center justify-center gap-1 text-Primary-DeepTeal text-[10px]">
                                      <img
                                        src="/icons/calendar-2.svg"
                                        alt=""
                                        className="w-3 h-3"
                                      />
                                      Weekly
                                    </div>
                                    <ChoosingDaysWeek
                                      selectedDays={item.frequency_dates}
                                      toggleDaySelection={() => {}}
                                      ClassName="lg:ml-1"
                                    />
                                  </>
                                )}
                                {item.frequency_type === 'monthly' && (
                                  <>
                                    <div className="w-[80px] h-[24px] rounded-2xl bg-[#DEF7EC] flex items-center justify-center gap-1 text-Primary-DeepTeal text-[10px]">
                                      <img
                                        src="/icons/calendar-2.svg"
                                        alt=""
                                        className="w-3 h-3"
                                      />
                                      Monthly
                                    </div>
                                    <MonthShows days={item.frequency_dates} />
                                  </>
                                )}
                                {item.frequency_type === 'daily' && (
                                  <div className="w-[65px] h-[24px] rounded-2xl bg-[#DEF7EC] flex items-center justify-center gap-1 text-Primary-DeepTeal text-[10px]">
                                    <img
                                      src="/icons/calendar-2.svg"
                                      alt=""
                                      className="w-3 h-3"
                                    />
                                    Daily
                                  </div>
                                )}
                                {!item.frequency_type ||
                                item.frequency_type.length === 0 ? (
                                  <div className="flex items-center gap-1 text-[10px] text-[#FFAB2C]">
                                    <img src="/icons/danger-new.svg" alt="" />
                                    No Scheduled
                                  </div>
                                ) : (
                                  ''
                                )}
                              </td>
                        
                            </tr>
                              {item.client_notes && item.client_notes.length > 0 && (
                                <tr>
                                  <td colSpan={3} className="px-3 py-2">
                                    <div className="flex items-start text-justify">
                                      <div
                                        className="text-[10px] font-medium mr-2"
                                        style={{ fontSize: '10px' }}
                                      >
                                        Notes:
                                      </div>
                                      <div
                                        className="text-[10px]"
                                        style={{ color: '#888888' }}
                                      >
                                        {item.client_notes[0]}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </Fragment>
                    ),
                  )}
                </tbody>
              </table>
            ) : (
              <div className="w-full h-full flex items-center justify-center flex-col">
                <p className="text-[#ffffffa4] mt-[8px] text-[16px]">
                  No Result to Show
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TableNoPaginateForActionPlan;

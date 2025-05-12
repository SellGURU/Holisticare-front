/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, Fragment, useEffect, useState } from 'react';
import MonthShows from './MonthShows';
import ChoosingDaysWeek from './ChoosingDaysWeek';

interface TableProps {
  classData: Array<any>;
}

const ActionPlanOverview: FC<TableProps> = ({ classData }) => {
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
  console.log(data);
  const headers = ['Category', 'Title', 'Frequency'];
  return (
    <div
      className="w-full relative mt-8"
      style={{
        zIndex: '60',
      }}
    >
      <div
        style={{
          borderRadius: '16px',
          marginTop: '-12px',
        }}
        className={`flex flex-col justify-between overflow-x-auto bg-white  text-Text-Primary  border border-Boarder shadow-200`}
      >
        {data?.length > 0 ? (
          <table
            className={`border-collapse table-auto text-sm text-left rtl:text-right w-full`}
          >
            <thead
              className="text-xs text-Text-Primary bg-backgroundColor-Main"
              style={{ background: '#F4F4F4 ', color: '#383838' }}
            >
              <tr className="text-nowrap text-Text-Primary">
                {headers?.map((header, index) => (
                  <th
                    key={index}
                    className={`${header !== 'Title' && 'px-3'} pt-4 pb-3.5 text-xs font-medium cursor-pointer first:rounded-tl-3 last:rounded-tr-3`}
                  >
                    <div
                      className={`flex items-center ${header === 'Frequency' && 'justify-center'}`}
                    >
                      <div className="flex items-center">{header}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#e9edf5]">
              {(Object.entries(grouped) as [string, any[]][]).map(
                ([key, items]) => (
                  <Fragment key={key}>
                    {items?.map((item, index) => (
                      <>
                        <tr key={index}>
                          {/* Category */}
                          {index === 0 && (
                            <td
                              rowSpan={items?.length}
                              className="px-3 py-3 align-top text-xs text-Text-Primary whitespace-nowrap"
                            >
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </td>
                          )}

                          {/* Title */}
                          <td
                            className={`py-3 text-xs whitespace-nowrap ${index == 0 && 'align-top'}`}
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
                            ) : item.total_macro ? (
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
                                  {item.total_macro.Carbs}
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
                                  {item.total_macro.Protein}
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
                                  {item.total_macro.Fats}
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
                                {item.sections
                                  ?.slice(0, 2)
                                  ?.map((section: string, index: number) => {
                                    return (
                                      <div
                                        key={index}
                                        className="px-2 py-1 rounded-2xl text-[10px] flex items-center justify-center mr-1"
                                        style={{
                                          backgroundColor: '#E9F0F2',
                                          color: '#005F73',
                                        }}
                                      >
                                        {section}
                                      </div>
                                    );
                                  })}
                                {item?.sections?.length > 2 && (
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

                          {/* Frequency */}
                          <td className="px-3 py-3 whitespace-nowrap flex flex-col items-center">
                            {item.frequency_type === 'weekly' && (
                              <>
                                <div
                                  className="rounded-2xl flex items-center mb-2 justify-center gap-1"
                                  style={{
                                    width: '76px',
                                    height: '24px',
                                    backgroundColor: '#DEF7EC',
                                    color: '#005f73',
                                    fontSize: '10px',
                                  }}
                                >
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
                                  marginNotActive
                                />
                              </>
                            )}
                            {item.frequency_type === 'monthly' && (
                              <>
                                <div
                                  className="rounded-2xl flex mb-2 items-center justify-center gap-1"
                                  style={{
                                    width: '80px',
                                    height: '24px',
                                    backgroundColor: '#DEF7EC',
                                    color: '#005f73',
                                    fontSize: '10px',
                                  }}
                                >
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
                              <div
                                className="rounded-2xl flex items-center justify-center gap-1"
                                style={{
                                  width: '65px',
                                  height: '24px',
                                  backgroundColor: '#DEF7EC',
                                  color: '#005f73',
                                  fontSize: '10px',
                                }}
                              >
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
                              <div
                                className="flex items-center gap-1"
                                style={{ fontSize: '10px', color: '#FFAB2C' }}
                              >
                                <img src="/icons/danger-new.svg" alt="" />
                                No Scheduled
                              </div>
                            ) : (
                              ''
                            )}
                          </td>
                        </tr>
                        {/* Notes Row */}
                        {item.client_notes && item.client_notes.length > 0 && (
                          <tr style={{ border: 'none' }}>
                            <td colSpan={3} className="px-4 py-2">
                              <div className="flex items-start">
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
                    ))}
                  </Fragment>
                ),
              )}
            </tbody>
          </table>
        ) : (
          <div className="w-full h-full flex items-center justify-center flex-col">
            <p
              style={{ color: '#ffffffa4', marginTop: '8px', fontSize: '16px' }}
            >
              No Result to Show
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionPlanOverview;

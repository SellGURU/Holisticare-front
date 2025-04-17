/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, Fragment, useEffect, useState } from 'react';
import ChoosingDaysWeek from '../../NewGenerateActionPlan/components/ChoosingDaysWeek';
import MonthShows from '../../NewGenerateActionPlan/components/MonthShows';

interface TableProps {
  classData: Array<any>;
}

const ActionPlanOverview: FC<TableProps> = ({ classData }) => {
  const [data, setData] = useState(classData);
  useEffect(() => {
    setData(classData);
  }, [classData]);
  const grouped = data.reduce((acc: any, item) => {
    const key = item.category.toLowerCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
  const headers = ['Category', 'Title', 'Frequency', 'Time'];
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
        {data.length > 0 ? (
          <table
            className={`border-collapse table-auto text-sm text-left rtl:text-right w-full`}
          >
            <thead className="text-xs text-Text-Primary bg-backgroundColor-Main">
              <tr className="text-nowrap text-Text-Primary">
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className={`px-3 pt-4 pb-3.5 text-xs font-medium cursor-pointer first:rounded-tl-3 last:rounded-tr-3`}
                  >
                    <div className={`flex items-center`}>
                      <div className="flex items-center">{header}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-Gray-50">
              {(Object.entries(grouped) as [string, any[]][]).map(
                ([key, items]) => (
                  <Fragment key={key}>
                    {items.map((item, index) => (
                      <tr key={index}>
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
                        <td className="py-3 text-xs text-Text-Quadruple whitespace-nowrap">
                          {item.title}
                        </td>

                        {/* Frequency */}
                        <td className="px-4 py-3 whitespace-nowrap  items-center">
                          {item.frequency_type === 'weekly' && (
                            <>
                              <div
                                className="rounded-2xl flex items-center justify-center gap-1"
                                style={{
                                  width: '76px',
                                  height: '24px',
                                  backgroundColor: '#DEF7EC',
                                  color: 'var(--Primary-DeepTeal)',
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
                                ClassName="lg:ml-1"
                              />
                            </>
                          )}
                          {item.frequency_type === 'monthly' && (
                            <>
                              <div
                                className="rounded-2xl flex items-center justify-center gap-1"
                                style={{
                                  width: '80px',
                                  height: '24px',
                                  backgroundColor: '#DEF7EC',
                                  color: 'var(--Primary-DeepTeal)',
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
                                color: 'var(--Primary-DeepTeal)',
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

                        {/* Time */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {item.times && item.times.length > 0 ? (
                            <div className="flex items-center gap-1">
                              {item.times.map((time: string, index: number) => (
                                <div
                                  key={index}
                                  className="inline-block rounded-2xl capitalize"
                                  style={{
                                    backgroundColor: 'var(--bg-color)',
                                    color: 'var(--Primary-DeepTeal)',
                                    fontSize: '10px',
                                    padding: '0 0.5rem',
                                  }}
                                >
                                  {time}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div
                              className="flex items-center gap-1"
                              style={{ fontSize: '10px', color: '#FFAB2C' }}
                            >
                              <img
                                src="/icons/danger-new.svg"
                                alt=""
                                className="w-4 h-4"
                              />
                              No Scheduled
                            </div>
                          )}
                        </td>
                      </tr>
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

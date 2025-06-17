/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from 'react';
import MonthShows from '../MonthShows';
import ChoosingDaysWeek from '../ChoosingDaysWeek';

interface ActionPlanRowOverFlowProps {
  index: number;
  category: string;
  item: any;
}
const ActionPlanRowOverFlow: React.FC<ActionPlanRowOverFlowProps> = ({
  index,
  item,
  category,
}) => {
  return (
    <>
      <Fragment>
        <div className=" flex justify-between items-center bg-white">
          {/* Category */}
          {index === 0 ? (
            <div
              style={{ width: '100px' }}
              // rowSpan={items?.length}
              className="px-3 py-3 align-top bg-white flex text-xs text-Text-Primary whitespace-nowrap"
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </div>
          ) : (
            <div className="" style={{ width: '100px' }}></div>
          )}

          {/* Title */}
          <div
            style={{ width: '230px' }}
            className={`py-3 text-xs text-left flex-wrap ${index == 0 && 'align-top'}`}
          >
            <div
              style={{
                color: '#888888',
              }}
            >
              {item.title}
            </div>
            {item.dose ? (
              <div className="flex flex-wrap mt-3">
                <div className="text-[10px]" style={{ color: '#B0B0B0' }}>
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
              <div className="flex items-center flex-wrap mt-3">
                <div className="text-[10px]" style={{ color: '#B0B0B0' }}>
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
              <div className="flex items-center flex-wrap mt-3">
                <div className="text-[10px]" style={{ color: '#B0B0B0' }}>
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
          </div>

          {/* Frequency */}
          <div
            className="px-3 py-3 whitespace-nowrap flex flex-col items-center"
            style={{ width: '280px' }}
          >
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
                  <img src="/icons/calendar-2.svg" alt="" className="w-3 h-3" />
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
                  <img src="/icons/calendar-2.svg" alt="" className="w-3 h-3" />
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
                <img src="/icons/calendar-2.svg" alt="" className="w-3 h-3" />
                Daily
              </div>
            )}
            {!item.frequency_type || item.frequency_type.length === 0 ? (
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
          </div>
        </div>
        {/* Notes Row */}
        {/* {item.client_notes && item.client_notes.length > 0 && (
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
                            className="text-[10px] break-words text-justify"
                            style={{ color: '#888888' }}
                        >
                            {item.client_notes[0].substring(0, 400)}
                        </div>
                        </div>
                    </td>
                    </tr>
                )} */}
      </Fragment>
    </>
  );
};

export default ActionPlanRowOverFlow;

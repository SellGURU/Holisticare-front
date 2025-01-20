import React, { useState,useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import Checkbox from '../../checkbox';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
type Filters = {
  priority: { high: boolean; medium: boolean; low: boolean };
  progress: { inProgress: boolean; toDo: boolean };
  date: { from: Date | null; to: Date | null };
};

type AddFilterProps = {
  filters: Filters;
  onApply: (filters: Filters) => void;
  onClear: () => void;
  onClose:()=>void,
};

const AddFilter: React.FC<AddFilterProps> = ({ filters, onApply, onClear ,onClose}) => {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useModalAutoClose({
    refrence: modalRef,
    close: onClose,
  });
  return (
    <div ref={modalRef} className="bg-white shadow-800 h-[264px] z-50  w-[400px] rounded-2xl p-4 text-Text-Primary absolute top-12 right-[180px]">
      <div className="w-full flex items-center justify-between border-b  text-base font-medium pb-2 mb-6">
        Add Filter
        <img onClick={()=>onClose()} className='cursor-pointer' src="/icons/close-circle.svg" alt="" />
      </div>
      <div className="">
        <div className='flex w-full  gap-12'>
          <h3 className="text-xs font-medium">Priority</h3>
          <div className='flex gap-6'>
            <Checkbox
              checked={localFilters.priority.high}
              onChange={(e) =>
                setLocalFilters({
                  ...localFilters,
                  priority: {
                    ...localFilters.priority,
                    high: e.target.checked,
                  },
                })
              }
              label="High"
            />
            <Checkbox
              checked={localFilters.priority.medium}
              onChange={(e) =>
                setLocalFilters({
                  ...localFilters,
                  priority: {
                    ...localFilters.priority,
                    medium: e.target.checked,
                  },
                })
              }
              label="Medium"
            />
            <Checkbox
              checked={localFilters.priority.low}
              onChange={(e) =>
                setLocalFilters({
                  ...localFilters,
                  priority: { ...localFilters.priority, low: e.target.checked },
                })
              }
              label="Low"
            />
          </div>
        </div>
        <div className=' my-6 flex w-full gap-[38px] '>
          <h3 className="text-xs font-medium">Progress</h3>
          <div className='flex gap-[46px] '>
            <label className='flex'>
            <Checkbox
                checked={localFilters.progress.inProgress}
                onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      progress: {
                        ...localFilters.progress,
                        inProgress: e.target.checked,
                      },
                    })
                  }
              
            />
              <div className="px-2.5 py-[2px] rounded-full bg-[#06C78D1A] bg-opacity-10 text-[#06C78D] text-[10px]">
              In Progress
              </div>
            </label>
            <label className='flex'>
            <Checkbox
                checked={localFilters.progress.toDo}
                onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      progress: { ...localFilters.progress, toDo: e.target.checked },
                    })
                  }
              
            />
               <div className="px-2.5 py-[2px] rounded-full bg-[#4C88FF1A] bg-opacity-10 text-[#4C88FF] text-[10px]">
               To do
              </div>
            </label>
          </div>
        </div>
        <div className='flex w-full justify-between items-center'>
          <h3 className="text-xs font-medium">Deadline</h3>
          <div className='flex gap-4'>
            <DatePicker
              selected={localFilters.date.from}
              onChange={(date) =>
                setLocalFilters({
                  ...localFilters,
                  date: { ...localFilters.date, from: date },
                })
              }
              customInput={
                <button className="w-[133px] rounded-md px-2 py-1 bg-backgroundColor-Card border border-Gray-50 shadow-100 flex items-center justify-between text-[10px] text-Text-Secondary">
                  From{' '}
                  {localFilters.date.from
                    ? localFilters.date.from.toLocaleDateString()
                    : ''}
                  <img src="/icons/calendar-3.svg" alt="" />
                </button>
              }
            />
            <DatePicker
              selected={localFilters.date.to}
              onChange={(date) =>
                setLocalFilters({
                  ...localFilters,
                  date: { ...localFilters.date, to: date },
                })
              }
              customInput={
                <button className="w-[133px] shadow-100 rounded-md px-2 py-1 bg-backgroundColor-Card border border-Gray-50 flex items-center justify-between text-[10px] text-Text-Secondary">
                  To{' '}
                  {localFilters.date.to
                    ? localFilters.date.to.toLocaleDateString()
                    : ''}
                  <img src="/icons/calendar-3.svg" alt="" />
                </button>
              }
            />
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-8 gap-3">
        <ButtonSecondary style={{backgroundColor: 'white' , borderColor: "#005F73" , color: "#005F73", borderRadius:"16px" , width:'176px'}} onClick={() => onClear()}>Clear all</ButtonSecondary>
        <ButtonSecondary style={{width:'176px'}} onClick={() => onApply(localFilters)}>
            <img className='w-3 h-3' src="/icons/tick-square.svg" alt="" />
          Apply Filters
        </ButtonSecondary>
      </div>
    </div>
  );
};

export default AddFilter;

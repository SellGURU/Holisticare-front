/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import Application from '../../api/app';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary';
import DoseScheduleModal from './DoseScheduleModal';
import { DoseScheduleRow } from './DoseScheduleRow';

interface DoseScheduleHandlerProps {
  data: Array<any>;
  onAdd: () => void;
  showAdd: boolean;
  setShowAdd: React.Dispatch<React.SetStateAction<boolean>>;
  doseSchedulesListLength: number;
}

const DoseSchedule: React.FC<DoseScheduleHandlerProps> = ({
  data,
  onAdd,
  showAdd,
  setShowAdd,
  doseSchedulesListLength,
}) => {
  const [loadingCall, setLoadingCall] = useState(false);
  const [clearData, setClearData] = useState(false);
  const [showDeleteError, setshowDeleteError] = useState('');
  const [scheduleId, setScheduleId] = useState<string | undefined>(undefined);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleClearData = (value: boolean) => {
    setClearData(value);
  };

  const handleAddDoseSchedule = (newSchedule: any) => {
    setLoadingCall(true);
    Application.addPeptideDoseSchedule(newSchedule)
      .then(() => {
        onAdd();
        setShowAdd(false);
        setClearData(true);
      })
      .catch((error) => {
        console.error('Error adding dose schedule:', error);
      })
      .finally(() => {
        setLoadingCall(false);
      });
  };

  const handleDeleteDoseSchedule = (scheduleIdToDelete: string) => {
    Application.deletePeptideDoseSchedule(scheduleIdToDelete)
      .then(() => {
        onAdd();
      })
      .catch((error) => {
        console.log(error);
        if (error.detail) {
          setshowDeleteError(error.detail);
        }
      });
  };

  const handleUpdateDoseSchedule = (updatedSchedule: any) => {
    setLoadingCall(true);
    Application.editPeptideDoseSchedule(updatedSchedule)
      .then(() => {
        onAdd();
        setShowEditModal(false);
        setClearData(true);
      })
      .catch((error) => {
        console.error('Error editing dose schedule:', error);
      })
      .finally(() => {
        setLoadingCall(false);
      });
  };

  const [dynamicHeight, setDynamicHeight] = useState<number | null>(null);
  useEffect(() => {
    const updateHeight = () => {
      if (typeof window !== 'undefined') {
        const newHeight =
          window.innerWidth > 720
            ? window.innerHeight - 220
            : window.innerHeight - 320;
        setDynamicHeight(newHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  useEffect(() => {
    if (showDeleteError) {
      const timer = setTimeout(() => {
        setshowDeleteError('');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showDeleteError]);

  return (
    <>
      {showDeleteError && (
        <div className="absolute right-6 top-[70px] w-fit bg-backgroundColor-Card border border-Red py-1 px-4 flex rounded-2xl items-center gap-1  text-xs text-Text-Primary select-none">
          {' '}
          <img src="/icons/info-circle-red.svg" alt="" />
          {showDeleteError}
        </div>
      )}

      {doseSchedulesListLength === 0 ? (
        <div className="w-full h-full min-h-[450px] flex justify-center items-center">
          <div>
            <img src="/icons/supplement-empty.svg" alt="" />
            <div className="mt-8">
              <div className="text-Text-Primary text-center font-medium">
                No dose schedule found.
              </div>
              <div className="flex justify-center mt-4">
                <ButtonSecondary
                  onClick={() => {
                    setShowAdd(true);
                  }}
                  ClassName="rounded-full min-w-[180px]"
                >
                  <img src="./icons/add-square.svg" alt="" />
                  Add Dose Schedule
                </ButtonSecondary>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {data.length > 0 ? (
            <div
              className="mt-6 overflow-y-auto mb-20 md:mb-14 overflow-x-auto"
              style={{
                height: dynamicHeight ? `${dynamicHeight}px` : 'auto',
              }}
            >
              <table className="w-full min-w-[882px]">
                <thead className="w-full">
                  <tr className="text-left text-xs bg-[#F4F4F4] text-Text-Primary border-Gray-50 w-full ">
                    <th className="py-3 pl-4 w-[160px] rounded-tl-2xl text-nowrap">
                      Title
                    </th>
                    <th className="py-3 w-[150px] text-center text-nowrap">
                      Frequency
                    </th>
                    <th className="py-3 w-[150px] text-center pl-2 text-nowrap">
                      Dose
                    </th>
                    <th className="py-3 w-[100px] text-center pl-3 text-nowrap">
                      Added on
                    </th>
                    <th className="py-3 w-[80px] text-center pl-3 rounded-tr-2xl text-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="border border-t-0 border-[#E9F0F2]">
                  {data.map((schedule, index) => (
                    <DoseScheduleRow
                      schedule={schedule}
                      index={index}
                      key={index}
                      onDelete={() =>
                        handleDeleteDoseSchedule(schedule.Pds_Id || schedule.Schedule_Id)
                      }
                      onEdit={() => {
                        setShowEditModal(true);
                        setScheduleId(schedule.Pds_Id || schedule.Schedule_Id);
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="w-full h-full h-sm:h-[500px] flex flex-col justify-center items-center text-base font-medium text-Text-Primary ">
              <img src="/icons/search-status.svg" alt="" />
              <span className="-mt-6"> No results found.</span>
            </div>
          )}
        </>
      )}

      <DoseScheduleModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleAddDoseSchedule}
        loadingCall={loadingCall}
        clearData={clearData}
        handleClearData={handleClearData}
      />
      <DoseScheduleModal
        isEdit
        scheduleId={scheduleId as string}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
        }}
        onSubmit={handleUpdateDoseSchedule}
        loadingCall={loadingCall}
        clearData={clearData}
        handleClearData={handleClearData}
      />
    </>
  );
};

export default DoseSchedule;

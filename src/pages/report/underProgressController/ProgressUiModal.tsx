/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { publish, subscribe, unsubscribe } from '../../../utils/event';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';

const ProgressUiModal = () => {
  const [showProgressModal, setshowProgressModal] = useState(false);
  const [progressData, setprogressData] = useState<Array<any>>([]);
  const [completedIdes, setCompletedIdes] = useState<Array<string>>([]);
  const isVisibleModal = () => {
    if (progressData.length > 0 && showProgressModal) {
      return true;
    } else {
      return false;
    }
  };
  const resolveTitle = () => {
    return 'Processing Completed';
  };
  useEffect(() => {
    subscribe('openProgressModal', (data?: any) => {
      setshowProgressModal(true);
      if (data?.detail?.data) {
        setprogressData(data?.detail?.data);
      }
    });
    subscribe('closeProgressModal', () => {
      setshowProgressModal(false);
    });
    subscribe('completedProgress', (data: any) => {
      setCompletedIdes((prev) => [...prev, data?.detail?.file_id]);
    });
    return () => {
      unsubscribe('openProgressModal', () => {
        setshowProgressModal(false);
      });
      unsubscribe('closeProgressModal', () => {
        setshowProgressModal(false);
      });
    };
  }, []);
  const isSynced = () => {
    if (progressData.length === 0) return false;
    return progressData.every((progress: any) => {
      const progressId = progress.file_id || progress.id;
      return progressId && completedIdes.includes(progressId);
    });
  };
  return (
    <div
      style={{ zIndex: 1000 }}
      className={`
            fixed top-[48px] right-6
            w-[320px]
            rounded-2xl border-2 border-r-0 border-Gray-50 
            shadow-200 p-4 bg-white
            transition-all duration-[1000] ease-[cubic-bezier(0.4,0,0.2,1)]
            ${
              isVisibleModal()
                ? 'opacity-100 translate-x-0 scale-100 shadow-xl'
                : 'opacity-0 translate-x-[120%] scale-95 pointer-events-none shadow-none'
            }
            `}
    >
      <div className="flex items-center justify-between text-xs font-medium text-Primary-DeepTeal">
        {resolveTitle()}
        <img
          onClick={() => setshowProgressModal(false)}
          src="/icons/close.svg"
          alt="close"
          className="cursor-pointer transition-transform hover:rotate-90 duration-300"
        />
      </div>
      <div></div>
      {isSynced() && (
        <div className="w-full  flex justify-end mt-4">
          <ButtonSecondary
            onClick={() => {
              setshowProgressModal(false);
              setCompletedIdes([]);
              setprogressData([]);
              publish('syncReport', {});
            }}
          >
            Sync Data
          </ButtonSecondary>
        </div>
      )}
    </div>
  );
};

export default ProgressUiModal;

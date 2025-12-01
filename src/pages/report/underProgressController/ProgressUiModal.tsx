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
  const resolveSectionName = (item: any) => {
    if(item.category === 'file') {
      if(item.action_type === 'deleted') {
        if(completedIdes.includes(item.file_id)) {
          return {'title': 'File deleted successfully!', 'description': 'The file deletion completed.'}
        }
        return {'title': 'File deletion in progress…', 'description': 'The file is being deleted.'}
      }
      if(completedIdes.includes(item.file_id)) {
        return {'title': 'File uploaded successfully!', 'description': 'The file upload completed.'}
      }
      return {'title': 'File upload in progress…', 'description': 'The file is being uploaded.'}
    }
    return {'title': 'Processing Completed', 'description': 'The processing completed.'};
  };
  useEffect(() => {
    subscribe('openProgressModal', (data?: any) => {
      setshowProgressModal(true);
      if (data?.detail?.data) {
        setprogressData((prevData) => {
          const newData = data?.detail?.data || [];
          const updatedData = [...prevData];
          
          newData.forEach((newItem: any) => {
            const existingIndex = updatedData.findIndex(
              (item: any) => item.file_id === newItem.file_id
            );
            
            if (existingIndex !== -1) {
              // Merge new data with existing data
              updatedData[existingIndex] = { ...updatedData[existingIndex], ...newItem };
            } else {
              // Add new item if it doesn't exist
              updatedData.push(newItem);
            }
          });
          
          return updatedData;
        });
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
      const progressId = progress.file_id ;
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
      <div className="relative w-full">
        <img
          onClick={() => setshowProgressModal(false)}
          src="/icons/close.svg"
          alt="close"
          className="cursor-pointer absolute right-0 top-[-2px] transition-transform hover:rotate-90 duration-300"
        />
      </div>
      <div>
        {progressData.map((el,index:number) => {
          return (
            <>
              <div>
                <div className='text-Primary-DeepTeal TextStyle-Headline-6'> {resolveSectionName(el).title}</div>
                <div className="mt-1 w-full flex items-center gap-1 p-3 rounded-[12px] border border-Gray-50 text-[10px] text-Primary-DeepTeal transition-colors">
                  { !completedIdes.includes(el.file_id) ? (
                    <div
                      style={{
                        background:
                          'linear-gradient(to right, rgba(0,95,115,0.4), rgba(108,194,74,0.4))',
                      }}
                      className="flex size-5   rounded-full items-center justify-center gap-[3px]"
                    >
                      <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot1"></div>
                      <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot2"></div>
                      <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot3"></div>
                    </div>
                  ) : (
                    // <img src="/icons/more-circle.svg" alt="" />
                    <img src="/icons/tick-circle-upload.svg" alt="" />
                  )}
                  {resolveSectionName(el).description}
                </div>                
              </div>
              {progressData.length -1 > index  &&
              <div className='w-full h-[1px] bg-Gray-50 mt-4'></div>
              }
            </>
          )
        })}

      </div>
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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import { publish, subscribe, unsubscribe } from '../../../utils/event';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
interface ProgressUiModalProps {
  userInfoData: any;
  activeUi: boolean;
}
const ProgressUiModal: FC<ProgressUiModalProps> = ({
  userInfoData,
  activeUi,
}) => {
  const [showProgressModal, setshowProgressModal] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [progressData, setprogressData] = useState<Array<any>>([]);
  // const [completedIdes, setCompletedIdes] = useState<Array<string>>([]);
  const [isClosed, setIsClosed] = useState(false);

  const isVisibleModal = () => {
    if (!activeUi) {
      return false;
    }
    if (
      progressData.length > 0 &&
      showProgressModal &&
      !isClosed &&
      !isSideMenuOpen
    ) {
      return true;
    } else {
      return false;
    }
  };
  const resolveSectionName = (item: any) => {
    if (item.category === 'file') {
      if (item.action_type === 'deleted') {
        if (item.process_status == true) {
          return {
            title: 'File deleted successfully!',
            description: 'The file deletion completed.',
          };
        }
        return {
          title: 'File deletion in progress…',
          description: 'The file is being deleted.',
        };
      }
      if (item.process_status == true) {
        return {
          title: 'File uploaded successfully!',
          description: 'The file upload completed.',
        };
      }
      return {
        title: 'File upload in progress…',
        description: 'The file is being uploaded.',
      };
    }
    if (item.category === 'questionnaire') {
      if (item.action_type == 'entered') {
        if (item.filled_by == 'client') {
          if (item.process_status == true) {
            return {
              title: 'Client questionnaire submitted successfully!',
              description: 'Client questionnaire submission completed.',
            };
          } else {
            return {
              title: 'Client questionnaire submission in progress…',
              description: 'Your client’s responses are being processed.',
            };
          }
        } else {
          if (item.process_status == true) {
            return {
              title: 'Questionnaire filled out successfully!',
              description: 'Questionnaire submission completed.',
            };
          } else {
            return {
              title: 'Questionnaire completion in progress…',
              description: 'Your questionnaire responses are being saved.',
            };
          }
        }
      }
      if (item.action_type == 'deleted') {
        if (item.process_status == true) {
          return {
            title: 'Questionnaire deleted successfully!',
            description: 'Questionnaire deletion completed.',
          };
        } else {
          return {
            title: 'Questionnaire deletion in progress…',
            description: 'The questionnaire is being deleted.',
          };
        }
      }
      if (item.action_type == 'edited') {
        if (item.process_status == true) {
          return {
            title: 'Questionnaire edited successfully!',
            description: 'Questionnaire updates completed.',
          };
        } else {
          return {
            title: 'Questionnaire editing in progress…',
            description: 'The questionnaire responses are being updated.',
          };
        }
      }
    }
    if (item.category === 'refresh') {
      if (item.process_status == true) {
        return {
          title: userInfoData?.name + `'s data updated successfully!`,
          description: 'Client data update completed.',
        };
      } else {
        return {
          title: userInfoData?.name + `'s data update in progress…`,
          description: 'Client data is being updated...',
        };
      }
    }
    return {
      title: 'Processing Completed',
      description: 'The processing completed.',
    };
  };
  useEffect(() => {
    subscribe('openProgressModal', (data?: any) => {
      setshowProgressModal(true);
      if (data?.detail?.data) {
        setprogressData((prevData) => {
          const newData = data?.detail?.data || [];
          const updatedData = [...prevData];

          newData.forEach((newItem: any) => {
            const existingIndex = updatedData.findIndex((item: any) => {
              if (item.category === 'file' && newItem.category === 'file') {
                return item.file_id === newItem.file_id;
              }
              if (
                item.category === 'questionnaire' &&
                newItem.category === 'questionnaire'
              ) {
                return item.f_unique_id === newItem.f_unique_id;
              }
              if (
                item.category === 'refresh' &&
                newItem.category === 'refresh'
              ) {
                return true;
              }
              return false;
            });

            if (existingIndex !== -1) {
              // Merge new data with existing data
              updatedData[existingIndex] = {
                ...updatedData[existingIndex],
                ...newItem,
              };
            } else {
              // Add new item if it doesn't exist
              updatedData.push(newItem);
            }
          });

          return updatedData;
        });
        setIsClosed(false);
      }
    });
    subscribe('closeProgressModal', () => {
      setshowProgressModal(false);
    });
    subscribe('openSideMenu', (status: any) => {
      setIsSideMenuOpen(status.detail.status);
    });
    subscribe('allProgressCompleted', () => {
      setIsClosed(false);
      setprogressData((pre) => {
        return pre.map((item: any) => ({
          ...item,
          process_status: true,
        }));
      });
      // setCompletedIdes((prev) => [...prev, data?.detail?.file_id]);
    });
    subscribe('syncReport', () => {
      setprogressData([]);
    });
    return () => {
      unsubscribe('openProgressModal', () => {
        setshowProgressModal(false);
      });
      unsubscribe('syncReport', () => {
        setprogressData([]);
      });
      unsubscribe('closeProgressModal', () => {
        setshowProgressModal(false);
      });
    };
  }, []);
  const isSynced = () => {
    if (progressData.length === 0) return false;
    return progressData.every((progress: any) => {
      return progress.process_status == true;
    });
  };
  return (
    <div
      style={{ zIndex: 1000 }}
      className={`
            fixed top-[48px] right-[85px]
            w-[320px]
            max-h-[calc(100vh-100px)]
            overflow-y-auto
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
          onClick={() => setIsClosed(true)}
          src="/icons/close.svg"
          alt="close"
          className="cursor-pointer absolute right-0 top-[-2px] transition-transform hover:rotate-90 duration-300"
        />
      </div>
      <div>
        {progressData.map((el) => {
          return (
            <>
              <div>
                <div className="text-Primary-DeepTeal TextStyle-Headline-6">
                  {' '}
                  {resolveSectionName(el).title}
                </div>
                <div className="mt-1 w-full flex items-center gap-1 p-3 rounded-[12px] border border-Gray-50 text-[10px] text-Primary-DeepTeal transition-colors">
                  {el.process_status == false ? (
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

              <div
                className={`${progressData.length > 0 ? 'visible' : 'invisible'} w-full h-[1px] bg-Gray-50 my-4`}
              ></div>
            </>
          );
        })}
      </div>
      {isSynced() ? (
        <>
          <div>
            <div className="text-Text-Secondary TextStyle-Body-3 mb-4">
              Click “Sync Data” to save these updates to the system.
            </div>
          </div>
          <div className="w-full  flex justify-end ">
            <ButtonSecondary
              size="small"
              onClick={() => {
                setshowProgressModal(false);
                // setCompletedIdes([]);
                setprogressData([]);
                publish('syncReport', {});
              }}
            >
              Sync Data
            </ButtonSecondary>
          </div>
        </>
      ) : (
        <>
          <div className="w-full  text-Text-Secondary TextStyle-Body-3">
            <div>
              Feel free to continue working while the system completes the
              process.
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProgressUiModal;

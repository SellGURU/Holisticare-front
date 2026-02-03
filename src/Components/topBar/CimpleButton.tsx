/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useMemo, useState } from 'react';
import { publish, subscribe, unsubscribe } from '../../utils/event';
import { ButtonPrimary } from '../Button/ButtonPrimary';
// import TooltipText from '../TooltipText';
import { Tooltip } from 'react-tooltip';
import SpinnerLoader from '../SpinnerLoader';
// import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
// import Tooltip from '../../../'; // فرضی
interface CompileButtonProps {
  userInfoData: any;
}

const CompileButton: FC<CompileButtonProps> = ({ userInfoData }) => {
  const [progressData, setProgressData] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showProgressModal, setshowProgressModal] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  // const [completedIdes, setCompletedIdes] = useState<Array<string>>([]);
  const [isClosed, setIsClosed] = useState(false);
  /* ---------- derive state ---------- */

  const state = useMemo(() => {
    if (isSyncing) return 'SYNCING';
    if (progressData.length === 0) return 'IDLE';

    const isCompiling = progressData.some(
      (item) => item.process_status === false,
    );

    if (isCompiling) return 'COMPILING';

    return 'READY_TO_COMPILE';
  }, [progressData, isSyncing]);
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
  const isVisibleModal = () => {
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
  /* ---------- effects ---------- */

  useEffect(() => {
    subscribe('openProgressModal', (data?: any) => {
      if (!data?.detail?.data) return;

      setProgressData((prev) => {
        const updated = [...prev];
        data.detail.data.forEach((newItem: any) => {
          const index = updated.findIndex((item: any) => {
            if (item.category === 'file')
              return item.file_id === newItem.file_id;
            if (item.category === 'questionnaire')
              return item.f_unique_id === newItem.f_unique_id;
            if (item.category === 'refresh') return true;
            return false;
          });

          if (index !== -1) {
            updated[index] = { ...updated[index], ...newItem };
          } else {
            updated.push(newItem);
          }
        });
        return updated;
      });
      setIsClosed(false);
    });

    subscribe('allProgressCompleted', () => {
      setProgressData((prev) =>
        prev.map((item) => ({ ...item, process_status: true })),
      );
      setIsClosed(false);
    });
    subscribe('openSideMenu', (status: any) => {
      setIsSideMenuOpen(status.detail.status);
    });
    subscribe('syncReport', () => {
      setIsSyncing(false);
      setProgressData([]);
    });

    return () => {
      unsubscribe('openProgressModal', () => {});
      unsubscribe('allProgressCompleted', () => {});
      unsubscribe('syncReport', () => {});
    };
  }, []);

  /* ---------- UI config ---------- */

  const ui = {
    IDLE: {
      label: 'Compiled',
      disabled: true,
      tooltip:
        'Your system is fully compiled. You can now use the Holistic Plan and Action Plan.',
    },
    COMPILING: {
      label: 'Compiling...',
      disabled: false,
      tooltip:
        'Your changes are being compiled. You can continue working while this completes.',
    },
    READY_TO_COMPILE: {
      label: 'Compile',
      disabled: false,
      tooltip:
        'Compilation is ready. Click to compile and apply your latest changes.',
    },
    SYNCING: {
      label: 'Compiling...',
      disabled: true,
      tooltip: 'Final compilation in progress. Applying changes to the system.',
    },
  }[state];

  /* ---------- handlers ---------- */

  const handleClick = () => {
    if (state == 'COMPILING') {
      setshowProgressModal(true);
      setIsClosed(false);
    }
    if (state !== 'READY_TO_COMPILE') return;
    setIsSyncing(true);
    publish('syncReport', {});
  };

  /* ---------- render ---------- */

  return (
    // <Tooltip content={ui.tooltip}>
    <>
      <div>
        <ButtonPrimary
          size="small"
          isSoftDisabled={ui.disabled}
          //   disabled={ui.disabled}
          onClick={handleClick}
        >
          {(state === 'COMPILING' || state === 'SYNCING') && (
            <SpinnerLoader></SpinnerLoader>
          )}
          <div
            data-tooltip-id={'tooltipcompile'}
            data-tooltip-content={ui.tooltip}
          >
            {ui.label}
          </div>
        </ButtonPrimary>
      </div>
      <Tooltip
        place="bottom-start"
        className="!opacity-100 !z-[100005] !bg-opacity-100"
        id="tooltipcompile"
      ></Tooltip>
      <div>
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
                    className={`${progressData.length > 1 ? 'visible my-4' : 'invisible mt-4'} w-full  border-t bg-Gray-50 `}
                  ></div>
                </>
              );
            })}
          </div>
          <>
            <div className=" w-full overflow-hidden text-Text-Secondary TextStyle-Body-3">
              <div className="">
                Feel free to continue working while the system completes
                <br></br>
                the process.
              </div>
            </div>
          </>
        </div>
      </div>
    </>
    // </Tooltip>
  );
};

export default CompileButton;

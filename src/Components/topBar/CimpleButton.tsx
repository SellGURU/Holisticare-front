/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useMemo, useState } from 'react';
import { publish, subscribe, unsubscribe } from '../../utils/event';
import { ButtonPrimary } from '../Button/ButtonPrimary';
// import TooltipText from '../TooltipText';
import { Tooltip } from 'react-tooltip';
import SpinnerLoader from '../SpinnerLoader';
import { GitPullRequest, Merge, RefreshCcw } from 'lucide-react';
import { SlideOutPanel } from '../SlideOutPanel';
import Application from '../../api/app';
import { useParams } from 'react-router-dom';
// import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
// import Tooltip from '../../../'; // فرضی
interface CompileButtonProps {
  userInfoData: any;
}

const CompileButton: FC<CompileButtonProps> = ({ userInfoData }) => {
  const { id } = useParams<{ id: string; name: string }>();
  const [progressData, setProgressData] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showProgressModal, setshowProgressModal] = useState(false);
  const [isLoading, setIsLaoding] = useState(true);
  const [needCompile, setNeedCompile] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [beRecompile, setBeRecompile] = useState(false);
  const [latestRefresh, setLatestRefresh] = useState<string | null>(null);
  // const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  // const [completedIdes, setCompletedIdes] = useState<Array<string>>([]);

  /* ---------- derive state ---------- */
  useEffect(() => {
    setLatestRefresh(userInfoData?.latest_refresh)
  },[userInfoData])
  const state = useMemo(() => {
    if (isLoading) return 'LOADING';

    const isProgressing = progressData
      .filter((el) => el.category != 'refresh')
      .some((item) => item.process_status === false);
    const isCompilingprogress = progressData
      .filter((el) => el.category === 'refresh')
      .some((item) => item.process_status === false);
    if (isProgressing) return 'PROGRESSING';
    if (isCompilingprogress || isCompiling) return 'COMPILING';
    if (needCompile) return 'READY_TO_COMPILE';
    if (isSyncing) return 'SYNCING';
    if (beRecompile) return 'RECOMPILE';
    if (progressData.length === 0) return 'IDLE';
    return 'READY_TO_COMPILE';
  }, [
    progressData,
    isSyncing,
    isLoading,
    needCompile,
    isCompiling,
    beRecompile,
  ]);
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

  /* ---------- effects ---------- */
  const checkRefrashData = () => {
    setIsLaoding(true);
    Application.checkClientRefresh(id as string)
      .then((res) => {
        setNeedCompile(res.data.need_of_refresh);
        // const raw = res.data.latest_refresh;
        // setLatestRefresh(
        //   raw && String(raw).trim().toLowerCase() !== 'no data' ? raw : null,
        // );
      })
      .catch(() => {})
      .finally(() => {
        setIsLaoding(false);
      });
  };

  const formatLatestRefreshLabel = (dateStr: string | null): string | null => {
    if (!dateStr || String(dateStr).trim().toLowerCase() === 'no data')
      return null;
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return null;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const inputStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (inputStart.getTime() === todayStart.getTime()) return 'today';
    if (inputStart.getTime() === yesterdayStart.getTime()) return 'yesterday';
    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  useEffect(() => {
    checkRefrashData();
  }, []);
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
    });

    subscribe('allProgressCompleted', () => {
      setProgressData((prev) =>
        prev.map((item) => ({ ...item, process_status: true })),
      );
    });
    // subscribe('openSideMenu', (status: any) => {
    //   setIsSideMenuOpen(status.detail.status);
    // });
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
    RECOMPILE: {
      label: 'Recompile',
      disabled: false,
      tooltip: 'Click to recompile and apply your latest changes.',
    },
    LOADING: {
      label: 'Loading ...',
      disabled: true,
      tooltip: '',
    },
    PROGRESSING: {
      label: 'Progressing...',
      disabled: false,
      tooltip:
        'Your changes are being Progressed. You can continue working while this completes.',
    },
    IDLE: {
      label: 'Compiled',
      disabled: true,
      tooltip: 'Click to recompile and apply your latest changes.',
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

  useEffect(() => {
    if (progressData.length > 0) {
      if (progressData.every((item) => item.process_status === true)) {
        setIsCompiling(false);
        setshowProgressModal(false);
        publish('syncReport', {});
      }
    }
  }, [progressData]);
  /* ---------- handlers ---------- */

  const handleClick = () => {
    if (state == 'READY_TO_COMPILE' || state == 'RECOMPILE') {
      setIsCompiling(true);
      setNeedCompile(false);
      Application.refreshData(id as string)
        .then(() => {
          // setLatestRefresh(new Date().toISOString());
          publish('SyncRefresh', {});
          publish('disableGenerate', {});
        })
        .catch(() => {});
      return;
    }
    if (state == 'COMPILING' || state == 'PROGRESSING') {
      setshowProgressModal(true);
    }
    // if (state !== 'READY_TO_COMPILE') return;
    // setIsSyncing(true);
    // setshowProgressModal(false);
    // publish('syncReport', {});
  };

  /* ---------- render ---------- */

  const refreshLabel = formatLatestRefreshLabel(latestRefresh);

  return (
    // <Tooltip content={ui.tooltip}>
    <>
      <div className="flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:gap-2">
        <ButtonPrimary
          size="small"
          isSoftDisabled={ui.disabled}
          // disabled={state == 'IDLE'}
          onMouseEnter={() => {
            if (state === 'IDLE') {
              setBeRecompile(true);
            }
          }}
          onMouseLeave={() => {
            setBeRecompile(false);
          }}
          onClick={handleClick}
        >
          {(state === 'COMPILING' ||
            state === 'SYNCING' ||
            state == 'LOADING' ||
            state == 'PROGRESSING') && <SpinnerLoader></SpinnerLoader>}
          {state == 'READY_TO_COMPILE' && (
            <>
              <GitPullRequest width={14} height={14}></GitPullRequest>
            </>
          )}
          {state == 'IDLE' && (
            <>
              <Merge width={14} height={14}></Merge>
            </>
          )}
          {state == 'RECOMPILE' && (
            <>
              <RefreshCcw width={14} height={14}></RefreshCcw>
            </>
          )}
          <div
            data-tooltip-id={'tooltipcompile'}
            data-tooltip-content={ui.tooltip}
          >
            {ui.label}
          </div>
        </ButtonPrimary>
        {refreshLabel != null && (
          <span className="text-Text-Secondary text-[10px] whitespace-nowrap">
            Last compiled: {refreshLabel}
          </span>
        )}
      </div>
      <Tooltip
        place="bottom-start"
        className="!opacity-100 !z-[100005] !bg-opacity-100"
        id="tooltipcompile"
      ></Tooltip>
      <div>
        <SlideOutPanel
          isOpen={showProgressModal}
          headline={'Progress'}
          onClose={() => {
            setshowProgressModal(false);
          }}
        >
          <div className="max-h-[calc(100vh-180px)] overflow-y-auto pr-2">
            {progressData.map((el) => {
              return (
                <>
                  <div>
                    <div className="text-Primary-DeepTeal  TextStyle-Headline-6 ">
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
        </SlideOutPanel>
      </div>
    </>
    // </Tooltip>
  );
};
// <div
//   style={{ zIndex: 1000 }}
//   className={`
//         fixed top-[48px] right-[85px]
//         w-[320px]
//         max-h-[calc(100vh-100px)]
//         overflow-y-auto
//         rounded-2xl border-2 border-r-0 border-Gray-50
//         shadow-200 p-4 bg-white
//         transition-all duration-[1000] ease-[cubic-bezier(0.4,0,0.2,1)]
//         ${
//           isVisibleModal()
//             ? 'opacity-100 translate-x-0 scale-100 shadow-xl'
//             : 'opacity-0 translate-x-[120%] scale-95 pointer-events-none shadow-none'
//         }
//         `}
// >
//   <div className="relative w-full">
//     <img
//       onClick={() => setIsClosed(true)}
//       src="/icons/close.svg"
//       alt="close"
//       className="cursor-pointer absolute right-0 top-[-2px] transition-transform hover:rotate-90 duration-300"
//     />
//   </div>
//   <div>
//     {progressData.map((el) => {
//       return (
//         <>
//           <div>
//             <div className="text-Primary-DeepTeal TextStyle-Headline-6">
//               {' '}
//               {resolveSectionName(el).title}
//             </div>
//             <div className="mt-1 w-full flex items-center gap-1 p-3 rounded-[12px] border border-Gray-50 text-[10px] text-Primary-DeepTeal transition-colors">
//               {el.process_status == false ? (
//                 <div
//                   style={{
//                     background:
//                       'linear-gradient(to right, rgba(0,95,115,0.4), rgba(108,194,74,0.4))',
//                   }}
//                   className="flex size-5   rounded-full items-center justify-center gap-[3px]"
//                 >
//                   <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot1"></div>
//                   <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot2"></div>
//                   <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot3"></div>
//                 </div>
//               ) : (
//                 // <img src="/icons/more-circle.svg" alt="" />
//                 <img src="/icons/tick-circle-upload.svg" alt="" />
//               )}
//               {resolveSectionName(el).description}
//             </div>
//           </div>

//           <div
//             className={`${progressData.length > 1 ? 'visible my-4' : 'invisible mt-4'} w-full  border-t bg-Gray-50 `}
//           ></div>
//         </>
//       );
//     })}
//   </div>
//   <>
//     <div className=" w-full overflow-hidden text-Text-Secondary TextStyle-Body-3">
//       <div className="">
//         Feel free to continue working while the system completes
//         <br></br>
//         the process.
//       </div>
//     </div>
//   </>
// </div>
export default CompileButton;

import { useNavigate } from 'react-router-dom';
// import { ButtonSecondary } from "../Button/ButtosSecondary";
import { FC, useEffect, useRef, useState } from 'react';
import Application from '../../api/app.ts';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
import SvgIcon from '../../utils/svgIcon.tsx';
import { ButtonPrimary } from '../Button/ButtonPrimary.tsx';
import { ArchiveModal } from './ArchiveModal.tsx';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tooltip } from 'react-tooltip';
import MainModal from '../MainModal/index.tsx';
import Checkbox from '../checkbox/index.tsx';
import { DeleteModal } from './deleteModal.tsx';
interface ClientCardProps {
  client: any;
  indexItem: number;
  ondelete: (memberid: any) => void;
  onarchive: (memberid: any) => void;
  onToggleHighPriority: (memberid: any) => void;
  activeTab: string;
  onAssign: (memberId: number, coachUsername: string) => void;
}

const ClientCard: FC<ClientCardProps> = ({
  client,
  indexItem,
  ondelete,
  onarchive,
  onToggleHighPriority,
  activeTab,
  onAssign,
}) => {
  const navigate = useNavigate();
  const [showModal, setshowModal] = useState(false);
  const showModalRefrence = useRef(null);
  const showModalButtonRefrence = useRef(null);
  const [refresh, setRefresh] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  useModalAutoClose({
    refrence: showModalRefrence,
    buttonRefrence: showModalButtonRefrence,
    close: () => {
      setshowModal(false);
      setshowAssign(false);
    },
  });
  // const handleToggleFavoriteAndHighPriority = async () => {
  //   try {
  //     // Call API to toggle favorite status
  //     await Application.addFavorite({
  //       member_id: client.member_id,
  //       is_favorite: !client.favorite,
  //     });

  //     // Update the local state to reflect the change
  //     onToggleHighPriority(client.member_id);

  //     // Optionally close the modal if applicable
  //     setshowModal(false);
  //   } catch (error) {
  //     console.error('Error updating favorite status:', error);
  //   }
  // };
  const handleAddToHighPriority = async () => {
    try {
      if (!client.favorite) {
        // Call API to add to high priorities
        await Application.addFavorite({
          member_id: client.member_id,
          is_favorite: true,
        });

        // Update the local state to reflect the change
        onToggleHighPriority(client.member_id);

        // Optionally close the modal if applicable
        setshowModal(false);
      }
    } catch (error) {
      console.error('Error adding to high priorities:', error);
    }
  };
  const handleRemoveFromHighPriority = async () => {
    try {
      if (client.favorite && activeTab === 'High-Priority') {
        // Call API to remove from high priorities
        await Application.addFavorite({
          member_id: client.member_id,
          is_favorite: false,
        });

        // Update the local state to reflect the change
        onToggleHighPriority(client.member_id);

        // Optionally close the modal if applicable
        setshowModal(false);
      }
    } catch (error) {
      console.error('Error removing from high priorities:', error);
    }
  };
  // const handleToggleFavorite = async () => {
  //   try {
  //     // Call API to toggle favorite status
  //     await Application.addFavorite({
  //       member_id: client.member_id,
  //       is_favorite: !client.favorite,F
  //     });

  //     // Update the local state to reflect the change
  //     client.favorite = !client.favorite;
  //     setshowModal(false);
  //   } catch (error) {
  //     console.error('Error updating favorite status:', error);
  //   }
  // };

  const [isExpanded, setIsExpanded] = useState(window.innerWidth > 768);
  useEffect(() => {
    const handleResize = () => {
      setIsExpanded(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, []);
  const [showArchiveModal, setshowArchiveModal] = useState(false);
  const [showDeleteModal, setshowDeleteModal] = useState(false);
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'checked':
        return {
          backgroundColor: '#DEF7EC',
          ellipseColor: '#06C78D',
        };
      case 'needs check':
        return {
          backgroundColor: '#FFD8E4',
          ellipseColor: '#FC5474',
        };
      case 'incomplete data':
        return {
          backgroundColor: '#F9DEDC',
          ellipseColor: '#FFAB2C',
        };
      default:
        return {
          backgroundColor: '#FFD8E4',
          ellipseColor: '#FC5474',
        };
    }
  };
  const { backgroundColor, ellipseColor } = getStatusStyles(client.status);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [AccessUserName, setAccessUserName] = useState('');
  const [AccessPassword, setAccessPassword] = useState('');
  const [isShared, setIsShared] = useState(false);
  // Application.giveClientAccess({ member_id: client.member_id }).then((res) => {
  //   console.log(res);

  //   // setAccessUserName(res.username);
  //   // setAccessPassword(res.password);
  // });
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notifType, setNotifType] = useState('');
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotifType(type);
      setNotificationMessage('Text Copied to Clipboard');
      setTimeout(() => {
        setNotifType('');
        setNotificationMessage('');
      }, 3000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  const notifCopyModal = useRef(null);
  useModalAutoClose({
    refrence: notifCopyModal,
    close: () => {
      setNotificationMessage('');
    },
  });
  // const [showAsignList, setshowAsignList] = useState(false);
  const [showAssign, setshowAssign] = useState(false);
  interface Coach {
    username: string;
    assigned: boolean;
  }
  const [CoachList, setCoachList] = useState<Array<any>>([]);

  const handleAssignClick = () => {
    Application.getCoachList({ member_id: client.member_id }).then((res) => {
      setCoachList(res.data);
      setshowAssign(!showAssign);
    });
  };
  const handleCoachSelection = (selectedCoach: Coach) => {
    // Toggle the assigned state for the selected coach
    const newAssignedState = !selectedCoach.assigned;

    // Update UI - toggle the selected coach's assigned state
    setCoachList((prevCoaches) =>
      prevCoaches.map((coach) => ({
        ...coach,
        assigned:
          coach.username === selectedCoach.username ? newAssignedState : false,
      })),
    );

    // Send the updated assignment to API
    Application.assignCoach({
      member_id: client.member_id,
      coach_usernames: newAssignedState ? [selectedCoach.username] : [],
    }).then(() => {
      onAssign(
        client.member_id,
        newAssignedState ? selectedCoach.username : '',
      );
    });
  };
  //  handleAssignCoach = (index: number) => {
  //   // Get all coaches that have assigned = true (including previously assigned coaches)
  //   const assignedCoaches = CoachList.filter(coach => coach.assigned)
  //     .map(coach => coach.username);

  //   // Add the newly selected coach if not already included
  //   const selectedCoach = CoachList[index];
  //   if (!assignedCoaches.includes(selectedCoach.username)) {
  //     assignedCoaches.push(selectedCoach.username);
  //   }

  //   Application.assignCoach({
  //     member_id: client.member_id,
  //     coach_usernames: assignedCoaches, // Send all assigned coaches
  //   }).then(() => {
  //     setshowAssign(false);
  //   });
  // };

  const handleCheckRefreshProgress = () => {
    return Application.checkRefreshProgress(client.member_id)
      .then((res) => res.data)
      .catch(() => null);
  };

  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((x) => x + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  const formatLastRefresh = (date: string) => {
    if(date == 'No Data') return 'No Data';
    const lastTime = lastRefreshTime==null? new Date(date) : lastRefreshTime;
    // if (!lastRefreshTime) return '';
    const now = new Date();
    const diffMs = now.getTime() - lastTime.getTime();
    const diffMinutes = diffMs / 60000;

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 5) return '1 min ago';
    if (diffMinutes < 10) return '5 min ago';

    return lastTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleRefreshData = () => {
    setRefresh(true);

    Application.refreshData(client.member_id)
      .then(() => {
        refreshIntervalRef.current = setInterval(async () => {
          const result = await handleCheckRefreshProgress();

          if (result?.status) {
            if (refreshIntervalRef.current) {
              clearInterval(refreshIntervalRef.current);
              refreshIntervalRef.current = null;
            }
            setRefresh(false);
            setLastRefreshTime(new Date());
          }
        }, 30000);
      })
      .catch(() => {
        setRefresh(false);
      });
  };

  return (
    <>
      <MainModal
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
      >
        <>
          {isShared ? (
            <div className="bg-white w-[90vw] md:w-[500px] h-[196px] rounded-2xl p-4 shadow-800 text-Text-Primary">
              <div className="flex flex-col gap-4 items-center w-full ">
                <img
                  className="w-[134px] h-[108px] -mt-3"
                  src="/icons/tick-circle-background-new.svg"
                  alt=""
                />
                <div className="text-xs font-medium -mt-6 mb-3">
                  The email address and password have been successfully sent to{' '}
                  {client.name}.
                </div>
                <ButtonPrimary onClick={() => setShowAccessModal(false)}>
                  <div className="w-[150px]">Got it</div>
                </ButtonPrimary>
              </div>
            </div>
          ) : (
            <div className="bg-white w-[90vw] md:w-[500px] h-[352px] rounded-2xl p-4 shadow-800 text-Text-Primary">
              <div
                className="border-b border-Gray-50 pb-2 text-sm font-medium"
                data-tooltip-id={'tooltip-client-access' + client.name}
              >
                {client.name.length > 35
                  ? client.name.substring(0, 35) + "...'s Access"
                  : client.name + "'s Access"}
                {client.name.length > 35 && (
                  <Tooltip
                    place="top"
                    id={'tooltip-client-access' + client.name}
                    className="!bg-white !w-[250px] !text-wrap !text-[#888888] !bg-opacity-100 !opacity-100 !text-[8px] !rounded-[6px] !border !border-Gray-50 !p-2 !break-words"
                  >
                    {client.name}'s Access
                  </Tooltip>
                )}
              </div>
              <div className="mt-6 text-xs font-medium text-justify">
                Share the email address and password with your client to give
                them access.
              </div>
              <div className="text-xs text-Text-Secondary mt-3">
                Do not share this information with anyone else.
              </div>
              <div className="flex flex-col gap-2 mt-6">
                <div className="text-xs font-medium">Email Address</div>
                <div className="w-full flex justify-between rounded-2xl border border-Gray-50 px-3 py-1 bg-[#FDFDFD] relative">
                  <span
                    className="text-xs select-none"
                    data-tooltip-id={'tooltip-client-access' + AccessUserName}
                  >
                    {AccessUserName.length > 35
                      ? AccessUserName.substring(0, 35) + '...'
                      : AccessUserName}
                    {AccessUserName.length > 35 && (
                      <Tooltip
                        place="top"
                        id={'tooltip-client-access' + AccessUserName}
                        className="!bg-white !w-[250px] !bg-opacity-100 !opacity-100 !text-wrap !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 !p-2 !break-words"
                      >
                        {AccessUserName}
                      </Tooltip>
                    )}
                  </span>
                  <img
                    onClick={() => copyToClipboard(AccessUserName, 'Email')}
                    className="cursor-pointer"
                    src="/icons/copy.svg"
                    alt=""
                  />
                  {notificationMessage && notifType == 'Email' && (
                    <div
                      ref={notifCopyModal}
                      className="absolute bg-white py-1 px-4 rounded-xl border border-Gray-50 shadow-800 flex items-center gap-1 text-xs text-Text-Primary right-0 top-7"
                    >
                      <img src="/icons/info-circle-green.svg" alt="" />
                      {notificationMessage}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-6">
                <div className="text-xs font-medium">Password</div>
                <div className="w-full flex justify-between rounded-2xl border border-Gray-50 px-3 py-1 bg-[#FDFDFD] relative">
                  <span
                    className="text-xs select-none"
                    data-tooltip-id={'tooltip-client-access' + AccessPassword}
                  >
                    {AccessPassword.length > 35
                      ? AccessPassword.substring(0, 35) + '...'
                      : AccessPassword}
                    {AccessPassword.length > 35 && (
                      <Tooltip
                        place="top"
                        id={'tooltip-client-access' + AccessPassword}
                        className="!bg-white !opacity-100 !bg-opacity-100 !w-[250px] !text-wrap !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 !p-2 !break-words"
                      >
                        {AccessPassword}
                      </Tooltip>
                    )}
                  </span>
                  <img
                    onClick={() => copyToClipboard(AccessPassword, 'Password')}
                    className="cursor-pointer"
                    src="/icons/copy.svg"
                    alt=""
                  />
                  {notificationMessage && notifType == 'Password' && (
                    <div
                      ref={notifCopyModal}
                      className="absolute bg-white py-1 px-4 rounded-xl border border-Gray-50 shadow-800 flex items-center gap-1 text-xs text-Text-Primary right-0 top-7"
                    >
                      <img src="/icons/info-circle-green.svg" alt="" />
                      {notificationMessage}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex w-full justify-end mt-12 gap-4 items-center">
                <div
                  onClick={() => setShowAccessModal(false)}
                  className="text-sm font-medium text-Text-Secondary cursor-default"
                >
                  Cancel
                </div>
                <div
                  onClick={() => {
                    Application.shareClientAccess({
                      member_id: client.member_id,
                      username: AccessUserName,
                      password: AccessPassword,
                    })
                      .then(() => {
                        setIsShared(true);
                      })
                      .catch(() => {});
                  }}
                  className="text-sm font-medium text-Primary-DeepTeal cursor-default"
                >
                  Share with Email
                </div>
              </div>
            </div>
          )}
        </>
      </MainModal>
      <ArchiveModal
        archived={client.archived}
        onConfirm={() => {
          if (client.archived) {
            Application.unArchivePatient({
              member_id: client.member_id,
            }).then(() => {
              onarchive(client.member_id);
            });
          } else {
            Application.archivePatient({
              member_id: client.member_id,
            }).then(() => {
              onarchive(client.member_id);
            });
          }
        }}
        name={client.name}
        isOpen={showArchiveModal}
        onClose={() => setshowArchiveModal(false)}
      ></ArchiveModal>
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setshowDeleteModal(false);
          // ondelete(client.member_id);
        }}
        name={client.name}
        onDelete={() => {
          Application.deletePatient({
            member_id: client.member_id,
          }).then(() => {
            // setshowModal(false);
          });
          // onarchive(client.member_id)
        }}
        onConfirm={() => {
          ondelete(client.member_id);
        }}
      ></DeleteModal>
      <div
        onClick={() => {
          // e.stopPropagation();
          // navigate(`/report/${client.member_id}/${client.name}`);
        }}
        className="sm:min-w-[315px] w-full xs:w-[344px] ss:w-full md:w-[333px] p-2 sm:p-4 bg-white shadow-200 xl:w-[24%] rounded-[16px] relative"
      >
        {showModal && (
          <div
            ref={showModalRefrence}
            className="absolute top-7 md:top-12 right-[10px] z-20 w-[220px] rounded-[16px] px-4 py-2 bg-white border border-Gray-50 shadow-200 flex flex-col gap-3"
          >
            {client.archived ? (
              <>
                <div
                  onClick={() => {
                    setshowModal(false);
                    setshowArchiveModal(true);
                    // Application.archivePatient({
                    //   member_id: client.member_id,
                    // });
                    // onarchive(client.member_id);
                    // ondelete(client.member_id);
                  }}
                  className="flex items-center gap-2 cursor-pointer TextStyle-Body-2 text-Text-Primary pb-1 border-b border-Secondary-SelverGray "
                >
                  <img src="/icons/directbox-send.svg" alt="" />
                  Unarchive
                </div>
                {!client.favorite ? (
                  <div
                    onClick={handleAddToHighPriority}
                    className="flex items-center gap-2 cursor-pointer TextStyle-Body-2 text-Text-Primary pb-1 border-b border-Secondary-SelverGray cursor-default"
                  >
                    <img src="/icons/star.svg" alt="" />
                    Add to High-Priorities
                  </div>
                ) : (
                  client.favorite &&
                  activeTab == 'High-Priority' && (
                    <div
                      onClick={handleRemoveFromHighPriority}
                      className="flex items-center gap-2 cursor-pointer TextStyle-Body-2 text-Text-Primary pb-1 border-b border-Secondary-SelverGray cursor-default"
                    >
                      <img src="/icons/star.svg" alt="" />
                      Remove from High-Priorities
                    </div>
                  )
                )}
                <div
                  onClick={() => {
                    Application.giveClientAccess({
                      member_id: client.member_id,
                    })
                      .then((res) => {
                        setAccessUserName(res.data.username);
                        setAccessPassword(res.data.password);
                        setShowAccessModal(true);
                      })
                      .catch(() => {});
                  }}
                  className="flex items-center gap-2 cursor-pointer TextStyle-Body-2 text-Text-Primary pb-1 border-b border-Secondary-SelverGray "
                >
                  <img src="/icons/keyboard-open.svg" alt="" />
                  Client Access
                </div>
                <div
                  onClick={() => {
                    setshowDeleteModal(true);
                  }}
                  // onClick={() => {
                  //   setshowModal(false);
                  //   Application.deletePatient({
                  //     member_id: client.member_id,
                  //   });
                  //   // onarchive(client.member_id)
                  //   ondelete(client.member_id);
                  // }}
                  className="flex items-center gap-2 cursor-pointer TextStyle-Body-2 text-Text-Primary pb-1 cursor-default"
                >
                  <img src="/icons/delete-green.svg" className="w-4" alt="" />
                  Delete
                </div>
              </>
            ) : (
              <>
                <div className="relative">
                  <div
                    onClick={handleAssignClick}
                    className="flex items-center gap-2 cursor-pointer justify-between w-full TextStyle-Body-2 text-Text-Primary pb-1 border-b border-Secondary-SelverGray "
                  >
                    <div className="flex items-center gap-1">
                      {' '}
                      <img src="/icons/assign-green.svg" alt="" />
                      Assign to
                    </div>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssignClick();
                      }}
                      className={`${showAssign && 'rotate-180'} transition-transform`}
                    >
                      <SvgIcon
                        src="/icons/arrow-right.svg"
                        width="20px"
                        height="20px"
                        color="#888888"
                      />
                    </div>
                  </div>
                  {showAssign && (
                    <div
                      className={`absolute top-0 md:-top-2 ${(indexItem + 1) % 4 == 0 ? '-right-4 md:right-[200px]' : ' -right-4 md:-right-[200px]'} max-h-[300px] overflow-auto ${(indexItem + 1) % 4 == 0 ? 'rounded-tl-2xl rounded-b-2xl' : ' rounded-tr-2xl rounded-b-2xl'} w-[220px] h-[182px] md:h-auto  md:w-[188px] shadow-200 p-3 bg-white flex flex-col gap-3`}
                    >
                      <div
                        onClick={() => setshowAssign(false)}
                        className=" md:hidden size-5 rotate-180"
                      >
                        <SvgIcon
                          src="/icons/arrow-right.svg"
                          width="20px"
                          height="20px"
                          color="#888888"
                        />
                      </div>

                      {CoachList.map((coach: Coach) => (
                        <div
                          // onClick={() => handleCoachSelection(coach)}
                          className={`p-1 cursor-pointer select-none w-full flex items-center gap-2 rounded text-Text-Secondary text-xs ${coach.assigned ? 'bg-[#E9F0F2]' : 'bg-white'}`}
                        >
                          <div>
                            <Checkbox
                              borderColor={
                                coach.assigned
                                  ? 'borderPrimary-DeepTeal'
                                  : 'border-[#888888]'
                              }
                              onChange={() => handleCoachSelection(coach)}
                              checked={coach.assigned}
                            />
                          </div>
                          <div
                            className={`${coach.assigned && 'text-Primary-DeepTeal'}`}
                            onClick={() => handleCoachSelection(coach)}
                          >
                            {coach.username}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  onClick={() => {
                    setshowModal(false);
                    setshowArchiveModal(true);
                    // Application.archivePatient({
                    //   member_id: client.member_id,
                    // });
                    // onarchive(client.member_id);
                    // ondelete(client.member_id);
                  }}
                  className="flex items-center gap-2 cursor-pointer TextStyle-Body-2 text-Text-Primary pb-1 border-b border-Secondary-SelverGray "
                >
                  <img src="/icons/directbox-send.svg" alt="" />
                  Send to Archieve
                </div>
                {!client.favorite ? (
                  <div
                    onClick={handleAddToHighPriority}
                    className="flex items-center gap-2 cursor-pointer TextStyle-Body-2 text-Text-Primary pb-1 border-b border-Secondary-SelverGray "
                  >
                    <img src="/icons/star.svg" alt="" />
                    Add to High-Priority
                  </div>
                ) : (
                  client.favorite &&
                  activeTab == 'High-Priority' && (
                    <div
                      onClick={handleRemoveFromHighPriority}
                      className="flex items-center gap-2 cursor-pointer TextStyle-Body-2 text-Text-Primary pb-1 border-b border-Secondary-SelverGray "
                    >
                      <img src="/icons/star.svg" alt="" />
                      Remove from High-Priority
                    </div>
                  )
                )}
                {/* <div
                  onClick={handleToggleFavoriteAndHighPriority}
                  className="flex items-center border-b border-Secondary-SelverGray gap-1 TextStyle-Body-2 text-Text-Primary pb-1  cursor-pointer"
                >
                  <img src="/icons/star.svg" alt="" />
                  {client.favorite && activeTab == "High-Priority"
                    ? 'Remove from High-Priorities'
                    : 'Add to High-Priorities'}{' '}
                </div> */}
                <div
                  onClick={() => {
                    Application.giveClientAccess({
                      member_id: client.member_id,
                    })
                      .then((res) => {
                        setAccessUserName(res.data.username);
                        setAccessPassword(res.data.password);
                        setShowAccessModal(true);
                      })
                      .catch(() => {});
                  }}
                  className="flex items-center gap-2 cursor-pointer TextStyle-Body-2 text-Text-Primary pb-1 border-b border-Secondary-SelverGray "
                >
                  <img src="/icons/keyboard-open.svg" alt="" />
                  Client Access
                </div>
                <div
                  onClick={() => {
                    setshowDeleteModal(true);
                  }}
                  // onClick={() => {
                  //   setshowModal(false);
                  //   Application.deletePatient({
                  //     member_id: client.member_id,
                  //   });
                  //   // onarchive(client.member_id)
                  //   ondelete(client.member_id);
                  // }}
                  className="flex items-center gap-2 cursor-pointer TextStyle-Body-2 text-Text-Primary pb-1 "
                >
                  <img src="/icons/delete-green.svg" className="w-4" alt="" />
                  Delete
                </div>
              </>
            )}
          </div>
        )}
        <div
          onClick={() => {
            // navigate(`/report/${client.member_id}/${client.name}`  );
          }}
          className="flex"
        >
          <div className="size-[48px] xs:size-[64px] md:size-[72px] min-w-[48px] xs:min-w-[64px] md:min-w-[72px] border border-Primary-DeepTeal rounded-full relative">
            <img
              className="w-full h-full rounded-full object-cover"
              onError={(e: any) => {
                e.target.src = `◘${client.name}`; // Set fallback image
              }}
              src={
                client.picture
                  ? client.picture
                  : `https://ui-avatars.com/api/?name=${client.name}`
              }
              alt=""
            />
            {client.favorite && (
              <img
                className="absolute md:bottom-0 -bottom-2 -right-1 md:right-0 w-[30px] h-[26px] md:w-[34px] md:h-[30px]"
                src="/icons/Priority.svg"
                alt=""
              />
            )}
          </div>
          <div
            onClick={() => {
              if (window.innerWidth < 768) {
                navigate(`/report/${client.member_id}/${client.name}`);
              }
            }}
            className="pl-2 flex flex-col mt-4 cursor-default"
          >
            <div
              data-tooltip-id={`${client.member_id}-${client.name}`}
              className="text-Text-Primary truncate max-w-[90px] sm:max-w-[100px] md:max-w-[150px] text-xs sm:text-[14px] font-medium text-nowrap mb-2 cursor-default"
            >
              {client.name}
              {client.name.length > 15 && (
                <Tooltip
                  place="top"
                  id={`${client.member_id}-${client.name}`}
                  className="!bg-white !w-[230px] !bg-opacity-100 !opacity-100 !z-[999] !text-wrap !text-[#888888] !text-[8px] !rounded-[6px] !border !border-Gray-50 !p-2 !break-words"
                >
                  {client.name}
                </Tooltip>
              )}
            </div>
            {/* <div className="text-Text-Secondary text-[10px] sm:text-[12px]">
              {client.age} years{' '}
            </div> */}
            <div className="text-Text-Secondary text-[10px] sm:text-[12px] text-nowrap cursor-default">
              ID: {client.member_id}
            </div>
          </div>
          <div className="flex md:hidden flex-col w-full items-end justify-end ml-4">
            <ButtonPrimary
              onClick={(e) => {
                e.stopPropagation();

                setIsExpanded(!isExpanded);
              }}
              ClassName="px-1 ml-3"
              size="small"
            >
              <div className="text-[10px] flex justify-center gap-1 text-nowrap">
                <img
                  className={`${isExpanded && 'rotate-180'}`}
                  src="/icons/arrow-circle-down-white.svg"
                  alt=""
                />
                {isExpanded ? 'Show Less' : 'Show More'}
              </div>
            </ButtonPrimary>
          </div>
        </div>
        <div
          ref={showModalButtonRefrence}
          onClick={(e) => {
            e.stopPropagation();
            setshowModal(!showModal);
          }}
          className="absolute top-2 md:top-7 right-2 cursor-pointer"
        >
          <img src="/icons/client-card/more.svg" alt="" />
        </div>
        <div>
          {isExpanded && (
            <div className="flex flex-col h-full">
              <div className="w-full mt-2 flex h-full justify-between">
                <div className="flex flex-col justify-between h-full border-r border-Gray-50 pr-3 pl-2 py-1">
                  <div className="flex flex-col relative h-[128px] justify-between ">
                    <div className="flex items-center justify-center flex-col">
                      <div className="text-[8px] sm:text-[10px] text-Text-Secondary cursor-default">
                        Enroll Date
                      </div>
                      <div className="text-Text-Primary text-[10px] sm:text-xs mb-6 cursor-default">
                        {client.enroll_date}
                      </div>
                    </div>
                    <div className="">
                      <div className="text-[8px] sm:text-[10px] text-Text-Secondary text-nowrap cursor-default">
                        Checked on
                      </div>
                      <div className="text-Text-Primary text-[10px] text-center sm:text-xs cursor-default">
                        {client.last_checkin != 'No Data'
                          ? client.last_checkin
                          : '-'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-col gap-1 justify-between pl-3 py-1">
                  <div className="flex gap-2 w-full text-Text-Primary text-[10px] sm:text-xs cursor-default">
                    <div className="flex gap-1 w-[85px] items-center  text-Text-Secondary text-[8px] text-nowrap sm:text-[10px] cursor-default">
                      <img src="/icons/user-tick.svg" alt="" />
                      Assigned to
                    </div>
                    <div className="flex text-nowrap truncate max-w-[110px] cursor-default">
                      {client.assigned_to[0] || '-'}
                    </div>
                  </div>
                  <div className="flex gap-2 w-full text-Text-Primary text-[10px] sm:text-xs capitalize cursor-default">
                    <div className="flex items-center w-[85px] gap-1 text-Text-Secondary text-[8px] sm:text-[10px] cursor-default">
                      <img src="/icons/status.svg" alt="" />
                      Status
                    </div>
                    <div
                      style={{ backgroundColor: backgroundColor }}
                      className="flex items-center px-1.5 text-[9px] h-[20px] rounded-[10px] justify-center text-nowrap text-Text-Primary cursor-default"
                    >
                      <div
                        className="mr-[5px] size-2.5 rounded-full"
                        style={{ backgroundColor: ellipseColor }}
                      ></div>
                      {client.status}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center w-full text-Text-Primary text-[10px] sm:text-xs capitalize cursor-default">
                    <div className="flex items-center gap-1 w-[85px] text-Text-Secondary text-[8px] sm:text-[10px] cursor-default">
                      <img src="/icons/client-card/Gender-man.svg" alt="" />
                      Gender
                    </div>
                    {client.sex}
                  </div>
                  <div className="flex w-full gap-2 text-Text-Primary text-[10px] sm:text-xs capitalize cursor-default">
                    <div className="flex items-center gap-1 w-[85px] text-Text-Secondary text-[8px] sm:text-[10px] cursor-default">
                      <img src="/icons/happyemoji.svg" alt="" />
                      Age
                    </div>
                    {client.age ? client.age + ' Years Old' : null}
                  </div>
                  <div className="flex w-full gap-2 text-Text-Primary text-[10px] sm:text-xs capitalize cursor-default">
                    <div className="flex items-center w-[85px] gap-1 text-nowrap text-Text-Secondary text-[8px] sm:text-[10px] cursor-default">
                      <img src="/icons/sms-edit-2.svg" alt="" />
                      Check-in
                    </div>
                    <div
                      className="text-nowrap max-w-[110px] truncate cursor-default"
                      data-tooltip-id={`${client.member_id}-${client['Check-in']}`}
                    >
                      {client['Check-in']}
                      {client['Check-in'].length > 15 && (
                        <Tooltip
                          place="top"
                          id={`${client.member_id}-${client['Check-in']}`}
                          className="!bg-white !w-fit !bg-opacity-100 !opacity-100 !text-wrap !text-[#888888] !text-[8px] !rounded-[6px] !border !border-Gray-50 !p-2"
                        >
                          {client['Check-in']}
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  <div className="flex w-full gap-2 text-Text-Primary text-[10px] sm:text-xs capitalize cursor-default">
                    <div className="flex items-center w-[85px] gap-1 text-Text-Secondary text-[8px] sm:text-[10px] cursor-default">
                      <img src="/icons/note-2.svg" alt="" />
                      Questionnaire
                    </div>
                    <div
                      className="text-nowrap max-w-[100px] truncate cursor-default"
                      data-tooltip-id={`${client.member_id}-questionary`}
                      data-tooltip-content={client.Questionary}
                    >
                      {client.Questionary}
                    </div>
                    {client.Questionary.length > 15 && (
                      <Tooltip
                        place="top"
                        id={`${client.member_id}-questionary`}
                        className="bg-white z-50 w-fit bg-opacity-100 opacity-100 text-wrap text-[#888888] text-[8px] rounded-[6px] border border-Gray-50 p-2 max-w-xs"
                        style={{
                          backgroundColor: 'white',
                          zIndex: 50,
                          opacity: 1,
                          wordWrap: 'break-word',
                          maxWidth: '300px',
                        }}
                        delayShow={300}
                        delayHide={100}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="w-full flex justify-between items-center py-1 mt-2">
                {/* <div
                  onClick={() =>
                    navigate(
                      `/drift-analysis?activeMemberId=${client.member_id}&showBack=true`,
                    )
                  }
                  className={` ${client.drift_analyzed ? 'visible' : 'invisible'} flex items-center cursor-default text-Primary-DeepTeal text-xs font-medium gap-1`}
                >
                  <SvgIcon
                    src="/icons/tick-square-blue.svg"
                    width="16px"
                    height="16px"
                    color="#005F73"
                  />
                  Drift Analyzed
                </div> */}
                <div
                  className="flex items-center justify-center gap-2 cursor-pointer"
                  onClick={handleRefreshData}
                >
                  <img
                    src="/icons/refresh-circle.svg"
                    alt=""
                    className={refresh ? 'animate-spin-slow' : ''}
                  />
                  {refresh ? (
                    <div className="text-Primary-DeepTeal text-xs font-medium">
                      Syncing...
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="text-Primary-DeepTeal font-medium text-xs">
                        Sync with Latest Data
                      </div>
                      <div className="text-Text-Quadruple text-[8px]">
                        Last sync:{' '}
                        {/* {lastRefreshTime
                          ? formatLastRefresh()
                          : client['Latest Sync']} */}
                          {formatLastRefresh(client['Latest Sync'])}
                      </div>
                    </div>
                  )}
                </div>
                <div className="hidden md:flex justify-end items-center">
                  <ButtonPrimary
                    onClick={() => {
                      navigate(`/report/${client.member_id}/${client.name}`);
                    }}
                    size="small"
                  >
                    <SvgIcon
                      color="#FFFFFF"
                      src="/icons/document-forward-blue.svg"
                      width="12px"
                      height="12px"
                    />
                    <div className="text-[10px] font-medium sm:text-xs ml-[0.5px]">
                      Health Plan
                    </div>
                  </ButtonPrimary>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ClientCard;

import { useNavigate } from 'react-router-dom';
// import { ButtonSecondary } from "../Button/ButtosSecondary";
import useModalAutoClose from '../../hooks/UseModalAutoClose';
import { useState, useRef, useEffect } from 'react';
import { ButtonPrimary } from '../Button/ButtonPrimary.tsx';
import Application from '../../api/app.ts';
import SvgIcon from '../../utils/svgIcon.tsx';
import { ArchiveModal } from './ArchiveModal.tsx';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteModal } from './deleteModal.tsx';
import MainModal from '../MainModal/index.tsx';
interface ClientCardProps {
  client: any;
  ondelete: (memberid: any) => void;
  onarchive: (memberid: any) => void;
  onToggleHighPriority: (memberid: any) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({
  client,
  ondelete,
  onarchive,
  onToggleHighPriority,
}) => {
  console.log(client);

  const navigate = useNavigate();
  const [showModal, setshowModal] = useState(false);
  const showModalRefrence = useRef(null);
  const showModalButtonRefrence = useRef(null);
  useModalAutoClose({
    refrence: showModalRefrence,
    buttonRefrence: showModalButtonRefrence,
    close: () => {
      setshowModal(false);
    },
  });
  const handleToggleFavoriteAndHighPriority = async () => {
    try {
      // Call API to toggle favorite status
      await Application.addFavorite({
        member_id: client.member_id,
        is_favorite: !client.favorite,
      });

      // Update the local state to reflect the change
      onToggleHighPriority(client.member_id);

      // Optionally close the modal if applicable
      setshowModal(false);
    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  };
  // const handleToggleFavorite = async () => {
  //   try {
  //     // Call API to toggle favorite status
  //     await Application.addFavorite({
  //       member_id: client.member_id,
  //       is_favorite: !client.favorite,
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
  const [showArchiveModal, setshowArchiveModal] = useState(false);
  const [showDeleteModal, setshowDeleteModal] = useState(false);
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal':
      case 'checked':
        return {
          backgroundColor: '#DEF7EC',
          ellipseColor: '#06C78D',
        };
      case 'needs checking':
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
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Optional: Add a success notification
      alert('Copied to clipboard!');
      // Or use a toast notification if you have a toast library
      // toast.success('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <>
      <MainModal
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
      >
        <>
          {isShared ? (
            <div className="bg-white w-[500px] h-[196px] rounded-2xl p-4 shadow-800 text-Text-Primary">
              <div className="flex flex-col gap-4 items-center w-full ">
                <img
                  className="w-[134px] h-[108px] -mt-3"
                  src="/icons/tick-circle-background-new.svg"
                  alt=""
                />
                <div className="text-xs font-medium -mt-6 mb-3">
                  The username and unique code have been successfully sent to{' '}
                  {client.name}.
                </div>
                <ButtonPrimary onClick={() => setShowAccessModal(false)}>
                  <div className="w-[150px]">Got it</div>
                </ButtonPrimary>
              </div>
            </div>
          ) : (
            <div className="bg-white w-[500px] h-[332px] rounded-2xl p-4 shadow-800 text-Text-Primary">
              <div className="border-b border-Gray-50 pb-2 text-sm font-medium">
                {' '}
                {client.name}`s Access
              </div>
              <div className="mt-6 text-xs font-medium">
                Share the username and unique code with your client to give them
                access.
              </div>
              <div className="text-xs text-Text-Secondary mt-3">
                Do not share this information with anyone else.
              </div>
              <div className="flex flex-col gap-2 mt-6">
                <div className="text-xs font-medium">Email Address</div>
                <div className="w-full flex justify-between rounded-2xl border border-Gray-50 px-3 py-1 bg-[#FDFDFD]">
                  <span className="text-xs select-none">{AccessUserName}</span>
                  <img
                    onClick={() => copyToClipboard(AccessUserName)}
                    className="cursor-pointer"
                    src="/icons/copy.svg"
                    alt=""
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-6">
                <div className="text-xs font-medium">Password</div>
                <div className="w-full flex justify-between rounded-2xl border border-Gray-50 px-3 py-1 bg-[#FDFDFD]">
                  <span className="text-xs select-none">{AccessPassword}</span>
                  <img
                    onClick={() => copyToClipboard(AccessPassword)}
                    className="cursor-pointer"
                    src="/icons/copy.svg"
                    alt=""
                  />
                </div>
              </div>
              <div className="flex w-full justify-end mt-6 gap-4 items-center">
                <div
                  onClick={() => setShowAccessModal(false)}
                  className="text-sm font-medium text-Text-Secondary cursor-pointer"
                >
                  Cancel
                </div>
                <div
                  onClick={() => {
                    Application.shareClientAccess({
                      member_id: client.member_id,
                      username: AccessUserName,
                      password: AccessPassword,
                    }).then((res) => {
                      console.log(res);
                      setIsShared(true);
                    });
                  }}
                  className="text-sm font-medium text-Primary-DeepTeal cursor-pointer"
                >
                  Share With Email
                </div>
              </div>
            </div>
          )}
        </>
      </MainModal>
      <ArchiveModal
        archived={client.archived}
        onConfirm={() => {
          Application.archivePatient({
            member_id: client.member_id,
          });
          onarchive(client.member_id);
        }}
        name={client.name}
        isOpen={showArchiveModal}
        onClose={() => setshowArchiveModal(false)}
      ></ArchiveModal>
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setshowDeleteModal(false)}
        name={client.name}
        onConfirm={() => {
          setshowModal(false);
          Application.deletePatient({
            member_id: client.member_id,
          });
          // onarchive(client.member_id)
          ondelete(client.member_id);
        }}
      ></DeleteModal>
      <div
        onClick={() => {
          // e.stopPropagation();
          // navigate(`/report/${client.member_id}/${client.name}`);
        }}
        className="sm:min-w-[315px] w-full xs:w-[344px] md:w-[333px] p-2 sm:p-4 bg-white shadow-200 xl:w-[24%] rounded-[16px] relative"
      >
        {showModal && (
          <div
            ref={showModalRefrence}
            className="absolute top-12 right-[10px] z-20 w-[220px] rounded-[16px] px-4 py-2 bg-white border border-Gray-50 shadow-200 flex flex-col gap-3"
          >
            {/* <div className="flex items-center gap-1 TextStyle-Body-2 text-Text-Primary pb-1 border-b border-Secondary-SelverGray  cursor-pointer">
              <img src="/icons/assign-green.svg" alt="" />
              Assign to ...
            </div> */}
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
                  className="flex items-center gap-1 TextStyle-Body-2 text-Text-Primary pb-1 border-b border-Secondary-SelverGray  cursor-pointer"
                >
                  <img src="/icons/directbox-send.svg" alt="" />
                  Unarchive
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
                  className="flex items-center gap-1 TextStyle-Body-2 text-Text-Primary pb-1   cursor-pointer"
                >
                  <img src="/icons/delete-green.svg" className="w-4" alt="" />
                  Delete
                </div>
              </>
            ) : (
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
                  className="flex items-center gap-1 TextStyle-Body-2 text-Text-Primary pb-1 border-b border-Secondary-SelverGray  cursor-pointer"
                >
                  <img src="/icons/directbox-send.svg" alt="" />
                  Send to Archieve
                </div>
                <div
                  onClick={handleToggleFavoriteAndHighPriority}
                  className="flex items-center border-b border-Secondary-SelverGray gap-1 TextStyle-Body-2 text-Text-Primary pb-1  cursor-pointer"
                >
                  <img src="/icons/star.svg" alt="" />
                  {client.favorite
                    ? 'Remove from High-Priorities'
                    : 'Add to High-Priorities'}{' '}
                </div>
                <div
                  onClick={() => {
                    Application.giveClientAccess({
                      member_id: client.member_id,
                    }).then((res) => {
                      console.log(res);

                      setAccessUserName(res.data.username);
                      setAccessPassword(res.data.password);
                      setShowAccessModal(true);
                    });
                  }}
                  className="flex items-center border-b border-Secondary-SelverGray gap-1 TextStyle-Body-2 text-Text-Primary pb-1  cursor-pointer"
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
                  className="flex items-center gap-1 TextStyle-Body-2 text-Text-Primary pb-1   cursor-pointer"
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
          <div className="size-[48px] xs:size-[64px] md:size-[72px] border border-Primary-DeepTeal rounded-full relative">
            <img
              className="w-full h-full rounded-full object-cover"
              onError={(e: any) => {
                e.target.src = `https://ui-avatars.com/api/?name=${client.name}`; // Set fallback image
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
                className="absolute bottom-0 right-0"
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
            className="pl-2 flex flex-col mt-4"
          >
            <div
              title={client.name}
              className="text-Text-Primary truncate max-w-[160px] text-xs sm:text-[14px] font-medium text-nowrap mb-2"
            >
              {client.name}
            </div>
            {/* <div className="text-Text-Secondary text-[10px] sm:text-[12px]">
              {client.age} years{' '}
            </div> */}
            <div className="text-Text-Secondary text-[10px] sm:text-[12px] text-nowrap">
              ID: {client.member_id}
            </div>
          </div>
          <div className="flex md:hidden flex-col justify-end ml-4">
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
                  src="/icons/arrow-circle-down.svg"
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
          className="absolute top-7 right-2 cursor-pointer"
        >
          <img src="/icons/client-card/more.svg" alt="" />
        </div>
        <div>
          {isExpanded && (
            <div className="flex flex-col">
              <div className="w-full mt-2 flex justify-between">
                <div className="flex flex-col justify-between border-r border-Gray-50 pr-3 pl-2 py-1">
                  <div className="flex flex-col gap-1">
                    {' '}
                    <div className=" text-[8px] sm:text-[10px] text-Text-Secondary">
                      Enroll Date
                    </div>
                    <div className="text-Text-Primary text-[10px] sm:text-xs mb-6">
                      {client.enroll_date}
                    </div>
                    <div className=" text-[8px] sm:text-[10px] text-Text-Secondary text-nowrap">
                      Last Check-In
                    </div>
                    <div className="text-Text-Primary text-[10px] sm:text-xs">
                      {client.enroll_date}
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-col justify-between pl-3 py-1">
                  <div className="flex w-full text-Text-Primary text-[10px] sm:text-xs capitalize">
                    <div className="flex items-center gap-1 text-Text-Secondary text-[8px] sm:text-[10px] mr-3">
                      <img src="/icons/user-tick.svg" alt="" />
                      Assigned to
                    </div>
                    <div className="size-[24px] hidden xs:size-[24px] md:size-[24px] border border-Primary-DeepTeal rounded-full relative">
                      <img
                        className="w-full h-full rounded-full object-cover"
                        onError={(e: any) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${client.name}`; // Set fallback image
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
                          className="absolute bottom-0 right-0"
                          src="/icons/Icon_star.svg"
                          alt=""
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex w-full text-Text-Primary text-[10px] sm:text-xs capitalize">
                    <div className="flex items-center gap-1 text-Text-Secondary text-[8px] sm:text-[10px] mr-[38px]">
                      <img src="/icons/status.svg" alt="" />
                      Status
                    </div>

                    <div
                      style={{ backgroundColor }}
                      className="flex items-center px-2.5 h-[20px] rounded-[10px]  justify-center text-[10px] text-nowrap text-Text-Primary"
                    >
                      <div
                        className="mr-[5px] size-3 rounded-full"
                        style={{ backgroundColor: ellipseColor }}
                      ></div>
                      {client.status}
                    </div>
                  </div>
                  <div className="flex items-center w-full text-Text-Primary text-[10px] sm:text-xs capitalize">
                    <div className="flex items-center gap-1 text-Text-Secondary text-[8px] sm:text-[10px] mr-9">
                      <img src="/icons/client-card/Gender-man.svg" alt="" />
                      Gender
                    </div>
                    {client.sex}
                  </div>
                  <div className="flex w-full text-Text-Primary text-[10px] sm:text-xs capitalize">
                    <div className="flex items-center gap-1 text-Text-Secondary text-[8px] sm:text-[10px] mr-[51px]">
                      <img src="/icons/happyemoji.svg" alt="" />
                      Age
                    </div>
                    {client.age ? client.age + ' Years Old' : null}
                    {/* {client.age}  */}
                  </div>
                  <div className="flex w-full text-Text-Primary   text-[10px] sm:text-xs capitalize">
                    <div className="flex items-center gap-1 text-nowrap text-Text-Secondary text-[8px] sm:text-[10px]">
                      <img src="/icons/sms-edit-2.svg" alt="" />
                      Check-in
                    </div>
                    <div
                      className="text-nowrap max-w-[110px] ml-[28px]    truncate"
                      title={client['Check-in']}
                    >
                      {client['Check-in']}
                    </div>
                  </div>
                  <div className="flex w-full  text-Text-Primary   text-[10px] sm:text-xs capitalize">
                    <div className="flex items-center gap-1 text-Text-Secondary text-[8px] sm:text-[10px] ">
                      <img src="/icons/note-2.svg" alt="" />
                      Questionary
                    </div>
                    <div
                      className="text-nowrap max-w-[100px] ml-[13px] truncate"
                      title={client.Questionary}
                    >
                      {client.Questionary}
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full flex justify-between items-center py-1 mt-2">
                <div
                  onClick={() =>
                    navigate(
                      `/drift-analysis?activeMemberId=${client.member_id}`,
                    )
                  }
                  className={` ${client.drift_analyzed ? 'visible' : 'invisible'} flex items-center cursor-pointer text-Primary-DeepTeal text-sm gap-1`}
                >
                  <SvgIcon
                    src="/icons/tick-square-blue.svg"
                    width="16px"
                    height="16px"
                    color="#005F73"
                  />
                  Drift Analyzed
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
                    <div className="text-[10px] sm:text-xs ml-[0.5px]">
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

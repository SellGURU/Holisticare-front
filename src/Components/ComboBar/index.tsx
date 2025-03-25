/* eslint-disable @typescript-eslint/no-explicit-any */
import { PopUpChat } from '../popupChat';
import { useEffect, useRef, useState } from 'react';
import useModalAutoClose from '../../hooks/UseModalAutoClose.ts';
import { useParams } from 'react-router-dom';
import { SlideOutPanel } from '../SlideOutPanel';
import { subscribe } from '../../utils/event.ts';
import Application from '../../api/app.ts';

import TimeLine from './components/timeLine.tsx';
import { ChatModal } from './components/chatModal.tsx';
import { ClientInfo } from './components/clientInfo.tsx';
import { DataSyncing } from './components/dataSyncing.tsx';
import { Questionary } from './components/Questionary.tsx';
import { Notes } from './components/notes.tsx';
import { FilleHistory } from './components/filleHistory.tsx';
import { SwitchClient } from './components/switchClient.tsx';
import SvgIcon from '../../utils/svgIcon.tsx';
// import { Tooltip } from 'react-tooltip';

export const ComboBar = () => {
  const { id } = useParams<{ id: string }>();
  const itemList = [
    { name: 'Client Info', url: '/images/sidbar-menu/info-circle.svg' },
    { name: 'Data Syncing', url: '/icons/sidbar-menu/cloud-change.svg' },
    { name: 'File History', url: '/icons/sidbar-menu/directbox-notif.svg' },
    {
      name: 'Questionary Tracking',
      url: '/icons/sidbar-menu/task-square.svg',
    },
    { name: 'Timeline', url: '/icons/sidbar-menu/timeline.svg' },
    { name: 'Expert’s Note', url: '/icons/sidbar-menu/note-2.svg' },
    { name: 'Client’s Chat History', url: '/icons/sidbar-menu/messages.svg' },
    { name: 'Select Client', url: '/icons/sidbar-menu/repeat.svg' },
  ];
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    email: '',
    picture: '',
  });

  useEffect(() => {
    Application.getPatientsInfo({
      member_id: id,
    }).then((res) => {
      setPatientInfo(res.data);
    });
  }, [id]);
  // useConstructor(() => {
  //   // setIsLoading(true);
  //   Application.getSummary(id as string).then((res) => {
  //     console.log(res);
  //     if (res.data != "Internal Server Error") {
  //       // setData(res.data);
  //       formik.setFieldValue("firstName", res.data.personal_info["first_name"]);
  //       formik.setFieldValue("lastName", res.data.personal_info["last_name"]);
  //       // setImage(res.data.personal_info.picture);
  //       formik.setFieldValue(
  //         "workOuts",
  //         res.data.personal_info["total workouts"] != "No Data"
  //           ? res.data.personal_info["total workouts"]
  //           : ""
  //       );
  //       formik.setFieldValue(
  //         "Activity",
  //         res.data.personal_info["total Cardio Activities"] != "No Data"
  //           ? res.data.personal_info["total Cardio Activities"]
  //           : ""
  //       );
  //       formik.setFieldValue(
  //         "expert",
  //         res.data.personal_info.expert ? res.data.personal_info.expert : ""
  //       );
  //       formik.setFieldValue(
  //         "location",
  //         res.data.personal_info.Location ? res.data.personal_info.Location : ""
  //       );
  //     }
  //     //   setIsLoading(false);
  //   });
  // });

  // const formik = useFormik({
  //   initialValues: {
  //     firstName: "",
  //     lastName: "",
  //     workOuts: "",
  //     Activity: "",
  //     expert: "",
  //     location: "",
  //   },
  //   onSubmit: () => {},
  // });
  const [toogleOpenChat, setToogleOpenChat] = useState<boolean>(false);

  // Refs for modal and button to close it when clicking outside
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Handle modal close
  const closeModal = () => {
    setToogleOpenChat(false);
  };

  // Using the custom hook to automatically close the modal when clicking outside
  useModalAutoClose({
    refrence: modalRef,
    buttonRefrence: buttonRef,
    close: closeModal,
  });
  const [isSlideOutPanel, setIsSlideOutPanel] = useState<boolean>(false);
  const [updated, setUpdated] = useState(false);
  subscribe('QuestionaryTrackingCall', () => {
    // setUpdated(true);
    handleItemClick('Questionary Tracking');
  });
  const handleItemClick = (name: string) => {
    setActiveItem(name);
    setIsSlideOutPanel(true);
  };
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const renderModalContent = () => {
    switch (activeItem) {
      case 'Client Info':
        return <ClientInfo></ClientInfo>;
      case 'Data Syncing':
        return <DataSyncing></DataSyncing>;
      case 'File History':
        return <FilleHistory></FilleHistory>;
      case 'Questionary Tracking':
        return <Questionary></Questionary>;
      case 'Expert’s Note':
        return <Notes></Notes>;
      // Add more cases as needed
      case 'Timeline':
        return <TimeLine />;
      case 'Client’s Chat History':
        return <ChatModal memberId={id} info={patientInfo}></ChatModal>;
      case 'Select Client':
        return <SwitchClient></SwitchClient>;
      default:
        return <div>No Content</div>;
    }
  };
  console.log(isSlideOutPanel);
  return (
    <>
      <SlideOutPanel
        isOpen={isSlideOutPanel}
        isCombo={true}
        onClose={() => setIsSlideOutPanel(false)}
        headline={activeItem || ''}
      >
        {renderModalContent()}
      </SlideOutPanel>
      <div
        className={
          'w-[55px] flex justify-center items-center relative bg-white h-fit md:h-[500px] border-Boarder border rounded-xl p-5 '
        }
      >
        <div
          className={
            'absolute hidden md:block top-0 left-0 bg-Primary-DeepTeal h-[49px] rounded-xl w-full z-10'
          }
        ></div>
        <ul className={'flex items-center flex-col z-10 gap-3'}>
          <li
            key={'1'}
            className={
              'hidden md:flex items-center justify-center border-2 rounded-full  w-10 h-10 '
            }
          >
            <img
              src={
                patientInfo.picture != ''
                  ? patientInfo.picture
                  : `https://ui-avatars.com/api/?name=${patientInfo.name}`
              }
              onError={(e: any) => {
                e.target.src = `https://ui-avatars.com/api/?name=${patientInfo.name}`; // Set fallback image
              }}
              className={
                ' hidden md:block border-whiteavatar w-full h-full rounded-full'
              }
            />
          </li>
          <li
            key={'2'}
            className={
              'text-Text-Primary TextStyle-Headline-6 w-10 text-center hidden md:block'
            }
            style={{
              whiteSpace: '',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            {patientInfo.name.substring(0, 20)}
          </li>
          <li
            key={'line'}
            className={'h-[2px] w-full px-[1px] bg-green-400 hidden md:block'}
          ></li>
          {itemList.map((el, index) => (
            <>
              <li
                title={el.name}
                // data-tooltip-id="tooltip"
                // data-tooltip-content={el.name}
                key={index}
                onClick={() => {
                  if (el.name == 'Questionary Tracking') {
                    setIsSlideOutPanel(true);
                    setUpdated(false);
                  }
                  handleItemClick(el.name);
                }}
                className={`cursor-pointer rounded-full relative border w-8 h-8 flex items-center justify-center ${
                  updated &&
                  el.name == 'Questionary Tracking' &&
                  'border-2 border-Orange'
                }
                 
                `}
              >
                <SvgIcon src={el.url} width="16" height="16" color="#005F73" />
                {/* <img src={el.url} className={'w-5 h-5 object-cover'} /> */}
                {
                  updated && el.name == 'Questionary Tracking' && (
                    <img
                      className="absolute top-[-4px]  right-[-3px]"
                      src="/icons/warning.svg"
                      alt=""
                    />
                  )
                  // <div className="w-[12px] h-[12px] bg-[#FFBD59] rounded-full absolute top-[-4px]  right-[-3px]">
                  // </div>
                }
              </li>
            </>
          ))}
        </ul>
        {/* <Tooltip id="tooltip" place="left" /> */}
      </div>

      <div className={' hidden md:block space-y-1'}>
        <div
          className={
            'w-8 h-8 rounded-md flex bg-Primary-EmeraldGreen items-center justify-center'
          }
        >
          <img src={'/icons/add.svg'} />
        </div>
        <div
          ref={buttonRef}
          onClick={() => setToogleOpenChat(!toogleOpenChat)}
          className={
            'w-8 shadow-200 cursor-pointer h-8 rounded-md bg-white flex items-center justify-center'
          }
        >
          {toogleOpenChat ? (
            <img src={'/icons/close.svg'} />
          ) : (
            <img src={'/icons/sidbar-menu/message-question.svg'} />
          )}
        </div>
        <div ref={modalRef} className="w-full shadow-200">
          <PopUpChat
            isOpen={toogleOpenChat}
            info={patientInfo}
            memberId={id as string}
          />
        </div>
      </div>
    </>
  );
};

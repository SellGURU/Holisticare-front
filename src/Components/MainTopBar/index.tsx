// import { useNavigate } from "react-router-dom";

import { useRef, useState, useEffect } from 'react';
import LogOutModal from '../LogOutModal';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
// import Auth from '../../api/auth';
import { publish, subscribe } from '../../utils/event';
import Application from '../../api/app';
import { BeatLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../Notification';
import NotificationApi from '../../api/Notification';
const MainTopBar = () => {
  const navigate = useNavigate();
  // const navigate = useNavigate();
  const [visibleClinic, setVisibleClinic] = useState(false);
  const [isUnReadNotif, setisUnReadNotif] = useState(false);
  const [showNotification, setshowNotification] = useState(false);
  const refrence = useRef(null);
  const buttentRef = useRef(null);
  const notifRefrence = useRef(null);
  const notifButtentRef = useRef(null);
  useModalAutoClose({
    refrence: refrence,
    buttonRefrence: buttentRef,
    close: () => {
      setVisibleClinic(false);
    },
  });
  useModalAutoClose({
    refrence: notifRefrence,
    buttonRefrence: notifButtentRef,
    close: () => {
      setshowNotification(false);
    },
  });
  const [customTheme, setCustomTheme] = useState(
    localStorage.getItem('brandInfoData')
      ? JSON.parse(localStorage.getItem('brandInfoData') || '{}')
      : {
          selectedImage: null as string | null,
          name: '',
          headLine: '',
        },
  );

  const getShowBrandInfo = () => {
    Application.getShowBrandInfo().then((res) => {
      if (
        res.data.brand_elements.name === null ||
        res.data.brand_elements.name === '' ||
        res.data.brand_elements.logo === null
      ) {
        navigate('/register-profile');
        return;
      }
      setCustomTheme({
        headLine: res.data.brand_elements.headline,
        name: res.data.brand_elements.name,
        selectedImage: res.data.brand_elements.logo,
      });
      localStorage.setItem(
        'brandInfoData',
        JSON.stringify({
          headLine: res.data.brand_elements.headline,
          name: res.data.brand_elements.name,
          selectedImage: res.data.brand_elements.logo,
        }),
      );
    });
  };

  useEffect(() => {
    getShowBrandInfo();

    // Subscribe to refresh event
    subscribe('refreshBrandInfo', () => {
      getShowBrandInfo();
    });
  }, []);

  console.log(showNotification);
  const [notificationRefetchTrigger, setNotificationRefetchTrigger] =
    useState(false);

  useEffect(() => {
    const checkNewNotifications = async () => {
      try {
        const response = await NotificationApi.checkNotification();
        if (response && response.data && response.data.new_notifications) {
          setNotificationRefetchTrigger((prev) => !prev);
          setisUnReadNotif(true);
        }
      } catch (error) {
        console.error('Error checking for new notifications:', error);
      }
    };

    checkNewNotifications();

    const intervalId = setInterval(checkNewNotifications, 15000);

    return () => clearInterval(intervalId);
  }, []);
  return (
    <>
      <div className="w-full  flex md:hidden justify-between items-center border-b border-white  py-2">
        <button
          onClick={() => {
            publish('mobileMenuOpen', {});
          }}
          className="p-2"
        >
          <img src="/icons/humber-menu.svg" alt="Menu" />
        </button>
        <div
          onClick={() => setVisibleClinic(!visibleClinic)}
          ref={buttentRef}
          // onClick={() => {
          //   setVisibleClinic(!visibleClinic);
          // }}
          className=" relative flex select-none items-center gap-1 TextStyle-Body-2 cursor-pointer text-[#383838]"
        >
          {customTheme.selectedImage ? (
            <img
              className="size-6 rounded-full "
              src={customTheme.selectedImage}
              alt=""
            />
          ) : (
            <img src="/icons/topbar-logo2.svg" alt="" />
          )}
          {customTheme.name ? customTheme.name : 'Clinic Longevity 1'}{' '}
        </div>
        {visibleClinic && (
          <>
            <LogOutModal
              customTheme={customTheme}
              refrence={refrence}
            ></LogOutModal>
          </>
        )}
      </div>
      <div className="hidden md:block w-full sticky z-50 top-0 ">
        <div className="w-full flex items-center justify-end bg-white border-b  border-gray-50 pl-4 pr-6 py-2 shadow-100">
          <div className="relative">
            <div className="flex gap-10 ">
              <div className="relative">
                <div
                  ref={notifButtentRef}
                  onClick={() => setshowNotification(!showNotification)}
                  className="size-6 relative rounded-[31px] bg-white border border-Gray-50 shadow-drop flex items-center justify-center cursor-pointer -mr-4 "
                >
                  <img src="/icons/notification-2.svg" alt="" />
                  {isUnReadNotif && (
                    <div className="bg-[#F4A261] size-[3.33px] rounded-full absolute top-[6px] right-[6px]"></div>
                  )}
                </div>
              </div>

              <div
                ref={buttentRef}
                onClick={() => {
                  setVisibleClinic(!visibleClinic);
                }}
                className="flex select-none items-center gap-1 TextStyle-Body-2 cursor-pointer text-[#383838]"
              >
                {customTheme.selectedImage ? (
                  <img
                    className="size-6 rounded-full "
                    src={customTheme.selectedImage}
                    alt=""
                  />
                ) : (
                  <div className="w-full h-5 flex justify-center items-center">
                    <BeatLoader size={6}></BeatLoader>
                  </div>
                )}
                {customTheme.name ? customTheme.name : ''}{' '}
              </div>
            </div>
            {visibleClinic && (
              <LogOutModal
                customTheme={customTheme}
                refrence={refrence}
              ></LogOutModal>
            )}
            {showNotification && (
              <Notification
                refetchTrigger={notificationRefetchTrigger}
                refrence={notifRefrence}
                setisUnReadNotif={(value) => {
                  setisUnReadNotif(value);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MainTopBar;

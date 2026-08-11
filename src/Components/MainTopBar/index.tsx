// import { useNavigate } from "react-router-dom";

import { useRef, useState, useEffect, useCallback } from 'react';
import LogOutModal from '../LogOutModal';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
// import Auth from '../../api/auth';
import { publish, subscribe } from '../../utils/event';
import { BeatLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../Notification';
import NotificationApi from '../../api/Notification';
import { useApp } from '../../hooks';
import { useVisibilityAwarePoll } from '../../hooks/useVisibilityAwarePoll';
import { fetchBrandInfo } from '../../utils/brandInfoCache';
const MainTopBar = () => {
  const navigate = useNavigate();
  const { accountRole, setAccountRole } = useApp();
  // const navigate = useNavigate();
  const [visibleClinic, setVisibleClinic] = useState(false);
  const [isUnReadNotif, setisUnReadNotif] = useState(false);
  const [showNotification, setshowNotification] = useState(false);
  const [unreadNotificationIds, setUnreadNotificationIds] = useState<string[]>(
    [],
  );

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

      // Mark all unread notifications as read when the modal closes (Boss's requirement)
      if (unreadNotificationIds.length > 0) {
        console.log(
          `Marking ${unreadNotificationIds.length} notifications as read on modal close.`,
        );
        unreadNotificationIds.forEach((id) => {
          NotificationApi.readNotification(id); // Send API call for each
        });
        setisUnReadNotif(false); // Immediately hide the dot in MainTopBar
        setUnreadNotificationIds([]); // Clear the list
      }

      // Update lastUsed timestamp after processing all unreads
      // This is crucial: the user has acknowledged everything up to this moment.
      NotificationApi.lastUsed = new Date();
      localStorage.setItem('lastNotif', JSON.stringify(new Date().getTime()));
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

  const getShowBrandInfo = useCallback(() => {
    fetchBrandInfo()
      .then((res) => {
        const responseAccountRole =
          (res.brand_elements.account_role as string) || accountRole;
        if (responseAccountRole) {
          setAccountRole(responseAccountRole);
        }
        if (
          responseAccountRole.toLowerCase() !== 'staff' &&
          (res.brand_elements.name === null ||
            res.brand_elements.name === '' ||
            res.brand_elements.logo === null)
        ) {
          navigate('/register-profile');
          return;
        }
        setCustomTheme({
          headLine: res.brand_elements.headline as string,
          name: res.brand_elements.name as string,
          selectedImage: res.brand_elements.logo as string | null,
        });
        localStorage.setItem(
          'brandInfoData',
          JSON.stringify({
            headLine: res.brand_elements.headline,
            name: res.brand_elements.name,
            selectedImage: res.brand_elements.logo,
          }),
        );
        if (res.brand_elements.knowledge_playground == true) {
          publish(
            'knowledge_playground-Show',
            res.brand_elements.knowledge_playground,
          );
        }
        if (res.brand_elements.permission) {
          publish('permissions-show', res.brand_elements.permission);
        }
      })
      .catch(() => {});
  }, [accountRole, navigate, setAccountRole]);

  useEffect(() => {
    getShowBrandInfo();

    // Subscribe to refresh event
    subscribe('refreshBrandInfo', () => {
      getShowBrandInfo();
    });
  }, [getShowBrandInfo]);

  console.log(showNotification);

  const checkNewNotifications = useCallback(async () => {
    try {
      const response = await NotificationApi.checkNotification();
      if (response && response.data && response.data.new_notifications) {
        setisUnReadNotif(true);
      }
    } catch (error) {
      console.error('Error checking for new notifications:', error);
    }
  }, []);

  useVisibilityAwarePoll(checkNewNotifications, 120000);
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
                onUnreadNotificationsChange={setUnreadNotificationIds}
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

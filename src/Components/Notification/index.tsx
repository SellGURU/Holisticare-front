/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import Toggle from '../Toggle';
import TooltipTextAuto from '../TooltipText/TooltipTextAuto';
// import Application from '../../api/app';
interface NotificationProps {
  setisUnReadNotif: (value: boolean) => void;
  refrence: any;
}
interface NotificationItem {
  id: string;
  picture: string; // URL to the image
  name: string;
  time: string; // e.g., "7 Hours ago", "Yesterday 2:05 AM", "Apr 30, 2025 4:27 PM"
  unread: boolean;
  action?: string;

  notifType: 'General Notifications' | 'My Notifications';
}
export const Notification: React.FC<NotificationProps> = ({
  refrence,
  setisUnReadNotif,
}) => {
  console.log(setisUnReadNotif);
  const [activeMenu, setactiveMenu] = useState('General Notifications');
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      picture: 'https://placehold.co/40x40/f0f0f0/333333?text=DL',
      name: 'Devon Lane',
      time: '7 Hours ago',
      unread: true,
      action: 'aaaaaaaaa',
      notifType: 'General Notifications',
    },
    {
      id: '2',
      picture: 'https://placehold.co/40x40/f0f0f0/333333?text=DL',
      name: 'Devon Lane',
      time: 'Yesterday 2:05 AM',
      unread: false,
      notifType: 'General Notifications',
    },
    {
      id: '3',
      picture: 'https://placehold.co/40x40/f0f0f0/333333?text=DL',
      name: "Devon Lane's Test Results",
      time: '10 Hours ago',
      unread: true,
      action: 'vbvbbvb',
      notifType: 'My Notifications', // Example of a 'My Notifications' type
    },
    {
      id: '4',
      picture: 'https://placehold.co/40x40/f0f0f0/333333?text=DL',
      name: "Devon Lane's Plan",
      time: 'Yesterday 2:05 AM',
      unread: false,
      notifType: 'General Notifications',
    },
    {
      id: '5',
      picture: 'https://placehold.co/40x40/f0f0f0/333333?text=DL',
      name: 'Devon Lane',
      time: 'Yesterday 2:05 AM',
      unread: false,
      notifType: 'My Notifications',
    },
    {
      id: '6',
      picture: 'https://placehold.co/40x40/f0f0f0/333333?text=DL',
      name: 'Devon Lane',
      time: 'Apr 30, 2025 4:27 PM',
      unread: false,
      notifType: 'General Notifications',
    },
    {
      id: '7',
      picture: 'https://placehold.co/40x40/f0f0f0/333333?text=DL',
      name: 'Devon Lane',
      time: 'Apr 30, 2025 4:27 PM',
      unread: false,
      notifType: 'My Notifications',
    },
    // Add more mock data as needed
  ]);

  // Filter notifications based on activeMenu
  const filteredNotifications = notifications.filter(
    (notif) => notif.notifType === activeMenu,
  );
  // useEffect(() => {
  //   Application.getNotifications().then((res) => {
  //     console.log(res)
  //   })
  // })
  // Update unread status count whenever notifications change or filter changes
  // useEffect(() => {
  //   const unreadCount = notifications.filter(
  //     (notif) => notif.unread && notif.notifType === activeMenu,
  //   ).length;
  //   setisUnReadNotif(unreadCount > 0);
  // }, [notifications, activeMenu, setisUnReadNotif]);

  return (
    <div
      ref={refrence}
      className="absolute right-[80px] z-50 w-[400px] h-fit max-h-[613px]  border top-14 md:top-10 border-gray-50   bg-white rounded-[16px] p-4 flex flex-col gap-4 shadow-800 text-Text-Primary"
    >
      <div className="text-sm font-medium">Notification</div>
      <div className="w-full  justify-center">
        <Toggle
          isNotif
          active={activeMenu}
          setActive={setactiveMenu}
          value={['General Notifications', 'My Notifications']}
        />
      </div>
      <div className="flex-1 overflow-y-auto max-h-[500px] pr-1">
        {' '}
        {filteredNotifications.length > 0 &&
          filteredNotifications.map((notif) => (
            <div
              onClick={() => {
                setNotifications((prev) =>
                  prev.map((item) =>
                    item.id === notif.id ? { ...item, unread: false } : item,
                  ),
                );
              }}
              key={notif.id}
              className="flex w-full justify-between bg-[#FCFCFC] py-2 px-3 items-center gap-3 cursor-pointer  border border-Gray-25   rounded-2xl  mt-[6px]"
            >
              <div className="flex items-center gap-2">
                <div className="relative flex-shrink-0">
                  <img
                    src={notif.picture}
                    alt={notif.name}
                    className="size-8 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/40x40/cccccc/333333?text=${notif.name.charAt(0).toUpperCase()}`;
                    }}
                  />
                </div>
                <div className="flex-grow flex flex-col">
                  <div className="text-[10px] font-medium ">
                    <TooltipTextAuto maxWidth="228px">
                      {notif.name}
                    </TooltipTextAuto>
                    <div className="text-[10px] text-[#888888]">
                      {notif.time}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                {notif.unread && (
                  <span className="  h-2 w-2 rounded-full  bg-gradient-to-r from-[#005F73] to-[#6CC24A] "></span>
                )}
                {notif.action && (
                  <button className="flex gap-1 items-center text-Primary-DeepTeal text-xs font-medium self-start">
                    Procced
                    <img src="/icons/arrow-right-small 2.svg" alt="" />
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

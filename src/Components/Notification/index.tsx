/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useContext } from 'react';
import Toggle from '../Toggle';
import TooltipTextAuto from '../TooltipText/TooltipTextAuto';
import NotificationApi from '../../api/Notification';
import { AppContext } from '../../store/app';
import Circleloader from '../CircleLoader';
interface NotificationProps {
  setisUnReadNotif: (value: boolean) => void;
  refrence: any;
  refetchTrigger: boolean;
}

interface NotificationItem {
  notification_id: string;
  title: string;
  type: 'General' | 'Coach'; 
  content: string;
  read_status: boolean;
  created_at: string;
  read_at: null | string;
  member_id: number; 
}

export const Notification: React.FC<NotificationProps> = ({
  refrence,
  refetchTrigger,
  setisUnReadNotif,
}) => {
  const [activeMenu, setactiveMenu] = useState<string>('General Notifications');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to format the time string
  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffHours < 24) {
      return `${diffHours} Hours ago`;
    } else if (diffHours < 48 && now.getDate() - date.getDate() === 1) {
      // Check if it's truly yesterday and not just 24-48 hours ago within the same day
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const fetchNotifications = useCallback(() => {
    setLoading(true);
    NotificationApi.getAll((data: any) => {
      const allNotifications: NotificationItem[] = [];

      // Process "general" notifications
      if (data.general) {
        data.general.forEach((notif: NotificationItem) => {
          allNotifications.push({
            ...notif,
            type: 'General', // Ensure type consistency
          });
        });
      }

      // Process "coach" notifications
      if (data.coach) {
        data.coach.forEach((notif: NotificationItem) => {
          allNotifications.push({
            ...notif,
            type: 'Coach', // Ensure type consistency
          });
        });
      }
      const initialUnreadCount = allNotifications.filter((notif) => !notif.read_status).length;
      setisUnReadNotif(initialUnreadCount > 0);
      setNotifications(allNotifications);
      setLoading(false);
    });
  }, [setisUnReadNotif]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, refetchTrigger]);

  // Update unread status count whenever notifications change or filter changes
  useEffect(() => {
    const unreadCount = notifications.filter(
      (notif) =>
        !notif.read_status &&
        (activeMenu === 'General Notifications'
          ? notif.type === 'General'
          : notif.type === 'Coach'),
    ).length;
    setisUnReadNotif(unreadCount > 0);
  }, [notifications, activeMenu, setisUnReadNotif]);

  const handleNotificationClick = (clickedNotifId: string) => {
    // Mark notification as read in the UI
    setNotifications((prev) =>
      prev.map((item) =>
        item.notification_id === clickedNotifId
          ? { ...item, read_status: true, read_at: new Date().toISOString() }
          : item,
      ),
    );
    // Call the API to mark as read
    NotificationApi.readNotification(clickedNotifId);
  };

  const filteredNotifications = notifications.filter(
    (notif) =>
      (activeMenu === 'General Notifications' && notif.type === 'General') ||
      (activeMenu === 'My Notifications' && notif.type === 'Coach'),
  );
  const { patientsList } = useContext(AppContext);



  const getPatientPicture = (memberId: number | undefined): string => { 

    const patient = patientsList.find(p => p.member_id === memberId);
    return patient?.profile_picture || `https://ui-avatars.com/api/?name=${patient.name}`;
  };
console.log(patientsList);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, refetchTrigger]);
  return (
    <div
      ref={refrence}
      className="absolute right-[80px] z-50 w-[400px] h-fit max-h-[613px] border top-14 md:top-10 border-gray-50 bg-white rounded-[16px] p-4 flex flex-col gap-4 shadow-800 text-Text-Primary"
    >
      <div className="text-sm font-medium">Notification</div>
      <div className="w-full justify-center">
        <Toggle
          isNotif
          active={activeMenu}
          setActive={setactiveMenu}
          value={['General Notifications', 'My Notifications']}
        />
      </div>
      <div className="flex-1 overflow-y-auto max-h-[500px] pr-1">
        {loading ? (
          <div className="w-full flex flex-col gap-3  justify-center items-center h-full">
          <Circleloader></Circleloader>
        </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              onClick={() =>{ 
                if(!notif.read_status){
                  handleNotificationClick(notif.notification_id)}}
                }
              
              key={notif.notification_id}
              className="flex w-full justify-between bg-[#FCFCFC] py-2 px-3 items-center gap-3 cursor-pointer border border-Gray-25 rounded-2xl mt-[6px]"
            >
              <div className="flex items-center gap-2">
                <div className="relative flex-shrink-0">
                 
                  <img src={getPatientPicture(notif.member_id)} className="size-8 rounded-full object-cover flex items-center justify-center bg-gray-200 text-gray-700 text-xs font-semibold"/>
                  
                </div>
                <div className="flex-grow flex flex-col">
                  <div className="text-[10px] font-medium ">
                    <TooltipTextAuto maxWidth="228px">
                      {notif.content || notif.title}
                    </TooltipTextAuto>
                    <div className="text-[10px] text-[#888888]">
                      {notif.created_at ? formatTime(notif.created_at) : ''}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                {!notif.read_status && ( // Check read_status directly
                  <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#005F73] to-[#6CC24A]"></span>
                )}
                {/* Removed 'action' as it's not in the provided API response, add back if needed */}
                {/* {notif.action && (
                  <button className="flex gap-1 items-center text-Primary-DeepTeal text-xs font-medium self-start">
                    Proceed
                    <img src="/icons/arrow-right-small 2.svg" alt="" />
                  </button>
                )} */}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">
            No notifications in this category.
          </div>
        )}
      </div>
    </div>
  );
};

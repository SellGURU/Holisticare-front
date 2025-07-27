/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useContext } from 'react';
import Toggle from '../Toggle';
import TooltipTextAuto from '../TooltipText/TooltipTextAuto';
import NotificationApi from '../../api/Notification';
import { AppContext } from '../../store/app';
import Circleloader from '../CircleLoader';
import { useNavigate } from 'react-router-dom';
interface NotificationProps {
  setisUnReadNotif: (value: boolean) => void;
  refrence: any;
  onUnreadNotificationsChange?: (unreadIds: string[]) => void;
}

interface ProceedType {
  type: 'read_only' | 'redirect';
  destination?: string; // Only present if type is 'redirect'
}

interface NotificationItem {
  notification_id: string;
  title: string;
  type: 'General' | 'Coach';
  content: string;
  read_status: boolean;
  created_at: number;
  read_at: null | number;
  member_id?: number; // Made optional as not all notifications may have it
  proceed_type?: ProceedType; // Add the new field, it's optional in case not all notifications have it
}

export const Notification: React.FC<NotificationProps> = ({
  refrence,
  setisUnReadNotif,
  onUnreadNotificationsChange,
}) => {
  const [activeMenu, setactiveMenu] = useState<string>('General Notifications');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to format the time string
  const formatTime = (timestamp: number): string => {
    const notificationDate = new Date(timestamp); // Create Date object directly from timestamp
    const now = new Date(); // Current date/time in user's local timezone

    const diffMilliseconds = now.getTime() - notificationDate.getTime();

    // Convert to minutes, hours, days
    const diffMinutes = Math.floor(diffMilliseconds / (1000 * 60));
    const diffHours = Math.floor(diffMilliseconds / (1000 * 60 * 60));
    // diffDays is used for the "X days ago" calculation, based on exact 24-hour periods
    // We'll use diffDaysFromMidnight for the "calendar day" comparisons.

    // Get start of today and start of notificationDate's day (in local time)
    // This helps accurately determine "yesterday" and "X days ago" across timezone boundaries
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const startOfNotificationDay = new Date(
      notificationDate.getFullYear(),
      notificationDate.getMonth(),
      notificationDate.getDate(),
    ).getTime();

    // Calculate difference in calendar days (midnight to midnight)
    const diffDaysFromMidnight = Math.floor(
      (startOfToday - startOfNotificationDay) / (1000 * 60 * 60 * 24),
    );

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      // Singular 'minute' if 1
      return `${diffMinutes} Minute${diffMinutes === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24 && diffDaysFromMidnight === 0) {
      // Still today, but more than an hour ago
      // Singular 'hour' if 1
      return `${diffHours} Hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDaysFromMidnight === 1) {
      // Exactly yesterday
      return `Yesterday ${notificationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDaysFromMidnight > 1 && diffDaysFromMidnight <= 7) {
      // Between 2 and 7 calendar days ago
      // Singular 'day' if 1 (though this condition starts from >1)
      return `${diffDaysFromMidnight} day${diffDaysFromMidnight === 1 ? '' : 's'} ago`;
    } else {
      // For older dates (more than 7 days ago), show full local date and time
      return notificationDate.toLocaleString([], {
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

      if (data.general) {
        data.general.forEach((notif: NotificationItem) => {
          allNotifications.push({ ...notif, type: 'General' });
        });
      }

      if (data.coach) {
        data.coach.forEach((notif: NotificationItem) => {
          allNotifications.push({ ...notif, type: 'Coach' });
        });
      }
      setNotifications(allNotifications);
      setLoading(false);

      // After fetching, update the parent's unread dot status
      const unreadCount = allNotifications.filter(
        (notif) => !notif.read_status,
      ).length;
      setisUnReadNotif(unreadCount > 0);

      // NEW: Report all unread IDs to the parent component
      if (onUnreadNotificationsChange) {
        const currentUnreadIds = allNotifications
          .filter((notif) => !notif.read_status)
          .map((notif) => notif.notification_id);
        onUnreadNotificationsChange(currentUnreadIds);
      }
    });
  }, []);

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

    // NEW: Also report unread IDs when local state changes (e.g., user clicks to read)
    if (onUnreadNotificationsChange) {
      const currentUnreadIds = notifications
        .filter((notif) => !notif.read_status)
        .map((notif) => notif.notification_id);
      onUnreadNotificationsChange(currentUnreadIds);
    }
  }, [notifications, activeMenu, onUnreadNotificationsChange]);

  const handleNotificationClick = (clickedNotifId: string) => {
    // Mark notification as read in the UI
    setNotifications((prev) =>
      prev.map((item) =>
        item.notification_id === clickedNotifId
          ? { ...item, read_status: true, read_at: new Date().getTime() } // Use getTime() for timestamp
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
    const patient = patientsList.find((p) => p.member_id === memberId);

    return (
      patient?.profile_picture ||
      `https://ui-avatars.com/api/?name=${patient?.name}`
    );
  };
  console.log(patientsList);

  const navigate = useNavigate();
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  const handleProceedClick = (notif: NotificationItem) => {
    // Mark as read when proceeding
    handleNotificationClick(notif.notification_id);

    if (
      notif.proceed_type?.type === 'redirect' &&
      notif.proceed_type.destination
    ) {
      // Use navigate to redirect
      navigate(`/${notif.proceed_type.destination}`);
    }
    // If type is 'read_only' or destination is missing, do nothing (just mark as read)
  };
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
              onClick={() => {
                if (!notif.read_status) {
                  handleNotificationClick(notif.notification_id);
                }
              }}
              key={notif.notification_id}
              className="flex w-full justify-between bg-[#FCFCFC] py-2 px-3 items-center gap-3 cursor-pointer border border-Gray-25 rounded-2xl mt-[6px]"
            >
              <div className="flex items-center gap-2">
                <div className="relative flex-shrink-0">
                  <img
                    src={getPatientPicture(notif.member_id)}
                    className="size-8 rounded-full object-cover flex items-center justify-center bg-gray-200 text-gray-700 text-xs font-semibold"
                  />
                </div>
                <div className="flex-grow flex flex-col">
                  <div className="text-[10px] font-[500] ">
                    <TooltipTextAuto maxWidth="228px">
                      {notif.content || notif.title}
                    </TooltipTextAuto>
                    <div className="text-[10px] font-normal text-[#888888]">
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
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the parent div's onClick from firing
                    handleProceedClick(notif);
                  }}
                  className={` ${notif.proceed_type?.type === 'redirect' ? '' : 'invisible'} flex gap-1 items-center text-Primary-DeepTeal text-xs font-medium self-start`}
                >
                  Proceed
                  <img src="/icons/arrow-right-small 2.svg" alt="" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col justify-center items-center w-full  h-[450px] text-xs font-medium">
            <img className="-mb-4" src="/icons/noNotif.svg" alt="" />
            No notification found.
          </div>
        )}
      </div>
    </div>
  );
};

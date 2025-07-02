/* eslint-disable @typescript-eslint/no-explicit-any */
import Api from './api';
class NotificationApi extends Api {
  static lastUsed: Date | null = null;
  static isChecking: boolean = false;
  static getAll(resolve: (data: Array<any>) => void) {
    if (this.isChecking) {
      return;
    }
    this.isChecking = true;
    this.get('/notifications', {
      noPending: true,
    })
      .then((res) => {
        resolve(res.data);
        this.isChecking = false;
        this.lastUsed = new Date();
        localStorage.setItem('lastNotif', JSON.stringify(new Date()));
      })
      .catch(() => {
        this.isChecking = false;
      });
  }

  static readNotification(notification_id: string) {
    this.post(
      '/notifications/mark_read',
      {
        notification_id,
      },
      {
        noPending: true,
      },
    );
  }

  static checkNotification() {
    if (this.isChecking) {
      // <--- NEW: Prevent if already checking
      console.warn(
        'Notification.checkNotification: A check is already in progress. Skipping.',
      );
      return Promise.resolve({
        data: {
          new_notifications: false,
          checked_after: new Date().toISOString(),
        },
      }); // Return a resolved promise to prevent errors in caller
    }

    if (this.lastUsed == null) {
      const last = localStorage.getItem('lastNotif');
      if (last) {
        this.lastUsed = new Date(JSON.parse(last));
      }
    }

    const timeToSend = this.lastUsed
      ? this.lastUsed.toISOString()
      : new Date(0).toISOString();

    this.isChecking = true; 

    return this.post(
      '/notifications/check_new',
      {
        time: timeToSend,
      },
      {
        noPending: true,
      },
    ).finally(() => {
      this.isChecking = false;
    });
  }
}
export default NotificationApi;

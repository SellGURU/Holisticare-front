/* eslint-disable @typescript-eslint/no-explicit-any */
import Api from './api';
class NotificationApi extends Api {
  static lastUsed: Date | null = null;
  static isChecking: boolean = false;
  static getAll(resolve: (data: Array<any>) => void) {
    this.isChecking = true;
    this.get('/notifications', {
      noPending: true,
    })
      .then((res) => {
        resolve(res.data);
        this.isChecking = false;
        this.lastUsed = new Date();
        localStorage.setItem('lastNotif', JSON.stringify(new Date()));      })
      .catch(() => {
        this.isChecking = false;
      });
  }

  static readNotification( notification_id: string) {
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
    if (this.lastUsed == null) {
      const last = localStorage.getItem('lastNotif');
      if (last) {
        this.lastUsed = new Date(JSON.parse(last));
      }
    }
    const timeToSend = this.lastUsed ? this.lastUsed.toISOString() : new Date(0).toISOString();

    const response = this.post(
      '/notifications/check_new',
      {
        time: timeToSend,
      },
      {
        noPending: true,
      },
    );
    return response;
  }
}

export default NotificationApi;

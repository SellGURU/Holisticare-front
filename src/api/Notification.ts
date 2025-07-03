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
      console.warn(
        'Notification.checkNotification: A check is already in progress. Skipping.',
      );
      // Return a resolved promise with a default response.
      // `checked_after` would typically be the current timestamp as a string.
      return Promise.resolve({
        data: {
          new_notifications: false,
          checked_after: String(new Date().getTime()), // Send as string in response too
        },
      });
    }

    // --- Retrieve lastUsed from localStorage: needs to be parsed as a number ---
    if (this.lastUsed == null) {
      const last = localStorage.getItem('lastNotif');
      if (last) {
        try {
          // Parse as a number directly, not a JSON string representing a Date
          const storedTimestamp = JSON.parse(last);
          if (typeof storedTimestamp === 'number') {
            this.lastUsed = new Date(storedTimestamp);
          } else {
            // Fallback for old ISO string format if necessary, though now we consistently store numbers
            this.lastUsed = new Date(0); // Attempt to parse as ISO string from storage directly
          }
        } catch (e) {
          console.error('Failed to parse lastNotif from localStorage:', e);
          this.lastUsed = new Date(0); // Default to epoch if parsing fails
        }
      }
    }

    // --- CRITICAL FIX: timeToSend should be the timestamp number converted to a string ---
    const timeToSend = this.lastUsed
      ? String(this.lastUsed.getTime()) // Convert to string here
      : String(new Date(0).getTime()); // Default to Unix Epoch timestamp as string

    this.isChecking = true;

    return this.post(
      '/notifications/check_new',
      {
        time: timeToSend, // Now sending the timestamp number as a string
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

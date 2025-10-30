import Api from './api';

/* eslint-disable @typescript-eslint/no-explicit-any */
class Log extends Api {
  static saveLog(log: any) {
    return this.post('/marketing/session', {
      session_data:log
    });
  }
}

export default Log;

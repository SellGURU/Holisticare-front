import Api from './api';

/* eslint-disable @typescript-eslint/no-explicit-any */
class Log extends Api {
  static saveLog(log: any) {
    return this.post('/marketing/session', log);
  }
}

export default Log;

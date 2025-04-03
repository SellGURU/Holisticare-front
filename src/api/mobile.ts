/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiMobile from './apiMobile';

interface getQuestionaryEmptyData {
  encoded_mi: string;
  unique_id: string;
}

class Mobile extends ApiMobile {
  static getQuestionaryEmpty = (data: getQuestionaryEmptyData) => {
    return this.post('/tasks/show_empty_questionary', data);
  };
  static getCheckInEmpty = (data: getQuestionaryEmptyData) => {
    return this.post('/tasks/show_checkin_questions', data);
  };
  static fillQuestionary = (data: any) => {
    return this.post('/tasks/save_questionary_respond', data);
  };
  static fillCheckin = (data: any) => {
    return this.post('/tasks/save_checkin_respond', data);
  };  
}

export default Mobile;

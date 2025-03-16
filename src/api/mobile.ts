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
  static fillQuestionary = (data: any) => {
    return this.post('/tasks/save_questionary_respond', data);
  };  
}

export default Mobile;

import ApiMobile from './apiMobile';

interface getQuestionaryEmptyData {
  encoded_mi: string;
  unique_id: string;
}

class Mobile extends ApiMobile {
  static getQuestionaryEmpty = (data: getQuestionaryEmptyData) => {
    return this.post('/tasks/show_empty_questionary', data);
  };
}

export default Mobile;

/* eslint-disable @typescript-eslint/no-explicit-any */
import Api from './api';

class FormsApi extends Api {
  static getCheckinList = () => {
    return this.post('/forms/check_in/list_checkin_forms', {});
  };

  static addCheckin = (data: CheckinFormType) => {
    return this.post('/forms/check_in/add_checkin_form', data);
  };

  static deleteCheckin = (id: string) => {
    return this.post('/forms/check_in/delete_checkin_form', { unique_id: id });
  };

  static showCheckIn = (id: string) => {
    return this.post('/forms/check_in/show_checkin_form', { unique_id: id });
  };

  static editCheckIn = (data: CheckinEditFormType) => {
    return this.post('/forms/check_in/edit_checkin_form', data);
  };

  static checkInReposition = (data: any) => {
    return this.post('/forms/check_in/reposition_questions', data);
  };

  // questionary

  static getQuestionaryList = () => {
    return this.post('/forms/questionary/list_questionary_forms', {});
  };

  static deleteQuestionary = (id: string) => {
    return this.post('/forms/questionary/delete_questionary_form', { unique_id: id });
  };  
}

export default FormsApi;

import Api from './api';

class DashboardApi extends Api {
  static getClientsStats =(data:any) => {
    return this.post('/dashboard/clinic/clients_statistics',data);
  };
  static getActionsList =(data:any) => {
    return this.post('/dashboard/action_needed/list_of_actions', data);
  };
  static getCheckinList =(data:any) => {
    return this.post('/dashboard/checkin/checkin_list', data);
  };

  static getFilledCheckin =(data:any) => {
    return this.post('/dashboard/checkin/show_filled_checkin', data);
  };
  static compareCheckin =(data:any) => {
    return this.post('/dashboard/checkin/compare_checkins', data);
  };
  static showCompareCheckin =(data:any) => {
    return this.post('/dashboard/checkin/show_filled_checkin', data);
  };
  static saveCoachComment =(data:any) => {
    return this.post('/dashboard/checkin/save_coach_comment', data);
  };
  static markAsReviewd =(data:any) => {
    return this.post('/dashboard/checkin/mark_as_reviewed', data);
  };
  static getStaffList =(data:any) => {
    return this.post('/dashboard/staff/staff_list', data);
  };
  static getCLientsList =(data:any) => {
    return this.post('/dashboard/clients/clients_list', data);
  };
  
  static getTasksList =(data:any) => {
    return this.post('/dashboard/tasks/tasks_list', data);
  };
  static AddTask =(data:any) => {
    return this.post('/dashboard/tasks/add_task', data);
  };
  static checkTask =(data:any) => {
    return this.post('/dashboard/tasks/check_task', data);
  };
}
export default DashboardApi;

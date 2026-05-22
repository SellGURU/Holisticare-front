/* eslint-disable @typescript-eslint/no-explicit-any */
import Api from './api';

class AppendUiDashboardApi extends Api {
  static getDashboardHeader = (data: any = {}) => {
    return this.post('/append_ui_dashboard/header', data);
  };

  static getClinicalAttentionRadar = (data: any = {}) => {
    return this.post('/append_ui_dashboard/clinical_attention_radar', data);
  };

  static getEngagementHealth = (data: any = {}) => {
    return this.post('/append_ui_dashboard/engagement_health', data);
  };

  static getAiPriorityQueue = (data: any = {}) => {
    return this.post('/append_ui_dashboard/ai_priority_queue', data);
  };

  static getCommunicationCenter = (data: any = {}) => {
    return this.post('/append_ui_dashboard/communication_center', data);
  };

  static getInterventionInsights = (data: any = {}) => {
    return this.post('/append_ui_dashboard/intervention_insights', data);
  };

  static getActivePatientGrowth = (data: any = {}) => {
    return this.post('/append_ui_dashboard/active_patient_growth', data);
  };
}

export default AppendUiDashboardApi;

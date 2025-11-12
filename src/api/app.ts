/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Api from './api';
// import allBiomarkers from './--moch--/data/Allbiomarkers.json';
// import AllBloodtests from './--moch--/data/AllBloodtests.json'
// import Allactivities from './--moch--/data/Allactivities.json'
class Application extends Api {
  static getPatients() {
    const response = this.get('/patients');
    return response;
  }

  static getPatientsInfo(data: any) {
    const response = this.post('/patients/patient_data', data);
    return response;
  }

  static addDataEntery(data: any) {
    return this.post('/data_entry/', data);
  }

  static getReports() {
    const response = this.post('/getreports', {});
    return response;
  }
  static getBiomarkers() {
    const response = this.get('/patients/allbiomarkers');
    return response;
  }
  static getDiagnosis() {
    const response = this.post('/getDiagnosis', {});
    return response;
  }
  static getAllBiomarkers() {
    const response = this.post('/getAllBiomarkers', {});
    return response;
  }
  static getBloodTest() {
    const response = this.post('/getBloodTest', {});
    return response;
  }
  static getgraphData() {
    const response = this.post('/ai_knowledge/show_ai_knowledge', {});
    return response;
  }
  static getActionPLan() {
    const response = this.post('/actionplan', {});
    return response;
  }
  static getBiomarkersByPatientId(member_id: number) {
    const response = Api.get('/patients/' + member_id + '/biomarkers');
    return response;
    // const patient = allBiomarkers.find(p => p.patient_id === patient_id);
    // if (patient) {
    //   return { data: patient.biomarkers };
    // } else {
    //   return { data: [] };
    // }
  }
  static getActivityByPatientId(member_id: number) {
    const response = Api.get('/patients/' + member_id + '/analysis/activity');
    return response;
    // const patient = Allactivities.find(p => p.patient_id === patient_id);
    // if (patient) {
    //   return { data: patient.activities };
    // } else {
    //   return { data: [] };
    // }
  }
  static getBloodTestByPatientId(_patient_id: number) {
    // const patient = AllBloodtests.find(p => p.patient_id === patient_id);
    // if (patient) {
    //   return { data: patient.bloodTests };
    // } else {
    return { data: [] };
    // }
  }

  static addClient(data: any) {
    const response = this.post('/patients/add_patient', data);
    return response;
  }
  static getAppoinments(patient_id: number) {
    const response = this.get(
      `/patients/` + patient_id + `/overview/appointments`,
    );
    return response;
  }
  static getSummary(member_id: number | string) {
    const response = this.get(`/summary/${member_id}`);
    return response;
  }

  static updateSummary(data: any) {
    const response = this.post(`/summary/update`, data);
    return response;
  }
  static generateTreatmentPlan(data: any) {
    const response = this.post(`/patients/generate_treatment_plan`, data);
    return response;
  }
  static getGeneratedTreatmentPlan(data: any) {
    const response = this.post(`/patients/get_treatment_plan_data`, data);
    return response;
  }  
  static getTreatmentPlanDescriptions(member_id: number) {
    const response = this.get(`/patients/show-tplan-description/${member_id}`);
    return response;
  }
  static getTreatmentPlanDetails(member_id: number) {
    const response = this.get(`/patients/show-benchmarks-details/${member_id}`);
    return response;
  }
  static getTreatmentPlanModalData(data: any) {
    const response = this.post(`/patients/show_patient_benchmarks`, data);
    return response;
  }
  static showPlanPriorities() {
    const response = this.get(`/clinic/show-plan-priorities/`);
    return response;
  }
  static downloadReport(data: any) {
    const response = this.post(`/patients/download_report`, data);
    return response;
  }
  static downloadClinicReport(data: any) {
    const response = this.post(`/patients/download_clinic_report`, data);
    return response;
  }

  static updatePlanPriorities(data: any) {
    const response = this.post(`/clinic/update-plan-priorities`, {
      edited_plan_priorities: data,
    });
    return response;
  }
  static showPlanDescription(member_id: any) {
    const response = this.get(`/patients/${member_id}/show-tplan-description`);
    return response;
  }
  static showTreatmentPlan(data: any) {
    const response = this.post(`/patients/show_treatmentplan`, data);
    return response;
  }

  static getPatientReorders(member_id: string) {
    const response = this.post('/patients/priority_data', {
      member_id: member_id,
    });
    return response;
  }

  static savereport(data: any) {
    const response = this.post('/patients/save_report', data);
    return response;
  }
  static saveLogo(data: any) {
    const response = this.post('/clinic/settings_update_logo', data);
    return response;
  }
  static getLogoClinic() {
    const response = this.post('/clinic/settings_show_logo');
    return response;
  }
  static aiStudio_patients() {
    const response = this.get('/drift_analysis/patients');
    return response;
  }
  static aiStudio_copilotChat(data: any) {
    const response = this.post('/copilot_chat', data);
    return response;
  }
  static aiStudio_overview(data: any) {
    const response = this.post('/ai_studio/overview', data);
    return response;
  }

  static getDocument(data: any) {
    const response = this.post('/ai_knowledge/get_documents', data);
    return response;
  }

  static getWeeklyReport(data: any) {
    const response = this.post('/ai_studio/ai_studio_show_weekly_data', data);
    return response;
  }

  static showReportList(data: any) {
    const response = this.post('/ai_studio/show_report_list', data);
    return response;
  }

  static ai_studio_generate_report(data: any) {
    const response = this.post('/ai_studio/ai_studio_generate_report', data);
    return response;
  }

  static ai_studio_update_weekly_data(data: any) {
    const response = this.post('/ai_studio/ai_studio_update_weekly_data', data);
    return response;
  }

  static getListChats(data: any) {
    const response = this.post('/get_messages_id', data);
    return response;
  }

  static generateWithAi(data: any) {
    const response = this.post('/ai_studio/ai_studio_generate_report', data);
    return response;
  }

  static downloadReportForGenerate(data: any) {
    const response = this.post('/ai_studio/download_weekly_report', data);
    return response;
  }

  static saveAiStadioReport(data: any) {
    const response = this.post('/ai_studio/save_weekly_data', data);
    return response;
  }

  static getReportString(data: any) {
    const response = this.post('/ai_studio/get_report_string', data);
    return response;
  }
  static showHistory(data: any) {
    const response = this.post('/patients/show_treatment_plan_list', data);
    return response;
  }

  static showHistoryActionPlan(data: any) {
    const response = this.post('/patients/show_action_plan_list', data);
    return response;
  }

  static addNoteHelth(data: any) {
    const response = this.post('/clinic-user/add-notes', data);
    return response;
  }

  static AiStudioShowSavedReport(data: any) {
    const response = this.post('/ai_studio/show_saved_report', data);
    return response;
  }

  static AiStudioEditSavedReport(data: any) {
    const response = this.post('/ai_studio/edit_saved_report', data);
    return response;
  }

  static WeaklyReportGraph = (data: any) => {
    const response = this.post('/weekly_graph', data);
    return response;
  };

  static getDataTracking = (data: any) => {
    const response = this.post('/summary/data_tracking_action', data);
    return response;
  };

  static getManualData = () => {
    const response = this.post('/ai_studio/manual_data_entry', {});
    return response;
  };

  static Gethistorical_graph = (data: any) => {
    const response = this.post('/historical_graph', data);
    return response;
  };

  static updateSetting = (data: any) => {
    const response = this.post('/clinic/update_setting/', data);
    return response;
  };

  static deletePatient = (data: any) => {
    const response = this.post('/patients/delete_patient', data);
    return response;
  };
  static archivePatient = (data: any) => {
    const response = this.post('/patients/add_to_archive', data);
    return response;
  };
  static unArchivePatient = (data: any) => {
    const response = this.post('/patients/unarchive', data);
    return response;
  };
  static saveTreatmentPaln = (data: any) => {
    const response = this.post('/save_treatment_plan', data);
    return response;
  };
  static saveActionPaln = (data: any) => {
    const response = this.post('/save_action_plan', data);
    return response;
  };

  static UpdateTreatmentPlanWithAi = (data: any) => {
    const response = this.post('/update_treatment_plan_with_ai', data);
    return response;
  };

  static ShareWeaklyReport(data: any) {
    const response = this.post('/ai_studio/message_to_client', data);
    return response;
  }
  static ShareTreatMentPlanReport(data: any) {
    const response = this.post('/patients/share_treatment', data);
    return response;
  }

  static treatment_by_knowledge(data: any) {
    const response = this.post('/treatment_by_knowledge', data);
    return response;
  }

  static getScors(memberId: any) {
    const response = this.get(`/patients/${memberId}/health_score`);
    return response;
  }
  static get_benchmark_list() {
    const response = this.post(`/get_benchmark_list`, {});
    return response;
  }

  static getBiomarkersData() {
    const response = this.post('/clinic_settings/show_biomarkers/', {});
    return response;
  }

  static GetPlanPriorty() {
    const response = this.post('/clinic_settings/show_plan_priority/', {});
    return response;
  }

  static savePlanPriorty(data: any) {
    const response = this.post('/clinic_settings/save_plan_priority/', data);
    return response;
  }

  static saveBiomarker(data: any) {
    const response = this.post('/clinic_settings/save_biomarkers/', data);
    return response;
  }

  static AnalyseTreatmentPlan(data: any) {
    const response = this.post('/analysis_treatment_plan', data);
    return response;
  }
  static addClinicInfo(data: any) {
    const response = this.post('/clinic/add_clinic_info', data);
    return response;
  }
  static getTestSetting() {
    const response = this.post('/show_test_settings/', {});
    return response;
  }
  static saveTestSetting(data: any) {
    const response = this.post('/save_test_settings/', data);
    return response;
  }
  static getClientSummaryOutofrefs(data: any) {
    const response = this.post('/overview/client_summary_outofrefs', data);
    return response;
  }

  // share
  static getClientSummaryOutofrefsShare(data: any, key: any) {
    const response = this.post(
      '/overview/share_report/detailed_analysis?unique_key=' + key,
      data,
    );
    return response;
  }
  static getClientSummaryCategoriesShare(data: any, key: any) {
    const response = this.post(
      '/overview/share_report/client_summary?unique_key=' + key,
      data,
    );
    return response;
  }
  static getConceringResultsShare(data: any, key: any) {
    const response = this.post(
      '/overview/share_report/concerning_results?unique_key=' + key,
      data,
    );
    return response;
  }

  static getOverviewtplanShare(data: any, key: any) {
    const response = this.post(
      '/overview/share_report/holistic_plan?unique_key=' + key,
      data,
    );
    return response;
  }
  static getCaldenderdataShare(data: any, key: any) {
    const response = this.post(
      '/overview/share_report/calendar?unique_key=' + key,
      data,
    );
    return response;
  }
  static getPatientsInfoShare(data: any, key: any) {
    const response = this.post(
      '/overview/share_report/patient_data?unique_key=' + key,
      data,
    );
    return response;
  }
  // endShare
  static getConceringResults(data: any) {
    const response = this.post('/overview/concerning_results', data);
    return response;
  }
  static getClientSummaryCategories(data: any) {
    const response = this.post('/overview/client_summary_categories', data);
    return response;
  }
  static getOverviewtplan(data: any) {
    const response = this.post('/overview/treatment_plan', data);
    return response;
  }
  static getAnalysetab() {
    const response = this.post('/analysis/tabs', {});
    return response;
  }
  static getCaldenderdata(data: any) {
    const response = this.post('/overview/report_calendar', data);
    return response;
  }

  static addLabReport(
    data: any,
    onUploadProgress: (progressEvent: any) => void,
    signal?: AbortSignal,
  ) {
    const response = this.post('/patients/add_lab_report', data, {
      onUploadProgress: (progressEvent: any) => {
        onUploadProgress(progressEvent);
      },
      signal,
    });
    return response;
  }
  static getTreatmentPlanDetail(data: any) {
    const response = this.post(
      '/patients/treatment_plan_details_for_list',
      data,
    );
    return response;
  }

  static getActionPlanMethods = (data: any) => {
    const response = this.post('/action_plan/methods', data);
    return response;
  };

  static ActionPlanRoadMap = (data: any) => {
    const response = this.post('/action_plan/add_block', data);
    return response;
  };
  static ActionPlanSaveTask = (data: any) => {
    const response = this.post('/action_plan/block/save_tasks', data);
    return response;
  };
  static ActionPlanBlockList = (data: any) => {
    const response = this.post('/action_plan/list_of_blocks', data);
    return response;
  };
  static ActionPlanGenerateTask = (data: any) => {
    const response = this.post('/action_plan/block/generate_tasks', data);
    return response;
  };

  static showCategory = (data: any) => {
    const response = this.post('/clinic/show_category', data);
    return response;
  };
  static showPlanPriorty = (data: any) => {
    const response = this.post('/clinic/show_plan_priority', data);
    return response;
  };
  static driftPatientInfo = (data: any) => {
    const response = this.post(`/drift_analysis/patient_info`, data);
    return response;
  };
  static getClientInfo = (data: any) => {
    const response = this.post(`/health_profile/patient_info`, data);
    return response;
  };
  static getDataSyncing = (data: any) => {
    const response = this.post(
      `/summary/data_syncing_devices
    `,
      data,
    );
    return response;
  };
  static getQuestionary_tracking = (data: any) => {
    const response = this.post(
      `/questionary_tracking/selected_questionarries


    `,
      data,
    );
    return response;
  };
  static Questionary_tracking_action = (data: any) => {
    const response = this.post(
      `/health_profile/questionary_tracking/action


    `,
      data,
    );
    return response;
  };
  static AddQuestionaryList = (data: any) => {
    const response = this.post(
      `/questionary_tracking/clinic_q_list



    `,
      data,
    );
    return response;
  };
  static AddQuestionary = (data: any) => {
    const response = this.post(
      `/questionary_tracking/add_questionary_for_client





    `,
      data,
    );
    return response;
  };
  static SaveQuestionary = (data: any) => {
    const response = this.post(
      `
/questionary_tracking/save_filled_questionary



    `,
      data,
    );
    return response;
  };
  static PreviewQuestionary = (data: any) => {
    const response = this.post(
      `
/questionary_tracking/action_preview



    `,
      data,
    );
    return response;
  };
  static QuestionaryAction = (data: any) => {
    const response = this.post(
      `/questionary_tracking/action_assign_or_fill






    `,
      data,
    );
    return response;
  };
  static getNotes = (data: any) => {
    const response = this.post(`/health_profile/notes/show_notes`, data);
    return response;
  };
  static updateNote = (data: any) => {
    const response = this.post(`/health_profile/notes/update_note`, data);
    return response;
  };
  static deleteNote = (id: string) => {
    return this.post('/health_profile/notes/delete_note', {
      note_unique_id: id,
    });
  };
  static addNote = (data: any) => {
    const response = this.post(`/health_profile/notes/add_notes`, data);
    return response;
  };
  static getFilleList = (data: any) => {
    const response = this.post(
      `/patients/get_list_lab_report
      `,
      data,
    );
    return response;
  };
  static downloadFille = (data: any) => {
    const response = this.post(
      `/patients/download_lab_report

      `,
      data,
    );
    return response;
  };
  static addFavorite = (data: any) => {
    const response = this.post(
      `/patients/add_to_fav_list


      `,
      data,
    );
    return response;
  };
  static deleteActionCard = (data: any) => {
    const response = this.post(
      `/delete_block



      `,
      data,
    );
    return response;
  };
  static deleteHolisticPlan = (data: any) => {
    const response = this.post(`/delete_treatment_plan`, data);
    return response;
  };

  static SendVerification = ({ email }: { email: string }) => {
    const response = this.post('/auth/forget_password/send_verification', {
      email: email,
    });
    return response;
  };
  static varifyCode = ({
    email,
    reset_code,
  }: {
    email: string;
    reset_code: string;
  }) => {
    const response = this.post('/auth/forget_password/verify_reset_code', {
      email: email,
      reset_code: reset_code,
    });
    return response;
  };

  static ChangePassword = ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const response = this.post('/auth/forget_password/reset_password', {
      email: email,
      password: password,
    });
    return response;
  };
  static deleteClinic = (data: any) => {
    const response = this.post('/patients/delete_patient', data);
    return response;
  };

  static LoginWithGooglge = (data: any) => {
    const response = this.post('/auth/google_login', {
      google_json: data,
    });
    return response;
  };
  static dashboardTasks = () => {
    const response = this.post('/dashboard/tasks/tasks_list', {});
    return response;
  };
  static dashboardAddTask = (data: any) => {
    const response = this.post('tasks', data);
    return response;
  };

  static messagesUsersList = () => {
    const response = this.post('/messages/client_list', {});
    return response;
  };
  static sendMessage = (data: any) => {
    const response = this.post('/messages/chat_window/send_message', data);
    return response;
  };
  static userMessagesList = (data: any) => {
    const response = this.post('/messages/chat_window/messages_list', data);
    return response;
  };
  static clientsStats = () => {
    const response = this.post('/dashboard/clinic/clients_statistics', {});
    return response;
  };
  static dashboardReminders = () => {
    const response = this.post('/dashboard/reminder/reminders_list', {});
    return response;
  };
  static dashboardStaff = () => {
    const response = this.post('/dashboard/staff/staff_list', {});
    return response;
  };
  static dashboardClients = () => {
    const response = this.post('/dashboard/clients/clients_list', {});
    return response;
  };
  static medicalAnalyse = (data: any) => {
    const response = this.post('/treatment_plan/medical_summary_ai', data);
    return response;
  };
  static driftAction = (data: any) => {
    const response = this.post('/drift_analysis/action_plan', data);
    return response;
  };
  static generateAi = (data: any) => {
    const response = this.post('/action_plan/generate_by_ai', data);
    return response;
  };
  static roadMapGenerateAi = (data: any) => {
    const response = this.post('/drift_analysis/road_map/generate_by_ai', data);
    return response;
  };
  static questionaryLink = (data: any) => {
    const response = this.post(
      '/health_profile/questionary_tracking/send_link',
      data,
    );
    return response;
  };
  static getGoogleFormEmty = () => {
    const response = this.post('/empty_personal_info_form', {});
    return response;
  };
  static setGoogleFormEmty = ({
    member_id,
    data,
  }: {
    member_id: number;
    data: any;
  }) => {
    const response = this.post('/submit_personal_info_form', {
      member_id: member_id,
      response: data,
    });
    return response;
  };
  static deleteLapReport = (data: any) => {
    const response = this.post('/patients/delete_lab_report', data);
    return response;
  };
  static getMemberId = (key: string) => {
    const response = this.post('/overview/get_member_id', {
      unique_key: key,
    });
    return response;
  };
  static downloadTreatmentCsv = (data: any) => {
    const response = this.post('/patients/download_treatment_csv', data);
    return response;
  };

  static driftAnalysisApporve = (data: any) => {
    const response = this.post('/drift_analysis/message/approve', data);
    return response;
  };

  static showTimeLine = (data: any) => {
    const response = this.post('/health_profile/timeline/show_events', data);
    return response;
  };

  static getActionPlanMethodsNew = () => {
    const response = this.post('/action_plan/percents', {});
    return response;
  };
  static getActionPlanTaskDirectoryNew = (data: any) => {
    const response = this.post('/action_plan/task_directory', data);
    return response;
  };
  static getActionPlanGenerateActionPlanTaskNew = (data: any) => {
    const response = this.post('/action_plan/generate_action_plan_task', data);
    return response;
  };
  static getActionPlanBlockSaveTasksNew = (data: any) => {
    const response = this.post('/action_plan/block/save_tasks', data);
    return response;
  };
  static holisticPlanReScore = (data: any) => {
    const response = this.post('/patients/treatment_plan_rescore', data);
    return response;
  };
  static saveHolisticPlan = (data: any) => {
    const response = this.post('/initial_save_treatment_plan', data);
    return response;
  };
  static showHolisticPlan = (data: any) => {
    const response = this.post('/show_initial_saved_treatment_plan', data);
    return response;
  };
  static HolisticPlanCategories = (data: any) => {
    const response = this.post('/patients/available_categories', data);
    return response;
  };
  static checkConflicActionPlan = (data: any) => {
    const response = this.post('/action_plan/conflict_check', data);
    return response;
  };
  static getActionPlanBlockCalendarView = (data: any) => {
    const response = this.post('/action_plan/block/calendar_view', data);
    return response;
  };
  static giveClientAccess = (data: any) => {
    const response = this.post('/patients/give_access/mobile_user_info', data);
    return response;
  };
  static shareClientAccess = (data: any) => {
    const response = this.post('/patients/give_access/share_with_email', data);
    return response;
  };
  static addSupplement = (data: any) => {
    return this.post('/supplement_library/add_supplement', data);
  };
  static editSupplement = (data: any) => {
    return this.post('/supplement_library/edit_supplement', data);
  };
  static deleteSupplement = (id: string) => {
    return this.post('/supplement_library/delete_supplement', {
      Sup_Id: id,
    });
  };
  static getSupplementList = () => {
    return this.post('/supplement_library/supplements_list', {});
  };
  static addLifestyle = (data: any) => {
    return this.post('/lifestyle_library/add_lifestyle', data);
  };
  static editLifestyle = (data: any) => {
    return this.post('/lifestyle_library/edit_lifestyle', data);
  };
  static deleteLifestyle = (id: string) => {
    return this.post('/lifestyle_library/delete_lifestyle', {
      Life_Id: id,
    });
  };
  static getLifestyleList = () => {
    return this.post('/lifestyle_library/lifestyles_list', {});
  };
  static addDiet = (data: any) => {
    return this.post('/diet_library/add_diet', data);
  };
  static editDiet = (data: any) => {
    return this.post('/diet_library/edit_diet', data);
  };
  static deleteDiet = (id: string) => {
    return this.post('/diet_library/delete_diet', {
      Diet_Id: id,
    });
  };
  static getDietList = () => {
    return this.post('/diet_library/diets_list', {});
  };
  static getShowBrandInfo = () => {
    return this.post('/custom_branding/show_brand_info', {});
  };
  static saveBrandInfo = (data: any) => {
    return this.post('/custom_branding/save_brand_info', data);
  };
  static saveExcerciseFille = (data: any) => {
    return this.post('/activity_library/save_exercise_file', data);
  };
  static addExercise = (data: any) => {
    return this.post('/activity_library/add_exercise', data);
  };
  static getExerciseFilters = (data: any) => {
    return this.post('/activity_library/filters', data);
  };
  static getExercisesList = (data: any) => {
    return this.post('/activity_library/exercises_list', data);
  };

  static DeleteExercise = (data: any) => {
    return this.post('/activity_library/delete_exercise', data);
  };
  static updateExercise = (data: any) => {
    return this.post('/activity_library/edit_exercise', data);
  };
  static showExerciseFille = (data: any) => {
    return this.post('/activity_library/show_exercise_file', data);
  };
  static getStaffList = () => {
    return this.post('/settings/staff_list', {});
  };
  static inviteStaffMember = (data: any) => {
    return this.post('/settings/invite_staff', data);
  };
  static getStaffAssignedClients = (data: any) => {
    return this.post('/settings/staffs/assigned_clients', data);
  };
  static RemoveUserStaff = (data: any) => {
    return this.post('/settings/remove_staff', data);
  };
  static ChangeRoleUserStaff = (data: any) => {
    return this.post('/settings/change_role', data);
  };

  static addActivity = (data: any) => {
    return this.post('/activity_library/add_activity', data);
  };
  static deleteActivity = (Act_Id: string) => {
    return this.post('/activity_library/delete_activity', { Act_Id: Act_Id });
  };
  static activityList = () => {
    return this.post('/activity_library/activities_list');
  };
  static checkSelectedTaskConflict = (data: any) => {
    return this.post('/action_plan/check_selected_task_conflict', data);
  };
  static getActivity = (Act_Id: string) => {
    return this.post('/activity_library/show_activity_details', {
      Act_Id: Act_Id,
    });
  };
  static editActivity = (data: any) => {
    return this.post('/activity_library/edit_activity', data);
  };
  static getStaffRoles = (data: any) => {
    return this.get('/settings/invite_staff/roles', data);
  };
  static getResultTab = (data: any) => {
    return this.post('/patients/generate_treatment_plan_result_page', data);
  };
  static tratmentPlanConflict = (data: any) => {
    return this.post('/treatment_plan/conflict_check', data);
  };
  static getCoachList = (data: any) => {
    return this.post('/patients/coaches_usernames', data);
  };
  static assignCoach = (data: any) => {
    return this.post('/patients/assign_to_coach', data);
  };
  static has_unread_message = (data: any) => {
    return this.post('/has_unread_message', data);
  };
  static getHolisticPlanReview = (data: any) => {
    return this.post('/action_plan/holistic_plan', data);
  };
  static checkInvation = (data: any) => {
    return this.post('/settings/check_invitation', data);
  };
  static getDocumentKnowledge = (data: any) => {
    return this.post('/ai_knowledge/get_document_knowledge', data);
  };
  static deleteUserUploadDocument = (data: any) => {
    return this.post('/ai_knowledge/remove_nodes_by_file', data);
  };
  static addToDatabaseDocumentKnowledge = (data: any) => {
    return this.post('/ai_knowledge/add_to_knowledge', data);
  };
  static downloadUserUploadDocumentKnowledge = (data: any) => {
    return this.post('/ai_knowledge/get_document_by_name', data);
  };
  static downloadSystemDocumentKnowledge = (data: any) => {
    return this.post('/ai_knowledge/get_system_document_by_name', data);
  };
  static hideUserUploadDocumentKnowledge = (data: any) => {
    return this.post('/ai_knowledge/hide_user_docs', data);
  };
  static unhideUserUploadDocumentKnowledge = (data: any) => {
    return this.post('/ai_knowledge/unhide_user_docs', data);
  };
  static hideSystemDocumentKnowledge = (data: any) => {
    return this.post('/ai_knowledge/hide_system_docs', data);
  };
  static unhideSystemDocumentKnowledge = (data: any) => {
    return this.post('/ai_knowledge/unhide_system_docs', data);
  };
  static getSettingData = (data: any) => {
    return this.post('/setting/clinic_preferecne', data);
  };
  static updateSettingData = (data: any) => {
    return this.post('/setting/update_clinic_preference', data);
  };
  static getToneList = (data: any) => {
    return this.post('/setting/tone_list', data);
  };

  static getNotifications = () => {
    return this.get('/notifications', {});
  };
  static deleteFileHistory = (data: any) => {
    return this.post(`/patients/delete_lab_report`, data);
  };

  static first_view_report = (memberId: any) => {
    return this.post('/overview/first_view', {
      member_id: memberId,
    });
  };
  static saveActionEdit = (data: any) => {
    return this.post('/drift_analysis/edit_action_plan', data);
  };
  static getDietLibrary = () => {
    return this.post('/diet_library/get_parent_id', {});
  };
  static getActivityLibrary = () => {
    return this.post('/activity_library/get_parent_id', {});
  };
  static checkLabStepOne = (data: any) => {
    return this.post('/patients/check_lab_report_step_one', data);
  };
  static SaveLabReport = (data: any) => {
    return this.post('/patients/process_lab_report', data);
  };
  static getBiomarkerName = (data: any) => {
    return this.post('/clinic/get_biomarkers_list', data);
  };
  static getBiomarkerUnit = (data: any) => {
    return this.post('/clinic/get_biomarker_unit', data);
  };
  static checkDeleteLabReport = (data: any) => {
    return this.post(`/patients/check_delete_lab_report`, data);
  };
  static checkStepTwoUpload = (data: any) => {
    return this.post('/patients/check_lab_report_step_two', data);
  };
  // static getDietLibrary = () => {
  //   return this.post('/diet_library/get_parent_id', {});
  // };
  // static getActivityLibrary = () => {
  //   return this.post('/activity_library/get_parent_id', {});
  // };
  static getPlaygroundList = () => {
    return this.post('/test_api/tests', {});
  };
  static setPlaygroundList = (data: any) => {
    return this.post('/test_api', data);
  };
  static getInputPlayGround = () => {
    return this.post('/test_api/inputs', {});
  };
  static getInputPlayGroundVariables = () => {
    return this.post('/test_api/agents', {});
  };
  static standardizeBiomarkers = (data: any) => {
    return this.post('/patients/standardize_biomarkers', data);
  };
  static getAllBiomarkerUnits = (data: any) => {
    return this.post('/clinic/get_biomarker_all_units', data);
  };
  static validateBiomarkers = (data: any) => {
    return this.post('/patients/validate_biomarkers', data);
  };
  static validateAddedBiomarkers = (data: any) => {
    return this.post('/patients/validate_added_biomarkers', data);
  };
  static getHtmlReport = (member_id: string) => {
    return this.post(`/get_html_report`, { member_id: member_id });
  };
  static checkHtmlReport = (member_id: string) => {
    return this.post(`/check_html_report`, { member_id: member_id });
  };
  static showExerciseDetails = (exercise_Id: string) => {
    return this.post(`/activity_library/show_exercise_details`, {
      Exercise_Id: exercise_Id,
    });
  };
  static getCoverage = (data: any) => {
    return this.post('/holistic_plan_coverage/calculate_progress', data);
  };
  static remapIssues = (data: any) => {
    return this.post('/issues/remap_issues', data);
  };
  static checkRefreshProgress = (member_id: string) => {
    return this.post(`/patients/check_refresh_progress`, {
      member_id: member_id,
    });
  };
  static refreshData = (member_id: string) => {
    return this.post(`/patients/refresh_data`, {
      member_id: member_id,
    });
  };
  static reportGeneratedNotification = (member_id: string) => {
    return this.post(`/report_generated_notification`, {
      member_id: member_id,
    });
  };
}

export default Application;

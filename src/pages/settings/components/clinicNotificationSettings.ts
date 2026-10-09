export type ClinicNotificationSettings = {
  email: {
    questionnaire_assigned: boolean;
    questionnaire_reminder: boolean;
    report_shared: boolean;
    chat_messages: boolean;
    patient_welcome: boolean;
    mobile_access: boolean;
  };
  push: {
    questionnaire: boolean;
    report_ready: boolean;
    chat_messages: boolean;
  };
};

export const emptyClinicNotificationSettings = (): ClinicNotificationSettings => ({
  email: {
    questionnaire_assigned: false,
    questionnaire_reminder: false,
    report_shared: false,
    chat_messages: false,
    patient_welcome: false,
    mobile_access: false,
  },
  push: {
    questionnaire: true,
    report_ready: true,
    chat_messages: true,
  },
});

export const EMAIL_ROWS: { key: keyof ClinicNotificationSettings['email']; label: string }[] =
  [
    { key: 'questionnaire_assigned', label: 'Questionnaire assigned' },
    { key: 'questionnaire_reminder', label: 'Questionnaire reminder' },
    { key: 'report_shared', label: 'Report shared with client' },
    { key: 'chat_messages', label: 'Coach chat message' },
    { key: 'patient_welcome', label: 'New patient welcome' },
    { key: 'mobile_access', label: 'Mobile app access' },
  ];

export const PUSH_ROWS: { key: keyof ClinicNotificationSettings['push']; label: string }[] =
  [
    { key: 'questionnaire', label: 'Questionnaire' },
    { key: 'report_ready', label: 'Report ready' },
    { key: 'chat_messages', label: 'Coach chat message' },
  ];

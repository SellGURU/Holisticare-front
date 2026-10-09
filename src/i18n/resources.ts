export const namespaces = [
  'common',
  'nav',
  'settings',
  'auth',
  'errors',
  'survey',
  'clinical',
  'reports',
  'plan',
  'chat',
  'notifications',
  'accessibility',
] as const;

export const englishResources = {
  common: {
    loading: 'Loading…',
    unavailable: 'Content unavailable',
    save: 'Save',
    cancel: 'Cancel',
    itemCount: '{count, plural, one {# item} other {# items}}',
  },
  nav: {
    dashboard: 'Dashboard',
    settings: 'Settings',
  },
  settings: {
    title: 'Settings',
    languageAndRegion: 'Language and region',
  },
  auth: {
    signIn: 'Sign in',
    signOut: 'Sign out',
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
  },
  survey: {
    title: 'Questionnaire',
  },
  clinical: {
    title: 'Clinical information',
  },
  reports: {
    title: 'Reports',
  },
  plan: {
    title: 'Plan',
  },
  chat: {
    title: 'Messages',
  },
  notifications: {
    title: 'Notifications',
  },
  accessibility: {
    languageChanged: 'Language changed to {language}.',
    closeDialog: 'Close dialog',
  },
} as const;

export type I18nNamespace = (typeof namespaces)[number];

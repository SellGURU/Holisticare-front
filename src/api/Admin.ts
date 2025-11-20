import Api from './api';

export function formatDateYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface VersionConfig {
  version: string;
  minimumSupportedVersion: string;
  maintenance: boolean;
}

export interface VersionControlData {
  web_main: VersionConfig;
  web_test: VersionConfig;
  ios: VersionConfig;
  android: VersionConfig;
  pwa: VersionConfig;
}

class Admin extends Api {
  static getClinics() {
    return this.get('/marketing/clinics');
  }
  static getLog(clinicId: string, startDate: string, endDate: string) {
    return this.post('/marketing/analytics', {
      clinic_email: clinicId,
      start_date: formatDateYMD(new Date(startDate)),
      end_date: formatDateYMD(new Date(endDate)),
    });
  }
  
  // Version Control APIs
  static getVersionControl() {
    return this.get('/config');
  }
  
  static saveVersionControl(data: VersionControlData) {
    return this.post('/config', { config_data: data });
  }
}

export default Admin;

import Api from './api';

export function formatDateYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
}

export default Admin;

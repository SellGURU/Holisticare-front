import Api from './api';

class Admin extends Api {
  static getClinics() {
    return this.get('/marketing/clinics');
  }
  static getLog(clinicId: string, startDate: string, endDate: string) {
    return this.post('/marketing/log', {
      clinic_email: clinicId,
      start_date: startDate,
      end_date: endDate,
    });
  }
}

export default Admin;

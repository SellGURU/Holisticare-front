import Api from './api';

class Admin extends Api {
  static getClinics() {
    return this.get('/marketing/clinics');
  }
}

export default Admin;

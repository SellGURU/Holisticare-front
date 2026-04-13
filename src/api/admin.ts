/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { resolveBaseEndPoint } from './base';
import { getAdminToken } from '../store/adminToken';

const baseUrl = resolveBaseEndPoint();

const withAuthHeaders = (contentType = 'application/json') => ({
  Authorization: `Bearer ${getAdminToken() || ''}`,
  'Content-Type': contentType,
});

class AdminApi {
  static login(username: string, password: string) {
    const data = new URLSearchParams();
    data.append('username', username);
    data.append('password', password);

    return axios.post(`${baseUrl}/admin/auth/token`, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  static checkAuth() {
    return axios.get(`${baseUrl}/admin/login-auth`, {
      headers: withAuthHeaders(),
    });
  }

  static logout() {
    return axios.post(
      `${baseUrl}/admin/auth/log_out`,
      {},
      {
        headers: withAuthHeaders(),
      },
    );
  }

  static getClinics() {
    return axios.get(`${baseUrl}/admin/marketing/clinics`, {
      headers: withAuthHeaders(),
    });
  }

  static getAnalytics(data: any) {
    return axios.post(`${baseUrl}/admin/marketing/analytics`, data, {
      headers: withAuthHeaders(),
    });
  }

  static getConfig() {
    return axios.get(`${baseUrl}/admin/config`, {
      headers: withAuthHeaders(),
    });
  }

  static getJsonManagerClinics() {
    return axios.post(
      `${baseUrl}/admin/custom_biomarker/clinics`,
      {},
      {
        headers: withAuthHeaders(),
      },
    );
  }

  static loadClinicJsonConfigs(data: any) {
    return axios.post(`${baseUrl}/admin/custom_biomarker/load_configs`, data, {
      headers: withAuthHeaders(),
    });
  }

  static saveClinicJsonConfig(data: any) {
    return axios.post(`${baseUrl}/admin/custom_biomarker/save_config`, data, {
      headers: withAuthHeaders(),
    });
  }

  static updateConfig(config_data: any) {
    return axios.post(
      `${baseUrl}/admin/config`,
      { config_data },
      {
        headers: withAuthHeaders(),
      },
    );
  }
}

export default AdminApi;

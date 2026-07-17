/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { resolveBaseEndPoint } from './base';
import { getAdminToken } from '../store/adminToken';

const getBaseUrl = () => resolveBaseEndPoint();

const withAuthHeaders = (contentType = 'application/json') => ({
  Authorization: `Bearer ${getAdminToken() || ''}`,
  'Content-Type': contentType,
});

class AdminApi {
  static login(username: string, password: string) {
    const data = new URLSearchParams();
    data.append('username', username);
    data.append('password', password);

    return axios.post(`${getBaseUrl()}/admin/auth/token`, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  static checkAuth() {
    return axios.get(`${getBaseUrl()}/admin/login-auth`, {
      headers: withAuthHeaders(),
    });
  }

  static logout() {
    return axios.post(
      `${getBaseUrl()}/admin/auth/log_out`,
      {},
      {
        headers: withAuthHeaders(),
      },
    );
  }

  static getClinics() {
    return axios.get(`${getBaseUrl()}/admin/marketing/clinics`, {
      headers: withAuthHeaders(),
    });
  }

  static listClinics() {
    return axios.get(`${getBaseUrl()}/admin/clinics`, {
      headers: withAuthHeaders(),
    });
  }

  static updateClinic(
    id: number,
    data: { plan_type?: 'demo' | 'paying'; is_disabled?: boolean },
  ) {
    return axios.patch(`${getBaseUrl()}/admin/clinics/${id}`, data, {
      headers: withAuthHeaders(),
    });
  }

  static getAnalytics(data: any) {
    return axios.post(`${getBaseUrl()}/admin/marketing/analytics`, data, {
      headers: withAuthHeaders(),
    });
  }

  static getConfig() {
    return axios.get(`${getBaseUrl()}/admin/config`, {
      headers: withAuthHeaders(),
    });
  }

  static getBackendErrors(params?: {
    limit?: number;
    search?: string;
    status_code?: number;
  }) {
    return axios.get(`${getBaseUrl()}/admin/logs/backend-errors`, {
      headers: withAuthHeaders(),
      params,
    });
  }

  static getLlmCalls(params?: {
    limit?: number;
    offset?: number;
    search?: string;
    status?: string;
    name?: string;
    clinic_id?: string;
    patient_id?: string;
    model?: string;
    date_from?: string;
    date_to?: string;
    category?: string;
    flow_id?: string;
    prompt_hash?: string;
    max_scan_bytes?: number;
    include_summary?: boolean;
  }) {
    return axios.get(`${getBaseUrl()}/admin/logs/llm-calls`, {
      headers: withAuthHeaders(),
      params,
    });
  }

  static getJsonManagerClinics() {
    return axios.post(
      `${getBaseUrl()}/admin/custom_biomarker/clinics`,
      {},
      {
        headers: withAuthHeaders(),
      },
    );
  }

  static loadClinicJsonConfigs(data: any) {
    return axios.post(
      `${getBaseUrl()}/admin/custom_biomarker/load_configs`,
      data,
      {
        headers: withAuthHeaders(),
      },
    );
  }

  static saveClinicJsonConfig(data: any) {
    return axios.post(
      `${getBaseUrl()}/admin/custom_biomarker/save_config`,
      data,
      {
        headers: withAuthHeaders(),
      },
    );
  }

  static updateConfig(config_data: any) {
    return axios.post(
      `${getBaseUrl()}/admin/config`,
      { config_data },
      {
        headers: withAuthHeaders(),
      },
    );
  }

  // ==========================================================================
  // LLM Prompt Catalog
  // ==========================================================================

  static listLlmPrompts(params?: {
    category?: string;
    owner_service?: string;
    search?: string;
    include_inactive?: boolean;
    only_active?: boolean;
  }) {
    return axios.get(`${getBaseUrl()}/admin/llm/prompts`, {
      headers: withAuthHeaders(),
      params,
    });
  }

  static getLlmAdminCapabilities() {
    return axios.get(`${getBaseUrl()}/admin/llm/prompts/_capabilities`, {
      headers: withAuthHeaders(),
    });
  }

  static getBusinessFlows() {
    return axios.get(`${getBaseUrl()}/admin/business-flows`, {
      headers: withAuthHeaders(),
    });
  }

  static getLlmPromptSnapshot(promptHash: string) {
    return axios.get(
      `${getBaseUrl()}/admin/llm/prompts/_snapshots/${encodeURIComponent(promptHash)}`,
      { headers: withAuthHeaders() },
    );
  }

  static getLlmPromptHistory(key: string, limit = 50) {
    return axios.get(
      `${getBaseUrl()}/admin/llm/prompts/${encodeURIComponent(key)}/history`,
      { headers: withAuthHeaders(), params: { limit } },
    );
  }

  static restoreLlmPrompt(key: string, historyId: number) {
    return axios.post(
      `${getBaseUrl()}/admin/llm/prompts/${encodeURIComponent(key)}/restore/${historyId}`,
      {},
      { headers: withAuthHeaders() },
    );
  }

  static getLlmPrompt(key: string) {
    return axios.get(
      `${getBaseUrl()}/admin/llm/prompts/${encodeURIComponent(key)}`,
      {
        headers: withAuthHeaders(),
      },
    );
  }

  static updateLlmPrompt(key: string, payload: any) {
    return axios.put(
      `${getBaseUrl()}/admin/llm/prompts/${encodeURIComponent(key)}`,
      payload,
      { headers: withAuthHeaders() },
    );
  }

  static toggleLlmPrompt(key: string, is_active: boolean) {
    return axios.post(
      `${getBaseUrl()}/admin/llm/prompts/${encodeURIComponent(key)}/toggle`,
      { is_active },
      { headers: withAuthHeaders() },
    );
  }

  static testLlmPrompt(key: string, payload: any) {
    return axios.post(
      `${getBaseUrl()}/admin/llm/prompts/${encodeURIComponent(key)}/test`,
      payload,
      { headers: withAuthHeaders() },
    );
  }

  static reseedLlmPrompts() {
    return axios.post(
      `${getBaseUrl()}/admin/llm/prompts/_reseed`,
      {},
      { headers: withAuthHeaders() },
    );
  }

  static invalidateLlmPromptCache(key?: string) {
    return axios.post(
      `${getBaseUrl()}/admin/llm/prompts/_invalidate`,
      key ? { key } : {},
      { headers: withAuthHeaders() },
    );
  }

  static getLlmPromptCacheStats() {
    return axios.get(`${getBaseUrl()}/admin/llm/prompts/_cache`, {
      headers: withAuthHeaders(),
    });
  }

  // ==========================================================================
  // ROOK CSV Comparison Tool (diagnostic, read-only)
  // ==========================================================================

  static compareRookCsv(formData: FormData) {
    return axios.post(`${getBaseUrl()}/admin/compare-rook-csv`, formData, {
      headers: {
        Authorization: `Bearer ${getAdminToken() || ''}`,
        // Content-Type intentionally omitted: axios sets the multipart
        // boundary itself when given a FormData body.
      },
    });
  }
}

export default AdminApi;

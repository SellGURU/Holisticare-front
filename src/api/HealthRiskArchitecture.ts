/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import Api from './api';
import { getTokenFromLocalStorage } from '../store/token';
import { resolveBaseEndPoint } from './base';

class HealthRiskArchitectureApi extends Api {
  static getClinicOptions() {
    return this.post('/health_risk/clinic_options', {});
  }

  static getDomains(domain_type?: string) {
    return this.post(
      '/health_risk/domains/list',
      domain_type ? { domain_type } : {},
    );
  }

  static importDefaults() {
    return this.post('/health_risk/domains/import_defaults', {});
  }

  static testSample(payload: {
    formula_code: string;
    domain_type?: string;
    biomarker_values?: Record<string, number>;
    profile?: Record<string, unknown>;
    context?: Record<string, unknown>;
    result_categories?: Array<{
      min: number;
      max: number;
      label: string;
      color?: string;
    }>;
  }) {
    return this.post('/health_risk/domains/test_sample', payload);
  }

  static createDomain(payload: any) {
    return this.post('/health_risk/domains', payload);
  }

  static updateDomain(id: string, payload: any) {
    return axios.put(
      resolveBaseEndPoint() + `/health_risk/domains/${id}`,
      payload,
      {
        headers: {
          Authorization: 'Bearer ' + getTokenFromLocalStorage(),
          'Content-Type': 'application/json',
        },
      },
    );
  }

  static deleteDomain(id: string) {
    return axios.delete(resolveBaseEndPoint() + `/health_risk/domains/${id}`, {
      headers: {
        Authorization: 'Bearer ' + getTokenFromLocalStorage(),
      },
    });
  }

  static validateFormula(
    formula_code: string,
    options?: { domain_type?: string; catalog_biomarker_uid?: string },
  ) {
    return this.post('/health_risk/domains/validate', {
      formula_code,
      domain_type: options?.domain_type,
      catalog_biomarker_uid: options?.catalog_biomarker_uid,
    });
  }

  static getCurrentAssessments(memberId: number) {
    return this.get(`/health_risk/patients/${memberId}/current`);
  }

  static calculateAssessments(memberId: number) {
    return this.post('/health_risk/calculate', { member_id: memberId });
  }

  static getFormulaLibrary() {
    return this.get('/health_risk/library');
  }

  static importFormulaLibrary(template_id: string, is_enabled = true) {
    return this.post('/health_risk/library/import', {
      template_id,
      is_enabled,
    });
  }
}

export default HealthRiskArchitectureApi;

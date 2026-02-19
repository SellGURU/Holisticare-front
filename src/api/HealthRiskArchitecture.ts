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

  static validateFormula(formula_code: string) {
    return this.post('/health_risk/domains/validate', { formula_code });
  }

  static getRiskScores(patientsId: number, reportId?: number) {
    const url =
      reportId != null
        ? `/health_risk/scores/${patientsId}?report_id=${reportId}`
        : `/health_risk/scores/${patientsId}`;
    return axios.get(resolveBaseEndPoint() + url, {
      headers: { Authorization: 'Bearer ' + getTokenFromLocalStorage() },
    });
  }

  /** Get risk score history by member_id for longitudinal / Progress tab. */
  static getRiskScoresByMember(memberId: number) {
    return axios.get(resolveBaseEndPoint() + `/health_risk/scores/by_member/${memberId}`, {
      headers: { Authorization: 'Bearer ' + getTokenFromLocalStorage() },
    });
  }

  /** Get risk scores with generic test data (male, 30yo). No patient required. */
  static getRiskScoresPreview() {
    return axios.get(resolveBaseEndPoint() + '/health_risk/scores/preview', {
      headers: { Authorization: 'Bearer ' + getTokenFromLocalStorage() },
    });
  }

  static getDomainsUsingBiomarker(biomarkerName: string) {
    return axios.get(
      resolveBaseEndPoint() +
        `/health_risk/domains/using_biomarker?biomarker_name=${encodeURIComponent(biomarkerName)}`,
      { headers: { Authorization: 'Bearer ' + getTokenFromLocalStorage() } },
    );
  }
}

export default HealthRiskArchitectureApi;

/* eslint-disable @typescript-eslint/no-explicit-any */
import AdminApi from '../../api/admin';
import BiomarkersApi from '../../api/Biomarkers';
import HealthRiskArchitectureApi from '../../api/HealthRiskArchitecture';
import type { ClinicBiomarkerOption, IntelligenceDomainType } from './types';

export type IntelligenceResponse<T = any> = { data: T };

export interface ValidateFormulaOptions {
  domain_type?: string;
  catalog_biomarker_uid?: string;
}

export interface IntelligenceApi {
  listDomains(
    domainType: IntelligenceDomainType,
  ): Promise<IntelligenceResponse<any[]>>;
  createDomain(payload: any): Promise<IntelligenceResponse>;
  updateDomain(id: string, payload: any): Promise<IntelligenceResponse>;
  deleteDomain(
    id: string,
    domainType?: IntelligenceDomainType,
  ): Promise<IntelligenceResponse>;
  validateFormula(
    formula_code: string,
    options?: ValidateFormulaOptions,
  ): Promise<IntelligenceResponse>;
  getFormulaLibrary(): Promise<IntelligenceResponse>;
  importFormulaLibrary(
    template_id: string,
    is_enabled?: boolean,
  ): Promise<IntelligenceResponse>;
  listCatalogBiomarkers(): Promise<ClinicBiomarkerOption[]>;
}

export function mapCatalogRows(rows: any[]): ClinicBiomarkerOption[] {
  const mapped = rows
    .map((item) => {
      const name = String(item?.Biomarker || item?.name || '').trim();
      if (!name) return null;
      const uid = String(item?.biomarker_uid || '').trim();
      return {
        biomarker_uid: uid || null,
        name,
        unit: item?.unit || '',
        benchmark_area: item?.['Benchmark areas'] || item?.benchmark_area || '',
        has_parametric: Boolean(item?.has_parametric),
        selectable: item?.selectable !== false,
        is_enabled: item?.is_enabled !== false,
      } as ClinicBiomarkerOption;
    })
    .filter(Boolean) as ClinicBiomarkerOption[];
  mapped.sort((a, b) => a.name.localeCompare(b.name));
  return mapped;
}

async function listClinicCatalogBiomarkers(): Promise<ClinicBiomarkerOption[]> {
  const res = await BiomarkersApi.getBiomarkersList({ include_all: true });
  const rows = Array.isArray(res.data)
    ? res.data
    : Array.isArray(res.data?.chart_bounds)
      ? res.data.chart_bounds
      : [];
  return mapCatalogRows(rows);
}

export function clinicIntelligenceApi(): IntelligenceApi {
  return {
    listDomains: (domainType) => HealthRiskArchitectureApi.getDomains(domainType),
    createDomain: (payload) => HealthRiskArchitectureApi.createDomain(payload),
    updateDomain: (id, payload) =>
      HealthRiskArchitectureApi.updateDomain(id, payload),
    deleteDomain: (id) => HealthRiskArchitectureApi.deleteDomain(id),
    validateFormula: (formula_code, options) =>
      HealthRiskArchitectureApi.validateFormula(formula_code, options),
    getFormulaLibrary: () => HealthRiskArchitectureApi.getFormulaLibrary(),
    importFormulaLibrary: (template_id, is_enabled = true) =>
      HealthRiskArchitectureApi.importFormulaLibrary(template_id, is_enabled),
    listCatalogBiomarkers: listClinicCatalogBiomarkers,
  };
}

export function adminIntelligenceApi(clinicId: number): IntelligenceApi {
  return {
    listDomains: (domainType) =>
      AdminApi.listIntelligenceDomains(clinicId, domainType),
    createDomain: (payload) =>
      AdminApi.createIntelligenceDomain(clinicId, payload),
    updateDomain: (id, payload) =>
      AdminApi.updateIntelligenceDomain(clinicId, id, payload),
    deleteDomain: (id, domainType) =>
      AdminApi.deleteIntelligenceDomain(clinicId, id, domainType),
    validateFormula: (formula_code, options) =>
      AdminApi.validateIntelligenceFormula(clinicId, {
        formula_code,
        domain_type: options?.domain_type,
        catalog_biomarker_uid: options?.catalog_biomarker_uid,
      }),
    getFormulaLibrary: () => AdminApi.getIntelligenceLibrary(clinicId),
    importFormulaLibrary: (template_id, is_enabled = true) =>
      AdminApi.importIntelligenceLibrary(clinicId, template_id, is_enabled),
    listCatalogBiomarkers: async () => {
      const res = await AdminApi.getIntelligenceClinicOptions(clinicId);
      return mapCatalogRows(
        Array.isArray(res.data?.biomarkers) ? res.data.biomarkers : [],
      );
    },
  };
}

let defaultIntelligenceApi: IntelligenceApi = clinicIntelligenceApi();

export function getDefaultIntelligenceApi(): IntelligenceApi {
  return defaultIntelligenceApi;
}

export function setDefaultIntelligenceApi(api: IntelligenceApi): void {
  defaultIntelligenceApi = api;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import AdminApi from '../../api/admin';
import BiomarkersApi from '../../api/Biomarkers';
import HealthRiskArchitectureApi from '../../api/HealthRiskArchitecture';
import type {
  ClinicBiomarkerOption,
  IntelligenceDomainType,
  IntelligenceFormulaOptions,
} from './types';

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
  listFormulaOptions?(): Promise<IntelligenceFormulaOptions>;
}

function unwrapFormulaPayload(raw: any): any {
  if (!raw || typeof raw !== 'object') return {};
  if (raw.formula_options || Array.isArray(raw.questionnaires)) return raw;
  if (raw.data && typeof raw.data === 'object') {
    return unwrapFormulaPayload(raw.data);
  }
  return raw;
}

export function mapFormulaOptions(raw: any): IntelligenceFormulaOptions {
  const root = unwrapFormulaPayload(raw);
  const options = root?.formula_options || root || {};
  const capability = root?.capability || options.capability || {};
  const questionnaires = Array.isArray(options.questionnaires)
    ? options.questionnaires
    : [];
  const profile = Array.isArray(options.profile) ? options.profile : [];
  return {
    multiSourceEnabled: capability.multi_source_formulas === true,
    profile: profile.map((item: any) => ({
      token: String(item?.token || 'age'),
      label: item?.label || 'Age',
      unit: item?.unit || 'years',
    })),
    questionnaires: questionnaires.map((item: any) => ({
      token: String(item?.token || ''),
      form_unique_id: item?.form_unique_id,
      question_id: item?.question_id,
      form_title: item?.form_title || '',
      question_label: item?.question_label || item?.token || '',
      value_type: item?.value_type || 'string',
      stale: Boolean(item?.stale),
    })).filter((item: { token: string }) => item.token),
  };
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
    listFormulaOptions: async () => {
      const res = await HealthRiskArchitectureApi.getClinicOptions();
      return mapFormulaOptions(res.data);
    },
  };
}

export function adminDefaultIntelligenceApi(): IntelligenceApi {
  return {
    listDomains: (domainType) => AdminApi.listIntelligenceDefaults(domainType),
    createDomain: (payload) => AdminApi.createIntelligenceDefault(payload),
    updateDomain: (id, payload) => AdminApi.updateIntelligenceDefault(id, payload),
    deleteDomain: (id, domainType) =>
      AdminApi.deleteIntelligenceDefault(id, domainType),
    validateFormula: (formula_code, options) =>
      AdminApi.validateIntelligenceDefault({
        formula_code,
        domain_type: options?.domain_type,
        catalog_biomarker_uid: options?.catalog_biomarker_uid,
      }),
    getFormulaLibrary: () => AdminApi.getIntelligenceDefaultLibrary(),
    importFormulaLibrary: (template_id, is_enabled = true) =>
      AdminApi.importIntelligenceDefaultLibrary(template_id, is_enabled),
    listCatalogBiomarkers: async () => {
      const res = await AdminApi.getIntelligenceDefaultOptions();
      return mapCatalogRows(
        Array.isArray(res.data?.biomarkers) ? res.data.biomarkers : [],
      );
    },
    listFormulaOptions: async () => {
      const res = await AdminApi.getIntelligenceDefaultOptions();
      return mapFormulaOptions(res.data);
    },
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
    listFormulaOptions: async () => {
      const res = await AdminApi.getIntelligenceClinicOptions(clinicId);
      return mapFormulaOptions(res.data);
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

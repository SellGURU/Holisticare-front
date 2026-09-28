import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminApi from '../../api/admin';
import {
  adminIntelligenceApi,
  clinicIntelligenceApi,
  mapCatalogRows,
  mapFormulaOptions,
} from './intelligenceApi';
import { mapHealthRiskDomain } from './types';

vi.mock('../../api/admin', () => ({
  default: {
    listIntelligenceDomains: vi.fn(),
    createIntelligenceDomain: vi.fn(),
    updateIntelligenceDomain: vi.fn(),
    deleteIntelligenceDomain: vi.fn(),
    validateIntelligenceFormula: vi.fn(),
    getIntelligenceLibrary: vi.fn(),
    importIntelligenceLibrary: vi.fn(),
    getIntelligenceClinicOptions: vi.fn(),
  },
}));

vi.mock('../../api/HealthRiskArchitecture', () => ({
  default: {
    getDomains: vi.fn(),
    createDomain: vi.fn(),
    updateDomain: vi.fn(),
    deleteDomain: vi.fn(),
    validateFormula: vi.fn(),
    getFormulaLibrary: vi.fn(),
    importFormulaLibrary: vi.fn(),
    getClinicOptions: vi.fn(),
  },
}));

vi.mock('../../api/Biomarkers', () => ({
  default: {
    getBiomarkersList: vi.fn(),
  },
}));

describe('mapHealthRiskDomain', () => {
  it('maps questionnaire dependencies additively', () => {
    const row = mapHealthRiskDomain({
      id: '1',
      name: 'Mixed',
      display_name: 'Mixed Score',
      domain_type: 'SCORING',
      output_type: 'NUMERIC',
      formula_code: 'Biomarker.LDL + Questionnaire.q_smoke__form1',
      biomarker_dependencies: ['LDL'],
      questionnaire_dependencies: ['q_smoke__form1'],
      profile_dependencies: ['age'],
      result_categories: [],
      is_enabled: true,
    });
    expect(row.biomarkers).toEqual(['LDL']);
    expect(row.questionnaireDeps).toEqual(['q_smoke__form1']);
    expect(row.profileDeps).toEqual(['age']);
  });
});

describe('mapCatalogRows', () => {
  it('maps clinic catalog rows and skips nameless items', () => {
    const rows = mapCatalogRows([
      { Biomarker: 'Hb A1c', biomarker_uid: 'u1', unit: '%' },
      { name: '', biomarker_uid: 'skip' },
      { name: 'Glucose', biomarker_uid: 'u2', benchmark_area: 'Metabolic' },
    ]);
    expect(rows.map((row) => row.name)).toEqual(['Glucose', 'Hb A1c']);
    expect(rows[1].biomarker_uid).toBe('u1');
  });
});

describe('adminIntelligenceApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('scopes every call to the selected clinic', async () => {
    const api = adminIntelligenceApi(42);
    await api.listDomains('RISK');
    await api.createDomain({ domain_type: 'RISK' });
    await api.updateDomain('d1', { is_enabled: false, domain_type: 'AGING' });
    await api.deleteDomain('d1', 'AGING');
    await api.validateFormula('1+1', { domain_type: 'SCORING' });
    await api.getFormulaLibrary();
    await api.importFormulaLibrary('risk.cardiovascular');

    expect(AdminApi.listIntelligenceDomains).toHaveBeenCalledWith(42, 'RISK');
    expect(AdminApi.createIntelligenceDomain).toHaveBeenCalledWith(42, {
      domain_type: 'RISK',
    });
    expect(AdminApi.updateIntelligenceDomain).toHaveBeenCalledWith(42, 'd1', {
      is_enabled: false,
      domain_type: 'AGING',
    });
    expect(AdminApi.deleteIntelligenceDomain).toHaveBeenCalledWith(
      42,
      'd1',
      'AGING',
    );
    expect(AdminApi.validateIntelligenceFormula).toHaveBeenCalledWith(42, {
      formula_code: '1+1',
      domain_type: 'SCORING',
      catalog_biomarker_uid: undefined,
    });
    expect(AdminApi.getIntelligenceLibrary).toHaveBeenCalledWith(42);
    expect(AdminApi.importIntelligenceLibrary).toHaveBeenCalledWith(
      42,
      'risk.cardiovascular',
      true,
    );
  });

  it('does not reuse clinic id across adapters', async () => {
    const first = adminIntelligenceApi(1);
    const second = adminIntelligenceApi(2);
    await first.listDomains('RISK');
    await second.listDomains('SCORING');
    expect(AdminApi.listIntelligenceDomains).toHaveBeenNthCalledWith(1, 1, 'RISK');
    expect(AdminApi.listIntelligenceDomains).toHaveBeenNthCalledWith(
      2,
      2,
      'SCORING',
    );
  });
});

describe('mapFormulaOptions', () => {
  it('defaults to biomarker-only when capability is missing', () => {
    const options = mapFormulaOptions({ biomarkers: [{ name: 'LDL' }] });
    expect(options.multiSourceEnabled).toBe(false);
    expect(options.questionnaires).toEqual([]);
  });

  it('maps questionnaire registry rows', () => {
    const options = mapFormulaOptions({
      capability: { multi_source_formulas: true },
      formula_options: {
        questionnaires: [
          {
            token: 'q_smoke__form1',
            form_title: 'Intake',
            question_label: 'Smoking',
            value_type: 'string',
          },
        ],
      },
    });
    expect(options.multiSourceEnabled).toBe(true);
    expect(options.questionnaires[0].token).toBe('q_smoke__form1');
  });

  it('unwraps nested axios data.formula_options', () => {
    const options = mapFormulaOptions({
      data: {
        capability: { multi_source_formulas: true },
        formula_options: {
          questionnaires: [{ token: 'q_drink__form2', question_label: 'Drink?' }],
        },
      },
    });
    expect(options.questionnaires[0].token).toBe('q_drink__form2');
  });
});

describe('clinicIntelligenceApi', () => {
  it('exposes the clinic-session contract', () => {
    const api = clinicIntelligenceApi();
    expect(typeof api.listDomains).toBe('function');
    expect(typeof api.listCatalogBiomarkers).toBe('function');
    expect(typeof api.listFormulaOptions).toBe('function');
  });
});

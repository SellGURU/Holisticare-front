/* eslint-disable @typescript-eslint/no-explicit-any */
import Api from './api';

class BiomarkersApi extends Api {
  static getJsonManagerClinics = () => {
    return this.post('/custom_biomarker/admin/clinics', {});
  };

  static loadClinicJsonConfigs = (data: any) => {
    return this.post('/custom_biomarker/admin/load_configs', data);
  };

  static saveClinicJsonConfig = (data: any) => {
    return this.post('/custom_biomarker/admin/save_config', data);
  };

  static getBiomarkersList = (data: { include_all?: boolean } = {}) => {
    return this.post('/custom_biomarker/chart_bounds', data);
  };

  static getBiomarkerTypes = () => {
    return this.post('/custom_biomarker/biomarker_types', {});
  };

  static saveBiomarkersList = (data: any) => {
    return this.post('/custom_biomarker/update_chart_bounds', data);
  };

  static addBiomarkersList = (data: any) => {
    return this.post('/custom_biomarker/add_biomarker', data, {
      timeout: 180000,
    });
  };

  static deleteBiomarker = (data: {
    original_biomarker_name?: string;
    original_biomarker_index?: number;
    original_biomarker_uid?: string;
    original_biomarker_type?: string;
    original_unit?: string;
    original_benchmark_area?: string;
  }) => {
    return this.post('/custom_biomarker/delete_biomarker', data);
  };

  static getUnitMapping = () => {
    return this.post('/custom_biomarker/unit_mapping', {});
  };

  static updateUnitMapping = (data: any) => {
    return this.post('/custom_biomarker/update_unit_mapping', data);
  };

  static getBiomarkerMapping = () => {
    return this.post('/custom_biomarker/biomarker_mapping', {});
  };

  static updateBiomarkerMapping = (data: any) => {
    return this.post('/custom_biomarker/update_biomarker_mapping', data);
  };
}

export default BiomarkersApi;

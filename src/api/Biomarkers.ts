/* eslint-disable @typescript-eslint/no-explicit-any */
import Api from './api';

class BiomarkersApi extends Api {
  static getBiomarkersList = () => {
    return this.post('/custom_biomarker/chart_bounds', {});
  };

  static saveBiomarkersList = (data: any) => {
    return this.post('/custom_biomarker/update_chart_bounds', data);
  };

  static addBiomarkersList = (data: any) => {
    return this.post('/custom_biomarker/add_biomarker', data);
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

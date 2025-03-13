/* eslint-disable @typescript-eslint/no-explicit-any */
import Api from './api';

class BiomarkersApi extends Api {
  static getBiomarkersList = () => {
    return this.post('/custom_biomarker/chart_bounds', {});
  };

  static saveBiomarkersList = (data: any) => {
    return this.post('/custom_biomarker/update_chart_bounds', data);
  };
}

export default BiomarkersApi;

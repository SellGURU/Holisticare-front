/* eslint-disable @typescript-eslint/no-explicit-any */
import Api from './api';

class BiomarkersApi extends Api {
  static getBiomarkersList = () => {
    return this.post('/custom_biomarker/chart_bounds', {});
  };
}

export default BiomarkersApi;

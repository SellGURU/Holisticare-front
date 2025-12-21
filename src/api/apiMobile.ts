import Api from './api';
import { resolveBaseEndPoint } from './base';

class ApiMobile extends Api {
  protected static base_url: string = resolveBaseEndPoint() + '/mobile';
}

export default ApiMobile;

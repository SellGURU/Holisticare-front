import Api from './api';
import { resolveBaseEndPoint } from './base';

class ApiMobile extends Api {
  protected static get base_url(): string {
    return `${resolveBaseEndPoint()}/mobile`;
  }
}

export default ApiMobile;

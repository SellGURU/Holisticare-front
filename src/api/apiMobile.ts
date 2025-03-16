import Api from './api';

class ApiMobile extends Api {
  protected static base_url: string =
    'https://vercel-backend-one-roan.vercel.app/holisticare/mobile';
}

export default ApiMobile;

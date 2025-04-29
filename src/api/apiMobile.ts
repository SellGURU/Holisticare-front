import Api from './api';

class ApiMobile extends Api {
  protected static base_url: string =
    'https://vercel-backend-one-roan.vercel.app/holisticare/mobile';
  // 'https://vercel-backend-one-roan.vercel.app/holisticare_test/mobile';
}

export default ApiMobile;

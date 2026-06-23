/* eslint-disable prefer-const */
// test address
const baseProductEndPoint =
  'https://vercel-backend-one-roan.vercel.app/holisticare';

const baseTestEndPoint =
  'https://vercel-backend-one-roan.vercel.app/holisticare_test';

const defaultLocalApiUrl = 'http://127.0.0.1:3800';

const baseLocalEndpoint =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
  defaultLocalApiUrl;

const baseProductUrl = 'https://holisticare.vercel.app';

const baseTestUrl = 'https://holisticare-develop.vercel.app';

let env: 'test' | 'production' | 'local' = 'test';

const resolveBaseEndPoint = () => {
  if (env == 'local') {
    return baseLocalEndpoint;
  }

  if (env == 'test') {
    return baseTestEndPoint;
  }

  return baseProductEndPoint;
};

const resolveBaseUrl = () => {
  if (env === 'test') {
    return baseTestUrl;
  }

  return baseProductUrl;
};

export { resolveBaseEndPoint, resolveBaseUrl, env };

/* eslint-disable prefer-const */

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

type AppEnv = 'local' | 'test' | 'production';

const parseAppEnv = (value: string | undefined): AppEnv => {
  if (value === 'test' || value === 'production' || value === 'local') {
    return value;
  }
  return 'production';
};

const env: AppEnv = parseAppEnv(import.meta.env.VITE_ENV);

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

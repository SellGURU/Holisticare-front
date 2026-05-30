/* eslint-disable prefer-const */
const baseProductEndPoint =
  'https://vercel-backend-one-roan.vercel.app/holisticare';
/*const baseTestEndPoint =
  'https://vercel-backend-one-roan.vercel.app/holisticare_test';*/
const baseProductUrl = 'https://holisticare.vercel.app';
const defaultTestApiUrl = 'http://127.0.0.1:3901'
  // ? '/api'
  // : 'http://20.254.199.21:3901';
const baseTestUrl =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
  defaultTestApiUrl;
const baseTestEndPoint = baseTestUrl;

let env: 'test' | 'production' = 'test';

const resolveBaseEndPoint = () => {
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

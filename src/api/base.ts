/* eslint-disable prefer-const */
const baseProductEndPoint =
  'https://vercel-backend-one-roan.vercel.app/holisticare';
const baseTestEndPoint =
  'https://vercel-backend-one-roan.vercel.app/holisticare_test';
const baseProductUrl = 'https://holisticare.vercel.app';
const baseTestUrl = 'https://holisticare-develop.vercel.app';
let env: 'test' | 'production' = 'production';

const resolveBaseEndPoint = () => {
  if (env == 'production') {
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

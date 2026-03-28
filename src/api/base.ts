/* eslint-disable prefer-const */
const baseProductEndPoint =
  'https://vercel-backend-one-roan.vercel.app/holisticare';
/*const baseTestEndPoint =
  'https://vercel-backend-one-roan.vercel.app/holisticare_test';*/
const baseProductUrl = 'https://holisticare.vercel.app';
const baseTestUrl = 'http://20.254.199.21:3901';
const baseTestEndPoint = 'http://20.254.199.21:3901';

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

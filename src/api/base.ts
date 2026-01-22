/* eslint-disable prefer-const */
// const baseProductEndPoint =
//   'https://vercel-backend-one-roan.vercel.app/holisticare';
// const baseTestEndPoint =
//   'https://vercel-backend-one-roan.vercel.app/holisticare_test';
const baseProductUrl = 'https://holisticare.vercel.app';
const baseTestUrl = 'https://holisticare-develop.vercel.app';
let env: 'test' | 'production' = 'test';

const resolveBaseEndPoint = () => {
  // For local development, uncomment the line below:
  return 'http://localhost:8000';
  
  // Production/test endpoints (commented for local dev):
  // if (env == 'test') {
  //   return baseTestEndPoint;
  // }
  // return baseProductEndPoint;
};
const resolveBaseUrl = () => {
  if (env === 'test') {
    return baseTestUrl;
  }
  return baseProductUrl;
};

export { resolveBaseEndPoint, resolveBaseUrl, env };

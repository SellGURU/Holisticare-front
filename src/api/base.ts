/* eslint-disable prefer-const */

const baseProductEndPoint =
  'https://vercel-backend-one-roan.vercel.app/holisticare';

const baseTestEndPoint =
  'https://vercel-backend-one-roan.vercel.app/holisticare_test';

// In dev, use the Vite proxy (/api → 127.0.0.1:3902) so requests work when the
// UI is opened via a network IP (e.g. http://20.254.199.21:5173). Direct loopback
// calls from a non-secure public origin are blocked by the browser.
const defaultLocalApiUrl = import.meta.env.DEV
  ? '/api'
  : 'http://127.0.0.1:3902';

const baseLocalEndpoint =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
  defaultLocalApiUrl;

const baseProductUrl = 'https://holisticare.vercel.app';

const baseTestUrl = 'https://holisticare-develop.vercel.app';

let env: 'test' | 'production' | 'local' = import.meta.env.DEV
  ? 'local'
  : 'production';

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

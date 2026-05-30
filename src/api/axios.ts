/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import ActivityLogger from '../utils/activty-logger';
import { toast } from 'react-toastify';
import { showError, showSuccess } from '../Components/GlobalToast';

const logger = ActivityLogger.getInstance();

// ✅ Record start time for performance tracking
axios.interceptors.request.use((config) => {
  (config as any).metadata = { startTime: new Date() };
  return config;
});
import Auth from './auth';

// Function to check health endpoint before redirecting to maintenance
const checkHealthAndRedirect = async () => {
  try {
    const response = await Auth.helth();
    // If health check returns 200, don't redirect to maintenance
    if (response.status === 200) {
      return;
    }
  } catch {
    // If health check fails, redirect to maintenance
    console.log('Health check failed, redirecting to maintenance');
  }

  // Redirect to maintenance page
  window.location.href = '/maintenance';
};

axios.interceptors.response.use(
  (response) => {
    // 🔹 Keep your existing toast + logic
    if (response.status === 200 || response.status === 206) toast.dismiss();

    if (response.data.detail && response.status !== 206) {
      if (response.data.detail.toLowerCase().includes('successfully')) {
        showSuccess(response.data.detail);
      } else {
        showError(response.data.detail);
      }
    }

    if (response.status === 401 || response.data.detail === 'Invalid token.') {
      localStorage.clear();
      window.location.reload();
    }

    if (
      response.data.detail &&
      response.data.notif !== true &&
      response.data.detail !== 'Invalid token.' &&
      response.data.detail !== 'Not Found' &&
      response.status !== 206
    ) {
      showError(response.data.detail);
    }

    if (response.data && response.data.detail && response.status !== 206) {
      return Promise.reject(new Error(response.data.detail));
    }

    return response;
  },
  (error) => {
    const config = error.config || {};
    const backendDetail = error.response?.data?.detail;
    const backendCode =
      error.response?.data?.code ||
      (typeof backendDetail === 'object' ? backendDetail?.code : undefined);
    const backendMessage =
      typeof backendDetail === 'object' ? backendDetail?.detail : backendDetail;
    const start =
      (config as any).metadata?.startTime?.getTime?.() || Date.now();
    const duration = new Date().getTime() - start;

    // ✅ Log only *failed* API calls
    logger.logApiEvent({
      endpoint: config.url || 'unknown',
      method: config.method?.toUpperCase() || 'GET',
      status: error.response?.status || 0,
      message:
        backendMessage ||
        error.message ||
        'Unknown network error',
      durationMs: duration,
      route: window.location.pathname,
      payload: config.data,
    });

    // 🔹 Handle 500 / network errors → maintenance redirect
    if (
      (error.response?.status === 500 || error.message === 'Network Error') &&
      !window.location.href.includes('/maintenance')
    ) {
      // Check health endpoint before redirecting to maintenance
      checkHealthAndRedirect();
      return Promise.reject(error);
    }

    // 🔹 Handle invalid tokens (don't reload on html-previewer – public report may still load)
    if (
      (error.response?.status === 401 &&
        !window.location.href.includes('/login') &&
        !window.location.href.includes('/register') &&
        !window.location.href.includes('/share') &&
        !window.location.href.includes('/forgetPassword') &&
        !window.location.href.includes('/html-previewer')) ||
      error.response?.data?.detail === 'Invalid token.'
    ) {
      localStorage.clear();
      window.location.reload();
    }

    // 🔹 Network error handling
    if (error.code === 'ERR_NETWORK') {
      return Promise.reject(error.message);
    }

    if (error.response?.status === 403 && backendCode === 'DEMO_RESTRICTED') {
      showError(
        backendMessage ||
          'Your clinic is on the Demo plan. Upgrade to access this feature.',
      );
      return Promise.reject({
        ...error.response.data,
        detail:
          backendMessage ||
          'Your clinic is on the Demo plan. Upgrade to access this feature.',
        code: 'DEMO_RESTRICTED',
      });
    }

    // 🔹 Toast for backend messages
    if (
      backendMessage &&
      error.response?.status !== 406 &&
      !String(backendMessage).toLowerCase().includes('google')
    ) {
      if (String(backendMessage).toLowerCase().includes('successfully')) {
        showSuccess(backendMessage);
      } else {
        showError(backendMessage);
      }
    }

    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }

    return Promise.reject(error.message);
  },
);

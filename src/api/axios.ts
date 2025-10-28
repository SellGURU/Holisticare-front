import axios from 'axios';
import { toast } from 'react-toastify';
import ActivityLogger from '../utils/activty-logger';

const logger = ActivityLogger.getInstance();

// ✅ Record start time for performance tracking
axios.interceptors.request.use((config) => {
  (config as any).metadata = { startTime: new Date() };
  return config;
});

axios.interceptors.response.use(
  (response) => {
    // 🔹 Keep your existing toast + logic
    if (response.status === 200 || response.status === 206) toast.dismiss();

    if (response.data.detail && response.status !== 206) {
      if (response.data.detail.toLowerCase().includes('successfully')) {
        toast.success(response.data.detail);
      } else {
        toast.error(response.data.detail);
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
      toast.error(response.data.detail);
    }

    if (response.data && response.data.detail && response.status !== 206) {
      return Promise.reject(new Error(response.data.detail));
    }

    return response;
  },
  (error) => {
    const config = error.config || {};
    const start = (config as any).metadata?.startTime?.getTime?.() || Date.now();
    const duration = new Date().getTime() - start;

    // ✅ Log only *failed* API calls
    logger.logApiEvent({
      endpoint: config.url || 'unknown',
      method: config.method?.toUpperCase() || 'GET',
      status: error.response?.status || 0,
      message:
        error.response?.data?.detail ||
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
      window.location.href = '/maintenance';
      return Promise.reject(error);
    }

    // 🔹 Handle invalid tokens
    if (
      (error.response?.status === 401 &&
        !window.location.href.includes('/login') &&
        !window.location.href.includes('/register') &&
        !window.location.href.includes('/share') &&
        !window.location.href.includes('/forgetPassword')) ||
      error.response?.data?.detail === 'Invalid token.'
    ) {
      localStorage.clear();
      window.location.reload();
    }

    // 🔹 Network error handling
    if (error.code === 'ERR_NETWORK') {
      return Promise.reject(error.message);
    }

    // 🔹 Toast for backend messages
    if (
      error.response?.data?.detail &&
      error.response?.status !== 406 &&
      !error.response.data.detail.toLowerCase().includes('google')
    ) {
      if (error.response.data.detail.toLowerCase().includes('successfully')) {
        toast.success(error.response.data.detail);
      } else {
        toast.error(error.response.data.detail);
      }
    }

    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }

    return Promise.reject(error.message);
  },
);

/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import ActivityLogger from '../utils/activty-logger';
import { toast } from 'react-toastify';
import { showError, showSuccess } from '../Components/GlobalToast';
import Auth from './auth';

const logger = ActivityLogger.getInstance();

const MAINTENANCE_FAILURE_THRESHOLD = 2;
const MAINTENANCE_FAILURE_WINDOW_MS = 10000;

let healthFailureCount = 0;
let healthFailureWindowStart = 0;
let maintenanceCheckInFlight = false;

const SERVER_DOWN_STATUSES = new Set([500, 502, 503, 504]);

const isHealthCheckRequest = (config: any) =>
  Boolean(config?.holisticareHealthCheck);

const isCanceledRequest = (error: any) =>
  error.code === 'ERR_CANCELED' ||
  error.name === 'CanceledError' ||
  error.message === 'canceled';

const isPotentialServerOutage = (error: any) => {
  if (isHealthCheckRequest(error.config)) {
    return false;
  }
  if (isCanceledRequest(error)) {
    return false;
  }
  const status = error.response?.status;
  if (status && SERVER_DOWN_STATUSES.has(status)) {
    return true;
  }
  return (
    error.message === 'Network Error' || error.code === 'ERR_NETWORK'
  );
};

const resetHealthFailureCount = () => {
  healthFailureCount = 0;
  healthFailureWindowStart = 0;
};

const recordHealthFailure = () => {
  const now = Date.now();
  if (
    healthFailureWindowStart === 0 ||
    now - healthFailureWindowStart > MAINTENANCE_FAILURE_WINDOW_MS
  ) {
    healthFailureWindowStart = now;
    healthFailureCount = 1;
    return false;
  }

  healthFailureCount += 1;
  return healthFailureCount >= MAINTENANCE_FAILURE_THRESHOLD;
};

const checkHealthAndRedirect = async () => {
  if (
    window.location.href.includes('/maintenance') ||
    maintenanceCheckInFlight
  ) {
    return;
  }

  maintenanceCheckInFlight = true;
  try {
    const response = await Auth.helthNoAuth();
    if (response.status === 200 && response.data) {
      resetHealthFailureCount();
      return;
    }
  } catch {
    // Server may be down; count consecutive failures below.
  } finally {
    maintenanceCheckInFlight = false;
  }

  if (recordHealthFailure()) {
    console.log(
      'Health check failed repeatedly, redirecting to maintenance',
    );
    window.location.href = '/maintenance';
  }
};

axios.interceptors.request.use((config) => {
  (config as any).metadata = { startTime: new Date() };
  return config;
});

axios.interceptors.response.use(
  (response) => {
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

    logger.logApiEvent({
      endpoint: config.url || 'unknown',
      method: config.method?.toUpperCase() || 'GET',
      status: error.response?.status || 0,
      message: backendMessage || error.message || 'Unknown network error',
      durationMs: duration,
      route: window.location.pathname,
      payload: config.data,
    });

    if (
      isPotentialServerOutage(error) &&
      !window.location.href.includes('/maintenance')
    ) {
      void checkHealthAndRedirect();
      return Promise.reject(error);
    }

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

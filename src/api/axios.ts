/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import ActivityLogger from '../utils/activty-logger';
import { toast } from 'react-toastify';
import { showError, showSuccess, showWarning } from '../Components/GlobalToast';
import Auth from './auth';
import {
  isAxiosNetworkError,
  isBrowserOffline,
  isCanceledRequest,
  isServerHttpError,
} from '../utils/networkStatus';

const logger = ActivityLogger.getInstance();

const MAINTENANCE_FAILURE_THRESHOLD = 2;
const MAINTENANCE_FAILURE_WINDOW_MS = 10000;

let healthFailureCount = 0;
let healthFailureWindowStart = 0;
let maintenanceCheckInFlight = false;
let lastNetworkWarningAt = 0;

const LAB_UPLOAD_ENDPOINTS = [
  '/patients/check_lab_report_step_one',
  '/patients/check_lab_report_step_two',
  '/patients/process_lab_report',
  '/patients/validate_biomarkers',
];

const isHealthCheckRequest = (config: any) =>
  Boolean(config?.holisticareHealthCheck);

const isLabUploadRequest = (config: any) => {
  const url = String(config?.url || '');
  return LAB_UPLOAD_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

const shouldCheckServerHealth = (error: any) => {
  if (isHealthCheckRequest(error.config)) {
    return false;
  }
  if (isCanceledRequest(error)) {
    return false;
  }
  if (isBrowserOffline()) {
    return false;
  }

  const status = error.response?.status;
  if (status && isServerHttpError(status)) {
    if (isLabUploadRequest(error.config)) {
      return false;
    }
    return true;
  }

  return isAxiosNetworkError(error);
};

const resetHealthFailureCount = () => {
  healthFailureCount = 0;
  healthFailureWindowStart = 0;
};

const isPatientNotFoundMessage = (message: unknown) =>
  String(message || '')
    .trim()
    .toLowerCase() === 'no such patient was found.';

const handlePatientNotFound = () => {
  // Normalize this common backend response without globally moving the user or
  // showing a misleading toast. Individual screens decide whether this means
  // "empty widget", "show retry", or "not found".
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

const maybeShowNetworkWarning = () => {
  const now = Date.now();
  if (now - lastNetworkWarningAt < 10000) {
    return;
  }
  lastNetworkWarningAt = now;
  showWarning(
    'Connection problem',
    'Please check your internet connection and try again.',
  );
};

const checkHealthAndRedirect = async () => {
  if (
    window.location.href.includes('/maintenance') ||
    maintenanceCheckInFlight ||
    isBrowserOffline()
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
    console.log('Health check failed repeatedly, redirecting to maintenance');
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

    if (isBrowserOffline() && isAxiosNetworkError(error)) {
      return Promise.reject(error.message || 'Network Error');
    }

    if (
      shouldCheckServerHealth(error) &&
      !window.location.href.includes('/maintenance')
    ) {
      if (isAxiosNetworkError(error)) {
        maybeShowNetworkWarning();
      }
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
      error.response?.status === 406 &&
      isPatientNotFoundMessage(backendMessage)
    ) {
      handlePatientNotFound();
      return Promise.reject({
        ...error.response.data,
        detail: backendMessage,
        code: 'PATIENT_NOT_FOUND',
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

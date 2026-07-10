/* eslint-disable @typescript-eslint/no-explicit-any */

export const FATAL_APP_ERROR_EVENT = 'holisticare:fatal-app-error';

export const SERVER_DOWN_STATUSES = new Set([500, 502, 503, 504]);

export const isBrowserOffline = () =>
  typeof navigator !== 'undefined' && !navigator.onLine;

export const isAxiosNetworkError = (error: any) =>
  error?.code === 'ERR_NETWORK' || error?.message === 'Network Error';

export const isCanceledRequest = (error: any) =>
  error?.code === 'ERR_CANCELED' ||
  error?.name === 'CanceledError' ||
  error?.message === 'canceled';

export const isServerHttpError = (status?: number) =>
  status != null && SERVER_DOWN_STATUSES.has(status);

export const isAxiosError = (error: any) => Boolean(error?.isAxiosError);

export const isOfflineError = (error: any) =>
  isAxiosNetworkError(error) && isBrowserOffline();

export const isFilteredUnhandledRejection = (reason: any) => {
  if (reason == null) return true;
  if (isCanceledRequest(reason)) return true;
  if (isAxiosError(reason)) return true;
  if (isAxiosNetworkError(reason)) return true;
  if (typeof reason === 'string') {
    if (reason === 'Network Error' || reason === 'canceled') return true;
    // Business-logic rejections from axios interceptors.
    if (reason.length > 0 && reason.length < 300) return true;
  }
  if (
    reason?.detail ||
    reason?.code === 'PATIENT_NOT_FOUND' ||
    reason?.code === 'DEMO_RESTRICTED'
  ) {
    return true;
  }
  if (reason instanceof Error) {
    if (isAxiosNetworkError(reason)) return true;
    if (reason.message && reason.message.length < 300) return true;
  }
  return false;
};

export const dispatchFatalAppError = (error: unknown) => {
  window.dispatchEvent(
    new CustomEvent(FATAL_APP_ERROR_EVENT, { detail: error }),
  );
};

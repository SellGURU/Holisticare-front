import {
  dispatchFatalAppError,
  isFilteredUnhandledRejection,
} from './utils/networkStatus';

export function initGlobalErrorHandler() {
  window.onerror = function (message, source, lineno, colno, error) {
    console.error('Global JS Error:', {
      message,
      source,
      lineno,
      colno,
      error,
    });
    dispatchFatalAppError(error ?? message);
    return true;
  };

  window.onunhandledrejection = function (event) {
    console.error('Unhandled Promise Rejection:', event.reason);

    if (isFilteredUnhandledRejection(event.reason)) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    dispatchFatalAppError(event.reason);
  };
}

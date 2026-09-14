import {
  dispatchFatalAppError,
  isFilteredUnhandledRejection,
} from './utils/networkStatus';

export function initGlobalErrorHandler() {
  window.onerror = function (message, _source, _lineno, _colno, error) {
    dispatchFatalAppError(error ?? message);
    return true;
  };

  window.onunhandledrejection = function (event) {
    if (isFilteredUnhandledRejection(event.reason)) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    dispatchFatalAppError(event.reason);
  };
}

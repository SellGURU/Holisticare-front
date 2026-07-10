import { Component, type ErrorInfo, type ReactNode } from 'react';
import { FATAL_APP_ERROR_EVENT } from '../../utils/networkStatus';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error boundary caught:', error, info);
  }

  componentDidMount() {
    window.addEventListener(FATAL_APP_ERROR_EVENT, this.handleFatalEvent);
  }

  componentWillUnmount() {
    window.removeEventListener(FATAL_APP_ERROR_EVENT, this.handleFatalEvent);
  }

  handleFatalEvent = (event: Event) => {
    const detail = (event as CustomEvent).detail;
    const error =
      detail instanceof Error
        ? detail
        : new Error(String(detail ?? 'Something unexpected happened'));
    this.setState({ error });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFB] px-6 py-12">
          <div className="w-full max-w-md rounded-2xl border border-Gray-50 bg-white p-8 text-center shadow-sm">
            <img
              src="/icons/info-circle-red.svg"
              alt=""
              className="mx-auto mb-4 h-10 w-10"
            />
            <h1 className="text-lg font-semibold text-Text-Primary">
              Something unexpected happened
            </h1>
            <p className="mt-2 text-sm text-Text-Secondary">
              {this.state.error.message ||
                'The application ran into an unexpected problem.'}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                className="rounded-xl bg-Primary-DeepTeal px-4 py-2 text-sm text-white"
                onClick={() => window.location.reload()}
              >
                Reload page
              </button>
              <button
                type="button"
                className="rounded-xl border border-Gray-50 px-4 py-2 text-sm text-Text-Primary"
                onClick={() => {
                  window.location.href = '/';
                }}
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;

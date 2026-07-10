import React, { useEffect, useState } from 'react';
import Auth from '../../api/auth';
import { isBrowserOffline } from '../../utils/networkStatus';

const MaintenancePage: React.FC = () => {
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [isOffline, setIsOffline] = useState(isBrowserOffline);

  const checkServerStatus = async () => {
    if (isBrowserOffline()) {
      return;
    }

    setCheckingStatus(true);
    try {
      const response = await Auth.helthNoAuth();
      if (response.status === 200 && response.data) {
        window.location.href = '/';
      }
    } catch {
      console.log('Server still unavailable');
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFB] px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-Gray-50 bg-white p-8 text-center shadow-sm">
        {isOffline ? (
          <>
            <svg
              className="mx-auto mb-4 h-12 w-12 text-amber-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.5 16.5a5 5 0 017 0M2 8.82a15 15 0 0118 0M5 12.55a11 11 0 0114 0M12 20h.01"
              />
              <path strokeLinecap="round" d="M4 4l16 16" />
            </svg>
            <h1 className="text-lg font-semibold text-Text-Primary">
              No internet connection
            </h1>
            <p className="mt-2 text-sm text-Text-Secondary">
              Please reconnect to the internet. We&apos;ll check the service
              again once you&apos;re back online.
            </p>
          </>
        ) : (
          <>
            <img
              src="/icons/server-down.svg"
              alt=""
              className="mx-auto mb-4 h-28 w-28"
            />
            <h1 className="text-lg font-semibold text-Text-Primary">
              Service temporarily unavailable
            </h1>
            <p className="mt-2 text-sm text-Text-Secondary">
              Our servers are having trouble right now. We&apos;re working on it
              and will restore access as soon as possible.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-Primary-DeepTeal" />
            </div>
            <p className="mt-4 text-xs text-Text-Secondary">
              {checkingStatus
                ? 'Checking server status...'
                : 'Auto-checking every 30 seconds'}
            </p>
            <button
              type="button"
              onClick={checkServerStatus}
              disabled={checkingStatus}
              className="mt-6 rounded-xl bg-Primary-DeepTeal px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checkingStatus ? 'Checking...' : 'Try again'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MaintenancePage;

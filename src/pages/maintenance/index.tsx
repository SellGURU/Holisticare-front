import React, { useEffect } from 'react';
// import Api from '../../api/api';
import Auth from '../../api/auth';

const MaintenancePage: React.FC = () => {
  //   const [checkingStatus, setCheckingStatus] = useState(false);
  //   const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkServerStatus = async () => {
    // setCheckingStatus(true);
    try {
      // Try to make a simple API call to check if server is back online
      // Using a lightweight endpoint that doesn't require authentication
      const response = Auth.helth();

      if ((await response).data) {
        // Server is back online, redirect to app
        window.location.href = '/';
        return;
      }
    } catch {
      // Server still down, continue showing maintenance page
      console.log('Server still under maintenance');
    } finally {
      //   setCheckingStatus(false);
      //   setLastCheck(new Date());
    }
  };

  useEffect(() => {
    // Check immediately when page loads
    checkServerStatus();

    // Set up interval to check every 30 seconds
    const interval = setInterval(checkServerStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-yellow-500">
              <svg
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-xl font-extrabold text-gray-900">
              System Maintenance
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sorry for the pause! We're deploying a new version to enhance your
              experience.
            </p>
            <div className="mt-6">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Back in a few minutes!
              </p>

              {/* Auto-check status */}
              {/* <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600">
                  {checkingStatus ? 'Checking server status...' : 'Auto-checking every 30 seconds'}
                </p>
                {lastCheck && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last checked: {lastCheck.toLocaleTimeString()}
                  </p>
                )}
              </div> */}

              {/* Manual refresh button */}
              {/* <button
                onClick={checkServerStatus}
                disabled={checkingStatus}
                className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkingStatus ? 'Checking...' : 'Check Now'}
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;

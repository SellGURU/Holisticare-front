import { RouterProvider } from 'react-router-dom';
import './App.css';
import router from './router';
import { useEffect } from 'react';
import ActivityLogger from './utils/activty-logger';

function App() {
  useEffect(() => {
    // ✅ initialize logger with userEmail as the ID
    const logger = ActivityLogger.getInstance();
    return () => {
      logger.destroy(); // clean up before unmount/refresh
    };
  }, []);

  useEffect(() => {
    // Handle service worker updates
    if ('serviceWorker' in navigator) {
      let refreshing = false;

      const reloadPage = () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      };

      // Listen for service worker controller change
      navigator.serviceWorker.addEventListener('controllerchange', reloadPage);

      // Check for updates and handle service worker lifecycle
      const checkForUpdates = async () => {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          
          registrations.forEach((registration) => {
            // Listen for new service worker installation
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (!newWorker) return;

              // Listen for state changes
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker is installed and ready
                  console.log('New service worker installed, reloading...');
                  reloadPage();
                }
              });
            });

            // Check for updates
            registration.update();
          });
        } catch (error) {
          console.error('Error checking for service worker updates:', error);
        }
      };

      // Check immediately
      checkForUpdates();

      // Check periodically (every 1 minute)
      const updateInterval = setInterval(checkForUpdates, 1 * 60 * 1000);

      // Check when page becomes visible (user returns to tab)
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          checkForUpdates();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Check when window gains focus
      const handleFocus = () => {
        checkForUpdates();
      };
      window.addEventListener('focus', handleFocus);

      return () => {
        clearInterval(updateInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
        navigator.serviceWorker.removeEventListener('controllerchange', reloadPage);
      };
    }
  }, []);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;

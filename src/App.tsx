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

      // Listen for service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        // Reload when new service worker takes control
        window.location.reload();
      });

      // Check for updates periodically (every 5 minutes)
      const checkForUpdates = () => {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.update();
          });
        });
      };

      // Check immediately and then every 5 minutes
      checkForUpdates();
      const updateInterval = setInterval(checkForUpdates, 5 * 60 * 1000);

      return () => clearInterval(updateInterval);
    }
  }, []);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;

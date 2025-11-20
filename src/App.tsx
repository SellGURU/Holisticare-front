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

      const reloadPage = async () => {
        if (refreshing) return;
        refreshing = true;
        
        // Clear all caches before reloading to ensure fresh content
        try {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName))
          );
          console.log('All caches cleared, reloading...');
        } catch (error) {
          console.error('Error clearing caches:', error);
        }
        
        // Force hard reload to bypass any remaining cache
        window.location.reload();
      };

      // Listen for service worker controller change
      navigator.serviceWorker.addEventListener('controllerchange', reloadPage);

      // Check for updates and handle service worker lifecycle
      const checkForUpdates = async () => {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          
          registrations.forEach((registration) => {
            // Check if there's a waiting service worker (stuck in installing/waiting state)
            if (registration.waiting) {
              console.log('Found waiting service worker, activating...');
              // Post message to skip waiting
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });
              // Force activation
              registration.waiting.addEventListener('statechange', async () => {
                if (registration.waiting?.state === 'activated') {
                  console.log('Waiting service worker activated, reloading...');
                  await reloadPage();
                }
              });
            }

            // Check if there's an installing service worker
            if (registration.installing) {
              console.log('Service worker is installing...');
              registration.installing.addEventListener('statechange', async () => {
                const worker = registration.installing;
                if (!worker) return;

                console.log(`Service worker state: ${worker.state}`);
                
                if (worker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New service worker is installed, wait for it to activate
                    console.log('New service worker installed, waiting for activation...');
                    // Post message to skip waiting if it's waiting
                    if (registration.waiting) {
                      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                    }
                    // Wait a bit and reload
                    await new Promise(resolve => setTimeout(resolve, 500));
                    await reloadPage();
                  } else {
                    // First time installation
                    console.log('Service worker installed for the first time');
                  }
                } else if (worker.state === 'activated') {
                  console.log('Service worker activated, reloading...');
                  await reloadPage();
                }
              });
            }

            // Listen for new service worker installation
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (!newWorker) return;

              console.log('Update found, new service worker installing...');

              // Listen for state changes
              newWorker.addEventListener('statechange', async () => {
                console.log(`New worker state: ${newWorker.state}`);
                
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker is installed and ready
                  console.log('New service worker installed, activating...');
                  
                  // Post message to skip waiting
                  if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                  }
                  
                  // Wait a bit for activation
                  await new Promise(resolve => setTimeout(resolve, 500));
                  
                  // Clear all caches and reload
                  await reloadPage();
                } else if (newWorker.state === 'activated') {
                  console.log('New service worker activated, reloading...');
                  await reloadPage();
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

      // Immediate check for waiting service workers
      const immediateCheck = async () => {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            if (registration.waiting) {
              console.log('Found waiting service worker on page load, activating immediately...');
              // Force skip waiting and reload
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });
              await new Promise(resolve => setTimeout(resolve, 200));
              await reloadPage();
              return; // Exit early if we found a waiting worker
            }
          }
        } catch (error) {
          console.error('Error in immediate check:', error);
        }
      };

      // Check immediately for waiting workers
      immediateCheck();

      // Also check for updates
      checkForUpdates();

      // Check periodically (every 10 seconds for faster detection)
      const updateInterval = setInterval(checkForUpdates, 10 * 1000);

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

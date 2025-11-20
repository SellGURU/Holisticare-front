import { useEffect } from 'react';

export function useServiceWorker() {
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
            cacheNames.map((cacheName) => caches.delete(cacheName)),
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

      // Track stuck service workers
      const stuckWorkers = new Set();

      // Check for updates and handle service worker lifecycle
      const checkForUpdates = async () => {
        try {
          const registrations =
            await navigator.serviceWorker.getRegistrations();

          registrations.forEach((registration) => {
            const regId = registration.scope;

            // If we've seen this stuck worker before, force reload
            if (stuckWorkers.has(regId)) {
              console.log('Stuck service worker detected, forcing reload...');
              reloadPage();
              return;
            }

            // Mark as stuck if installing for too long
            if (registration.installing) {
              const installingWorker = registration.installing;
              setTimeout(() => {
                if (installingWorker.state === 'installing') {
                  console.warn('Service worker stuck in installing state');
                  stuckWorkers.add(regId);
                  reloadPage();
                }
              }, 2000); // 2 seconds
            }
            // Check if there's a waiting service worker (stuck in installing/waiting state)
            if (registration.waiting) {
              console.log(
                'Found waiting service worker, forcing activation...',
              );
              // Post message to skip waiting
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });

              // Also try to unregister and re-register if stuck
              const forceActivate = async () => {
                try {
                  // Wait a moment for skip waiting to take effect
                  await new Promise((resolve) => setTimeout(resolve, 300));

                  // If still waiting, force reload
                  if (registration.waiting) {
                    console.log(
                      'Service worker still waiting, forcing reload...',
                    );
                    await reloadPage();
                  }
                } catch (error) {
                  console.error('Error forcing activation:', error);
                  await reloadPage();
                }
              };

              forceActivate();

              // Also listen for state changes
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

              // Set a timeout to force activation if stuck (reduced to 2 seconds)
              const installTimeout = setTimeout(async () => {
                if (
                  registration.installing &&
                  registration.installing.state === 'installing'
                ) {
                  console.warn(
                    'Service worker stuck in installing state for 2+ seconds, forcing reload...',
                  );
                  await reloadPage();
                }
              }, 2000); // 2 second timeout - if still installing, force reload

              registration.installing.addEventListener(
                'statechange',
                async () => {
                  clearTimeout(installTimeout);
                  const worker = registration.installing;
                  if (!worker) return;

                  console.log(`Service worker state: ${worker.state}`);

                  if (worker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      // New service worker is installed, wait for it to activate
                      console.log(
                        'New service worker installed, forcing activation...',
                      );
                      // Post message to skip waiting if it's waiting
                      if (registration.waiting) {
                        registration.waiting.postMessage({
                          type: 'SKIP_WAITING',
                        });
                      }
                      // Wait a bit and reload
                      await new Promise((resolve) => setTimeout(resolve, 500));
                      await reloadPage();
                    } else {
                      // First time installation
                      console.log(
                        'Service worker installed for the first time',
                      );
                    }
                  } else if (worker.state === 'activated') {
                    console.log('Service worker activated, reloading...');
                    await reloadPage();
                  } else if (worker.state === 'redundant') {
                    console.log('Service worker became redundant');
                  }
                },
              );
            }

            // Listen for new service worker installation
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (!newWorker) return;

              console.log('Update found, new service worker installing...');

              // Listen for state changes
              newWorker.addEventListener('statechange', async () => {
                console.log(`New worker state: ${newWorker.state}`);

                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // New service worker is installed and ready
                  console.log('New service worker installed, activating...');

                  // Post message to skip waiting
                  if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                  }

                  // Wait a bit for activation
                  await new Promise((resolve) => setTimeout(resolve, 500));

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

      // Immediate check for waiting/installing service workers
      const immediateCheck = async () => {
        try {
          const registrations =
            await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            // Check for waiting worker
            if (registration.waiting) {
              console.log(
                'Found waiting service worker on page load, activating immediately...',
              );
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });
              await new Promise((resolve) => setTimeout(resolve, 300));
              await reloadPage();
              return;
            }

            // Check for installing worker (stuck in installing state)
            if (registration.installing) {
              console.log(
                'Found installing service worker on page load, monitoring...',
              );
              const installingWorker = registration.installing;

              // If it's been installing for a while, force reload immediately
              // Check if it's been stuck (we can't know exact time, but if it's installing on page load, it's likely stuck)
              setTimeout(async () => {
                if (installingWorker.state === 'installing') {
                  console.warn(
                    'Service worker stuck in installing state on page load, forcing immediate reload...',
                  );
                  await reloadPage();
                }
              }, 1000); // Only 1 second - if still installing, it's stuck

              // Listen for completion
              installingWorker.addEventListener('statechange', async () => {
                if (
                  installingWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  console.log('Installing worker completed, activating...');
                  if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                  }
                  await new Promise((resolve) => setTimeout(resolve, 300));
                  await reloadPage();
                } else if (installingWorker.state === 'activated') {
                  console.log('Installing worker activated, reloading...');
                  await reloadPage();
                }
              });
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

      // Check on user interaction (clicks, keyboard, etc.) for immediate detection
      const handleUserInteraction = async () => {
        // Immediately check for stuck workers on any interaction
        try {
          const registrations =
            await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            // If there's a waiting or installing worker, force reload
            if (
              registration.waiting ||
              (registration.installing &&
                registration.installing.state === 'installing')
            ) {
              console.log(
                'User interaction detected with stuck service worker, forcing reload...',
              );
              await reloadPage();
              return;
            }
          }
        } catch (error) {
          console.error('Error checking on user interaction:', error);
        }
        // Also do normal update check
        checkForUpdates();
      };
      document.addEventListener('click', handleUserInteraction, {
        once: false,
        passive: true,
      });
      document.addEventListener('keydown', handleUserInteraction, {
        once: false,
        passive: true,
      });
      document.addEventListener('touchstart', handleUserInteraction, {
        once: false,
        passive: true,
      });

      return () => {
        clearInterval(updateInterval);
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange,
        );
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
        navigator.serviceWorker.removeEventListener(
          'controllerchange',
          reloadPage,
        );
      };
    }
  }, []);
}

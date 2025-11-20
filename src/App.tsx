import { RouterProvider } from 'react-router-dom';
import './App.css';
import router from './router';
import { useEffect } from 'react';
import ActivityLogger from './utils/activty-logger';
import { useServiceWorker } from './hooks/useServiceWorker';

function App() {
  useEffect(() => {
    // ✅ initialize logger with userEmail as the ID
    const logger = ActivityLogger.getInstance();
    return () => {
      logger.destroy(); // clean up before unmount/refresh
    };
  }, []);

  useServiceWorker();

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;

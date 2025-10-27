import { RouterProvider } from 'react-router-dom';
import './App.css';
import router from './router';
import { useEffect } from 'react';
import ActivityLogger from './utils/activty-logger';

function App() {
  useEffect(() => {
    // ✅ get the user email from localStorage (fallback if missing)
    const userEmail = localStorage.getItem('email') || 'anonymous_user';

    // ✅ initialize logger with userEmail as the ID
    const logger = ActivityLogger.getInstance(userEmail);

    return () => {
      logger.destroy(); // clean up before unmount/refresh
    };
  }, []);
  return (
    <>
      <RouterProvider router={router} />
    
    </>
  );
}

export default App;

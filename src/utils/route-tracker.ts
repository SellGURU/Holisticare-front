// utils/RouteTracker.tsx
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ActivityLogger from './activty-logger';

const RouteTracker = () => {
  const location = useLocation();
  const prevPath = useRef<string>('');

  useEffect(() => {
    const logger = ActivityLogger.getInstance();
    const currentPath = location.pathname;

    // Avoid logging duplicates if same route triggers multiple renders
    if (prevPath.current !== currentPath) {
      logger.addEvent('page_view', {
        path: currentPath,
        title: document.title,
      });
      prevPath.current = currentPath;
    }
  }, [location]);

  return null; // this component doesn't render anything
};

export default RouteTracker;

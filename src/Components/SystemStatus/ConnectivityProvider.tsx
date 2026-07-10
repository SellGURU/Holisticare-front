import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import OfflineBanner from './OfflineBanner';

interface ConnectivityContextValue {
  isOffline: boolean;
}

const ConnectivityContext = createContext<ConnectivityContextValue>({
  isOffline: false,
});

export const useConnectivity = () => useContext(ConnectivityContext);

interface ConnectivityProviderProps {
  children: ReactNode;
}

const ConnectivityProvider = ({ children }: ConnectivityProviderProps) => {
  const [isOffline, setIsOffline] = useState(
    () => typeof navigator !== 'undefined' && !navigator.onLine,
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const value = useMemo(() => ({ isOffline }), [isOffline]);

  return (
    <ConnectivityContext.Provider value={value}>
      {isOffline && <OfflineBanner />}
      {children}
    </ConnectivityContext.Provider>
  );
};

export default ConnectivityProvider;

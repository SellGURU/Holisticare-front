import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import AppErrorBoundary from './Components/SystemStatus/AppErrorBoundary';
import ConnectivityProvider from './Components/SystemStatus/ConnectivityProvider';
import useSecurity from './hooks/useSecurity.tsx';

const MainWrapper = () => {
  const googleClientId = useSecurity();
  return (
    <AppErrorBoundary>
      <ConnectivityProvider>
        <GoogleOAuthProvider clientId={googleClientId}>
          <App />
        </GoogleOAuthProvider>
      </ConnectivityProvider>
    </AppErrorBoundary>
  );
};

export default MainWrapper;

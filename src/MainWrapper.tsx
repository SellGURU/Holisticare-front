import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import ConnectivityProvider from './Components/SystemStatus/ConnectivityProvider';
import useSecurity from './hooks/useSecurity.tsx';

const MainWrapper = () => {
  const googleClientId = useSecurity();
  return (
    <ConnectivityProvider>
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    </ConnectivityProvider>
  );
};

export default MainWrapper;

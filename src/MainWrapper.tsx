import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import useSecurity from './hooks/useSecurity.tsx';

const MainWrapper = () => {
  const googleClientId = useSecurity();
  return (
    <>
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    </>
  );
};

export default MainWrapper;

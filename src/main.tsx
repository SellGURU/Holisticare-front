import { GoogleOAuthProvider } from '@react-oauth/google';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import App from './App.tsx';
import { initGlobalErrorHandler } from './globalErrorHandler.ts';
import AppContextProvider from './store/app.tsx';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/rozha-one/400.css';
import './api/axios.ts';
import './index.css';

initGlobalErrorHandler();

createRoot(document.getElementById('root')!).render(
  <>
    <AppContextProvider>
      <GoogleOAuthProvider clientId="750278697489-u68emmire3d35234obo1mne9v0eobmsu.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </AppContextProvider>
    <ToastContainer
      position="top-right"
      hideProgressBar
      closeOnClick
      draggable
      pauseOnHover
    />
  </>,
);

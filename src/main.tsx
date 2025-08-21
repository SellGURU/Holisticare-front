import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/rozha-one/400.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import './api/axios.ts';
import App from './App.tsx';
import DeletedTooltipContainer from './Components/DeletedTooltip/index.tsx';
import UploaderTooltipContainer from './Components/UploaderTooltip/index.tsx';
import { initGlobalErrorHandler } from './globalErrorHandler.ts';
import './index.css';
import AppContextProvider from './store/app.tsx';
import UploadFileProgressModal from './Components/uploadFileProgressModal/index.tsx';

initGlobalErrorHandler();

createRoot(document.getElementById('root')!).render(
  <>
    <AppContextProvider>
      <GoogleOAuthProvider clientId="750278697489-u68emmire3d35234obo1mne9v0eobmsu.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </AppContextProvider>
    <ToastContainer />
    <UploaderTooltipContainer />
    <DeletedTooltipContainer />
    <UploadFileProgressModal />
  </>,
);

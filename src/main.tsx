import './utils/silenceConsole';
import { createRoot } from 'react-dom/client';
import { initGlobalErrorHandler } from './globalErrorHandler.ts';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/rozha-one/400.css';
import './api/axios.ts';
import './index.css';
import AppErrorBoundary from './Components/SystemStatus/AppErrorBoundary';
import MainWrapper from './MainWrapper.tsx';
import AppContextProvider from './store/app.tsx';
import { ToastContainer } from 'react-toastify';
import { runPortalBootGuard } from './utils/bootGuard';

initGlobalErrorHandler();
runPortalBootGuard();

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <AppContextProvider>
      <MainWrapper />
    </AppContextProvider>
    <ToastContainer
      position="top-right"
      hideProgressBar
      closeOnClick
      draggable
      pauseOnHover
    />
  </AppErrorBoundary>,
);

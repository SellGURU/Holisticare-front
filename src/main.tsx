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
import { ClinicLocaleSync } from './i18n/ClinicLocaleSync';
import { LocalePreferencesProvider } from './i18n/LocalePreferencesContext';
import { LocaleSetupGate } from './i18n/LocaleSetupGate.tsx';
import { LocaleRoot } from './i18n/LocaleRoot';
import { i18n, initializeI18n } from './i18n';
import { I18nextProvider } from 'react-i18next';

initGlobalErrorHandler();
runPortalBootGuard();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Holisticare root element (#root) was not found.');
}

createRoot(rootElement).render(
  <I18nextProvider i18n={i18n}>
    <LocaleRoot>
      <AppErrorBoundary>
        <AppContextProvider>
          <LocalePreferencesProvider>
            <ClinicLocaleSync />
            <LocaleSetupGate />
            <MainWrapper />
          </LocalePreferencesProvider>
        </AppContextProvider>
        <ToastContainer
          position="top-right"
          hideProgressBar
          closeOnClick
          draggable
          pauseOnHover
        />
      </AppErrorBoundary>
    </LocaleRoot>
  </I18nextProvider>,
);

void initializeI18n();

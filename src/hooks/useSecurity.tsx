import { useEffect } from 'react';
import useAppConfig from './useAppConfig';
import { useApp } from './index';

const useSecurity = () => {
  const { setAppConfig } = useApp();
  const appConfig = useAppConfig();

  useEffect(() => {
    setAppConfig(appConfig);
  }, [appConfig, setAppConfig]);

  return appConfig?.google_client_id ?? '';
};

export default useSecurity;

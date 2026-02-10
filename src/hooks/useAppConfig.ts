import { useEffect, useState } from 'react';
import Application from '../api/app';
// import { AppContext } from '../store/app';

const useAppConfig = () => {
  // const { appConfig, setAppConfig } = useContext(AppContext);
  const [appConfig, setAppConfig] = useState<AppConfig>({
    google_client_id: 'isEmpty',
    azure_storage_account_url: '',
    allowed_containers: [],
    sas_ttl_seconds_default: 600,
    sas_ttl_seconds_max: 900,
  });
  useEffect(() => {
    Application.getPublicConfig()
      .then((res) => {
        setAppConfig(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [setAppConfig]);

  return appConfig;
};

export default useAppConfig;

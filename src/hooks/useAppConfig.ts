import { useEffect, useContext } from 'react';
import Application from '../api/app';
import { AppContext } from '../store/app';

const useAppConfig = () => {
  const { setAppConfig } = useContext(AppContext);

  useEffect(() => {
    Application.getPublicConfig()
      .then((res) => {
        setAppConfig(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [setAppConfig]);
};

export default useAppConfig;

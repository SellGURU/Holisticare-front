/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, PropsWithChildren, useState } from 'react';
import PackageManager from '../model/Packages/PackageManager';

interface AppContextProp {
  permisions: any;
  token: string | null;
  isLoggedId: boolean;
  login: (token: string, permisions?: any, email?: string) => void;
  logout: () => void;
  PackageManager: PackageManager;
  treatmentId: string | null;
  setTreatmentId: (id: string) => void;
  patientsList: any[];
  setPatientsList: (patients: any[]) => void;
  appConfig: AppConfig;
  setAppConfig: (config: AppConfig) => void;
  clinicPlan: 'demo' | 'paying' | string;
  clinicStatus: 'active' | 'disabled' | string;
  setClinicAccess: (plan: string, status: string) => void;
}

export const AppContext = createContext<AppContextProp>({
  token: null,
  isLoggedId: false,
  login: () => {},
  permisions: {},
  logout: () => {},
  setAppConfig: () => {},
  clinicPlan: localStorage.getItem('clinicPlan') || 'paying',
  clinicStatus: localStorage.getItem('clinicStatus') || 'active',
  setClinicAccess: () => {},
  appConfig: {
    google_client_id: '',
    azure_storage_account_url: '',
    allowed_containers: [],
    sas_ttl_seconds_default: 600,
    sas_ttl_seconds_max: 900,
  },
  PackageManager: new PackageManager(),
  treatmentId: null,
  setTreatmentId: () => {},
  patientsList: [],
  setPatientsList: () => {},
});

const AppContextProvider = ({ children }: PropsWithChildren) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token') || null,
  );
  const [appConfig, setAppConfig] = useState<AppConfig>({
    google_client_id: '',
    azure_storage_account_url: '',
    allowed_containers: [],
    sas_ttl_seconds_default: 600,
    sas_ttl_seconds_max: 900,
  });
  const [treatmentId, setTreatmentId] = useState<string | null>(null);

  const [permisions, setPermisions] = useState(
    JSON.parse(localStorage.getItem('permisins') || '{}'),
  );
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [clinicPlan, setClinicPlan] = useState(
    localStorage.getItem('clinicPlan') || 'paying',
  );
  const [clinicStatus, setClinicStatus] = useState(
    localStorage.getItem('clinicStatus') || 'active',
  );

  const logOut = () => {
    setToken('');
    setPermisions({});
    setClinicPlan('paying');
    setClinicStatus('active');
    localStorage.clear();
  };
  const contextValue: AppContextProp = {
    token: token,
    logout: logOut,
    isLoggedId: !!token,

    login: (token: string, permisins?: any, email?: string) => {
      setToken(token);
      setPermisions(permisins);
      localStorage.setItem('permisins', JSON.stringify(permisins));
      localStorage.setItem('token', token);
      localStorage.setItem('email', email || '');
    },
    permisions: permisions,
    PackageManager: new PackageManager(),
    treatmentId: treatmentId,
    setTreatmentId: setTreatmentId,
    patientsList: patientsList,
    setPatientsList: setPatientsList,
    appConfig: appConfig,
    setAppConfig: setAppConfig,
    clinicPlan,
    clinicStatus,
    setClinicAccess: (plan: string, status: string) => {
      setClinicPlan(plan);
      setClinicStatus(status);
      localStorage.setItem('clinicPlan', plan);
      localStorage.setItem('clinicStatus', status);
    },
  };
  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppContextProvider;

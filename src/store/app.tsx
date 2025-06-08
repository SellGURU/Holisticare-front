/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, PropsWithChildren, useState } from 'react';
import PackageManager from '../model/Packages/PackageManager';

interface AppContextProp {
  permisions: any;
  token: string | null;
  isLoggedId: boolean;
  login: (token: string, permisions?: any,email?:string) => void;
  logout: () => void;
  PackageManager: PackageManager;
  treatmentId: string | null;
  setTreatmentId: (id: string) => void;
}

export const AppContext = createContext<AppContextProp>({
  token: null,
  isLoggedId: false,
  login: () => {},
  permisions: {},
  logout: () => {},
  PackageManager: new PackageManager(),
  treatmentId: null,
  setTreatmentId: () => {},
});

const AppContextProvider = ({ children }: PropsWithChildren) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token') || null,
  );
  const [treatmentId, setTreatmentId] = useState<string | null>(null);

  const [permisions, setPermisions] = useState(
    JSON.parse(localStorage.getItem('permisins') || '{}'),
  );
  const logOut = () => {
    setToken('');
    setPermisions({});
    localStorage.clear();
  };
  const contextValue: AppContextProp = {
    token: token,
    logout: logOut,
    isLoggedId: !!token,

    login: (token: string, permisins?: any,email?:string) => {
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
  };
  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppContextProvider;

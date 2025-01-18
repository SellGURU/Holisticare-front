/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, PropsWithChildren, useState } from 'react';

interface AppContextProp {
  permisions: any;
  token: string | null;
  isLoggedId: boolean;
  login: (token: string, permisions?: any) => void;
  logout: () => void;
}

export const AppContext = createContext<AppContextProp>({
  token: null,
  isLoggedId: false,
  login: () => {},
  permisions: {},
  logout: () => {},
});

const AppContextProvider = ({ children }: PropsWithChildren) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token') || null,
  );
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

    login: (token: string, permisins?: any) => {
      setToken(token);
      setPermisions(permisins);
      localStorage.setItem('permisins', JSON.stringify(permisins));
      localStorage.setItem('token', token);
    },
    permisions: permisions,
  };
  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppContextProvider;

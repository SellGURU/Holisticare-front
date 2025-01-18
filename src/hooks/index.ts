import { useContext } from 'react';
import { AppContext } from '../store/app';

export function useApp() {
  const context = useContext(AppContext);
  if (!context)
    throw new Error('AuthContext was used outside of the AuthContextProvider');
  return context;
}

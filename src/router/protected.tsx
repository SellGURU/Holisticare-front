/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navigate } from 'react-router-dom';
import { useApp } from '../hooks';
import { getTokenFromLocalStorage } from '../store/token';

interface ProtectedRouteProps {
  Component: React.ComponentType<any>;
}
function ProtectedRoute({ Component }: ProtectedRouteProps) {
  const isLoggedId = useApp().isLoggedId;
  // localStorage is written synchronously in login(); React state can lag one
  // render, which used to bounce a fresh login straight back to /login.
  const hasStoredToken = Boolean(getTokenFromLocalStorage());

  if (!isLoggedId && !hasStoredToken) {
    return <Navigate to="/login" replace />;
  }
  return <Component />;
}
export default ProtectedRoute;

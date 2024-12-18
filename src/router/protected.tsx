/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navigate } from "react-router-dom";
import { useApp } from "../hooks";

interface ProtectedRouteProps {
  Component: React.ComponentType<any>;
}
function ProtectedRoute({ Component }: ProtectedRouteProps) {
  const  isLoggedId  = useApp().isLoggedId;
  
  if (!isLoggedId) {
    return <Navigate to="/login" replace />;
  }
  return <Component />;
}
export default ProtectedRoute;
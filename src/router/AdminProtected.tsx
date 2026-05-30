/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navigate } from 'react-router-dom';
import { getAdminToken } from '../store/adminToken';

interface AdminProtectedRouteProps {
  Component: React.ComponentType<any>;
}

function AdminProtectedRoute({ Component }: AdminProtectedRouteProps) {
  const token = getAdminToken();

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Component />;
}

export default AdminProtectedRoute;

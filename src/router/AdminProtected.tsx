/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navigate, Outlet } from 'react-router-dom';
import { getAdminToken } from '../store/adminToken';
import AdminContextProvider from '../store/adminContext';

interface AdminProtectedRouteProps {
  Component?: React.ComponentType<any>;
}

function AdminProtectedRoute({ Component }: AdminProtectedRouteProps) {
  const token = getAdminToken();

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AdminContextProvider>
      {Component ? <Component /> : <Outlet />}
    </AdminContextProvider>
  );
}

export default AdminProtectedRoute;

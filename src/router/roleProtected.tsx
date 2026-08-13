import { Navigate } from 'react-router-dom';
import { useApp } from '../hooks';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleProtectedRoute = ({
  children,
  allowedRoles,
}: RoleProtectedRouteProps) => {
  const { accountRole } = useApp();
  const normalizedRole = String(accountRole || '')
    .trim()
    .toLowerCase();

  if (!allowedRoles.includes(normalizedRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleProtectedRoute;

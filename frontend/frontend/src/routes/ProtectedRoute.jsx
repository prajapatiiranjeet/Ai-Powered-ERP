import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_DEFAULT_ROUTE, ROUTES } from '../utils/constants.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50"><LoadingSpinner size="lg" label="Restoring your session…" /></div>;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;

  const role = user?.role;
  if (!role || !ROLE_DEFAULT_ROUTE[role]) return <Navigate to={ROUTES.LOGIN} replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to={ROLE_DEFAULT_ROUTE[role]} replace />;

  return children ?? <Outlet />;
}

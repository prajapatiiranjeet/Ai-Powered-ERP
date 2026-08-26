import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../utils/constants.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { Outlet } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    const fallback =
      user.role === 'ADMIN'
        ? ROUTES.ADMIN_DASHBOARD
        : user.role === 'STUDENT'
        ? ROUTES.STUDENT_DASHBOARD
        : ROUTES.FACULTY_DASHBOARD;
    return <Navigate to={fallback} replace />;
  }

  return children ?? <Outlet />;
}

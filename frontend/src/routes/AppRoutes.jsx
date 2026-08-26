import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import StudentDashboard from '../pages/student/StudentDashboard.jsx';
import FacultyDashboard from '../pages/faculty/FacultyDashboard.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import { ROUTES, ROLES } from '../utils/constants.js';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import StudentLayout from '../layouts/StudentLayout.jsx';
import FacultyLayout from '../layouts/FacultyLayout.jsx';

export default function AppRoutes() {
  const { loading, user, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path={ROUTES.LOGIN}
        element={
          isAuthenticated && user?.role ? (
            <Navigate
              to={
                user.role === ROLES.ADMIN
                  ? ROUTES.ADMIN_DASHBOARD
                  : user.role === ROLES.STUDENT
                  ? ROUTES.STUDENT_DASHBOARD
                  : ROUTES.FACULTY_DASHBOARD
              }
              replace
            />
          ) : (
            <LoginPage />
          )
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route index element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
      </Route>

      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route index element={<Navigate to={ROUTES.STUDENT_DASHBOARD} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.STUDENT_DASHBOARD} replace />} />
      </Route>

      <Route
        path="/faculty/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.FACULTY]}>
            <FacultyLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<FacultyDashboard />} />
        <Route index element={<Navigate to={ROUTES.FACULTY_DASHBOARD} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.FACULTY_DASHBOARD} replace />} />
      </Route>

      <Route
        path="/"
        element={
          isAuthenticated && user?.role ? (
            <Navigate
              to={
                user.role === ROLES.ADMIN
                  ? ROUTES.ADMIN_DASHBOARD
                  : user.role === ROLES.STUDENT
                  ? ROUTES.STUDENT_DASHBOARD
                  : ROUTES.FACULTY_DASHBOARD
              }
              replace
            />
          ) : (
            <Navigate to={ROUTES.LOGIN} replace />
          )
        }
      />

      <Route path="*" element={<Navigate to={isAuthenticated ? (user?.role === ROLES.ADMIN ? ROUTES.ADMIN_DASHBOARD : user?.role === ROLES.STUDENT ? ROUTES.STUDENT_DASHBOARD : ROUTES.FACULTY_DASHBOARD) : ROUTES.LOGIN} replace />} />
    </Routes>
  );
}

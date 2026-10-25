import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar.jsx';
import Navbar from '../components/common/Navbar.jsx';
import RagChatbot from '../components/common/RagChatbot.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../utils/constants.js';

const STUDENT_NAV = [
  { path: ROUTES.STUDENT_DASHBOARD, label: 'Dashboard', icon: 'dashboard' },
  { path: '/student/attendance', label: 'Attendance', icon: 'attendance' },
  { path: '/student/profile', label: 'My Profile', icon: 'profile' },
  { path: '/student/academic', label: 'Academic info', icon: 'academic', comingSoon: true },
  { path: '/student/change-password', label: 'Change Password', icon: 'security' }
];

export default function StudentLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <div className="erp-shell dashboard-shell min-h-screen">
      <Sidebar
        role="STUDENT"
        roleAccent="student"
        items={STUDENT_NAV}
        userEmail={user?.email}
        userName={user?.name}
        open={open}
        onClose={() => setOpen(false)}
        onNavigate={() => setOpen(false)}
      />
      <div className="flex min-h-screen flex-col">
        <Navbar
          title="Student Portal"
          subtitle="Access your academic information and profile"
          userEmail={user?.email}
          userName={user?.name}
          onLogout={handleLogout}
          onMenuToggle={() => setOpen(true)}
          roleAccent="student"
        />
        <main className="dashboard-main flex-1">
          <div className="mx-auto w-full max-w-[1440px]">
            <Outlet />
          </div>
        </main>
        <RagChatbot role="STUDENT" />
      </div>
    </div>
  );
}

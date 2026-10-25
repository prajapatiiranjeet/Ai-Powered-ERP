import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar.jsx';
import Navbar from '../components/common/Navbar.jsx';
import RagChatbot from '../components/common/RagChatbot.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../utils/constants.js';

const FACULTY_NAV = [
  { path: ROUTES.FACULTY_DASHBOARD, label: 'Dashboard', icon: 'dashboard' },
  { path: '/faculty/profile', label: 'My Profile', icon: 'profile', comingSoon: true },
  { path: '/faculty/teaching', label: 'Teaching assignments', icon: 'academic', comingSoon: true },
  { path: '/faculty/change-password', label: 'Change Password', icon: 'security', comingSoon: true }
];

export default function FacultyLayout() {
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
        role="FACULTY"
        roleAccent="faculty"
        items={FACULTY_NAV}
        userEmail={user?.email}
        userName={user?.name}
        open={open}
        onClose={() => setOpen(false)}
        onNavigate={() => setOpen(false)}
      />
      <div className="flex min-h-screen flex-col">
        <Navbar
          title="Faculty Portal"
          subtitle="Manage your profile and teaching activities"
          userEmail={user?.email}
          userName={user?.name}
          onLogout={handleLogout}
          onMenuToggle={() => setOpen(true)}
          roleAccent="faculty"
        />
        <main className="dashboard-main flex-1">
          <div className="mx-auto w-full max-w-[1440px]">
            <Outlet />
          </div>
        </main>
        <RagChatbot role="FACULTY" />
      </div>
    </div>
  );
}

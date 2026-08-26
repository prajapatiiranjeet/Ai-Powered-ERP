import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar.jsx';
import Navbar from '../components/common/Navbar.jsx';
import RagChatbot from '../components/common/RagChatbot.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../utils/constants.js';

const ADMIN_NAV = [
  { path: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: '📊' },
  { path: '/admin/students', label: 'Students', icon: '👨‍🎓', comingSoon: true },
  { path: '/admin/faculty', label: 'Faculty', icon: '👨‍🏫', comingSoon: true },
  { path: '/admin/departments', label: 'Departments & Courses', icon: '🏛️', comingSoon: true }
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:pl-64">
      <Sidebar
        role="ADMIN"
        roleAccent="admin"
        items={ADMIN_NAV}
        userEmail={user?.email}
        userName={user?.name}
        open={open}
        onClose={() => setOpen(false)}
        onNavigate={() => setOpen(false)}
      />
      <div className="flex min-h-screen flex-col">
        <Navbar
          title="Admin Portal"
          subtitle="Manage students, faculty, departments and courses"
          userEmail={user?.email}
          userName={user?.name}
          onLogout={handleLogout}
          onMenuToggle={() => setOpen(true)}
          roleAccent="admin"
        />
        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
        <RagChatbot role="ADMIN" />
      </div>
    </div>
  );
}

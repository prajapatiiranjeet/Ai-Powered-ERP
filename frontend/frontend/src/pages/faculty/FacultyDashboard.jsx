import { useEffect, useState } from 'react';
import DashboardPageHeader from '../../components/common/DashboardPageHeader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import FacultyAttendancePanel from '../../components/faculty/FacultyAttendancePanel.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { facultyService } from '../../services/facultyService.js';

function FacultyFact({ label, value }) {
  return <div className="dashboard-fact"><dt>{label}</dt><dd>{value || '—'}</dd></div>;
}

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);

  const loadProfile = async () => {
    setProfileLoading(true);
    setProfileError('');
    try {
      const data = await facultyService.viewProfile();
      setProfile(data && typeof data === 'object' ? data : null);
    } catch (error) {
      setProfileError(error?.message || 'Unable to load your profile. Please retry.');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const email = profile?.email || user?.email || '—';
  const displayName = profile?.fullName || profile?.name || user?.name || (email !== '—' ? email.split('@')[0] : 'Faculty');
  const firstName = String(displayName).trim().split(/\s+/)[0] || 'Faculty';
  const employeeId = profile?.employeeId || (profile?.id ? `NIU-EMP-${profile.id}` : '—');
  const designation = profile?.designation || '—';
  const department = profile?.department || profile?.departmentName || '—';
  const specialization = profile?.specialization || '—';
  const today = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <div className="dashboard-page dashboard-faculty" aria-busy={profileLoading}>
      <DashboardPageHeader
        eyebrow={`${today} · Teaching workspace`}
        title={`Welcome, ${firstName}`}
        description="Choose a class, confirm the roster, and record attendance for today."
        meta={<a href="#faculty-attendance" className="dashboard-signout !text-emerald-900 !no-underline">Go to attendance</a>}
      />

      <section id="faculty-attendance" aria-label="Faculty attendance workspace" className="scroll-mt-24">
        <FacultyAttendancePanel />
      </section>

      <section aria-labelledby="faculty-profile-title">
        <div className="dashboard-section-heading"><div><h2 id="faculty-profile-title">Teaching profile</h2><p>Key information attached to your faculty account.</p></div></div>
        {profileLoading ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" role="status" aria-label="Loading faculty profile">{Array.from({ length: 4 }, (_, index) => <div key={index} className="dashboard-fact animate-pulse"><div className="h-3 w-20 rounded bg-slate-200"/><div className="mt-3 h-4 w-32 rounded bg-slate-200"/></div>)}</div> : null}
        {profileError ? <ErrorMessage message={profileError} onRetry={loadProfile} /> : null}
        {!profileLoading && !profileError ? profile ? <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><FacultyFact label="Employee ID" value={employeeId}/><FacultyFact label="Designation" value={designation}/><FacultyFact label="Department" value={department}/><FacultyFact label="Specialization" value={specialization}/></dl> : <div className="dashboard-empty">Your profile is not available yet. Retry to load your faculty details.</div> : null}
      </section>
    </div>
  );
}

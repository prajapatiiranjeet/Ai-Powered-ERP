import { useEffect, useState } from 'react';
import DashboardCard from '../../components/common/DashboardCard.jsx';
import QuickActionCard from '../../components/common/QuickActionCard.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { studentService } from '../../services/studentService.js';

export default function StudentDashboard() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const p = await studentService.viewProfile();
        if (active) {
          setProfile(p);
          refreshUser().catch(() => {});
        }
      } catch (e) {
        if (active) setErr(e?.message || 'Could not load your profile');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [refreshUser]);

  const name = profile?.name || user?.name || 'Student';
  const email = profile?.email || user?.email || '—';
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 md:p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {today}
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
              Welcome back, {name.split(' ')[0]} 🎓
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 md:text-sm">
              Noida International University · Student Portal
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Semester Active
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              Student
            </span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Academic Snapshot
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="erp-stat-card border-slate-200 animate-pulse">
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="mt-4 h-8 w-16 rounded bg-slate-200" />
                <div className="mt-3 h-3 w-32 rounded bg-slate-100" />
              </div>
            ))
          ) : (
            <>
              <DashboardCard
                title="Personal Info"
                value={profile?.name || '—'}
                accent="blue"
                description={email}
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                }
              />
              <DashboardCard
                title="Current Semester"
                value="—"
                accent="indigo"
                description="(API pending: no student GET endpoint)"
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
                    <line x1="8" y1="3" x2="8" y2="21" />
                    <line x1="16" y1="3" x2="16" y2="21" />
                  </svg>
                }
              />
              <DashboardCard
                title="Course / Branch"
                value="—"
                accent="purple"
                description="(Needs backend data)"
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                }
              />
              <DashboardCard
                title="Section / Batch"
                value="—"
                accent="emerald"
                description="(Needs backend data)"
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                }
              />
            </>
          )}
        </div>
      </section>

      {/* Profile + quick actions */}
      <section className="grid gap-6 xl:grid-cols-3">
        <div className="erp-card p-6 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">My Profile</h3>
              <p className="text-xs text-slate-500">
                Basic information fetched from your student account
              </p>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner label="Loading profile..." />
            </div>
          ) : err ? (
            <ErrorMessage message={err} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Full Name</p>
                <p className="mt-1 font-semibold text-slate-900">{profile?.name || '—'}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Email ID</p>
                <p className="mt-1 break-all font-semibold text-slate-900">{email}</p>
              </div>
              <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Roll Number</p>
                <p className="mt-1 font-mono text-sm text-slate-500">— (missing endpoint)</p>
              </div>
              <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Phone / Address</p>
                <p className="mt-1 text-sm text-slate-500">— (missing endpoint)</p>
              </div>
            </div>
          )}
          <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-800">
            ℹ️ The current <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px]">/students/view-profile</code> endpoint
            returns only <b>name</b> and <b>email</b>. Full student profile details (roll no, semester, course, branch, batch, section)
            require a backend enhancement returning the full StudentDTO.
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <QuickActionCard
                accent="blue"
                title="View Full Profile"
                description="See all your academic details"
                icon={
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                }
              />
              <QuickActionCard
                accent="purple"
                title="Edit Profile"
                description="Update contact information"
                icon={
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                }
              />
              <QuickActionCard
                accent="teal"
                title="Change Password"
                description="Secure your account"
                icon={
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                }
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

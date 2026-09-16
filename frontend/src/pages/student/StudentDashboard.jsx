import { useEffect, useState } from 'react';
import DashboardCard from '../../components/common/DashboardCard.jsx';
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
        }
      } catch (e) {
        if (active) setErr(e?.message || 'Could not load your profile');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const name = profile?.fullName || profile?.name || user?.name || 'Student';
  const email = profile?.email || user?.email || '—';
  const rollNo = profile?.rollNo || (profile?.id ? `NIU-${profile.id}` : (user?.id ? `NIU-${user.id}` : 'NIU-101'));
  const department = profile?.department || profile?.departmentName || 'School of Engineering & Technology';
  const course = profile?.course || profile?.courseName || 'B.Tech';
  const branch = profile?.branch || profile?.branchName || 'Computer Science & Engineering';
  const semester = profile?.semester || 1;
  const section = profile?.section || profile?.sectionName || 'Section A';
  const batch = profile?.batch || profile?.batchName || 'Batch 2024-2028';
  const phone = profile?.phone || 'Not Provided';
  const address = profile?.address || 'Not Provided';

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-5">
      {/* Welcome banner — slim section header style */}
      <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 md:px-5 md:py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {today}
            </p>
            <h2 className="mt-0.5 text-lg font-bold tracking-tight text-slate-900 dark:text-white md:text-xl">
              Welcome back, {name.split(' ')[0]}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300">
              Student access
            </span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Academic Snapshot
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                value={name}
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
                value={`Semester ${semester}`}
                accent="indigo"
                description="Ongoing academic term"
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
                value={course}
                accent="purple"
                description={branch}
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                }
              />
              <DashboardCard
                title="Section / Batch"
                value={section}
                accent="emerald"
                description={batch}
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
      <section>
        <div className="erp-card p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">My Profile</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete information fetched from your student account
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
              <div className="rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Full Name</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{name}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Email ID</p>
                <p className="mt-1 break-all font-semibold text-slate-900 dark:text-white">{email}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Roll Number</p>
                <p className="mt-1 font-mono font-semibold text-slate-900 dark:text-white">{rollNo}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Department</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{department}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Course / Branch</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {course} ({branch})
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Semester</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                  Semester {semester}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Section / Batch</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {section} / {batch}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Phone / Address</p>
                <p className="mt-1 break-all text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {phone} / {address}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

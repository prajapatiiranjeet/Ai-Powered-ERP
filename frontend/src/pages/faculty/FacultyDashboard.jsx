import DashboardCard from '../../components/common/DashboardCard.jsx';
import QuickActionCard from '../../components/common/QuickActionCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const email = user?.email || '—';
  const displayName =
    user?.name ||
    (email !== '—' ? email.split('@')[0] : 'Faculty');
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
              Welcome, Prof. {displayName.split(' ')[0]} 👨‍🏫
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 md:text-sm">
              Noida International University · Faculty Portal
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Academic Session Active
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              Faculty
            </span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Faculty Overview
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            title="Faculty Info"
            value={user?.name || '—'}
            accent="teal"
            description={email}
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
          <DashboardCard
            title="Employee ID"
            value="—"
            accent="emerald"
            description="(No GET profile endpoint)"
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
                <circle cx="9" cy="10" r="2" />
                <path d="M15 8h2M15 12h2M7 16h10" />
              </svg>
            }
          />
          <DashboardCard
            title="Designation"
            value="—"
            accent="blue"
            description="(No GET profile endpoint)"
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3 6 6 1-4.5 4.5 1 6.5L12 17l-5.5 3 1-6.5L3 9l6-1z" />
              </svg>
            }
          />
          <DashboardCard
            title="Department"
            value="—"
            accent="indigo"
            description="(No GET profile endpoint)"
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4v18" />
                <path d="M19 21V11l-6-4" />
              </svg>
            }
          />
        </div>
      </section>

      {/* Teaching info + quick actions */}
      <section className="grid gap-6 xl:grid-cols-3">
        <div className="erp-card p-6 xl:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Academic Profile</h3>
            <p className="text-xs text-slate-500">
              Faculty-specific information mapped from your account
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Full Name', value: user?.name || '—', accent: true },
              { label: 'Email ID', value: email, accent: true },
              { label: 'Designation', value: '— (missing API)', dashed: true },
              { label: 'Department', value: '— (missing API)', dashed: true },
              { label: 'Specialization', value: '— (missing API)', dashed: true },
              { label: 'Highest Qualification', value: '— (missing API)', dashed: true },
              { label: 'Joining Date', value: '— (missing API)', dashed: true },
              { label: 'Phone / Address', value: '— (missing API)', dashed: true }
            ].map((f) => (
              <div
                key={f.label}
                className={`rounded-lg border bg-white px-4 py-3 ${
                  f.dashed ? 'border-dashed border-slate-300' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <p className={`text-xs uppercase tracking-wide ${f.dashed ? 'text-slate-400' : 'text-slate-500'}`}>
                  {f.label}
                </p>
                <p className={`mt-1 break-all font-semibold ${f.dashed ? 'text-slate-500' : f.accent ? 'text-slate-900' : 'text-slate-800'}`}>
                  {f.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-lg border border-teal-100 bg-teal-50/60 p-4 text-xs text-teal-800">
            ⚠️ Backend limitation: FacultyController has no <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px]">GET /faculty/view-profile</code> endpoint.
            Profile fields above can't be fetched until backend adds a read endpoint. Only PUT (update) is available today.
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <QuickActionCard
                accent="teal"
                title="Update My Profile"
                description="Edit faculty details"
                icon={
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                }
              />
              <QuickActionCard
                accent="emerald"
                title="Teaching Assignments"
                description="View assigned subjects"
                icon={
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                  </svg>
                }
              />
              <QuickActionCard
                accent="blue"
                title="Change Password"
                description="Keep account secure"
                icon={
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                }
              />
            </div>
          </div>

          <div className="erp-card border-teal-200 bg-teal-50/60 p-5">
            <h4 className="text-sm font-semibold text-teal-800">📋 Faculty Bug Note</h4>
            <p className="mt-2 text-xs text-teal-800">
              FacultyService.updatefaculty contains a bug where phone is set to itself instead of the DTO value —
              phone updates silently fail on the backend today.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

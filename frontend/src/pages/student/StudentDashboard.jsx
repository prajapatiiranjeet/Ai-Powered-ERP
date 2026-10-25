import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardPageHeader from '../../components/common/DashboardPageHeader.jsx';
import CohortContextRail from '../../components/common/CohortContextRail.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { studentService } from '../../services/studentService.js';
import { useAuth } from '../../context/AuthContext.jsx';

function Fact({ label, value }) {
  return <div className="dashboard-fact"><dt>{label}</dt><dd>{value || '—'}</dd></div>;
}

function ArrowIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08z" clipRule="evenodd"/></svg>;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [attendance, setAttendance] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState('');

  const loadProfile = async () => {
    setProfileLoading(true);
    setProfileError('');
    try {
      const result = await studentService.viewProfile();
      setProfile(result && typeof result === 'object' ? result : null);
    } catch (error) {
      setProfileError(error?.message || 'Unable to load your academic profile. Please retry.');
    } finally {
      setProfileLoading(false);
    }
  };

  const loadAttendance = async () => {
    setAttendanceLoading(true);
    setAttendanceError('');
    try {
      const result = await studentService.getAttendance();
      setAttendance(result && typeof result === 'object' && !Array.isArray(result) ? result : null);
    } catch (error) {
      setAttendanceError(error?.message || 'Unable to load attendance. Please retry.');
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    loadAttendance();
  }, []);

  const name = profile?.fullName || profile?.name || user?.name || 'Student';
  const email = profile?.email || user?.email || '—';
  const firstName = String(name).trim().split(/\s+/)[0] || 'Student';
  const course = profile?.courseName || profile?.course || '—';
  const department = profile?.departmentName || profile?.department || '—';
  const branch = profile?.branchName || profile?.branch || '—';
  const semester = profile?.semester ? `Semester ${profile.semester}` : '—';
  const section = profile?.sectionName || profile?.section || '—';
  const batch = profile?.batchName || profile?.batch || '—';
  const rawPercentage = attendance?.presentPercentage;
  const percentage = Number(rawPercentage);
  const hasPercentage = rawPercentage !== undefined && rawPercentage !== null && rawPercentage !== '' && Number.isFinite(percentage) && percentage >= 0 && percentage <= 100;
  const classCount = Number(attendance?.noOfClasses);
  const hasRecords = Number.isFinite(classCount) && classCount > 0;
  const present = attendance?.present ?? attendance?.presentCount ?? '—';
  const absent = attendance?.absent ?? attendance?.absentCount ?? '—';
  const leave = attendance?.leave ?? '—';
  const today = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <div className="dashboard-page dashboard-student" aria-busy={profileLoading || attendanceLoading}>
      <DashboardPageHeader
        eyebrow={`${today} · Your academic record`}
        title={`Welcome back, ${firstName}`}
        description="Check your attendance standing, understand your enrollment context, and find your records."
        meta={<span className="dashboard-context-pill">{semester} <span aria-hidden="true">·</span> {course}</span>}
      />
      {!profileLoading && profile ? <CohortContextRail items={[
        { label: 'Department', value: department },
        { label: 'Course', value: course },
        { label: 'Branch', value: branch },
        { label: 'Semester / section', value: `${semester} · ${section}` },
        { label: 'Batch', value: batch }
      ]} /> : null}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]" aria-labelledby="student-progress-title">
        <div className="dashboard-attendance-hero">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="dashboard-eyebrow">Academic progress</p>
              <h2 id="student-progress-title" className="text-lg font-bold tracking-tight text-slate-900">Attendance overview</h2>
              <p className="mt-1 text-sm text-slate-600">Based on attendance recorded for your classes.</p>
            </div>
            <Link to="/student/attendance" className="dashboard-action-link !min-h-11 !gap-2 !rounded-full !px-4 !py-2 !text-sm !font-semibold !text-emerald-900">View full attendance <ArrowIcon /></Link>
          </div>
          <div className="mt-7 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-end">
            <div>
              <p className="text-xs font-semibold text-slate-600">Present percentage</p>
              {attendanceLoading ? <div className="mt-3 h-11 w-32 animate-pulse rounded-lg bg-emerald-100" aria-hidden="true" /> : attendanceError ? <p className="mt-2 text-sm font-semibold text-rose-800">Unavailable</p> : hasRecords && hasPercentage ? <p className="dashboard-attendance-value mt-2">{percentage.toFixed(1)}<span className="text-2xl">%</span></p> : <p className="mt-2 text-sm font-semibold text-slate-600">No attendance data yet</p>}
            </div>
            <div className="pb-1">
              <div className="mb-2 flex justify-between gap-3 text-xs font-medium text-slate-600"><span>Attendance recorded</span><span>{hasRecords ? `${classCount} classes` : '—'}</span></div>
              <div className="dashboard-progress-track" role="progressbar" aria-label="Present percentage" aria-valuemin="0" aria-valuemax="100" aria-valuenow={hasPercentage && hasRecords ? percentage : undefined} aria-valuetext={hasPercentage && hasRecords ? `${percentage.toFixed(1)} percent present` : 'Attendance unavailable'}>
                <div className="dashboard-progress-fill" style={{ width: `${hasPercentage && hasRecords ? percentage : 0}%` }} />
              </div>
            </div>
          </div>
          {attendanceLoading ? <div className="mt-6 flex min-h-8 items-center" role="status"><LoadingSpinner size="sm" label="Loading attendance" /></div> : null}
          {attendanceError ? <div className="mt-5"><ErrorMessage message={attendanceError} onRetry={loadAttendance} /></div> : null}
          {!attendanceLoading && !attendanceError && !hasRecords ? <p className="mt-5 rounded-xl border border-dashed border-emerald-300 bg-white/70 px-4 py-3 text-sm text-slate-600">No class attendance has been recorded yet. Your attendance history will appear here when faculty submits it.</p> : null}
          {!attendanceLoading && !attendanceError && hasRecords ? <div className="mt-6 grid grid-cols-3 gap-2 border-t border-emerald-200/80 pt-5"><div><p className="text-[11px] font-medium text-slate-600">Present</p><p className="mt-1 text-lg font-bold text-emerald-900 dark:text-emerald-300">{present}</p></div><div><p className="text-[11px] font-medium text-slate-600">Absent</p><p className="mt-1 text-lg font-bold text-rose-800 dark:text-rose-300">{absent}</p></div><div><p className="text-[11px] font-medium text-slate-600">Leave</p><p className="mt-1 text-lg font-bold text-amber-800 dark:text-amber-300">{leave}</p></div></div> : null}
        </div>

        <aside className="dashboard-panel dashboard-panel__body flex flex-col justify-between gap-5">
          <div>
            <p className="dashboard-eyebrow">Your next step</p>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Stay on top of the essentials</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Check your recorded classes or review the information connected to your account.</p>
          </div>
          <div className="grid gap-2">
            <Link to="/student/attendance" className="dashboard-action-link"><span className="dashboard-action-link__icon"><svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 2v4m8-4v4M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"/><path d="m8 14 2 2 5-5"/></svg></span><span><span className="dashboard-action-link__title">Attendance history</span><span className="dashboard-action-link__description block">Review subject and date details</span></span><ArrowIcon /></Link>
            <Link to="/student/profile" className="dashboard-action-link"><span className="dashboard-action-link__icon"><svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></span><span><span className="dashboard-action-link__title">My profile</span><span className="dashboard-action-link__description block">Review your academic details</span></span><ArrowIcon /></Link>
            <Link to="/student/change-password" className="dashboard-action-link"><span className="dashboard-action-link__icon"><svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span><span><span className="dashboard-action-link__title">Account security</span><span className="dashboard-action-link__description block">Change your password</span></span><ArrowIcon /></Link>
          </div>
        </aside>
      </section>

      <section aria-labelledby="student-details-title">
        <div className="dashboard-section-heading"><div><h2 id="student-details-title">Academic context</h2><p>Your enrollment information, loaded from your student profile.</p></div><Link to="/student/profile" className="text-sm font-semibold text-emerald-800 underline-offset-4 hover:underline">View profile</Link></div>
        {profileLoading ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" role="status" aria-label="Loading academic details">{Array.from({ length: 4 }, (_, index) => <div key={index} className="dashboard-fact animate-pulse"><div className="h-3 w-20 rounded bg-slate-200"/><div className="mt-3 h-4 w-32 rounded bg-slate-200"/></div>)}</div> : null}
        {profileError ? <ErrorMessage message={profileError} onRetry={loadProfile} /> : null}
        {!profileLoading && !profileError ? profile ? <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Fact label="Department" value={department}/><Fact label="Course / branch" value={`${course} / ${branch}`}/><Fact label="Section / batch" value={`${section} / ${batch}`}/><Fact label="University email" value={email}/></dl> : <div className="dashboard-empty">Your profile is not available yet. Retry to load your academic details.</div> : null}
      </section>
    </div>
  );
}

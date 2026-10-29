import StudentAttendancePanel from '../../components/student/StudentAttendancePanel.jsx';

export default function StudentAttendancePage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Student portal</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Attendance</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review your subject totals and check attendance recorded on any date.</p>
      </header>
      <StudentAttendancePanel />
    </div>
  );
}

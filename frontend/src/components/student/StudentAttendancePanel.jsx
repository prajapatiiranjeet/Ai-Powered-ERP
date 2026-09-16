import { useEffect, useMemo, useState } from 'react';
import { studentService } from '../../services/studentService.js';

const statusStyles = {
  PRESENT: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800/60',
  ABSENT: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900/70',
  LEAVE: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800/60'
};

const statusLabel = { PRESENT: 'Present', ABSENT: 'Absent', LEAVE: 'Leave' };

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
}

export default function StudentAttendancePanel() {
  const [report, setReport] = useState(null);
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    studentService.getAttendance()
      .then((data) => setReport(data && !Array.isArray(data) ? data : null))
      .catch((err) => setError(err.message || 'Unable to load attendance'));
  }, []);

  const records = useMemo(() => (report?.records || []).filter((record) => (
    (subjectFilter === 'ALL' || String(record.offeringId) === subjectFilter)
    && (statusFilter === 'ALL' || record.status === statusFilter)
    && (!dateFilter || record.date === dateFilter)
  )), [report, subjectFilter, statusFilter, dateFilter]);

  return (
    <section className="erp-card overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800 md:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Academic record</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Attendance</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Subject totals and every marked class date in one place.</p>
          </div>
          {report?.records?.length ? <p className="text-xs text-slate-500 dark:text-slate-400">{report.records.length} class records</p> : null}
        </div>
      </div>

      <div className="px-5 py-5 md:px-6">
        {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">{error}</p> : null}
        {!error && !report ? <p className="text-sm text-slate-500 dark:text-slate-400">No attendance records found.</p> : null}
        {report ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="No. of Classes" value={report.noOfClasses} />
              <Metric label="Present (P)" value={report.present} tone="emerald" />
              <Metric label="Absent (A)" value={report.absent} tone="rose" />
              <Metric label="Leave (L)" value={report.leave} tone="amber" />
            </div>
            <div className="mt-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Overall Present %</span>
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{Number(report.presentPercentage || 0).toFixed(2)}%</span>
            </div>

            <div className="mt-8">
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">Attendance Records Subject Wise</h4>
              <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
                    <tr><th className="px-3 py-3">Subject Name</th><th className="px-3 py-3">Total Class Held</th><th className="px-3 py-3">Present Count</th><th className="px-3 py-3">Inactive</th><th className="px-3 py-3">Leave</th><th className="px-3 py-3">Absent Count</th><th className="px-3 py-3">Penalty</th><th className="px-3 py-3">Net Present</th><th className="px-3 py-3">Present %</th></tr>
                  </thead>
                  <tbody>{(report.subjectSummaries || []).map((item) => <tr key={item.offeringId} className="border-t border-slate-100 dark:border-slate-800"><td className="px-3 py-3"><span className="font-semibold text-slate-900 dark:text-white">{item.subjectName}</span><span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{item.subjectCode}</span></td><td className="px-3 py-3">{item.totalClassHeld}</td><td className="px-3 py-3 font-semibold text-emerald-700 dark:text-emerald-400">{item.presentCount}</td><td className="px-3 py-3">{item.inactive}</td><td className="px-3 py-3 text-amber-700 dark:text-amber-400">{item.leave}</td><td className="px-3 py-3 text-rose-700 dark:text-rose-400">{item.absentCount}</td><td className="px-3 py-3">{item.penalty}</td><td className="px-3 py-3 font-semibold">{item.netPresent}</td><td className="px-3 py-3 font-semibold">{Number(item.percentage || 0).toFixed(2)}%</td></tr>)}</tbody>
                </table>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div><h4 className="text-base font-semibold text-slate-900 dark:text-white">Date-wise Attendance</h4><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Each row is one class marked by faculty.</p></div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Check date<input aria-label="Filter attendance by date" className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal dark:border-slate-700 dark:bg-slate-900 dark:text-white" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} /></label>
                  <select aria-label="Filter attendance by subject" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}><option value="ALL">All subjects</option>{(report.subjectSummaries || []).map((item) => <option key={item.offeringId} value={item.offeringId}>{item.subjectCode}</option>)}</select>
                  <select aria-label="Filter attendance by status" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">All statuses</option><option value="PRESENT">Present</option><option value="ABSENT">Absent</option><option value="LEAVE">Leave</option></select>
                </div>
              </div>
              <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/70 dark:text-slate-400"><tr><th className="px-3 py-3">Date</th><th className="px-3 py-3">Subject</th><th className="px-3 py-3">Status</th></tr></thead><tbody>{records.length ? records.map((record) => <tr key={`${record.offeringId}-${record.date}`} className="border-t border-slate-100 dark:border-slate-800"><td className="px-3 py-3 font-medium text-slate-700 dark:text-slate-300">{formatDate(record.date)}</td><td className="px-3 py-3"><span className="font-semibold text-slate-900 dark:text-white">{record.subjectName}</span><span className="ml-2 text-xs text-slate-500">{record.subjectCode}</span></td><td className="px-3 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[record.status] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>{statusLabel[record.status] || record.status}</span></td></tr>) : <tr><td className="px-3 py-6 text-center text-sm text-slate-500" colSpan="3">No records match these filters.</td></tr>}</tbody></table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

function Metric({ label, value, tone = 'slate' }) {
  const tones = { slate: 'text-slate-900 dark:text-white', emerald: 'text-emerald-700 dark:text-emerald-400', rose: 'text-rose-700 dark:text-rose-400', amber: 'text-amber-700 dark:text-amber-400' };
  return <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"><p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p><p className={`mt-1 text-2xl font-bold ${tones[tone]}`}>{value}</p></div>;
}

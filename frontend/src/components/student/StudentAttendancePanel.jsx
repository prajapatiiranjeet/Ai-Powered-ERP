import { useEffect, useState } from 'react';
import { studentService } from '../../services/studentService.js';

export default function StudentAttendancePanel() {
  // The backend calculates counts and percentage; this component only renders the summary.
  const [summary, setSummary] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    studentService.getAttendance()
      .then((data) => setSummary(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || 'Unable to load attendance'));
  }, []);

  return (
    <section className="erp-card p-6">
      <div className="mb-4"><h3 className="text-lg font-semibold text-slate-900 dark:text-white">Attendance Summary</h3><p className="text-xs text-slate-500 dark:text-slate-400">Your attendance by subject.</p></div>
      {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      {!error && summary.length === 0 ? <p className="text-sm text-slate-500">No attendance records found.</p> : null}
      {summary.length > 0 ? <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3">Subject</th><th className="px-3 py-3">Section</th><th className="px-3 py-3">Present</th><th className="px-3 py-3">Absent</th><th className="px-3 py-3">Leave</th><th className="px-3 py-3">Percentage</th></tr></thead><tbody>{summary.map((item) => <tr key={item.offeringId} className="border-b border-slate-100"><td className="px-3 py-3"><span className="font-semibold text-slate-900">{item.subjectCode}</span><span className="ml-2 text-slate-500">{item.subjectName}</span></td><td className="px-3 py-3 text-slate-500">{item.sectionName}</td><td className="px-3 py-3 text-emerald-700">{item.present}</td><td className="px-3 py-3 text-rose-700">{item.absent}</td><td className="px-3 py-3 text-amber-700">{item.leave}</td><td className="px-3 py-3 font-semibold">{item.percentage}%</td></tr>)}</tbody></table></div> : null}
    </section>
  );
}
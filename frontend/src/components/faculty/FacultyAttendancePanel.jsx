import { useEffect, useState } from 'react';
import { facultyService } from '../../services/facultyService.js';

const today = new Date().toISOString().slice(0, 10);

export default function FacultyAttendancePanel() {
  // Separate state keeps assignment selection, roster data, and save feedback independent.
  const [offerings, setOfferings] = useState([]);
  const [offeringId, setOfferingId] = useState('');
  const [date, setDate] = useState(today);
  const [roster, setRoster] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // First load the faculty's own offerings for the subject/section dropdown.
    facultyService.getOfferings()
      .then((data) => {
        const nextOfferings = Array.isArray(data) ? data : [];
        setOfferings(nextOfferings);
        setOfferingId(nextOfferings[0]?.offeringId ? String(nextOfferings[0].offeringId) : '');
      })
      .catch((err) => setError(err.message || 'Unable to load teaching assignments'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Changing the offering or date reloads the roster and existing statuses.
    if (!offeringId || !date) return;
    setRosterLoading(true);
    setError('');
    setSuccess('');
    facultyService.getAttendanceRoster(offeringId, date)
      .then((data) => {
        const nextRoster = Array.isArray(data) ? data : [];
        setRoster(nextRoster);
        setStatuses(Object.fromEntries(nextRoster.map((student) => [student.studentId, student.status || ''])));
      })
      .catch((err) => setError(err.message || 'Unable to load attendance roster'))
      .finally(() => setRosterLoading(false));
  }, [offeringId, date]);

  const saveAttendance = async () => {
    // Submit one complete roster so the backend can validate every student together.
    const records = roster.map((student) => ({ studentId: student.studentId, status: statuses[student.studentId] }));
    if (records.some((record) => !record.status)) {
      setError('Select a status for every student before saving.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updatedRoster = await facultyService.markAttendance({ offeringId: Number(offeringId), date, records });
      setRoster(Array.isArray(updatedRoster) ? updatedRoster : roster);
      setSuccess('Attendance saved successfully.');
    } catch (err) {
      setError(err.message || 'Unable to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const markAll = (status) => {
    setStatuses(Object.fromEntries(roster.map((student) => [student.studentId, status])));
    setError('');
    setSuccess('');
  };

  const markedCount = roster.filter((student) => statuses[student.studentId]).length;

  return (
    <section className="erp-card p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Mark Attendance</h3>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c0-.69.56-1.25 1.25-1.25h10c.69 0 1.25.56 1.25 1.25v.25a.75.75 0 01-1.5 0V8h-9.5v-.25zm0 3.375c0 .069.056.125.125.125h10.25a.125.125 0 00.125-.125v-1.25a.125.125 0 00-.125-.125H4.875a.125.125 0 00-.125.125v1.25zm0 2.875a.75.75 0 01.75-.75h10a.75.75 0 010 1.5h-10a.75.75 0 01-.75-.75zm.75 2.125a.125.125 0 00-.125.125v.25c0 .69.56 1.25 1.25 1.25h10c.69 0 1.25-.56 1.25-1.25v-.25a.125.125 0 00-.125-.125h-12.25z" clipRule="evenodd" /></svg>
              {new Date(date).toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Choose a teaching assignment. Date is automatically set to today.</p>
        </div>
        <div className="w-full sm:w-[360px] md:shrink-0">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Subject / Section
            <select
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20"
              value={offeringId}
              onChange={(event) => setOfferingId(event.target.value)}
              disabled={loading}
            >
              {offerings.length === 0 ? <option value="">No assignments found</option> : null}
              {offerings.map((offering) => (
                <option key={offering.offeringId} value={offering.offeringId}>
                  {offering.subjectCode} — {offering.subjectName || 'Subject'} · {offering.sectionName}
                </option>
              ))}
            </select>
          </label>
          {offeringId && offerings.length > 0 ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-[11px] text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
              {(() => {
                const active = offerings.find((o) => String(o.offeringId) === String(offeringId));
                if (!active) return null;
                return (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="font-bold tracking-wide">{active.subjectCode}</span>
                      <span className="opacity-60">|</span>
                      <span className="font-medium">{active.subjectName || '—'}</span>
                    </span>
                    <span className="opacity-60">·</span>
                    <span>Section <span className="font-semibold">{active.sectionName}</span></span>
                  </>
                );
              })()}
            </div>
          ) : null}
        </div>
      </div>

      {error ? <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">{error}</p> : null}
      {success ? <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-950/60 dark:text-emerald-300">{success}</p> : null}
      {rosterLoading ? <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Loading roster...</p> : null}
      {!rosterLoading && offeringId && roster.length === 0 ? <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">No students are assigned to this section.</p> : null}
      {roster.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/70 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Marked {markedCount} of {roster.length} students</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/70" onClick={() => markAll('PRESENT')}>Mark all present</button>
              <button type="button" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70" onClick={() => markAll('ABSENT')}>Mark all absent</button>
              <button type="button" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/70" onClick={() => markAll('LEAVE')}>Mark all leave</button>
            </div>
          </div>
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400"><tr><th className="px-3 py-3">Student</th><th className="px-3 py-3">Roll No.</th><th className="px-3 py-3">Status</th></tr></thead>
            <tbody>{roster.map((student) => <tr key={student.studentId} className="border-b border-slate-100 dark:border-slate-800/80"><td className="px-3 py-3 font-medium text-slate-900 dark:text-white">{student.studentName}</td><td className="px-3 py-3 text-slate-500 dark:text-slate-400">{student.rollNo}</td><td className="px-3 py-3"><select className="rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white" value={statuses[student.studentId] || ''} onChange={(event) => setStatuses((current) => ({ ...current, [student.studentId]: event.target.value }))}><option value="">Select status</option><option value="PRESENT">Present</option><option value="ABSENT">Absent</option><option value="LEAVE">Leave</option></select></td></tr>)}</tbody>
          </table>
          <button type="button" className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600" onClick={saveAttendance} disabled={saving}>{saving ? 'Saving...' : 'Save Attendance'}</button>
        </div>
      ) : null}
    </section>
  );
}
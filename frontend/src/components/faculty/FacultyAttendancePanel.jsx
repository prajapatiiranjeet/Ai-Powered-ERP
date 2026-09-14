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
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Mark Attendance</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Choose a teaching assignment and date.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-500">
            Subject / Section
            <select className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" value={offeringId} onChange={(event) => setOfferingId(event.target.value)} disabled={loading}>
              {offerings.length === 0 ? <option value="">No assignments found</option> : null}
              {offerings.map((offering) => <option key={offering.offeringId} value={offering.offeringId}>{offering.subjectCode} · {offering.sectionName}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-500">
            Date
            <input className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" type="date" max={today} value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
        </div>
      </div>

      {error ? <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      {success ? <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p> : null}
      {rosterLoading ? <p className="mt-6 text-sm text-slate-500">Loading roster...</p> : null}
      {!rosterLoading && offeringId && roster.length === 0 ? <p className="mt-6 text-sm text-slate-500">No students are assigned to this section.</p> : null}
      {roster.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-600">Marked {markedCount} of {roster.length} students</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100" onClick={() => markAll('PRESENT')}>Mark all present</button>
              <button type="button" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100" onClick={() => markAll('ABSENT')}>Mark all absent</button>
              <button type="button" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100" onClick={() => markAll('LEAVE')}>Mark all leave</button>
            </div>
          </div>
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3">Student</th><th className="px-3 py-3">Roll No.</th><th className="px-3 py-3">Status</th></tr></thead>
            <tbody>{roster.map((student) => <tr key={student.studentId} className="border-b border-slate-100"><td className="px-3 py-3 font-medium text-slate-900">{student.studentName}</td><td className="px-3 py-3 text-slate-500">{student.rollNo}</td><td className="px-3 py-3"><select className="rounded-lg border border-slate-300 bg-white px-3 py-2" value={statuses[student.studentId] || ''} onChange={(event) => setStatuses((current) => ({ ...current, [student.studentId]: event.target.value }))}><option value="">Select status</option><option value="PRESENT">Present</option><option value="ABSENT">Absent</option><option value="LEAVE">Leave</option></select></td></tr>)}</tbody>
          </table>
          <button type="button" className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" onClick={saveAttendance} disabled={saving}>{saving ? 'Saving...' : 'Save Attendance'}</button>
        </div>
      ) : null}
    </section>
  );
}
import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';

export default function SubjectAssignmentPanel() {
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [batches, setBatches] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [filters, setFilters] = useState({ departmentId: '', courseId: '', branchId: '', batchId: '' });
  const [form, setForm] = useState({ facultyId: '', csbsId: '', sectionId: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    adminService.getDepartments()
      .then((options) => setDepartments(Array.isArray(options) ? options : []))
      .catch((err) => setError(err.message || 'Unable to load departments'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setCourses([]);
    setBranches([]);
    setBatches([]);
    setFaculty([]);
    setSubjects([]);
    setSections([]);
    setFilters((current) => ({ ...current, courseId: '', branchId: '', batchId: '' }));
    setForm({ facultyId: '', csbsId: '', sectionId: '' });
    if (!filters.departmentId) return;
    adminService.getCourses(filters.departmentId)
      .then((options) => setCourses(Array.isArray(options) ? options : []))
      .catch((err) => setError(err.message || 'Unable to load courses'));
  }, [filters.departmentId]);

  useEffect(() => {
    setBranches([]);
    setBatches([]);
    setFaculty([]);
    setSubjects([]);
    setSections([]);
    setFilters((current) => ({ ...current, branchId: '', batchId: '' }));
    setForm({ facultyId: '', csbsId: '', sectionId: '' });
    if (!filters.courseId) return;
    adminService.getBranches(filters.courseId)
      .then((options) => setBranches(Array.isArray(options) ? options : []))
      .catch((err) => setError(err.message || 'Unable to load branches'));
  }, [filters.courseId]);

  useEffect(() => {
    setBatches([]);
    setFaculty([]);
    setSubjects([]);
    setSections([]);
    setFilters((current) => ({ ...current, batchId: '' }));
    setForm({ facultyId: '', csbsId: '', sectionId: '' });
    if (!filters.courseId || !filters.branchId) return;
    const lookup = { departmentId: filters.departmentId, courseId: filters.courseId, branchId: filters.branchId };
    Promise.all([
      adminService.getAssignmentBatches(lookup),
      adminService.getAssignmentSubjects(lookup),
      adminService.getAssignmentFaculty(lookup)
    ])
      .then(([batchOptions, subjectOptions, facultyOptions]) => {
        setBatches(Array.isArray(batchOptions) ? batchOptions : []);
        setSubjects(Array.isArray(subjectOptions) ? subjectOptions : []);
        setFaculty(Array.isArray(facultyOptions) ? facultyOptions : []);
      })
      .catch((err) => setError(err.message || 'Unable to load assignment options'));
  }, [filters.branchId]);

  useEffect(() => {
    setSections([]);
    setForm((current) => ({ ...current, sectionId: '' }));
    if (!filters.batchId) return;
    adminService.getAssignmentSections(filters.batchId)
      .then((sectionOptions) => setSections(Array.isArray(sectionOptions) ? sectionOptions : []))
      .catch((err) => setError(err.message || 'Unable to load faculty and sections'));
  }, [filters.batchId]);

  const updateFilter = (name, value) => {
    setError('');
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (!form.facultyId || !form.csbsId || !form.sectionId) return;
      await adminService.assignSubject({
        facultyId: Number(form.facultyId),
        csbsId: Number(form.csbsId),
        sectionId: Number(form.sectionId)
      });
      setSuccess('Subject assigned successfully. You can assign another subject to the same faculty.');
    } catch (err) {
      setError(err.message || 'Unable to assign subject');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="erp-card p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Assign Subject to Faculty</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Link a faculty member, subject, and student section for attendance.</p>
      </div>
      {error ? <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      {success ? <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p> : null}
      <form className="grid gap-4 md:grid-cols-4" onSubmit={submit}>
        <label className="erp-label">Department<select className="erp-input mt-1" value={filters.departmentId} onChange={(event) => updateFilter('departmentId', event.target.value)} disabled={loading}><option value="">Select department</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="erp-label">Course<select className="erp-input mt-1" value={filters.courseId} onChange={(event) => updateFilter('courseId', event.target.value)} disabled={!filters.departmentId}><option value="">Select course</option>{courses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="erp-label">Branch<select className="erp-input mt-1" value={filters.branchId} onChange={(event) => updateFilter('branchId', event.target.value)} disabled={!filters.courseId}><option value="">Select branch</option>{branches.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="erp-label">Batch<select className="erp-input mt-1" value={filters.batchId} onChange={(event) => updateFilter('batchId', event.target.value)} disabled={!filters.branchId}><option value="">Select batch</option>{batches.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="erp-label">Faculty<select className="erp-input mt-1" required value={form.facultyId} onChange={(event) => setForm({ ...form, facultyId: event.target.value })} disabled={!filters.branchId}><option value="">Select faculty</option>{faculty.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="erp-label">Subject<select className="erp-input mt-1" required value={form.csbsId} onChange={(event) => setForm({ ...form, csbsId: event.target.value })} disabled={!filters.branchId}><option value="">Select subject</option>{subjects.map((item) => <option key={item.id} value={item.id}>{item.subjectCode} · {item.subjectName} · Sem {item.semester}</option>)}</select></label>
        <label className="erp-label">Section<select className="erp-input mt-1" required value={form.sectionId} onChange={(event) => setForm({ ...form, sectionId: event.target.value })} disabled={!filters.batchId}><option value="">Select section</option>{sections.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <div className="md:col-span-3"><button className="erp-btn-primary" type="submit" disabled={loading || saving}>{saving ? 'Assigning...' : 'Assign Subject'}</button></div>
      </form>
    </section>
  );
}
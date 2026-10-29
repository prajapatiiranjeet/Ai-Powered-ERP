import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { studentService } from '../../services/studentService.js';

function splitName(fullName = '') {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts.shift() || '', lastName: parts.join(' ') };
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', address: '', semester: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    studentService.viewProfile()
      .then((data) => {
        setProfile(data);
        const name = splitName(data?.fullName);
        setForm({ firstName: name.firstName, lastName: name.lastName, phone: data?.phone === 'Not Provided' ? '' : data?.phone || '', address: data?.address === 'Not Provided' ? '' : data?.address || '', semester: data?.semester || '' });
      })
      .catch((err) => setError(err.message || 'Unable to load your profile'))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const updated = await studentService.updateProfile({ ...form, semester: form.semester ? Number(form.semester) : null });
      setProfile((current) => ({ ...current, ...updated }));
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Unable to update your profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-[320px] items-center justify-center"><LoadingSpinner label="Loading profile..." /></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Student portal</p><h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Update the contact details connected to your student account.</p></header>
      <section className="erp-card p-5 md:p-6">
        {error ? <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
        {message ? <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
        <form className="space-y-5" onSubmit={saveProfile}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" name="firstName" value={form.firstName} onChange={updateField} required />
            <Field label="Last name" name="lastName" value={form.lastName} onChange={updateField} />
            <Field label="Email" value={profile?.email || ''} disabled />
            <Field label="Phone" name="phone" value={form.phone} onChange={updateField} />
            <Field label="Semester" name="semester" type="number" min="1" value={form.semester} onChange={updateField} />
            <Field label="Roll number" value={profile?.rollNo || ''} disabled />
          </div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Address<textarea name="address" rows="3" value={form.address} onChange={updateField} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></label>
          <div className="flex justify-end"><button type="submit" disabled={saving} className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Saving...' : 'Save changes'}</button></div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, name, value, onChange, type = 'text', disabled = false, ...props }) {
  return <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}<input {...props} name={name} type={type} value={value} onChange={onChange} disabled={disabled} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:disabled:bg-slate-800" /></label>;
}

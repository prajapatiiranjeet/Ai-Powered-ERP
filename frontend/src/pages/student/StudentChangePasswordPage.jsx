import { useState } from 'react';
import { studentService } from '../../services/studentService.js';

export default function StudentChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: '', password: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const changePassword = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (form.password.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setSaving(true);
    try {
      await studentService.changePassword(form.currentPassword, form.password);
      setMessage('Password changed successfully.');
      setForm({ currentPassword: '', password: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message || 'Unable to change your password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Account security</p><h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Change Password</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Use a strong password you do not reuse elsewhere.</p></header>
      <section className="erp-card p-5 md:p-6">
        {error ? <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
        {message ? <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
        <form className="space-y-4" onSubmit={changePassword}>
          <PasswordField label="Current password" name="currentPassword" value={form.currentPassword} onChange={updateField} required />
          <PasswordField label="New password" name="password" value={form.password} onChange={updateField} minLength="6" required />
          <PasswordField label="Confirm new password" name="confirmPassword" value={form.confirmPassword} onChange={updateField} minLength="6" required />
          <div className="flex justify-end pt-2"><button type="submit" disabled={saving} className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Updating...' : 'Update password'}</button></div>
        </form>
      </section>
    </div>
  );
}

function PasswordField({ label, name, value, onChange, ...props }) {
  return <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}<input {...props} name={name} type="password" value={value} onChange={onChange} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></label>;
}

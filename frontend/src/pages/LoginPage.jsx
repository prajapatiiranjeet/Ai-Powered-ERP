import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import { ROLES, ROUTES } from '../utils/constants.js';

const roleDefaults = { [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD, [ROLES.STUDENT]: ROUTES.STUDENT_DASHBOARD, [ROLES.FACULTY]: ROUTES.FACULTY_DASHBOARD };

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = { email: '', password: '' };
    if (!form.email.trim()) nextErrors.email = 'Enter your university email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!form.password) nextErrors.password = 'Enter your password.';
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      const role = await login(form.email.trim(), form.password);
      navigate(roleDefaults[role] ?? ROUTES.LOGIN, { replace: true });
    } catch (error) {
      const message = error?.message || 'Unable to sign in.';
      setSubmitError(/invalid|credentials|unauthorized|401|403|password|email/i.test(message) ? 'We couldn’t sign you in with those details. Check your email and password, then try again.' : message);
    } finally { setSubmitting(false); }
  };

  return <main className="login-v2-shell">
    <div className="login-v2-bg" aria-hidden="true"><div className="login-v2-bg__noise"/></div>
    <div className="login-v2-frame">
      <section className="login-v2-card" aria-labelledby="login-title">
        <div className="login-v2-hero">
          <div className="login-v2-hero__emblem"><img src="/Mainlogoerp.png" alt="New Innovation University" className="login-v2-hero__logo"/></div>
          <div className="login-v2-hero__text"><p className="login-v2-hero__kicker">New Innovation University</p><h1 id="login-title" className="login-v2-hero__title">Your campus, connected.</h1><p className="login-v2-hero__subtitle">A simpler way to stay on top of university life.</p></div>
        </div>
        <div className="login-v2-divider" aria-hidden="true"/>
        <form className="login-v2-form" onSubmit={onSubmit} noValidate>
          <div className="login-v2-form__heading"><p className="login-v2-form__eyebrow">Campus portal</p><h2>Welcome back</h2><p>Sign in with your university account to continue.</p></div>
          <label className="login-v2-field" htmlFor="email"><span className="login-v2-field__label">University email</span><input id="email" name="email" type="email" autoComplete="username" placeholder="name@niu.edu.in" disabled={submitting} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={`login-v2-field__input ${errors.email ? 'login-v2-field__input--error' : ''}`}/>{errors.email && <small>{errors.email}</small>}</label>
          <label className="login-v2-field" htmlFor="password"><span className="login-v2-field__label">Password</span><input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" disabled={submitting} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className={`login-v2-field__input ${errors.password ? 'login-v2-field__input--error' : ''}`}/>{errors.password && <small>{errors.password}</small>}</label>
          {submitError && <div role="alert" className="login-v2-error"><ErrorMessage message={submitError}/></div>}
          <button type="submit" className="login-v2-submit" disabled={submitting}>{submitting && <LoadingSpinner size="sm" color="text-white"/>}<span>{submitting ? 'Signing in…' : 'Sign in to portal'}</span>{!submitting && <span aria-hidden="true">→</span>}</button>
          <p className="login-v2-help">Need access? Contact your university administrator.</p>
        </form>
        <footer className="login-v2-foot"><span>© {new Date().getFullYear()} New Innovation University</span><span className="login-v2-foot__dot" aria-hidden="true">·</span><span>Secure campus access</span></footer>
      </section>
    </div>
  </main>;
}

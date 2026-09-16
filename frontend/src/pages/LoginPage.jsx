import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import { ROLES, ROUTES } from '../utils/constants.js';

const roleDefaults = {
  [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
  [ROLES.STUDENT]: ROUTES.STUDENT_DASHBOARD,
  [ROLES.FACULTY]: ROUTES.FACULTY_DASHBOARD
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const e = { email: '', password: '' };
    let ok = true;
    if (!form.email.trim()) {
      e.email = 'Email ID is required';
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = 'Please enter a valid email address';
      ok = false;
    }
    if (!form.password) {
      e.password = 'Password is required';
      ok = false;
    } else if (form.password.length < 4) {
      e.password = 'Password is too short';
      ok = false;
    }
    setErrors(e);
    return ok;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const role = await login(form.email.trim(), form.password);
      const dest = roleDefaults[role] ?? ROUTES.LOGIN;
      navigate(dest, { replace: true });
    } catch (err) {
      const msg = err?.message || 'Login failed';
      setSubmitError(
        /invalid|credentials|unauthorized|401|403|password|email/i.test(msg)
          ? 'Invalid email or password. Please try again.'
          : msg
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-v2-shell">
      <div className="login-v2-bg" aria-hidden="true">
        <div className="login-v2-bg__blob login-v2-bg__blob--a" />
        <div className="login-v2-bg__blob login-v2-bg__blob--b" />
        <div className="login-v2-bg__noise" />
      </div>

      <div className="login-v2-frame">
        <section className="login-v2-card" aria-labelledby="login-title">
          <div className="login-v2-card__grain" aria-hidden="true" />

          <div className="login-v2-hero">
            <div className="login-v2-hero__emblem">
              <img
                src="/Mainlogoerp.png"
                alt="New Innovation University logo"
                className="login-v2-hero__logo"
              />
            </div>
            <div className="login-v2-hero__text">
              <p className="login-v2-hero__kicker">Welcome back</p>
              <h1 id="login-title" className="login-v2-hero__title">
                New Innovation University
              </h1>
              <p className="login-v2-hero__subtitle">ERP Smart Academic Portal</p>
            </div>
          </div>

          <div className="login-v2-divider" aria-hidden="true">
            <span />
            <p>Sign in to continue</p>
            <span />
          </div>

          <form className="login-v2-form" onSubmit={onSubmit} noValidate>
            <label className="login-v2-field" htmlFor="email">
              <span className="login-v2-field__label">Email ID</span>
              <div className="login-v2-field__wrap">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="student@niu.edu.in"
                  disabled={submitting}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`login-v2-field__input login-v2-field__input--plain ${errors.email ? 'login-v2-field__input--error' : ''}`}
                />
              </div>
              {errors.email ? <small>{errors.email}</small> : null}
            </label>

            <label className="login-v2-field" htmlFor="password">
              <span className="login-v2-field__label">Password</span>
              <div className="login-v2-field__wrap">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={submitting}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`login-v2-field__input login-v2-field__input--plain ${errors.password ? 'login-v2-field__input--error' : ''}`}
                />
              </div>
              {errors.password ? <small>{errors.password}</small> : null}
            </label>

            {submitError ? <ErrorMessage message={submitError} /> : null}

            <button type="submit" className="login-v2-submit" disabled={submitting}>
              {submitting ? <LoadingSpinner size="sm" color="text-white" /> : null}
              <span>{submitting ? 'Authenticating...' : 'Sign In to Portal'}</span>
              {!submitting ? <span aria-hidden="true">&#8594;</span> : null}
            </button>
          </form>

          <footer className="login-v2-foot">
            <span>{new Date().getFullYear()} New Innovation University</span>
            <span className="login-v2-foot__dot" aria-hidden="true">·</span>
            <span>ERP Portal</span>
          </footer>
        </section>
      </div>
    </main>
  );
}

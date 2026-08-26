import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import ShapeGrid from '../components/common/ShapeGrid.jsx';
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
    <main className="login-shell">
      <ShapeGrid className="shape-grid" speed={0.25} squareSize={40} direction="diagonal" borderColor="#205124" hoverFillColor="#222" hoverColor="#876a12" size={30} shape="hexagon" hoverTrailAmount={9} />

      <section className="login-card" aria-labelledby="login-title">
        <div className="login-card-inner">
          <div className="login-brand">
            <div className="login-logo-wrap">
              <img
                src="/noida-international-university-logo-png_seeklogo-505931-removebg-preview.png"
                alt="Noida International University Logo"
                className="login-logo"
              />
            </div>

            <p className="login-kicker">Welcome back</p>
            <h1 id="login-title" className="login-title">
              Noida International University
            </h1>
            <p className="login-subtitle">ERP Smart Academic Portal</p>
          </div>

          <form className="login-form" onSubmit={onSubmit} noValidate>
            <label className="login-field" htmlFor="email">
              <span>Email ID</span>
              <div className="login-input-wrap">
                <span className="login-input-icon" aria-hidden="true">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                  </svg>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="student@niu.edu.in"
                  disabled={submitting}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`login-input ${errors.email ? 'login-input-error' : ''}`}
                />
              </div>
              {errors.email ? <small>{errors.email}</small> : null}
            </label>

            <label className="login-field" htmlFor="password">
              <span>Password</span>
              <div className="login-input-wrap">
                <span className="login-input-icon" aria-hidden="true">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={submitting}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`login-input ${errors.password ? 'login-input-error' : ''}`}
                />
              </div>
              {errors.password ? <small>{errors.password}</small> : null}
            </label>

            {submitError ? <ErrorMessage message={submitError} /> : null}

            <button type="submit" className="login-submit" disabled={submitting}>
              {submitting ? <LoadingSpinner size="sm" color="text-white" /> : null}
              <span>{submitting ? 'Authenticating...' : 'Sign In to Portal'}</span>
              {!submitting ? <span aria-hidden="true">&#8594;</span> : null}
            </button>
          </form>

          <p className="login-footer">
            {new Date().getFullYear()} Noida International University <span aria-hidden="true">·</span> NIU ERP
          </p>
        </div>
      </section>
    </main>
  );
}

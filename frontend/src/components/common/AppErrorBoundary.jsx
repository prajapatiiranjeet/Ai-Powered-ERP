import React from 'react';

export default class AppErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Preserve the diagnostic in DevTools so a render failure is never silently hidden.
    console.error('Unhandled application render error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-10 text-slate-900">
        <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" role="alert">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">Page error</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">This page couldn’t load</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The application hit an unexpected rendering error. Retry the page; if it happens again, share the error details with your administrator.
          </p>
          {import.meta.env.DEV && (
            <pre className="mt-5 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-100">
              {this.state.error?.stack || this.state.error?.message || String(this.state.error)}
            </pre>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
          >
            Reload page
          </button>
        </section>
      </main>
    );
  }
}

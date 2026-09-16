import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

(function initSystemThemeSync() {
  const root = document.documentElement;
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const apply = (dark) => {
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
  };
  apply(mql.matches);
  try {
    mql.addEventListener('change', (e) => apply(e.matches));
  } catch {
      mql.addListener((e) => apply(e.matches));
  }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

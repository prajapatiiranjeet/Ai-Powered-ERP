import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import * as authService from '../services/authService.js';
import { STORAGE_KEYS, ROLES, ROLE_DEFAULT_ROUTE } from '../utils/constants.js';
import { isTokenValid } from '../utils/jwt.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    loading: true,
    isAuthenticated: false
  });

  const hydrateFromStorage = useCallback(() => {
    const auth = authService.getStoredAuth();
    if (!auth?.token || !isTokenValid(auth.token)) {
      authService.logout();
      setState({ user: null, loading: false, isAuthenticated: false });
      return;
    }
    setState({
      user: {
        id: auth.userId,
        email: auth.email,
        role: auth.role,
        name: auth.name
      },
      loading: false,
      isAuthenticated: true
    });
  }, []);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const login = useCallback(async (email, password) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const { id, role } = await authService.login(email, password);
      const storedEmail = localStorage.getItem(STORAGE_KEYS.EMAIL);
      const storedName = localStorage.getItem(STORAGE_KEYS.NAME);
      setState({
        user: { id: String(id), email: storedEmail, role, name: storedName },
        loading: false,
        isAuthenticated: true
      });
      return role;
    } catch (err) {
      authService.logout();
      setState({ user: null, loading: false, isAuthenticated: false });
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setState({ user: null, loading: false, isAuthenticated: false });
  }, []);

  const refreshUser = useCallback(async () => {
    await authService.refreshUserName();
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const value = useMemo(
    () => ({
      user: state.user,
      loading: state.loading,
      isAuthenticated: state.isAuthenticated,
      login,
      logout,
      refreshUser,
      roleDefaultRoute: state.user?.role ? ROLE_DEFAULT_ROUTE[state.user.role] : null
    }),
    [state, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

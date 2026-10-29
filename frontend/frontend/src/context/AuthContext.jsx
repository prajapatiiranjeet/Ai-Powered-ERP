import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';
import { ROLE_DEFAULT_ROUTE, STORAGE_KEYS, normalizeRole } from '../utils/constants.js';
import { isTokenValid } from '../utils/jwt.js';

const AuthContext = createContext(null);
const initialState = { user: null, loading: true, isAuthenticated: false };

export function AuthProvider({ children }) {
  const [state, setState] = useState(initialState);

  const hydrateFromStorage = useCallback(() => {
    try {
      const auth = authService.getStoredAuth();
      if (!auth?.token || !isTokenValid(auth.token) || !auth.role) {
        authService.logout();
        setState({ user: null, loading: false, isAuthenticated: false });
        return;
      }
      setState({
        user: { id: auth.userId, email: auth.email, role: auth.role, name: auth.name },
        loading: false,
        isAuthenticated: true
      });
    } catch {
      authService.logout();
      setState({ user: null, loading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => { hydrateFromStorage(); }, [hydrateFromStorage]);

  const login = useCallback(async (email, password) => {
    setState((current) => ({ ...current, loading: true }));
    try {
      const { id, role } = await authService.login(email, password);
      const user = {
        id: id === null || id === undefined ? null : String(id),
        email: localStorage.getItem(STORAGE_KEYS.EMAIL),
        role: normalizeRole(role),
        name: localStorage.getItem(STORAGE_KEYS.NAME)
      };
      if (!user.role) throw new Error('The server did not return a recognized account role. Please contact your administrator.');
      setState({ user, loading: false, isAuthenticated: true });
      return user.role;
    } catch (error) {
      authService.logout();
      setState({ user: null, loading: false, isAuthenticated: false });
      throw error;
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

  const value = useMemo(() => ({
    user: state.user,
    loading: state.loading,
    isAuthenticated: state.isAuthenticated,
    login,
    logout,
    refreshUser,
    roleDefaultRoute: state.user?.role ? ROLE_DEFAULT_ROUTE[state.user.role] : null
  }), [state, login, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

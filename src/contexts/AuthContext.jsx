/**
 * AuthContext.jsx — Global authentication context.
 *
 * Provides: user, role, isAuthenticated, login, quickLogin, logout
 * Reads initial state from localStorage on mount.
 *
 * Wrap App with <AuthProvider> in main.jsx.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const role = user?.user_type || null;
  const isAuthenticated = user !== null;

  const login = useCallback(async (email, selectedRole) => {
    setIsLoggingIn(true);
    setLoginError('');
    const result = await authService.login(email, selectedRole);
    if (result.success) {
      setUser(result.user);
    } else {
      setLoginError(result.error);
    }
    setIsLoggingIn(false);
    return result;
  }, []);

  const quickLogin = useCallback(async (demoUser) => {
    setIsLoggingIn(true);
    setLoginError('');
    const result = await authService.quickLogin(demoUser);
    if (result.success) setUser(result.user);
    setIsLoggingIn(false);
    return result;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setLoginError('');
  }, []);

  const updateUserPrefs = useCallback((prefs) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...prefs };
      localStorage.setItem('medconnect_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      role,
      isAuthenticated,
      isLoggingIn,
      loginError,
      login,
      quickLogin,
      logout,
      updateUserPrefs,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

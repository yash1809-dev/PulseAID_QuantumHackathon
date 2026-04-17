/**
 * authService.js — Simulated authentication service.
 *
 * Validates against mock users. Stores session in localStorage.
 * Replace validation logic with real API call to upgrade to production.
 */

import { mockUsers } from '../data/users';

const STORAGE_KEY = 'medconnect_user';

export const authService = {
  /**
   * Simulate login: find user by email + role match.
   * In production, replace this with: POST /api/auth/login
   */
  login: async (email, selectedRole) => {
    await new Promise(r => setTimeout(r, 600)); // simulate network delay

    const found = mockUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.user_type === selectedRole
    );

    if (!found) {
      return { success: false, error: 'No account found with this email and role.' };
    }

    // Store session (omit password)
    const session = { ...found };
    delete session.password;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

    return { success: true, user: session };
  },

  /**
   * Dev quick-login — bypass email input for demo.
   */
  quickLogin: async (demoUser) => {
    await new Promise(r => setTimeout(r, 300));
    const session = { ...demoUser };
    delete session.password;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return { success: true, user: session };
  },

  /**
   * Logout — clear stored session.
   */
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Get currently logged in user from localStorage.
   * Returns null if no session.
   */
  getCurrentUser: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Get current role ('user' | 'hospital' | null)
   */
  getRole: () => {
    const u = authService.getCurrentUser();
    return u?.user_type || null;
  },

  isAuthenticated: () => {
    return authService.getCurrentUser() !== null;
  },
};

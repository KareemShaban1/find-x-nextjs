import { create } from 'zustand';
import { User } from '@/lib/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  _hydrated?: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  hydrate: () => void;
  isAuthenticated: () => boolean;
  isSuperAdmin: () => boolean;
  isOrganizationOwner: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  _hydrated: false,

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user, token });
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ user: null, token: null });
  },

  hydrate: () => {
    if (typeof window === 'undefined' || get()._hydrated) return;
    
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, _hydrated: true });
      } catch (e) {
        // Invalid data, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ _hydrated: true });
      }
    } else {
      set({ _hydrated: true });
    }
  },

  isAuthenticated: () => {
    return !!get().user && !!get().token;
  },

  isSuperAdmin: () => {
    return get().user?.role === 'super_admin';
  },

  isOrganizationOwner: () => {
    return get().user?.role === 'organization_owner';
  },
}));

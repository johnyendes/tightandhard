import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    role: 'user' | 'admin';
  } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: async (email: string, password: string) => {
    // Mock login - in production, this would call an API
    set({
      isAuthenticated: true,
      user: { id: '1', email, role: email.includes('admin') ? 'admin' : 'user' },
    });
  },
  logout: () => {
    set({ isAuthenticated: false, user: null });
  },
}));
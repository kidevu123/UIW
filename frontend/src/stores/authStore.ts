'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  preferences?: any;
  lastLogin?: string;
}

export interface AppStatus {
  userCount: number;
  maxUsers: number;
  registrationOpen: boolean;
  appInitialized: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  appStatus: AppStatus | null;
  partner: User | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  getAppStatus: () => Promise<void>;
  getPartner: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
}

// Configure axios defaults
axios.defaults.baseURL = API_URL;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,
      appStatus: null,
      partner: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          
          const response = await axios.post('/api/auth/login', {
            email,
            password,
          });

          const { user, token } = response.data;
          
          // Set authorization header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          set({ user, token, isLoading: false });
          
          toast.success(`Welcome back, ${user.displayName}!`);
          return true;
        } catch (error: any) {
          console.error('Login error:', error);
          toast.error(error.response?.data?.message || 'Login failed');
          set({ isLoading: false });
          return false;
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true });
          
          const response = await axios.post('/api/auth/register', userData);
          
          const { user, token } = response.data;
          
          // Set authorization header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          set({ user, token, isLoading: false });
          
          toast.success(`Welcome to UIW, ${user.displayName}!`);
          return true;
        } catch (error: any) {
          console.error('Registration error:', error);
          toast.error(error.response?.data?.message || 'Registration failed');
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          const { token } = get();
          
          if (token) {
            await axios.post('/api/auth/logout');
          }
          
          // Clear authorization header
          delete axios.defaults.headers.common['Authorization'];
          
          set({ user: null, token: null, partner: null });
          
          toast.success('Logged out successfully');
        } catch (error) {
          console.error('Logout error:', error);
          // Still clear local state even if server request fails
          delete axios.defaults.headers.common['Authorization'];
          set({ user: null, token: null, partner: null });
        }
      },

      checkAuth: async () => {
        try {
          const { token } = get();
          
          if (!token) {
            set({ isLoading: false });
            return;
          }
          
          // Set authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const response = await axios.get('/api/auth/me');
          
          set({ user: response.data.user, isLoading: false });
        } catch (error) {
          console.error('Auth check error:', error);
          
          // Clear invalid token
          delete axios.defaults.headers.common['Authorization'];
          set({ user: null, token: null, isLoading: false });
        }
      },

      getAppStatus: async () => {
        try {
          const response = await axios.get('/api/auth/status');
          set({ appStatus: response.data });
        } catch (error) {
          console.error('App status error:', error);
        }
      },

      getPartner: async () => {
        try {
          const { token } = get();
          
          if (!token) return;
          
          const response = await axios.get('/api/users/partner');
          set({ partner: response.data.partner });
        } catch (error) {
          console.error('Get partner error:', error);
        }
      },

      updateProfile: async (updates) => {
        try {
          const response = await axios.put('/api/users/profile', updates);
          
          set((state) => ({
            user: state.user ? { ...state.user, ...response.data.user } : null,
          }));
          
          toast.success('Profile updated successfully');
          return true;
        } catch (error: any) {
          console.error('Update profile error:', error);
          toast.error(error.response?.data?.message || 'Profile update failed');
          return false;
        }
      },
    }),
    {
      name: 'uiw-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);

// Provider component for context
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
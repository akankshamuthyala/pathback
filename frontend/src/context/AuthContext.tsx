import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
  quickDemoLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('pathback_access_token') || localStorage.getItem('sethu_access_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiClient.get('/auth/me');
      if (res.data.success && res.data.user) {
        setUser({
          id: res.data.user._id,
          ...res.data.user,
        });
      }
    } catch (err) {
      console.warn('Failed to restore session:', err);
      localStorage.removeItem('pathback_access_token');
      localStorage.removeItem('pathback_refresh_token');
      localStorage.removeItem('sethu_access_token');
      localStorage.removeItem('sethu_refresh_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (phoneNumber: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { phoneNumber, password });
      if (res.data.success) {
        localStorage.setItem('pathback_access_token', res.data.accessToken);
        localStorage.setItem('pathback_refresh_token', res.data.refreshToken);
        setUser(res.data.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = async (role: UserRole) => {
    const credentials: Record<UserRole, { phone: string; pass: string }> = {
      admin: { phone: '+15550000001', pass: 'Admin@123' },
      investigator: { phone: '+15550000002', pass: 'Investigator@123' },
      family_member: { phone: '+15550000003', pass: 'Family@123' },
      public_reporter: { phone: '+15550000004', pass: 'Reporter@123' },
      verified_org: { phone: '+15550000002', pass: 'Investigator@123' },
    };

    const target = credentials[role];
    if (target) {
      await login(target.phone, target.pass);
    }
  };

  const logout = () => {
    localStorage.removeItem('pathback_access_token');
    localStorage.removeItem('pathback_refresh_token');
    localStorage.removeItem('sethu_access_token');
    localStorage.removeItem('sethu_refresh_token');
    setUser(null);
  };

  const hasRole = (...roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        quickDemoLogin,
        logout,
        hasRole,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

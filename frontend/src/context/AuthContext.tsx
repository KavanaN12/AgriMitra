import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  User,
  UserRegisterRequest,
  UserLoginRequest,
  OtpVerifyRequest,
  OnboardingUpdateRequest,
  ResetPasswordRequest,
  ChangePasswordRequest
} from '../types/api';
import { api } from '../api/services';

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeRole: 'farmer' | 'buyer' | 'admin';
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  pendingPhone: string;
  setPendingPhone: (phone: string) => void;
  register: (payload: UserRegisterRequest) => Promise<User>;
  login: (payload: UserLoginRequest) => Promise<User>;
  verifyOtp: (payload: OtpVerifyRequest) => Promise<User>;
  resendOtp: (phone: string) => Promise<{ status: string; message: string; demo_otp: string }>;
  forgotPassword: (identifier: string) => Promise<{ status: string; message: string; delivery?: any; token?: string }>;
  resetPassword: (payload: ResetPasswordRequest) => Promise<{ status: string; message: string }>;
  changePassword: (payload: ChangePasswordRequest) => Promise<{ status: string; message: string }>;
  updateOnboarding: (payload: OnboardingUpdateRequest) => Promise<User>;
  switchRole: (newRole: 'farmer' | 'buyer') => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('agrimitra_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('agrimitra_token');
  });

  const [activeRole, setActiveRole] = useState<'farmer' | 'buyer' | 'admin'>(() => {
    const saved = localStorage.getItem('agrimitra_active_role');
    if (saved === 'farmer' || saved === 'buyer' || saved === 'admin') return saved;
    return user?.active_role || 'farmer';
  });

  const [pendingPhone, setPendingPhone] = useState<string>(() => {
    return localStorage.getItem('agrimitra_pending_phone') || '';
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync state to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('agrimitra_user', JSON.stringify(user));
      const role = user.active_role || (user.roles === 'buyer' ? 'buyer' : 'farmer');
      setActiveRole(role);
      localStorage.setItem('agrimitra_active_role', role);
    } else {
      localStorage.removeItem('agrimitra_user');
      localStorage.removeItem('agrimitra_active_role');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('agrimitra_token', token);
    } else {
      localStorage.removeItem('agrimitra_token');
    }
  }, [token]);

  useEffect(() => {
    if (pendingPhone) {
      localStorage.setItem('agrimitra_pending_phone', pendingPhone);
    } else {
      localStorage.removeItem('agrimitra_pending_phone');
    }
  }, [pendingPhone]);

  // Session verification and restoration on startup
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('agrimitra_token');
      if (savedToken) {
        try {
          const freshUser = await api.auth.me();
          setUser(freshUser);
          const role = freshUser.active_role || (freshUser.roles === 'buyer' ? 'buyer' : 'farmer');
          setActiveRole(role);
        } catch {
          // Token is expired, invalid, or user was deleted
          logout();
        }
      }
    };
    verifySession();
  }, []);

  const register = async (payload: UserRegisterRequest): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(payload);
      queryClient.clear();
      setToken(res.access_token);
      setUser(res.user);
      queryClient.setQueryData(['currentUser'], res.user);
      queryClient.setQueryData(['profile'], res.user);
      setPendingPhone(payload.phone_number);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (payload: UserLoginRequest): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(payload);
      queryClient.clear();
      setToken(res.access_token);
      setUser(res.user);
      queryClient.setQueryData(['currentUser'], res.user);
      queryClient.setQueryData(['profile'], res.user);
      setPendingPhone(res.user.phone_number);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (payload: OtpVerifyRequest): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.auth.verifyOtp(payload);
      queryClient.clear();
      setToken(res.access_token);
      setUser(res.user);
      queryClient.setQueryData(['currentUser'], res.user);
      queryClient.setQueryData(['profile'], res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (phone: string) => {
    return api.auth.resendOtp({ phone_number: phone });
  };

  const forgotPassword = async (identifier: string) => {
    return api.auth.forgotPassword({ identifier });
  };

  const resetPassword = async (payload: ResetPasswordRequest) => {
    return api.auth.resetPassword(payload);
  };

  const changePassword = async (payload: ChangePasswordRequest) => {
    return api.auth.changePassword(payload);
  };

  const updateOnboarding = async (payload: OnboardingUpdateRequest): Promise<User> => {
    setIsLoading(true);
    try {
      const updatedUser = await api.auth.updateOnboarding(payload);
      setUser(updatedUser);
      queryClient.setQueryData(['currentUser'], updatedUser);
      queryClient.setQueryData(['profile'], updatedUser);
      if (updatedUser.active_role) {
        setActiveRole(updatedUser.active_role);
      }
      return updatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (newRole: 'farmer' | 'buyer') => {
    if (!user) return;
    setIsLoading(true);
    try {
      const updatedUser = await api.auth.switchRole({ active_role: newRole });
      setUser(updatedUser);
      queryClient.setQueryData(['currentUser'], updatedUser);
      queryClient.setQueryData(['profile'], updatedUser);
      setActiveRole(newRole);
      localStorage.setItem('agrimitra_active_role', newRole);
    } catch {
      setActiveRole(newRole);
      const fallback = { ...user, active_role: newRole };
      setUser(fallback);
      queryClient.setQueryData(['currentUser'], fallback);
      queryClient.setQueryData(['profile'], fallback);
      localStorage.setItem('agrimitra_active_role', newRole);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    queryClient.clear();
    setUser(null);
    setToken(null);
    setPendingPhone('');
    localStorage.removeItem('agrimitra_user');
    localStorage.removeItem('agrimitra_token');
    localStorage.removeItem('agrimitra_active_role');
    localStorage.removeItem('agrimitra_pending_phone');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const u = await api.auth.me();
      setUser(u);
      queryClient.setQueryData(['currentUser'], u);
      queryClient.setQueryData(['profile'], u);
    } catch {
      logout();
    }
  };

  const isAuthenticated = Boolean(user && token);
  const isOnboarded = Boolean(user?.is_onboarded);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activeRole,
        isAuthenticated,
        isOnboarded,
        isLoading,
        pendingPhone,
        setPendingPhone,
        register,
        login,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        changePassword,
        updateOnboarding,
        switchRole,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

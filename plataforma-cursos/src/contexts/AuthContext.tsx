'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser, LoginCredentials, RegisterData, TrialStatus, ApiResponse } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  trialStatus: TrialStatus | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name: string; email: string }) => Promise<void>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token and get user data
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data: ApiResponse<AuthUser> = await response.json();
        if (data.success && data.data) {
          setUser(data.data);
          await fetchTrialStatus();
        } else {
          // Invalid token, clear it
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } else {
        // Token expired or invalid, try to refresh
        await tryRefreshToken();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const tryRefreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const data: ApiResponse<{ accessToken: string; refreshToken: string; user: AuthUser }> = await response.json();
        if (data.success && data.data) {
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          setUser(data.data.user);
          await fetchTrialStatus();
        }
      } else {
        // Refresh failed, clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const fetchTrialStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('/api/auth/trial-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data: ApiResponse<TrialStatus> = await response.json();
        if (data.success && data.data) {
          setTrialStatus(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching trial status:', error);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data: ApiResponse<{ user: AuthUser; tokens: { accessToken: string; refreshToken: string } }> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.error?.message || 'Erro ao fazer login');
    }

    // Store tokens
    localStorage.setItem('accessToken', data.data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
    
    setUser(data.data.user);
    await fetchTrialStatus();
  };

  const register = async (registerData: RegisterData) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registerData)
    });

    const data: ApiResponse<{ user: AuthUser; tokens: { accessToken: string; refreshToken: string } }> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.error?.message || 'Erro ao criar conta');
    }

    // Store tokens
    localStorage.setItem('accessToken', data.data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
    
    setUser(data.data.user);
    await fetchTrialStatus();
  };

  const logout = async () => {
    try {
      // Clear tokens from storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear state
      setUser(null);
      setTrialStatus(null);

      // Optional: Call logout endpoint to invalidate tokens on server
      const token = localStorage.getItem('accessToken');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear local state even if server call fails
      setUser(null);
      setTrialStatus(null);
    }
  };

  const updateProfile = async (profileData: { name: string; email: string }) => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('Não autenticado');

    const response = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });

    const data: ApiResponse<AuthUser> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.error?.message || 'Erro ao atualizar perfil');
    }

    setUser(data.data);
  };

  const changePassword = async (passwordData: { currentPassword: string; newPassword: string }) => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('Não autenticado');

    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(passwordData)
    });

    const data: ApiResponse = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || 'Erro ao alterar senha');
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data: ApiResponse<AuthUser> = await response.json();
        if (data.success && data.data) {
          setUser(data.data);
          await fetchTrialStatus();
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const forgotPassword = async (email: string) => {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data: ApiResponse = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || 'Erro ao enviar email de recuperação');
    }
  };

  const resetPassword = async (token: string, password: string) => {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, password })
    });

    const data: ApiResponse = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || 'Erro ao redefinir senha');
    }
  };

  const value: AuthContextType = {
    user,
    trialStatus,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
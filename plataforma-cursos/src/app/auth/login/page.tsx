'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '../../../components/auth/AuthLayout';
import { LoginForm } from '../../../components/auth/LoginForm';
import { useAuth } from '../../../contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectTo = searchParams.get('redirect') || '/dashboard';

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectTo);
    }
  }, [user, authLoading, router, redirectTo]);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    setError('');

    try {
      await login(credentials);
      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if user is already logged in (will redirect)
  if (user) {
    return null;
  }

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Faça login para continuar seus estudos"
    >
      <LoginForm
        onSubmit={handleLogin}
        loading={loading}
        error={error}
      />
    </AuthLayout>
  );
}
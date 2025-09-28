'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '../../../components/auth/AuthLayout';
import { RegisterForm } from '../../../components/auth/RegisterForm';
import { useAuth } from '../../../contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleRegister = async (data: { name: string; email: string; password: string }) => {
    setLoading(true);
    setError('');

    try {
      await register(data);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
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
      title="Crie sua conta"
      subtitle="Comece seu teste gratuito de 4 horas agora"
    >
      <RegisterForm
        onSubmit={handleRegister}
        loading={loading}
        error={error}
      />
    </AuthLayout>
  );
}
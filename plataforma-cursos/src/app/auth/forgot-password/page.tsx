'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '../../../components/auth/AuthLayout';
import { PasswordResetForm } from '../../../components/auth/PasswordResetForm';
import { useAuth } from '../../../contexts/AuthContext';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleForgotPassword = async (email: string) => {
    setLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email de recuperação');
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
      title="Recuperar senha"
      subtitle="Não se preocupe, isso acontece com todos nós"
    >
      <PasswordResetForm
        onSubmit={handleForgotPassword}
        loading={loading}
        error={error}
        success={success}
      />
    </AuthLayout>
  );
}
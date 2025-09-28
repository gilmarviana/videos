'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '../../../components/auth/AuthLayout';
import { ResponsiveForm, ResponsiveInput } from '../../../components/layout/ResponsiveForm';
import { ResponsiveButton } from '../../../components/layout/ResponsiveButton';
import { useAuth } from '../../../contexts/AuthContext';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<any>({});

  const token = searchParams.get('token');

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      router.push('/auth/forgot-password');
    }
  }, [token, router]);

  const validateForm = (): boolean => {
    const errors: any = {};

    if (!formData.password) {
      errors.password = 'Nova senha é obrigatória';
    } else if (formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !token) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await resetPassword(token, formData.password);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
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

  // Don't render if no token (will redirect)
  if (!token) {
    return null;
  }

  if (success) {
    return (
      <AuthLayout
        title="Senha redefinida!"
        subtitle="Sua senha foi alterada com sucesso"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-600 mb-6">
            Você será redirecionado para a página de login em alguns segundos...
          </p>
          <ResponsiveButton
            onClick={() => router.push('/auth/login')}
            fullWidth
          >
            Ir para login
          </ResponsiveButton>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Nova senha"
      subtitle="Digite sua nova senha"
    >
      <ResponsiveForm onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <ResponsiveInput
          label="Nova senha"
          type="password"
          value={formData.password}
          onChange={handleInputChange('password')}
          placeholder="••••••••"
          required
          error={formErrors.password}
          helperText="Mínimo de 6 caracteres"
          autoComplete="new-password"
          icon={
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          }
        />

        <ResponsiveInput
          label="Confirmar nova senha"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          placeholder="••••••••"
          required
          error={formErrors.confirmPassword}
          autoComplete="new-password"
          icon={
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          }
        />

        <ResponsiveButton
          type="submit"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Redefinindo...' : 'Redefinir senha'}
        </ResponsiveButton>
      </ResponsiveForm>
    </AuthLayout>
  );
}
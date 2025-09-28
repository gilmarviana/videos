'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ResponsiveForm, ResponsiveInput } from '../layout/ResponsiveForm';
import { ResponsiveButton } from '../layout/ResponsiveButton';
import { LoginCredentials } from '../../types';

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export function LoginForm({ onSubmit, loading = false, error }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<LoginCredentials>>({});

  const validateForm = (): boolean => {
    const errors: Partial<LoginCredentials> = {};

    if (!formData.email) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const handleInputChange = (field: keyof LoginCredentials) => (
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

  return (
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
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleInputChange('email')}
        placeholder="seu@email.com"
        required
        error={formErrors.email}
        autoComplete="email"
        icon={
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        }
      />

      <ResponsiveInput
        label="Senha"
        type="password"
        value={formData.password}
        onChange={handleInputChange('password')}
        placeholder="••••••••"
        required
        error={formErrors.password}
        autoComplete="current-password"
        icon={
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        }
      />

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link 
            href="/auth/forgot-password" 
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Esqueceu sua senha?
          </Link>
        </div>
      </div>

      <ResponsiveButton
        type="submit"
        fullWidth
        loading={loading}
        disabled={loading}
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </ResponsiveButton>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Não tem uma conta?{' '}
          <Link 
            href="/auth/register" 
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Cadastre-se grátis
          </Link>
        </p>
      </div>
    </ResponsiveForm>
  );
}
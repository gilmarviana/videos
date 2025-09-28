'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ResponsiveForm, ResponsiveInput, ResponsiveCheckbox } from '../layout/ResponsiveForm';
import { ResponsiveButton } from '../layout/ResponsiveButton';
import { RegisterData } from '../../types';

interface RegisterFormProps {
  onSubmit: (data: RegisterData) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export function RegisterForm({ onSubmit, loading = false, error }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterData & { confirmPassword: string; acceptTerms: boolean }>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [formErrors, setFormErrors] = useState<Partial<typeof formData>>({});

  const validateForm = (): boolean => {
    const errors: Partial<typeof formData> = {};

    if (!formData.name) {
      errors.name = 'Nome é obrigatório';
    } else if (formData.name.length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.email) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }

    if (!formData.acceptTerms) {
      errors.acceptTerms = 'Você deve aceitar os termos de uso';
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
      const { confirmPassword, acceptTerms, ...registerData } = formData;
      await onSubmit(registerData);
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'acceptTerms' ? e.target.checked : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
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
        label="Nome completo"
        type="text"
        value={formData.name}
        onChange={handleInputChange('name')}
        placeholder="Seu nome completo"
        required
        error={formErrors.name}
        autoComplete="name"
        icon={
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        }
      />

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
        autoComplete="new-password"
        helperText="Mínimo de 6 caracteres"
        icon={
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        }
      />

      <ResponsiveInput
        label="Confirmar senha"
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

      <ResponsiveCheckbox
        label="Aceito os termos de uso e política de privacidade"
        checked={formData.acceptTerms}
        onChange={handleInputChange('acceptTerms')}
        error={formErrors.acceptTerms}
        helperText="Ao se cadastrar, você automaticamente ganha 4 horas de teste gratuito"
      />

      <ResponsiveButton
        type="submit"
        fullWidth
        loading={loading}
        disabled={loading}
      >
        {loading ? 'Criando conta...' : 'Criar conta grátis'}
      </ResponsiveButton>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link 
            href="/auth/login" 
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Faça login
          </Link>
        </p>
      </div>

      {/* Trial Information */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">Teste Gratuito de 4 Horas</h4>
            <p className="text-xs text-blue-700">
              Após o cadastro, você terá acesso completo à plataforma por 4 horas de uso. 
              Depois, assine por apenas R$ 30,00/mês para continuar aprendendo.
            </p>
          </div>
        </div>
      </div>
    </ResponsiveForm>
  );
}
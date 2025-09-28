'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ResponsiveForm, ResponsiveInput } from '../layout/ResponsiveForm';
import { ResponsiveButton } from '../layout/ResponsiveButton';

interface PasswordResetFormProps {
  onSubmit: (email: string) => Promise<void>;
  loading?: boolean;
  error?: string;
  success?: boolean;
}

export function PasswordResetForm({ onSubmit, loading = false, error, success = false }: PasswordResetFormProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (): boolean => {
    if (!email) {
      setEmailError('Email é obrigatório');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Email inválido');
      return false;
    }

    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    try {
      await onSubmit(email);
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError('');
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Email enviado!</h3>
          <p className="text-sm text-gray-600 mb-6">
            Enviamos um link para redefinir sua senha para <strong>{email}</strong>. 
            Verifique sua caixa de entrada e spam.
          </p>
        </div>

        <div className="space-y-4">
          <ResponsiveButton
            onClick={() => window.location.reload()}
            variant="outline"
            fullWidth
          >
            Enviar novamente
          </ResponsiveButton>
          
          <div className="text-center">
            <Link 
              href="/auth/login" 
              className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <div className="mb-6 text-center">
        <p className="text-sm text-gray-600">
          Digite seu email e enviaremos um link para redefinir sua senha.
        </p>
      </div>

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
        value={email}
        onChange={handleEmailChange}
        placeholder="seu@email.com"
        required
        error={emailError}
        autoComplete="email"
        icon={
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        }
      />

      <ResponsiveButton
        type="submit"
        fullWidth
        loading={loading}
        disabled={loading}
      >
        {loading ? 'Enviando...' : 'Enviar link de recuperação'}
      </ResponsiveButton>

      <div className="text-center">
        <Link 
          href="/auth/login" 
          className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
        >
          Voltar para o login
        </Link>
      </div>
    </ResponsiveForm>
  );
}
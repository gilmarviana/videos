'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResponsiveButton, ResponsiveIconButton } from '../layout/ResponsiveButton';
import { useAuth } from '../../contexts/AuthContext';

interface LogoutButtonProps {
  variant?: 'button' | 'icon' | 'text';
  className?: string;
  showConfirm?: boolean;
}

export function LogoutButton({ 
  variant = 'button', 
  className = '',
  showConfirm = true 
}: LogoutButtonProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (showConfirm && !confirm('Tem certeza que deseja sair?')) {
      return;
    }

    setLoading(true);

    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still redirect even if logout fails
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'icon') {
    return (
      <ResponsiveIconButton
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        }
        onClick={handleLogout}
        loading={loading}
        disabled={loading}
        aria-label="Sair"
        className={className}
      />
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className={`text-sm text-gray-600 hover:text-gray-800 transition-colors ${className}`}
      >
        {loading ? 'Saindo...' : 'Sair'}
      </button>
    );
  }

  return (
    <ResponsiveButton
      onClick={handleLogout}
      loading={loading}
      disabled={loading}
      variant="outline"
      className={className}
      icon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      }
    >
      {loading ? 'Saindo...' : 'Sair'}
    </ResponsiveButton>
  );
}
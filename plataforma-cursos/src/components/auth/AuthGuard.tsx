'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: 'admin' | 'student';
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  requireRole,
  redirectTo = '/auth/login' 
}: AuthGuardProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !user) {
      const currentPath = window.location.pathname;
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
      router.push(redirectUrl);
      return;
    }

    if (requireRole && user && user.role !== requireRole) {
      router.push('/unauthorized');
      return;
    }
  }, [user, loading, requireAuth, requireRole, redirectTo, router]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Don't render if auth requirements are not met
  if (requireAuth && !user) {
    return null;
  }

  if (requireRole && user && user.role !== requireRole) {
    return null;
  }

  return <>{children}</>;
}
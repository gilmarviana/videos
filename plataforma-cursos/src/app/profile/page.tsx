'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '../../components/auth/UserProfile';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const { 
    user, 
    trialStatus, 
    updateProfile, 
    changePassword, 
    loading: authLoading 
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/profile');
    }
  }, [user, authLoading, router]);

  const handleUpdateProfile = async (data: { name: string; email: string }) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile(data);
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (data: { currentPassword: string; newPassword: string }) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await changePassword(data);
      setSuccess('Senha alterada com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura? Você manterá acesso até o final do período pago.')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/users/subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'cancel' })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Erro ao cancelar assinatura');
      }

      setSuccess('Assinatura cancelada com sucesso!');
      // Refresh user data to update subscription status
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Erro ao cancelar assinatura');
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

  // Don't render if user is not logged in (will redirect)
  if (!user || !trialStatus) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserProfile
        user={user}
        trialStatus={trialStatus}
        onUpdateProfile={handleUpdateProfile}
        onChangePassword={handleChangePassword}
        onCancelSubscription={handleCancelSubscription}
        loading={loading}
        error={error}
        success={success}
      />
    </div>
  );
}
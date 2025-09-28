'use client';

import React, { useState } from 'react';
import { ResponsiveCard, ResponsiveCardHeader, ResponsiveCardContent } from '../layout/ResponsiveCard';
import { ResponsiveForm, ResponsiveInput } from '../layout/ResponsiveForm';
import { ResponsiveButton } from '../layout/ResponsiveButton';
import { TrialTimer } from '../trial/TrialTimer';
import { AuthUser, TrialStatus } from '../../types';

interface UserProfileProps {
  user: AuthUser;
  trialStatus: TrialStatus;
  onUpdateProfile: (data: { name: string; email: string }) => Promise<void>;
  onChangePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
  onCancelSubscription?: () => Promise<void>;
  loading?: boolean;
  error?: string;
  success?: string;
}

export function UserProfile({ 
  user, 
  trialStatus,
  onUpdateProfile, 
  onChangePassword,
  onCancelSubscription,
  loading = false, 
  error,
  success 
}: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'subscription'>('profile');
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileErrors, setProfileErrors] = useState<any>({});
  const [passwordErrors, setPasswordErrors] = useState<any>({});

  const validateProfile = (): boolean => {
    const errors: any = {};

    if (!profileData.name) {
      errors.name = 'Nome é obrigatório';
    } else if (profileData.name.length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!profileData.email) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.email = 'Email inválido';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = (): boolean => {
    const errors: any = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Senha atual é obrigatória';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'Nova senha é obrigatória';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Nova senha deve ter pelo menos 6 caracteres';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) return;

    try {
      await onUpdateProfile(profileData);
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    try {
      await onChangePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: '👤' },
    { id: 'password', label: 'Senha', icon: '🔒' },
    { id: 'subscription', label: 'Assinatura', icon: '💳' }
  ] as const;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais e configurações da conta</p>
      </div>

      {/* Trial Status Banner */}
      {trialStatus.isActive && (
        <div className="mb-6">
          <ResponsiveCard padding="medium" className="bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Teste Gratuito Ativo</h3>
                <p className="text-sm text-blue-700">
                  Você ainda tem tempo de teste gratuito disponível
                </p>
              </div>
              <TrialTimer />
            </div>
          </ResponsiveCard>
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'profile' && (
            <ResponsiveCard>
              <ResponsiveCardHeader 
                title="Informações Pessoais"
                subtitle="Atualize suas informações básicas"
              />
              <ResponsiveCardContent>
                <ResponsiveForm onSubmit={handleProfileSubmit}>
                  <ResponsiveInput
                    label="Nome completo"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    error={profileErrors.name}
                    required
                  />
                  
                  <ResponsiveInput
                    label="Email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    error={profileErrors.email}
                    required
                  />

                  <ResponsiveButton
                    type="submit"
                    loading={loading}
                    disabled={loading}
                  >
                    Salvar alterações
                  </ResponsiveButton>
                </ResponsiveForm>
              </ResponsiveCardContent>
            </ResponsiveCard>
          )}

          {activeTab === 'password' && (
            <ResponsiveCard>
              <ResponsiveCardHeader 
                title="Alterar Senha"
                subtitle="Mantenha sua conta segura com uma senha forte"
              />
              <ResponsiveCardContent>
                <ResponsiveForm onSubmit={handlePasswordSubmit}>
                  <ResponsiveInput
                    label="Senha atual"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    error={passwordErrors.currentPassword}
                    required
                  />
                  
                  <ResponsiveInput
                    label="Nova senha"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    error={passwordErrors.newPassword}
                    helperText="Mínimo de 6 caracteres"
                    required
                  />

                  <ResponsiveInput
                    label="Confirmar nova senha"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    error={passwordErrors.confirmPassword}
                    required
                  />

                  <ResponsiveButton
                    type="submit"
                    loading={loading}
                    disabled={loading}
                  >
                    Alterar senha
                  </ResponsiveButton>
                </ResponsiveForm>
              </ResponsiveCardContent>
            </ResponsiveCard>
          )}

          {activeTab === 'subscription' && (
            <ResponsiveCard>
              <ResponsiveCardHeader 
                title="Assinatura"
                subtitle="Gerencie sua assinatura e pagamentos"
              />
              <ResponsiveCardContent>
                {user.subscription ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.subscription.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.subscription.status === 'active' ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Próximo pagamento</label>
                        <p className="text-sm text-gray-900">
                          {new Date(user.subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Plano Atual</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">Plano Mensal</h5>
                            <p className="text-sm text-gray-600">Acesso completo à plataforma</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">R$ 30,00</p>
                            <p className="text-sm text-gray-600">por mês</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {onCancelSubscription && user.subscription.status === 'active' && (
                      <div className="pt-4 border-t border-gray-200">
                        <ResponsiveButton
                          variant="danger"
                          onClick={onCancelSubscription}
                          loading={loading}
                        >
                          Cancelar assinatura
                        </ResponsiveButton>
                        <p className="text-xs text-gray-500 mt-2">
                          Você manterá acesso até {new Date(user.subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma assinatura ativa</h3>
                    <p className="text-gray-600 mb-4">
                      {trialStatus.isActive 
                        ? 'Você está usando o teste gratuito. Assine para continuar após o término.'
                        : 'Assine agora para ter acesso completo à plataforma.'
                      }
                    </p>
                    <ResponsiveButton>
                      Assinar agora - R$ 30,00/mês
                    </ResponsiveButton>
                  </div>
                )}
              </ResponsiveCardContent>
            </ResponsiveCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ResponsiveCard>
            <ResponsiveCardHeader title="Resumo da Conta" />
            <ResponsiveCardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tipo de conta</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">{user.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`text-sm font-medium ${
                    user.subscription?.status === 'active' ? 'text-green-600' : 
                    trialStatus.isActive ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {user.subscription?.status === 'active' ? 'Assinante' : 
                     trialStatus.isActive ? 'Teste gratuito' : 'Sem assinatura'}
                  </span>
                </div>
                {trialStatus.isActive && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tempo usado</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.floor(trialStatus.minutesUsed / 60)}h {trialStatus.minutesUsed % 60}m
                    </span>
                  </div>
                )}
              </div>
            </ResponsiveCardContent>
          </ResponsiveCard>

          <ResponsiveCard>
            <ResponsiveCardHeader title="Ajuda" />
            <ResponsiveCardContent>
              <div className="space-y-3">
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-500">
                  Central de ajuda
                </a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-500">
                  Contatar suporte
                </a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-500">
                  Termos de uso
                </a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-500">
                  Política de privacidade
                </a>
              </div>
            </ResponsiveCardContent>
          </ResponsiveCard>
        </div>
      </div>
    </div>
  );
}
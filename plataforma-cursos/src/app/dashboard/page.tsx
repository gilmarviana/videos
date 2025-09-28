'use client';

import React from 'react';
import Link from 'next/link';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { LogoutButton } from '../../components/auth/LogoutButton';
import { TrialTimer } from '../../components/trial/TrialTimer';
import { ResponsiveCard, ResponsiveCardHeader, ResponsiveCardContent } from '../../components/layout/ResponsiveCard';
import { ResponsiveButton } from '../../components/layout/ResponsiveButton';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardPage() {
  const { user, trialStatus } = useAuth();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {trialStatus?.isActive && <TrialTimer />}
                <Link href="/profile">
                  <ResponsiveButton variant="ghost" size="small">
                    Perfil
                  </ResponsiveButton>
                </Link>
                <LogoutButton variant="text" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Olá, {user?.name}! 👋
            </h2>
            <p className="text-gray-600">
              {trialStatus?.isActive 
                ? 'Você está no teste gratuito. Aproveite para explorar nossos cursos!'
                : user?.subscription?.status === 'active'
                ? 'Bem-vindo de volta! Continue seus estudos.'
                : 'Assine agora para ter acesso completo à plataforma.'
              }
            </p>
          </div>

          {/* Trial Status Banner */}
          {trialStatus?.isActive && (
            <div className="mb-8">
              <ResponsiveCard padding="medium" className="bg-blue-50 border-blue-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="font-medium text-blue-900 mb-1">Teste Gratuito Ativo</h3>
                    <p className="text-sm text-blue-700">
                      Você tem {Math.floor(trialStatus.minutesRemaining / 60)}h {trialStatus.minutesRemaining % 60}m restantes
                    </p>
                  </div>
                  <ResponsiveButton size="small">
                    Assinar agora - R$ 30,00/mês
                  </ResponsiveButton>
                </div>
              </ResponsiveCard>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link href="/courses">
              <ResponsiveCard hover clickable>
                <ResponsiveCardContent>
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">Explorar Cursos</h3>
                    <p className="text-sm text-gray-600">Descubra novos cursos e continue aprendendo</p>
                  </div>
                </ResponsiveCardContent>
              </ResponsiveCard>
            </Link>

            <Link href="/courses">
              <ResponsiveCard hover clickable>
                <ResponsiveCardContent>
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">Meus Cursos</h3>
                    <p className="text-sm text-gray-600">Continue de onde parou</p>
                  </div>
                </ResponsiveCardContent>
              </ResponsiveCard>
            </Link>

            <ResponsiveCard hover clickable>
              <ResponsiveCardContent>
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Certificados</h3>
                  <p className="text-sm text-gray-600">Veja seus certificados conquistados</p>
                </div>
              </ResponsiveCardContent>
            </ResponsiveCard>
          </div>

          {/* Account Info */}
          <ResponsiveCard>
            <ResponsiveCardHeader title="Informações da Conta" />
            <ResponsiveCardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-sm text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de conta</label>
                  <p className="text-sm text-gray-900 capitalize">{user?.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user?.subscription?.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : trialStatus?.isActive
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user?.subscription?.status === 'active' ? 'Assinante' : 
                     trialStatus?.isActive ? 'Teste gratuito' : 'Sem assinatura'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ações</label>
                  <Link href="/profile">
                    <ResponsiveButton size="small" variant="outline">
                      Gerenciar conta
                    </ResponsiveButton>
                  </Link>
                </div>
              </div>
            </ResponsiveCardContent>
          </ResponsiveCard>
        </main>
      </div>
    </AuthGuard>
  );
}
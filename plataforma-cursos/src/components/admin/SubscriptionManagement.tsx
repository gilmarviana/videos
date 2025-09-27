'use client';

import { useEffect, useState } from 'react';

interface SubscriptionWithUser {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  paymentGatewayId: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    name: string;
    email: string;
    isActive: boolean;
  };
}

interface SubscriptionsResponse {
  subscriptions: SubscriptionWithUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, [pagination.page, search, statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/admin/subscriptions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar assinaturas');
      }

      const result = await response.json();
      if (result.success) {
        setSubscriptions(result.data.subscriptions);
        setPagination(result.data.pagination);
      } else {
        setError(result.error?.message || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setError('Erro ao carregar assinaturas');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchSubscriptions();
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ativa' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' },
      past_due: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Em Atraso' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inativa' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const isExpiringSoon = (endDate: Date | string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const isExpired = (endDate: Date | string) => {
    const end = new Date(endDate);
    const now = new Date();
    return end < now;
  };

  if (loading && subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Assinaturas</h1>
        <p className="mt-1 text-sm text-gray-600">
          Monitore assinaturas, pagamentos e status de cobrança
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Assinaturas Ativas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {subscriptions.filter(s => s.status === 'active').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Vencendo em 7 dias
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {subscriptions.filter(s => s.status === 'active' && isExpiringSoon(s.currentPeriodEnd)).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Em Atraso
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {subscriptions.filter(s => s.status === 'past_due').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Receita Total
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(
                      subscriptions
                        .filter(s => s.status === 'active')
                        .reduce((sum, s) => sum + s.amount, 0)
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Buscar
              </label>
              <input
                type="text"
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nome ou email do usuário..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Todos</option>
                <option value="active">Ativa</option>
                <option value="cancelled">Cancelada</option>
                <option value="past_due">Em Atraso</option>
                <option value="inactive">Inativa</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Filtrar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período Atual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gateway
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criada em
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions.map((subscription) => (
                <tr key={subscription.id} className={
                  subscription.status === 'active' && isExpiringSoon(subscription.currentPeriodEnd)
                    ? 'bg-yellow-50'
                    : subscription.status === 'past_due'
                    ? 'bg-red-50'
                    : ''
                }>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {subscription.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {subscription.user.email}
                        </div>
                        {!subscription.user.isActive && (
                          <div className="text-xs text-red-600">
                            Usuário inativo
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(subscription.status)}
                    {subscription.status === 'active' && isExpiringSoon(subscription.currentPeriodEnd) && (
                      <div className="text-xs text-yellow-600 mt-1">
                        Vence em breve
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium">
                      {formatCurrency(subscription.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {subscription.currency.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="text-sm">
                        {formatDate(subscription.currentPeriodStart)} -
                      </div>
                      <div className={`text-sm ${
                        isExpired(subscription.currentPeriodEnd) ? 'text-red-600 font-medium' :
                        isExpiringSoon(subscription.currentPeriodEnd) ? 'text-yellow-600 font-medium' :
                        'text-gray-900'
                      }`}>
                        {formatDate(subscription.currentPeriodEnd)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="truncate max-w-32" title={subscription.paymentGatewayId}>
                      {subscription.paymentGatewayId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(subscription.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {subscriptions.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500">Nenhuma assinatura encontrada</div>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={!pagination.hasPrev}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={!pagination.hasNext}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando{' '}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{' '}
                  até{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  de{' '}
                  <span className="font-medium">{pagination.total}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {pagination.page} de {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={!pagination.hasNext}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
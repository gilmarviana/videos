'use client';

import { useEffect, useState } from 'react';
import { User } from '../../types';

interface UserWithSubscription extends Omit<User, 'passwordHash'> {
  subscription?: {
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
  };
}

interface UsersResponse {
  users: UserWithSubscription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function UserManagement() {
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
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
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, search, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar usuários');
      }

      const result = await response.json();
      if (result.success) {
        setUsers(result.data.users);
        setPagination(result.data.pagination);
      } else {
        setError(result.error?.message || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro ao atualizar usuário');
      }

      const result = await response.json();
      if (result.success) {
        // Update user in local state
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, isActive: !currentStatus }
            : user
        ));
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error instanceof Error ? error.message : 'Erro ao atualizar usuário');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (user: UserWithSubscription) => {
    if (!user.isActive) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Inativo</span>;
    }
    
    if (user.subscription?.status === 'active') {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Assinante</span>;
    }
    
    if (user.trialStartTime) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Teste</span>;
    }
    
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Ativo</span>;
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gerencie usuários, assinaturas e status de acesso
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Buscar
              </label>
              <input
                type="text"
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nome ou email..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Função
              </label>
              <select
                id="role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Todas</option>
                <option value="student">Aluno</option>
                <option value="admin">Administrador</option>
              </select>
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
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="trial">Em Teste</option>
                <option value="subscribed">Assinante</option>
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

      {/* Users Table */}
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
                  Assinatura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teste
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cadastro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-400">
                          {user.role === 'admin' ? 'Administrador' : 'Aluno'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.subscription ? (
                      <div>
                        <div className="font-medium">
                          {formatCurrency(user.subscription.amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Até {formatDate(user.subscription.currentPeriodEnd)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Sem assinatura</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.trialStartTime ? (
                      <div>
                        <div className="font-medium">
                          {user.trialMinutesUsed} min usados
                        </div>
                        <div className="text-xs text-gray-500">
                          Iniciado em {formatDate(user.trialStartTime)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Sem teste</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleUserStatusToggle(user.id, user.isActive)}
                        className={`${
                          user.isActive
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {user.isActive ? 'Desativar' : 'Ativar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500">Nenhum usuário encontrado</div>
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
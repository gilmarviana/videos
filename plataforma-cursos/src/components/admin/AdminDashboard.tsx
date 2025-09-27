'use client';

import { useEffect, useState } from 'react';

interface DashboardData {
  overview: {
    totalActiveUsers: number;
    trialUsers: number;
    subscribedUsers: number;
    monthlyRevenue: number;
    newUsersThisMonth: number;
    conversionRate: number;
    averageWatchTime: number;
    courseCompletionRate: number;
  };
  recentActivity: Array<{
    date: string;
    newUsers: number;
    activeUsers: number;
    watchTime: number;
  }>;
  subscriptionBreakdown: Array<{
    status: string;
    count: number;
  }>;
  topCourses: Array<{
    title: string;
    enrolledUsers: number;
    completionRate: number;
    averageWatchTime: number;
  }>;
  conversionFunnel: {
    visitors: number;
    signups: number;
    trialStarts: number;
    subscriptions: number;
  };
  engagementMetrics: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
  };
}

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar dados do dashboard');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error?.message || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="mt-1 text-sm text-gray-600">
          Visão geral da plataforma e métricas principais
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Usuários Ativos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.overview.totalActiveUsers}
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
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Usuários em Teste
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.overview.trialUsers}
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
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Assinantes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.overview.subscribedUsers}
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
                    Receita Mensal
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(data.overview.monthlyRevenue)}
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
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Novos Usuários (Mês)
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.overview.newUsersThisMonth}
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
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Taxa de Conversão
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.overview.conversionRate}%
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
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tempo Médio de Estudo
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatDuration(data.overview.averageWatchTime)}
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
                <div className="w-8 h-8 bg-teal-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Taxa de Conclusão
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.overview.courseCompletionRate}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Usuários Ativos Hoje
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.engagementMetrics.dailyActiveUsers}
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
                <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Usuários Ativos (7 dias)
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.engagementMetrics.weeklyActiveUsers}
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
                <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Usuários Ativos (30 dias)
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.engagementMetrics.monthlyActiveUsers}
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
                <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Duração Média da Sessão
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatDuration(data.engagementMetrics.averageSessionDuration)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Funil de Conversão (30 dias)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.conversionFunnel.visitors}</div>
              <div className="text-sm text-gray-500">Visitantes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.conversionFunnel.signups}</div>
              <div className="text-sm text-gray-500">Cadastros</div>
              <div className="text-xs text-gray-400">
                {data.conversionFunnel.visitors > 0 ? 
                  `${((data.conversionFunnel.signups / data.conversionFunnel.visitors) * 100).toFixed(1)}%` : 
                  '0%'
                }
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{data.conversionFunnel.trialStarts}</div>
              <div className="text-sm text-gray-500">Testes Iniciados</div>
              <div className="text-xs text-gray-400">
                {data.conversionFunnel.signups > 0 ? 
                  `${((data.conversionFunnel.trialStarts / data.conversionFunnel.signups) * 100).toFixed(1)}%` : 
                  '0%'
                }
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{data.conversionFunnel.subscriptions}</div>
              <div className="text-sm text-gray-500">Assinaturas</div>
              <div className="text-xs text-gray-400">
                {data.conversionFunnel.trialStarts > 0 ? 
                  `${((data.conversionFunnel.subscriptions / data.conversionFunnel.trialStarts) * 100).toFixed(1)}%` : 
                  '0%'
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Atividade Recente (7 dias)
            </h3>
            <div className="space-y-3">
              {data.recentActivity.map((activity, index) => (
                <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(activity.date)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">{activity.newUsers}</span> novos
                    </div>
                    <div>
                      <span className="font-medium">{activity.activeUsers}</span> ativos
                    </div>
                    <div>
                      <span className="font-medium">{formatDuration(activity.watchTime)}</span> assistido
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subscription Breakdown */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Status das Assinaturas
            </h3>
            <div className="space-y-3">
              {data.subscriptionBreakdown.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">
                    {item.status === 'active' ? 'Ativas' : 
                     item.status === 'cancelled' ? 'Canceladas' :
                     item.status === 'past_due' ? 'Em Atraso' : 
                     item.status}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Courses */}
        <div className="bg-white shadow rounded-lg lg:col-span-2">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Cursos Mais Populares
            </h3>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Curso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inscritos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conclusão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tempo Médio
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.topCourses.map((course, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {course.title || 'Sem título'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.enrolledUsers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.completionRate.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDuration(course.averageWatchTime)}
                      </td>
                    </tr>
                  ))}
                  {data.topCourses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        Nenhum curso encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
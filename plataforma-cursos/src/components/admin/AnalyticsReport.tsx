'use client';

import { useEffect, useState } from 'react';

interface CoursePopularityData {
  id: string;
  title: string;
  createdAt: string;
  totalViews: number;
  uniqueViewers: number;
  totalWatchTime: number;
  averageCompletionRate: number;
  enrolledUsers: number;
}

interface UserEngagementData {
  date: string;
  activeUsers: number;
  averageSessionDuration: number;
  totalVideosWatched: number;
  totalLessonsCompleted: number;
  totalCoursesCompleted: number;
}

export function AnalyticsReport() {
  const [courseData, setCourseData] = useState<CoursePopularityData[]>([]);
  const [engagementData, setEngagementData] = useState<UserEngagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [courseResponse, engagementResponse] = await Promise.all([
        fetch(`/api/admin/analytics/course-popularity?days=${selectedPeriod}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/admin/analytics/user-engagement?days=${selectedPeriod}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!courseResponse.ok || !engagementResponse.ok) {
        throw new Error('Erro ao carregar dados de analytics');
      }

      const courseResult = await courseResponse.json();
      const engagementResult = await engagementResponse.json();

      if (courseResult.success && engagementResult.success) {
        setCourseData(courseResult.data.courses);
        setEngagementData(engagementResult.data.engagement);
      } else {
        setError('Erro ao processar dados de analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Erro ao carregar dados de analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios de Analytics</h1>
            <p className="mt-1 text-sm text-gray-600">
              Análise detalhada de engajamento e popularidade dos cursos
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="period" className="text-sm font-medium text-gray-700">
              Período:
            </label>
            <select
              id="period"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>7 dias</option>
              <option value={30}>30 dias</option>
              <option value={90}>90 dias</option>
              <option value={365}>1 ano</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course Popularity Report */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Relatório de Popularidade dos Cursos
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visualizações
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visualizadores Únicos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tempo Total Assistido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taxa de Conclusão
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscritos
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courseData.map((course, index) => (
                  <tr key={course.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{course.title}</div>
                      <div className="text-sm text-gray-500">
                        Criado em {formatDate(course.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.totalViews.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.uniqueViewers.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(course.totalWatchTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${Math.min(course.averageCompletionRate, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">
                          {course.averageCompletionRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.enrolledUsers.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {courseData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum dado de curso encontrado para o período selecionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Engagement Report */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Relatório de Engajamento dos Usuários
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuários Ativos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duração Média da Sessão
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vídeos Assistidos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aulas Concluídas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cursos Concluídos
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {engagementData.map((engagement, index) => (
                  <tr key={engagement.date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatDate(engagement.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {engagement.activeUsers.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(engagement.averageSessionDuration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {engagement.totalVideosWatched.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {engagement.totalLessonsCompleted.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {engagement.totalCoursesCompleted.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {engagementData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum dado de engajamento encontrado para o período selecionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      {(courseData.length > 0 || engagementData.length > 0) && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-blue-800 text-sm font-medium">Total de Cursos Analisados</div>
            <div className="text-blue-900 text-2xl font-bold">{courseData.length}</div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-green-800 text-sm font-medium">Total de Visualizações</div>
            <div className="text-green-900 text-2xl font-bold">
              {courseData.reduce((sum, course) => sum + course.totalViews, 0).toLocaleString()}
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-purple-800 text-sm font-medium">Tempo Total Assistido</div>
            <div className="text-purple-900 text-2xl font-bold">
              {formatDuration(courseData.reduce((sum, course) => sum + course.totalWatchTime, 0))}
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-orange-800 text-sm font-medium">Aulas Concluídas</div>
            <div className="text-orange-900 text-2xl font-bold">
              {engagementData.reduce((sum, engagement) => sum + engagement.totalLessonsCompleted, 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { db } from '../../services/supabase'
import { detectVideoType, validateVideoUrl, getVideoTypeIcon } from '../../utils/videoUtils'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  UsersIcon,
  FilmIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('videos')
  const [videos, setVideos] = useState([])
  const [categories, setCategories] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingVideo, setEditingVideo] = useState(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  
  const { user, profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()

  // Form states
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    url: '',
    thumbnail_url: '',
    category_id: '',
    is_vip: false,
    duration: '',
    release_year: '',
    cast: '',
    director: '',
    genre: '',
    rating: '',
    trailer_url: ''
  })

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    active: true
  })

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard')
      return
    }
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load videos
      const { data: videosData } = await db.getVideos()
      setVideos(videosData || [])
      
      // Load categories
      const { data: categoriesData } = await db.getCategories()
      setCategories(categoriesData || [])
      
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVideoSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateVideoUrl(videoForm.url)) {
      alert('URL de vídeo inválida')
      return
    }

    try {
      const videoData = {
        ...videoForm,
        active: true,
        created_at: new Date().toISOString()
      }

      if (editingVideo) {
        await db.updateVideo(editingVideo.id, videoData)
      } else {
        await db.createVideo(videoData)
      }

      setShowModal(false)
      setEditingVideo(null)
      resetVideoForm()
      loadData()
    } catch (error) {
      console.error('Error saving video:', error)
      alert('Erro ao salvar vídeo')
    }
  }

  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    
    try {
      const categoryData = {
        ...categoryForm,
        created_at: new Date().toISOString()
      }

      await db.createCategory(categoryData)
      setShowCategoryModal(false)
      resetCategoryForm()
      loadData()
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Erro ao salvar categoria')
    }
  }

  const handleDeleteVideo = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este vídeo?')) {
      try {
        await db.deleteVideo(id)
        loadData()
      } catch (error) {
        console.error('Error deleting video:', error)
        alert('Erro ao deletar vídeo')
      }
    }
  }

  const handleEditVideo = (video) => {
    setVideoForm(video)
    setEditingVideo(video)
    setShowModal(true)
  }

  const resetVideoForm = () => {
    setVideoForm({
      title: '',
      description: '',
      url: '',
      thumbnail_url: '',
      category_id: '',
      is_vip: false,
      duration: '',
      release_year: '',
      cast: '',
      director: '',
      genre: '',
      rating: '',
      trailer_url: ''
    })
  }

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      active: true
    })
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const stats = {
    totalVideos: videos.length,
    vipVideos: videos.filter(v => v.is_vip).length,
    totalCategories: categories.length,
    totalUsers: users.length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando painel administrativo...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-netflix-darkGray border-b border-netflix-mediumGray">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-netflix-red text-2xl font-bold">StreamFlix Admin</h1>
            <span className="text-netflix-lightGray">Painel Administrativo</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-netflix-lightGray">
              Olá, {profile?.full_name || 'Admin'}
            </span>
            <button
              onClick={handleSignOut}
              className="btn-secondary text-sm"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-netflix-darkGray min-h-screen p-4">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-3 rounded transition-colors flex items-center space-x-3 ${
                activeTab === 'overview' ? 'bg-red-600' : 'hover:bg-gray-700'
              }`}
            >
              <ChartBarIcon className="w-5 h-5" />
              <span>Visão Geral</span>
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`w-full text-left px-4 py-3 rounded transition-colors flex items-center space-x-3 ${
                activeTab === 'videos' ? 'bg-red-600' : 'hover:bg-gray-700'
              }`}
            >
              <FilmIcon className="w-5 h-5" />
              <span>Vídeos</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full text-left px-4 py-3 rounded transition-colors flex items-center space-x-3 ${
                activeTab === 'categories' ? 'bg-red-600' : 'hover:bg-gray-700'
              }`}
            >
              <FilmIcon className="w-5 h-5" />
              <span>Categorias</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full text-left px-4 py-3 rounded transition-colors flex items-center space-x-3 ${
                activeTab === 'users' ? 'bg-red-600' : 'hover:bg-gray-700'
              }`}
            >
              <UsersIcon className="w-5 h-5" />
              <span>Usuários</span>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Visão Geral</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card">
                  <h3 className="text-lg font-semibold mb-2">Total de Vídeos</h3>
                  <p className="text-3xl font-bold text-netflix-red">{stats.totalVideos}</p>
                </div>
                <div className="card">
                  <h3 className="text-lg font-semibold mb-2">Conteúdo VIP</h3>
                  <p className="text-3xl font-bold text-yellow-500">{stats.vipVideos}</p>
                </div>
                <div className="card">
                  <h3 className="text-lg font-semibold mb-2">Categorias</h3>
                  <p className="text-3xl font-bold text-blue-500">{stats.totalCategories}</p>
                </div>
                <div className="card">
                  <h3 className="text-lg font-semibold mb-2">Usuários</h3>
                  <p className="text-3xl font-bold text-green-500">{stats.totalUsers}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Ações Rápidas</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setActiveTab('videos')
                        setShowModal(true)
                      }}
                      className="w-full btn-primary text-left"
                    >
                      + Adicionar Novo Vídeo
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('categories')
                        setShowCategoryModal(true)
                      }}
                      className="w-full btn-secondary text-left"
                    >
                      + Criar Nova Categoria
                    </button>
                  </div>
                </div>
                
                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Estatísticas Rápidas</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Vídeos Ativos:</span>
                      <span className="text-green-500">{videos.filter(v => v.active).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Categorias Ativas:</span>
                      <span className="text-green-500">{categories.filter(c => c.active).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">Gerenciar Vídeos</h2>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Adicionar Vídeo</span>
                </button>
              </div>

              {/* Videos Table */}
              <div className="bg-netflix-darkGray rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-netflix-mediumGray">
                    <tr>
                      <th className="text-left p-4">Título</th>
                      <th className="text-left p-4">Categoria</th>
                      <th className="text-left p-4">Tipo</th>
                      <th className="text-left p-4">VIP</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map((video) => (
                      <tr key={video.id} className="border-b border-netflix-mediumGray hover:bg-netflix-mediumGray">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{getVideoTypeIcon(detectVideoType(video.url))}</div>
                            <div>
                              <div className="font-medium">{video.title}</div>
                              <div className="text-sm text-netflix-lightGray">{video.release_year}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-netflix-lightGray">
                          {video.categories?.name || 'Sem categoria'}
                        </td>
                        <td className="p-4 text-netflix-lightGray">
                          {detectVideoType(video.url).toUpperCase()}
                        </td>
                        <td className="p-4">
                          {video.is_vip ? (
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded text-xs font-bold">
                              VIP
                            </span>
                          ) : (
                            <span className="text-netflix-lightGray">Básico</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            video.active ? 'bg-green-600' : 'bg-red-600'
                          }`}>
                            {video.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditVideo(video)}
                              className="text-blue-500 hover:text-blue-400"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className="text-red-500 hover:text-red-400"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">Gerenciar Categorias</h2>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Adicionar Categoria</span>
                </button>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div key={category.id} className="card">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold">{category.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        category.active ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {category.active ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-netflix-lightGray text-sm mb-4">{category.description}</p>
                    )}
                    <div className="text-sm text-netflix-lightGray">
                      Vídeos: {videos.filter(v => v.category_id === category.id).length}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Gerenciar Usuários</h2>
              <div className="card">
                <p className="text-netflix-lightGray">
                  Funcionalidade de gerenciamento de usuários em desenvolvimento.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Video Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-netflix-darkGray rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-6">
                {editingVideo ? 'Editar Vídeo' : 'Adicionar Novo Vídeo'}
              </h3>
              
              <form onSubmit={handleVideoSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Título *</label>
                    <input
                      type="text"
                      value={videoForm.title}
                      onChange={(e) => setVideoForm({...videoForm, title: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Categoria</label>
                    <select
                      value={videoForm.category_id}
                      onChange={(e) => setVideoForm({...videoForm, category_id: e.target.value})}
                      className="input-field"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">URL do Vídeo *</label>
                  <input
                    type="url"
                    value={videoForm.url}
                    onChange={(e) => setVideoForm({...videoForm, url: e.target.value})}
                    className="input-field"
                    placeholder="https://youtube.com/watch?v=... ou https://drive.google.com/..."
                    required
                  />
                  <p className="text-xs text-netflix-lightGray mt-1">
                    Suporta: YouTube, Google Drive, OneDrive, Vimeo, Panda Video, MP4, MKV, TS
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({...videoForm, description: e.target.value})}
                    className="input-field"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Ano de Lançamento</label>
                    <input
                      type="number"
                      value={videoForm.release_year}
                      onChange={(e) => setVideoForm({...videoForm, release_year: e.target.value})}
                      className="input-field"
                      min="1900"
                      max="2030"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Duração</label>
                    <input
                      type="text"
                      value={videoForm.duration}
                      onChange={(e) => setVideoForm({...videoForm, duration: e.target.value})}
                      className="input-field"
                      placeholder="120 min"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Classificação</label>
                    <input
                      type="text"
                      value={videoForm.rating}
                      onChange={(e) => setVideoForm({...videoForm, rating: e.target.value})}
                      className="input-field"
                      placeholder="14+"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Elenco</label>
                    <input
                      type="text"
                      value={videoForm.cast}
                      onChange={(e) => setVideoForm({...videoForm, cast: e.target.value})}
                      className="input-field"
                      placeholder="Ator 1, Ator 2, Ator 3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Diretor</label>
                    <input
                      type="text"
                      value={videoForm.director}
                      onChange={(e) => setVideoForm({...videoForm, director: e.target.value})}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Gênero</label>
                    <input
                      type="text"
                      value={videoForm.genre}
                      onChange={(e) => setVideoForm({...videoForm, genre: e.target.value})}
                      className="input-field"
                      placeholder="Ação, Drama, Comédia"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">URL da Thumbnail</label>
                    <input
                      type="url"
                      value={videoForm.thumbnail_url}
                      onChange={(e) => setVideoForm({...videoForm, thumbnail_url: e.target.value})}
                      className="input-field"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">URL do Trailer</label>
                  <input
                    type="url"
                    value={videoForm.trailer_url}
                    onChange={(e) => setVideoForm({...videoForm, trailer_url: e.target.value})}
                    className="input-field"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_vip"
                    checked={videoForm.is_vip}
                    onChange={(e) => setVideoForm({...videoForm, is_vip: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="is_vip" className="text-sm font-medium">
                    Conteúdo VIP (apenas para assinantes premium)
                  </label>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingVideo ? 'Atualizar Vídeo' : 'Adicionar Vídeo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingVideo(null)
                      resetVideoForm()
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-netflix-darkGray rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-6">Adicionar Nova Categoria</h3>
              
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome *</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                    className="input-field"
                    rows="3"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="category_active"
                    checked={categoryForm.active}
                    onChange={(e) => setCategoryForm({...categoryForm, active: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="category_active" className="text-sm font-medium">
                    Categoria ativa
                  </label>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Criar Categoria
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryModal(false)
                      resetCategoryForm()
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
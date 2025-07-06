import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { db } from '../../services/supabase'
import VideoCard from '../../components/shared/VideoCard'
import VideoPlayer from '../../components/shared/VideoPlayer'
import VideoModal from '../../components/shared/VideoModal'
import { MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const [videos, setVideos] = useState([])
  const [categories, setCategories] = useState([])
  const [filteredVideos, setFilteredVideos] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [watchHistory, setWatchHistory] = useState([])
  
  const { user, profile, subscription, signOut, hasAccess } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [user])

  useEffect(() => {
    filterVideos()
  }, [videos, selectedCategory, searchTerm])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load videos
      const { data: videosData } = await db.getVideos()
      setVideos(videosData || [])
      
      // Load categories
      const { data: categoriesData } = await db.getCategories()
      setCategories(categoriesData || [])
      
      // Load watch history
      if (user) {
        const { data: historyData } = await db.getWatchHistory(user.id)
        setWatchHistory(historyData || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterVideos = () => {
    let filtered = videos

    // Filter by category
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'vip') {
        filtered = filtered.filter(video => video.is_vip)
      } else {
        filtered = filtered.filter(video => video.category_id === selectedCategory)
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredVideos(filtered)
  }

  const handlePlayVideo = (video) => {
    setSelectedVideo(video)
    setShowPlayer(true)
  }

  const handleVideoInfo = (video) => {
    setSelectedVideo(video)
    setShowModal(true)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const getCategoryVideos = (categoryId) => {
    return videos.filter(video => video.category_id === categoryId)
  }

  const getVipVideos = () => {
    return videos.filter(video => video.is_vip)
  }

  const getRecentVideos = () => {
    return videos.slice(0, 10)
  }

  const getContinueWatching = () => {
    return watchHistory.slice(0, 8).map(item => item.videos)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-b from-black to-transparent">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-8">
            <h1 className="text-netflix-red text-2xl font-bold">StreamFlix</h1>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-6">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`hover:text-netflix-lightGray transition-colors ${
                  selectedCategory === 'all' ? 'text-white' : 'text-netflix-lightGray'
                }`}
              >
                Início
              </button>
              <button
                onClick={() => setSelectedCategory('movies')}
                className={`hover:text-netflix-lightGray transition-colors ${
                  selectedCategory === 'movies' ? 'text-white' : 'text-netflix-lightGray'
                }`}
              >
                Filmes
              </button>
              <button
                onClick={() => setSelectedCategory('series')}
                className={`hover:text-netflix-lightGray transition-colors ${
                  selectedCategory === 'series' ? 'text-white' : 'text-netflix-lightGray'
                }`}
              >
                Séries
              </button>
              <button
                onClick={() => setSelectedCategory('vip')}
                className={`hover:text-netflix-lightGray transition-colors ${
                  selectedCategory === 'vip' ? 'text-white' : 'text-netflix-lightGray'
                }`}
              >
                VIP
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-netflix-lightGray" />
              <input
                type="text"
                placeholder="Buscar títulos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-900 text-white pl-10 pr-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 text-gray-400 hover:text-white">
                <UserIcon className="w-6 h-6" />
                <span className="hidden md:block">{profile?.full_name || 'Usuário'}</span>
              </button>
              
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="p-2">
                  <div className="px-3 py-2 text-sm text-gray-400 border-b border-gray-700">
                    {subscription ? (
                      subscription.is_trial ? (
                        <div>
                          <span className="text-green-400 font-semibold">
                            🎁 Período de Teste
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            Expira em {new Date(subscription.expires_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-red-600 font-semibold">
                          Plano {subscription.subscription_plans?.name}
                        </span>
                      )
                    ) : (
                      <span>Sem assinatura</span>
                    )}
                  </div>
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 rounded"
                  >
                    Meu perfil
                  </button>
                  <button
                    onClick={() => navigate('/subscription')}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 rounded"
                  >
                    Assinatura
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 rounded text-red-600"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8">
        {/* Trial Notification */}
        {subscription?.is_trial && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 text-center">
            <div className="flex items-center justify-center space-x-2">
              <span>🎁</span>
              <span className="font-semibold">
                Período de teste ativo! Expira em {new Date(subscription.expires_at).toLocaleDateString('pt-BR')}
              </span>
              <button
                onClick={() => navigate('/subscription')}
                className="ml-4 bg-white text-green-600 px-4 py-1 rounded font-bold text-sm hover:bg-gray-100 transition-colors"
              >
                Assinar Agora
              </button>
            </div>
          </div>
        )}
        {/* Hero Section */}
        {filteredVideos.length > 0 && !searchTerm && (
          <section className="relative h-96 mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black">
              <img
                src={filteredVideos[0].thumbnail_url || '/placeholder-thumbnail.jpg'}
                alt={filteredVideos[0].title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 max-w-lg">
              <h2 className="text-4xl font-bold mb-4">{filteredVideos[0].title}</h2>
              <p className="text-lg text-gray-400 mb-6">
                {filteredVideos[0].description}
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handlePlayVideo(filteredVideos[0])}
                  className="btn-primary px-8 py-3 text-lg font-bold"
                  disabled={!hasAccess(filteredVideos[0].is_vip ? 'vip' : 'basic')}
                >
                  ▶ Assistir
                </button>
                <button
                  onClick={() => handleVideoInfo(filteredVideos[0])}
                  className="btn-secondary px-8 py-3 text-lg font-bold"
                >
                  ℹ Mais informações
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Categories Filter */}
        <section className="px-8 mb-8">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                {category.name}
              </button>
            ))}
            <button
              onClick={() => setSelectedCategory('vip')}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold ${
                selectedCategory === 'vip' ? 'opacity-100' : 'opacity-75 hover:opacity-100'
              }`}
            >
              VIP
            </button>
          </div>
        </section>

        {/* Continue Watching */}
        {watchHistory.length > 0 && selectedCategory === 'all' && !searchTerm && (
          <section className="px-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Continue assistindo</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {getContinueWatching().map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onPlay={handlePlayVideo}
                  onInfo={handleVideoInfo}
                  className="w-full"
                />
              ))}
            </div>
          </section>
        )}

        {/* Main Grid */}
        <section className="px-8">
          {searchTerm && (
            <h2 className="text-2xl font-bold mb-4">
              Resultados para "{searchTerm}" ({filteredVideos.length})
            </h2>
          )}
          
          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onPlay={handlePlayVideo}
                  onInfo={handleVideoInfo}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum vídeo disponível nesta categoria'}
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Video Player Modal */}
      {showPlayer && selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={() => {
            setShowPlayer(false)
            setSelectedVideo(null)
          }}
        />
      )}

      {/* Video Info Modal */}
      <VideoModal
        video={selectedVideo}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedVideo(null)
        }}
        onPlay={handlePlayVideo}
        onSubscribe={() => navigate('/subscription')}
      />
    </div>
  )
}

export default Dashboard
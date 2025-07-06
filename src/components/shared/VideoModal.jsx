import React from 'react'
import { PlayIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { detectVideoType, getThumbnailUrl, getVideoTypeIcon } from '../../utils/videoUtils'
import { useAuth } from '../../context/AuthContext'

const VideoModal = ({ video, isOpen, onClose, onPlay, onSubscribe }) => {
  const { hasAccess, subscription, user } = useAuth()
  
  if (!isOpen || !video) return null

  const videoType = detectVideoType(video.url)
  const thumbnailUrl = video.thumbnail_url || getThumbnailUrl(video.url, videoType)
  const typeIcon = getVideoTypeIcon(videoType)
  
  const canAccess = hasAccess(video.is_vip ? 'vip' : 'basic')

  const handlePlay = () => {
    if (canAccess) {
      onPlay?.(video)
      onClose()
    }
  }

  const handleSubscribe = () => {
    onSubscribe?.()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center p-4">
      <div className="bg-netflix-darkGray rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          {/* Thumbnail */}
          <div className="relative aspect-video bg-netflix-mediumGray">
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div className="w-full h-full bg-netflix-mediumGray hidden items-center justify-center text-8xl">
              {typeIcon}
            </div>

            {/* Play button overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <button
                onClick={handlePlay}
                className={`btn-primary rounded-full p-6 text-white transform hover:scale-110 transition-transform ${
                  !canAccess ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!canAccess}
              >
                <PlayIcon className="w-12 h-12" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title and actions */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{video.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-netflix-lightGray">
                <span className="flex items-center">
                  {typeIcon} {videoType.toUpperCase()}
                </span>
                {video.release_year && <span>{video.release_year}</span>}
                {video.duration && <span>{video.duration}</span>}
                {video.is_vip && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded text-xs font-bold">
                    VIP
                  </span>
                )}
              </div>
            </div>

            {canAccess ? (
              <button
                onClick={handlePlay}
                className="btn-primary ml-4"
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                Assistir
              </button>
            ) : (
              <div className="ml-4 text-center">
                <div className="mb-2">
                  <svg className="w-8 h-8 mx-auto text-netflix-lightGray" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-netflix-lightGray mb-2">
                  {video.is_vip ? 'Conteúdo VIP' : 'Assinatura necessária'}
                </p>
                {!subscription && user && (
                  <button
                    onClick={handleSubscribe}
                    className="btn-primary text-sm"
                  >
                    Assinar Agora
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          {video.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Sinopse</h3>
              <p className="text-netflix-lightGray leading-relaxed">
                {video.description}
              </p>
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <h4 className="text-white font-medium mb-2">Categoria</h4>
              <p className="text-netflix-lightGray">
                {video.categories?.name || 'Sem categoria'}
              </p>
            </div>

            {/* Video source */}
            <div>
              <h4 className="text-white font-medium mb-2">Fonte</h4>
              <p className="text-netflix-lightGray">
                {videoType === 'youtube' && 'YouTube'}
                {videoType === 'google_drive' && 'Google Drive'}
                {videoType === 'onedrive' && 'OneDrive'}
                {videoType === 'vimeo' && 'Vimeo'}
                {videoType === 'panda' && 'Panda Video'}
                {videoType === 'direct' && 'Vídeo direto'}
                {videoType === 'unknown' && 'Fonte desconhecida'}
              </p>
            </div>

            {/* Cast */}
            {video.cast && (
              <div>
                <h4 className="text-white font-medium mb-2">Elenco</h4>
                <p className="text-netflix-lightGray">{video.cast}</p>
              </div>
            )}

            {/* Director */}
            {video.director && (
              <div>
                <h4 className="text-white font-medium mb-2">Direção</h4>
                <p className="text-netflix-lightGray">{video.director}</p>
              </div>
            )}

            {/* Genre */}
            {video.genre && (
              <div>
                <h4 className="text-white font-medium mb-2">Gênero</h4>
                <p className="text-netflix-lightGray">{video.genre}</p>
              </div>
            )}

            {/* Rating */}
            {video.rating && (
              <div>
                <h4 className="text-white font-medium mb-2">Classificação</h4>
                <p className="text-netflix-lightGray">{video.rating}</p>
              </div>
            )}
          </div>

          {/* Additional info */}
          {video.trailer_url && (
            <div className="mt-6">
              <h4 className="text-white font-medium mb-2">Trailer</h4>
              <a 
                href={video.trailer_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-netflix-red hover:underline"
              >
                Assistir trailer
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoModal
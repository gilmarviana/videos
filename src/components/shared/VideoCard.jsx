import React, { useState } from 'react'
import { PlayIcon, InformationCircleIcon } from '@heroicons/react/24/solid'
import { detectVideoType, getThumbnailUrl, getVideoTypeIcon } from '../../utils/videoUtils'
import { useAuth } from '../../context/AuthContext'

const VideoCard = ({ video, onPlay, onInfo, className = '' }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { hasAccess } = useAuth()
  
  const videoType = detectVideoType(video.url)
  const thumbnailUrl = video.thumbnail_url || getThumbnailUrl(video.url, videoType)
  const typeIcon = getVideoTypeIcon(videoType)
  
  const canAccess = hasAccess(video.is_vip ? 'vip' : 'basic')

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(true)
  }

  const handlePlay = () => {
    if (canAccess) {
      onPlay?.(video)
    }
  }

  const handleInfo = () => {
    onInfo?.(video)
  }

  return (
    <div className={`video-card group relative ${className}`}>
      {/* Thumbnail */}
      <div className="relative aspect-video bg-netflix-mediumGray rounded-md overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-netflix-mediumGray animate-pulse flex items-center justify-center">
            <div className="text-4xl">{typeIcon}</div>
          </div>
        )}
        
        {!imageError ? (
          <img
            src={thumbnailUrl}
            alt={video.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-netflix-mediumGray flex items-center justify-center text-6xl">
            {typeIcon}
          </div>
        )}

        {/* Overlay */}
        <div className="overlay">
          <div className="flex space-x-2">
            <button
              onClick={handlePlay}
              className={`btn-primary rounded-full p-3 ${
                !canAccess ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!canAccess}
            >
              <PlayIcon className="w-6 h-6" />
            </button>
            <button
              onClick={handleInfo}
              className="btn-secondary rounded-full p-3"
            >
              <InformationCircleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* VIP Badge */}
        {video.is_vip && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded">
            VIP
          </div>
        )}

        {/* Video Type Badge */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {typeIcon} {videoType.toUpperCase()}
        </div>

        {/* Duration */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </div>
        )}

        {/* Access Lock Overlay */}
        {!canAccess && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <div className="text-center text-white">
              <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium">
                {video.is_vip ? 'VIP Content' : 'Premium Required'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="mt-2 px-1">
        <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-netflix-red transition-colors">
          {video.title}
        </h3>
        
        {video.description && (
          <p className="text-netflix-lightGray text-xs mt-1 line-clamp-2">
            {video.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-2 text-xs text-netflix-lightGray">
          <span>{video.categories?.name || 'Sem categoria'}</span>
          {video.release_year && (
            <span>{video.release_year}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoCard
// Video URL utilities for different platforms

export const detectVideoType = (url) => {
  if (!url) return 'unknown'
  
  const urlLower = url.toLowerCase()
  
  // YouTube
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'youtube'
  }
  
  // Google Drive
  if (urlLower.includes('drive.google.com')) {
    return 'google_drive'
  }
  
  // OneDrive
  if (urlLower.includes('onedrive.live.com') || urlLower.includes('1drv.ms')) {
    return 'onedrive'
  }
  
  // Direct video files
  if (urlLower.includes('.mp4') || urlLower.includes('.mkv') || 
      urlLower.includes('.ts') || urlLower.includes('.avi') || 
      urlLower.includes('.mov') || urlLower.includes('.webm')) {
    return 'direct'
  }
  
  // Panda Video
  if (urlLower.includes('pandavideo.com')) {
    return 'panda'
  }
  
  // Vimeo
  if (urlLower.includes('vimeo.com')) {
    return 'vimeo'
  }
  
  return 'unknown'
}

export const getEmbedUrl = (url, type) => {
  if (!url) return null
  
  switch (type) {
    case 'youtube':
      return getYouTubeEmbedUrl(url)
    case 'google_drive':
      return getGoogleDriveEmbedUrl(url)
    case 'onedrive':
      return getOneDriveEmbedUrl(url)
    case 'vimeo':
      return getVimeoEmbedUrl(url)
    case 'direct':
    case 'panda':
      return url
    default:
      return url
  }
}

const getYouTubeEmbedUrl = (url) => {
  let videoId = null
  
  // Extract video ID from different YouTube URL formats
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1].split('&')[0]
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0]
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('embed/')[1].split('?')[0]
  }
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&rel=0`
  }
  
  return url
}

const getGoogleDriveEmbedUrl = (url) => {
  // Extract file ID from Google Drive URL
  let fileId = null
  
  if (url.includes('/file/d/')) {
    fileId = url.split('/file/d/')[1].split('/')[0]
  } else if (url.includes('id=')) {
    fileId = url.split('id=')[1].split('&')[0]
  }
  
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`
  }
  
  return url
}

const getOneDriveEmbedUrl = (url) => {
  // OneDrive embed URL generation
  if (url.includes('onedrive.live.com')) {
    return url.replace('/view.aspx', '/embed').replace('view.aspx', 'embed')
  }
  
  return url
}

const getVimeoEmbedUrl = (url) => {
  // Extract video ID from Vimeo URL
  const match = url.match(/vimeo\.com\/(\d+)/)
  if (match) {
    const videoId = match[1]
    return `https://player.vimeo.com/video/${videoId}?autoplay=0`
  }
  
  return url
}

export const getThumbnailUrl = (url, type) => {
  switch (type) {
    case 'youtube':
      return getYouTubeThumbnail(url)
    default:
      return '/placeholder-thumbnail.jpg'
  }
}

const getYouTubeThumbnail = (url) => {
  let videoId = null
  
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1].split('&')[0]
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0]
  }
  
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }
  
  return '/placeholder-thumbnail.jpg'
}

export const validateVideoUrl = (url) => {
  if (!url) return false
  
  try {
    new URL(url)
    const type = detectVideoType(url)
    return type !== 'unknown'
  } catch {
    return false
  }
}

export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0:00'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
}

export const getVideoTypeIcon = (type) => {
  switch (type) {
    case 'youtube':
      return '🎬'
    case 'google_drive':
      return '💾'
    case 'onedrive':
      return '☁️'
    case 'vimeo':
      return '🎥'
    case 'direct':
      return '📹'
    case 'panda':
      return '🐼'
    default:
      return '🎵'
  }
}
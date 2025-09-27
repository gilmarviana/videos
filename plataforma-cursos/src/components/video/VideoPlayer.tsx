'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { VideoPlayerState } from '../../types';

interface VideoPlayerProps {
  lessonId: string;
  title: string;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
  onVideoEnd?: () => void;
  initialProgress?: number;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  lessonId,
  title,
  onProgressUpdate,
  onVideoEnd,
  initialProgress = 0,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [playerState, setPlayerState] = useState<VideoPlayerState>({
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    isPlaying: false,
    isMuted: false,
    volume: 1,
    isFullscreen: false
  });
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  // Playback speed options
  const playbackSpeeds = [0.5, 1, 1.5, 2];

  // Load video stream URL
  useEffect(() => {
    const loadVideo = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/videos/stream/${lessonId}`);
        const data = await response.json();
        
        if (data.success) {
          setStreamUrl(data.data.streamUrl);
        } else {
          setError(data.error?.message || 'Failed to load video');
        }
      } catch (err) {
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [lessonId]);

  // Set initial progress when video loads
  useEffect(() => {
    if (videoRef.current && initialProgress > 0) {
      videoRef.current.currentTime = initialProgress;
    }
  }, [streamUrl, initialProgress]);

  // Handle video events
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setPlayerState(prev => ({
        ...prev,
        duration: videoRef.current!.duration
      }));
    }
  };

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      
      setPlayerState(prev => ({
        ...prev,
        currentTime,
        duration
      }));

      // Call progress update callback
      if (onProgressUpdate) {
        onProgressUpdate(currentTime, duration);
      }
    }
  }, [onProgressUpdate]);

  const handlePlay = () => {
    setPlayerState(prev => ({ ...prev, isPlaying: true }));
  };

  const handlePause = () => {
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
  };

  const handleEnded = () => {
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
    if (onVideoEnd) {
      onVideoEnd();
    }
  };

  const handleVolumeChange = () => {
    if (videoRef.current) {
      setPlayerState(prev => ({
        ...prev,
        volume: videoRef.current!.volume,
        isMuted: videoRef.current!.muted
      }));
    }
  };

  // Control functions
  const togglePlay = () => {
    if (videoRef.current) {
      if (playerState.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  const changeVolume = (volume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlayerState(prev => ({ ...prev, playbackRate: speed }));
    }
  };

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(playerState.duration, time));
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && videoRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * playerState.duration;
      seekTo(newTime);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen();
        setPlayerState(prev => ({ ...prev, isFullscreen: true }));
      } else {
        document.exitFullscreen();
        setPlayerState(prev => ({ ...prev, isFullscreen: false }));
      }
    }
  };

  // Auto-hide controls
  const showControlsTemporarily = () => {
    setShowControls(true);
    
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (playerState.isPlaying) {
        setShowControls(false);
      }
    }, 3000);
    
    setControlsTimeout(timeout);
  };

  const handleMouseMove = () => {
    showControlsTemporarily();
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = playerState.duration > 0 
    ? (playerState.currentTime / playerState.duration) * 100 
    : 0;

  if (loading) {
    return (
      <div className={`bg-gray-900 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-white">Loading video...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-900 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div 
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playerState.isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={streamUrl}
        className="w-full h-full"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onVolumeChange={handleVolumeChange}
        onClick={togglePlay}
      />
      
      {/* Video Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div 
          ref={progressBarRef}
          className="w-full h-2 bg-gray-600 rounded-full cursor-pointer mb-4"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-100"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="hover:text-blue-400 transition-colors"
            >
              {playerState.isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="hover:text-blue-400 transition-colors"
              >
                {playerState.isMuted || playerState.volume === 0 ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776L4.216 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.216l4.167-3.776zm2.91 4.61a1 1 0 011.414 1.414L12 10.414l1.707 1.707a1 1 0 11-1.414 1.414L10.586 12l-1.707 1.707a1 1 0 01-1.414-1.414L9.172 11 7.465 9.293a1 1 0 011.414-1.414L10.586 9.586l1.707-1.707z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776L4.216 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.216l4.167-3.776zm7.025 1.632a1 1 0 011.414 0 9.051 9.051 0 010 12.8 1 1 0 11-1.414-1.415 7.051 7.051 0 000-9.97 1 1 0 010-1.415zm-2.829 2.828a1 1 0 011.415 0 5.051 5.051 0 010 7.142 1 1 0 11-1.415-1.414 3.051 3.051 0 000-4.314 1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={playerState.isMuted ? 0 : playerState.volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            {/* Time Display */}
            <div className="text-sm">
              {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Playback Speed */}
            <select
              value={playerState.playbackRate}
              onChange={(e) => changePlaybackSpeed(parseFloat(e.target.value))}
              className="bg-gray-700 text-white text-sm rounded px-2 py-1 border-none outline-none"
            >
              {playbackSpeeds.map(speed => (
                <option key={speed} value={speed}>
                  {speed}x
                </option>
              ))}
            </select>
            
            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="hover:text-blue-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Title Overlay */}
      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
    </div>
  );
};
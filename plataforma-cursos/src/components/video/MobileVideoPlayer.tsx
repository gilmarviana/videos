'use client';

import React, { useState, useRef, useEffect } from 'react';
import { VideoPlayer } from './VideoPlayer';

interface MobileVideoPlayerProps {
  lessonId: string;
  title: string;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
  onVideoEnd?: () => void;
  initialProgress?: number;
  className?: string;
}

export const MobileVideoPlayer: React.FC<MobileVideoPlayerProps> = ({
  lessonId,
  title,
  onProgressUpdate,
  onVideoEnd,
  initialProgress = 0,
  className = ''
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-hide controls on mobile
  useEffect(() => {
    if (!isMobile) return;

    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    resetControlsTimeout();

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isMobile]);

  // Handle fullscreen toggle
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  // Handle touch interactions
  const handleContainerTouch = () => {
    if (!isMobile) return;
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    setShowControls(!showControls);
    
    if (showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`
        video-container 
        ${isMobile ? 'mobile' : ''} 
        ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''} 
        ${className}
      `}
      onTouchStart={handleContainerTouch}
      onClick={handleContainerTouch}
    >
      <VideoPlayer
        lessonId={lessonId}
        title={title}
        onProgressUpdate={onProgressUpdate}
        onVideoEnd={onVideoEnd}
        initialProgress={initialProgress}
        className="w-full h-full"
      />

      {/* Mobile-optimized controls overlay */}
      {isMobile && (
        <div
          className={`
            absolute inset-0 pointer-events-none
            ${showControls ? 'opacity-100' : 'opacity-0'}
            transition-opacity duration-300
          `}
        >
          {/* Top controls */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 pointer-events-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium text-sm truncate flex-1 mr-4">
                {title}
              </h3>
              <button
                onClick={toggleFullscreen}
                className="touch-target text-white hover:text-gray-300 transition-colors"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Center play/pause button */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <div className="bg-black/50 rounded-full p-4 backdrop-blur-sm">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-auto">
            <div className="space-y-2">
              {/* Progress bar */}
              <div className="w-full bg-white/30 rounded-full h-1">
                <div className="bg-white rounded-full h-1 w-1/3"></div>
              </div>
              
              {/* Control buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="touch-target text-white hover:text-gray-300 transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                    </svg>
                  </button>
                  <button className="touch-target text-white hover:text-gray-300 transition-colors">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                  <button className="touch-target text-white hover:text-gray-300 transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm">0:00 / 10:30</span>
                  <button className="touch-target text-white hover:text-gray-300 transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
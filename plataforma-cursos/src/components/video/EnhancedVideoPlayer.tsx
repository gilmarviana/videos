'use client';

import React, { useEffect, useState } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { MobileVideoPlayer } from './MobileVideoPlayer';
import { useVideoProgress } from '../../hooks/useVideoProgress';
import { useCourseProgress } from '../../hooks/useCourseProgress';

interface EnhancedVideoPlayerProps {
  lessonId: string;
  userId: string;
  courseId: string;
  title: string;
  onLessonComplete?: () => void;
  onCourseComplete?: () => void;
  className?: string;
}

export const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
  lessonId,
  userId,
  courseId,
  title,
  onLessonComplete,
  onCourseComplete,
  className = ''
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const {
    progress,
    loading,
    saving,
    error,
    updateProgress,
    manualSave,
    markCompleted,
    getResumeTime,
    getProgressPercentage,
    isCompleted
  } = useVideoProgress({
    userId,
    lessonId,
    autoSave: true,
    saveInterval: 10
  });

  const {
    courseProgress,
    areAllLessonsWatched,
    markCourseCompleted,
    refreshProgress
  } = useCourseProgress({
    userId,
    courseId
  });

  // Handle progress updates from video player
  const handleProgressUpdate = (currentTime: number, duration: number) => {
    updateProgress(currentTime, duration);
    
    // Auto-complete lesson if watched 90% or more
    if (isCompleted(currentTime, duration) && !progress?.completed) {
      handleLessonCompletion();
    }
  };

  // Handle video end
  const handleVideoEnd = () => {
    if (!progress?.completed) {
      handleLessonCompletion();
    }
  };

  // Handle lesson completion and check for course completion
  const handleLessonCompletion = async () => {
    try {
      await markCompleted();
      
      if (onLessonComplete) {
        onLessonComplete();
      }

      // Refresh course progress to check if course is now complete
      await refreshProgress();
      
      // Check if this was the last lesson and course should be completed
      if (areAllLessonsWatched() && !courseProgress?.isCompleted) {
        await markCourseCompleted();
        if (onCourseComplete) {
          onCourseComplete();
        }
      }
    } catch (error) {
      console.error('Error handling lesson completion:', error);
    }
  };

  // Get initial progress for resume
  const initialProgress = getResumeTime();

  if (loading) {
    return (
      <div className={`bg-gray-900 rounded-lg flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-white">Loading video and progress...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-900 rounded-lg flex flex-col items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-red-400 mb-4">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Choose the appropriate video player based on device
  const VideoPlayerComponent = isMobile ? MobileVideoPlayer : VideoPlayer;

  return (
    <div className={`relative ${className}`}>
      <VideoPlayerComponent
        lessonId={lessonId}
        title={title}
        onProgressUpdate={handleProgressUpdate}
        onVideoEnd={handleVideoEnd}
        initialProgress={initialProgress}
        className={isMobile ? "w-full min-h-[250px] sm:min-h-[400px]" : "w-full min-h-[400px]"}
      />
      
      {/* Progress Indicator */}
      {progress && (
        <div className={`mt-4 flex ${isMobile ? 'flex-col space-y-2' : 'items-center justify-between'} text-sm text-gray-600`}>
          <div className="flex items-center space-x-2">
            {progress.completed ? (
              <div className="flex items-center text-green-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className={isMobile ? 'text-sm' : ''}>Completed</span>
              </div>
            ) : (
              <div className={isMobile ? 'text-sm' : ''}>
                Progress: {Math.round((progress.watchedSeconds / (progress.watchedSeconds + 1)) * 100)}%
              </div>
            )}
          </div>
          
          {saving && (
            <div className="flex items-center text-blue-600">
              <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className={isMobile ? 'text-sm' : ''}>Saving...</span>
            </div>
          )}
        </div>
      )}
      
      {/* Resume Notification */}
      {initialProgress > 0 && !progress?.completed && (
        <div className={`mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg ${isMobile ? 'mx-2' : ''}`}>
          <div className={`flex items-center ${isMobile ? 'flex-col sm:flex-row text-center sm:text-left' : ''}`}>
            <svg className={`${isMobile ? 'w-6 h-6 mb-2 sm:mb-0' : 'w-5 h-5'} text-blue-600 mr-2`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className={`text-blue-800 ${isMobile ? 'text-sm' : ''}`}>
              Resuming from where you left off ({Math.floor(initialProgress / 60)}:{Math.floor(initialProgress % 60).toString().padStart(2, '0')})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
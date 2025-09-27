'use client';

import React from 'react';
import { CourseProgress } from '../../types';
import { useFavorites } from '../../hooks/useFavorites';

interface CourseProgressCardProps {
  courseId: string;
  courseTitle: string;
  courseProgress: CourseProgress;
  onContinue?: () => void;
  className?: string;
}

export const CourseProgressCard: React.FC<CourseProgressCardProps> = ({
  courseId,
  courseTitle,
  courseProgress,
  onContinue,
  className = ''
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleFavorite(courseId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const progressPercentage = courseProgress.progressPercentage;
  const isCompleted = courseProgress.isCompleted;
  const isFav = isFavorite(courseId);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-4">
          {courseTitle}
        </h3>
        
        <button
          onClick={handleFavoriteClick}
          className={`p-2 rounded-full transition-colors ${
            isFav 
              ? 'text-red-500 hover:text-red-600' 
              : 'text-gray-400 hover:text-red-500'
          }`}
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-900">
            {progressPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
        <span>
          {courseProgress.completedLessons} of {courseProgress.totalLessons} lessons
        </span>
        {isCompleted && (
          <div className="flex items-center text-green-600">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Completed
          </div>
        )}
      </div>

      {/* Action Button */}
      {onContinue && (
        <button
          onClick={onContinue}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            isCompleted
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isCompleted ? 'Review Course' : 'Continue Learning'}
        </button>
      )}
    </div>
  );
};
'use client';

import React from 'react';

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export function ResponsiveCard({ 
  children, 
  className = '', 
  padding = 'medium',
  hover = false,
  clickable = false,
  onClick 
}: ResponsiveCardProps) {
  const paddingClasses = {
    none: '',
    small: 'p-3 sm:p-4',
    medium: 'p-4 sm:p-6',
    large: 'p-6 sm:p-8'
  };

  const baseClasses = 'card-responsive';
  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-200' : '';
  const clickableClasses = clickable ? 'cursor-pointer active:scale-[0.98] transition-transform' : '';

  return (
    <div
      className={`${baseClasses} ${paddingClasses[padding]} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      {children}
    </div>
  );
}

interface ResponsiveCardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function ResponsiveCardHeader({ title, subtitle, action, className = '' }: ResponsiveCardHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 ${className}`}>
      <div className="mb-2 sm:mb-0">
        <h3 className="heading-responsive font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-responsive text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}

interface ResponsiveCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveCardContent({ children, className = '' }: ResponsiveCardContentProps) {
  return (
    <div className={`text-responsive text-gray-700 ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveCardFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

export function ResponsiveCardFooter({ children, className = '', align = 'right' }: ResponsiveCardFooterProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={`flex flex-col sm:flex-row ${alignClasses[align]} items-center gap-2 sm:gap-4 mt-4 pt-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

// Course Card specific component
interface CourseCardProps {
  title: string;
  description: string;
  imageUrl?: string;
  progress?: number;
  duration?: string;
  instructor?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onClick?: () => void;
  className?: string;
}

export function CourseCard({
  title,
  description,
  imageUrl,
  progress,
  duration,
  instructor,
  isFavorite = false,
  onToggleFavorite,
  onClick,
  className = ''
}: CourseCardProps) {
  return (
    <ResponsiveCard 
      hover 
      clickable 
      onClick={onClick} 
      padding="none"
      className={className}
    >
      {/* Course Image */}
      <div className="relative aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          </div>
        )}
        
        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="absolute top-2 right-2 touch-target bg-white/90 backdrop-blur-sm rounded-full text-gray-600 hover:text-red-500 transition-colors"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}

        {/* Progress Bar */}
        {typeof progress === 'number' && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2">
            <div className="w-full bg-white/30 rounded-full h-1">
              <div 
                className="bg-white rounded-full h-1 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-white text-xs mt-1">{progress}% complete</p>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
          {description}
        </p>
        
        {/* Course Meta */}
        <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
          <div className="flex items-center space-x-4">
            {instructor && (
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {instructor}
              </span>
            )}
            {duration && (
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {duration}
              </span>
            )}
          </div>
        </div>
      </div>
    </ResponsiveCard>
  );
}
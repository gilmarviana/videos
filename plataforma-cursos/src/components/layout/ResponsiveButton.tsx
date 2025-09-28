'use client';

import React from 'react';

interface ResponsiveButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function ResponsiveButton({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  icon,
  iconPosition = 'left'
}: ResponsiveButtonProps) {
  const baseClasses = 'touch-button font-medium rounded-lg transition-all duration-200 focus-visible disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm',
    secondary: 'bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white shadow-sm',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100',
    ghost: 'text-blue-600 hover:bg-blue-50 active:bg-blue-100',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm'
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm',
    medium: 'px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base',
    large: 'px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg'
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClasses}
        ${className}
      `}
    >
      <div className="flex items-center justify-center space-x-2">
        {loading ? (
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
            <span>{children}</span>
            {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
          </>
        )}
      </div>
    </button>
  );
}

// Icon Button Component
interface ResponsiveIconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  'aria-label': string;
}

export function ResponsiveIconButton({
  icon,
  onClick,
  variant = 'ghost',
  size = 'medium',
  disabled = false,
  loading = false,
  className = '',
  'aria-label': ariaLabel
}: ResponsiveIconButtonProps) {
  const baseClasses = 'touch-target rounded-lg transition-all duration-200 focus-visible disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm',
    secondary: 'bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white shadow-sm',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100',
    ghost: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm'
  };

  const sizeClasses = {
    small: 'w-8 h-8 sm:w-9 sm:h-9',
    medium: 'w-10 h-10 sm:w-11 sm:h-11',
    large: 'w-12 h-12 sm:w-14 sm:h-14'
  };

  const iconSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {loading ? (
        <svg className={`animate-spin ${iconSizeClasses[size]}`} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <span className={iconSizeClasses[size]}>{icon}</span>
      )}
    </button>
  );
}

// Floating Action Button
interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
  'aria-label': string;
}

export function FloatingActionButton({
  icon,
  onClick,
  variant = 'primary',
  position = 'bottom-right',
  className = '',
  'aria-label': ariaLabel
}: FloatingActionButtonProps) {
  const baseClasses = 'fixed z-40 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg transition-all duration-200 focus-visible active:scale-95 flex items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white'
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4 sm:bottom-6 sm:right-6',
    'bottom-left': 'bottom-4 left-4 sm:bottom-6 sm:left-6',
    'top-right': 'top-4 right-4 sm:top-6 sm:right-6',
    'top-left': 'top-4 left-4 sm:top-6 sm:left-6'
  };

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${positionClasses[position]}
        ${className}
      `}
    >
      <span className="w-6 h-6 sm:w-7 sm:h-7">{icon}</span>
    </button>
  );
}
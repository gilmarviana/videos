'use client';

import React, { useEffect, useRef } from 'react';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = ''
}: ResponsiveModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Handle focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    full: 'max-w-full mx-4 sm:mx-6 lg:mx-8'
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="flex min-h-full items-center justify-center p-4 text-center sm:p-0"
        onClick={handleOverlayClick}
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity mobile-fade-in" />
        
        {/* Modal */}
        <div
          ref={modalRef}
          tabIndex={-1}
          className={`
            relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all
            w-full ${sizeClasses[size]} mobile-slide-up
            ${className}
          `}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              {title && (
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 pr-4">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="touch-target text-gray-400 hover:text-gray-600 transition-colors rounded-full"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ResponsiveModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveModalHeader({ children, className = '' }: ResponsiveModalHeaderProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveModalBody({ children, className = '' }: ResponsiveModalBodyProps) {
  return (
    <div className={`text-responsive text-gray-700 ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveModalFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function ResponsiveModalFooter({ children, className = '', align = 'right' }: ResponsiveModalFooterProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  return (
    <div className={`flex flex-col sm:flex-row ${alignClasses[align]} gap-2 sm:gap-3 mt-6 pt-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

// Confirmation Modal
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  loading = false
}: ConfirmationModalProps) {
  const iconColors = {
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };

  const buttonVariants = {
    danger: 'danger' as const,
    warning: 'primary' as const,
    info: 'primary' as const
  };

  const icons = {
    danger: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <div className="text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center sm:items-start">
          <div className={`flex-shrink-0 mx-auto sm:mx-0 w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 mb-4 sm:mb-0 sm:mr-4 ${iconColors[variant]}`}>
            {icons[variant]}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600">
              {message}
            </p>
          </div>
        </div>

        <ResponsiveModalFooter className="mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="button-responsive bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`
              button-responsive
              ${variant === 'danger' 
                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
              }
              disabled:opacity-50
            `}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </ResponsiveModalFooter>
      </div>
    </ResponsiveModal>
  );
}
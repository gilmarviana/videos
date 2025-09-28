'use client';

import React from 'react';
import { ResponsiveCard } from '../layout/ResponsiveCard';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showLogo?: boolean;
}

export function AuthLayout({ children, title, subtitle, showLogo = true }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {showLogo && (
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
          </div>
        )}
        
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {title}
        </h2>
        
        {subtitle && (
          <p className="text-center text-sm sm:text-base text-gray-600 mb-8">
            {subtitle}
          </p>
        )}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <ResponsiveCard padding="large" className="shadow-lg">
          {children}
        </ResponsiveCard>
      </div>
    </div>
  );
}
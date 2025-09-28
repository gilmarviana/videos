'use client';

import React from 'react';
import Link from 'next/link';
import { ResponsiveButton } from '../../components/layout/ResponsiveButton';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Acesso Negado
          </h1>
          
          <p className="text-gray-600 mb-8">
            Você não tem permissão para acessar esta página.
          </p>
          
          <div className="space-y-4">
            <Link href="/dashboard">
              <ResponsiveButton fullWidth>
                Voltar ao Dashboard
              </ResponsiveButton>
            </Link>
            
            <Link href="/">
              <ResponsiveButton variant="outline" fullWidth>
                Ir para Home
              </ResponsiveButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
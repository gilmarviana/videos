'use client';

import React, { useState } from 'react';
import { Certificate } from '@/types';

interface CertificateViewerProps {
  certificate: Certificate;
  userName?: string;
  courseName?: string;
  onDownload?: (certificateId: string) => void;
}

export function CertificateViewer({ 
  certificate, 
  userName, 
  courseName, 
  onDownload 
}: CertificateViewerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (!onDownload) return;
    
    setIsLoading(true);
    try {
      await onDownload(certificate.id);
    } catch (error) {
      console.error('Error downloading certificate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg 
              className="w-6 h-6 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" 
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Certificado de Conclusão
            </h3>
            <p className="text-sm text-gray-500">
              {courseName || 'Curso'}
            </p>
          </div>
        </div>
        
        {onDownload && (
          <button
            onClick={handleDownload}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Baixando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Baixar PDF
              </>
            )}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {userName && (
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-500">Aluno:</span>
            <span className="text-sm text-gray-900">{userName}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-500">Data de Emissão:</span>
          <span className="text-sm text-gray-900">{formatDate(certificate.issuedAt)}</span>
        </div>

        {certificate.averageQuizScore !== null && certificate.averageQuizScore !== undefined && (
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-500">Aproveitamento:</span>
            <span className="text-sm text-gray-900">
              {certificate.averageQuizScore.toFixed(1)}%
            </span>
          </div>
        )}

        <div className="flex justify-between items-center py-2">
          <span className="text-sm font-medium text-gray-500">ID do Certificado:</span>
          <span className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
            {certificate.id}
          </span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-green-50 rounded-md">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-green-800">
            Certificado válido e verificado
          </span>
        </div>
      </div>
    </div>
  );
}

export default CertificateViewer;
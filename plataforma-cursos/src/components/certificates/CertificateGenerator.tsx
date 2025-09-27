'use client';

import React, { useState } from 'react';

interface CertificateGeneratorProps {
  courseId: string;
  courseName: string;
  isEligible: boolean;
  onGenerate?: (certificate: any) => void;
}

export function CertificateGenerator({ 
  courseId, 
  courseName, 
  isEligible, 
  onGenerate 
}: CertificateGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleGenerate = async () => {
    if (!isEligible) return;

    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to generate certificate');
      }

      setSuccess(true);
      if (onGenerate) {
        onGenerate(data.data);
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate certificate');
    } finally {
      setIsGenerating(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-green-800">
              Certificado gerado com sucesso!
            </h3>
            <p className="text-sm text-green-700 mt-1">
              Seu certificado está disponível para download.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isEligible) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Certificado não disponível
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Complete todas as aulas do curso para gerar seu certificado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Gerar Certificado
            </h3>
            <p className="text-sm text-gray-500">
              {courseName}
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Gerando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Gerar Certificado
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p>
          Parabéns por completar o curso! Clique no botão acima para gerar seu certificado de conclusão em PDF.
        </p>
      </div>
    </div>
  );
}

export default CertificateGenerator;
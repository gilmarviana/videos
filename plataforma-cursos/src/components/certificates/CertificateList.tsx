'use client';

import React, { useState, useEffect } from 'react';
import { Certificate } from '@/types';
import CertificateViewer from './CertificateViewer';

interface CertificateWithCourse extends Certificate {
  courseName?: string;
}

interface CertificateListProps {
  userId?: string;
  onDownload?: (certificateId: string) => void;
}

export function CertificateList({ userId, onDownload }: CertificateListProps) {
  const [certificates, setCertificates] = useState<CertificateWithCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, [userId]);

  const fetchCertificates = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/certificates');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch certificates');
      }

      setCertificates(data.data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setError(error instanceof Error ? error.message : 'Failed to load certificates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (certificateId: string) => {
    try {
      const response = await fetch(`/api/certificates/${certificateId}/download`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to download certificate');
      }

      // Open download URL in new tab
      if (data.data?.downloadUrl) {
        window.open(data.data.downloadUrl, '_blank');
      }

      if (onDownload) {
        onDownload(certificateId);
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Erro ao baixar certificado. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-800">{error}</span>
        </div>
        <button
          onClick={fetchCertificates}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum certificado encontrado</h3>
        <p className="mt-1 text-sm text-gray-500">
          Complete um curso para receber seu primeiro certificado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">
          Meus Certificados ({certificates.length})
        </h2>
        <button
          onClick={fetchCertificates}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Atualizar
        </button>
      </div>

      <div className="space-y-4">
        {certificates.map((certificate) => (
          <CertificateViewer
            key={certificate.id}
            certificate={certificate}
            courseName={certificate.courseName}
            onDownload={handleDownload}
          />
        ))}
      </div>
    </div>
  );
}

export default CertificateList;
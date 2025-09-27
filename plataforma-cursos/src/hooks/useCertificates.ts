'use client';

import { useState, useEffect, useCallback } from 'react';
import { Certificate } from '@/types';

interface CertificateWithCourse extends Certificate {
  courseName?: string;
}

export function useCertificates() {
  const [certificates, setCertificates] = useState<CertificateWithCourse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = useCallback(async () => {
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
  }, []);

  const getCertificate = useCallback(async (courseId: string): Promise<Certificate | null> => {
    try {
      const response = await fetch(`/api/certificates?courseId=${courseId}`);
      const data = await response.json();

      if (!data.success) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(data.error?.message || 'Failed to get certificate');
      }

      return data.data;
    } catch (error) {
      console.error('Error getting certificate:', error);
      return null;
    }
  }, []);

  const generateCertificate = useCallback(async (courseId: string): Promise<Certificate | null> => {
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

      // Refresh certificates list
      await fetchCertificates();

      return data.data;
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
  }, [fetchCertificates]);

  const downloadCertificate = useCallback(async (certificateId: string): Promise<string | null> => {
    try {
      const response = await fetch(`/api/certificates/${certificateId}/download`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to download certificate');
      }

      return data.data?.downloadUrl || null;
    } catch (error) {
      console.error('Error downloading certificate:', error);
      throw error;
    }
  }, []);

  const verifyCertificate = useCallback(async (certificateId: string) => {
    try {
      const response = await fetch(`/api/certificates/${certificateId}`);
      const data = await response.json();

      if (!data.success) {
        return { isValid: false, certificate: null };
      }

      return data.data;
    } catch (error) {
      console.error('Error verifying certificate:', error);
      return { isValid: false, certificate: null };
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  return {
    certificates,
    isLoading,
    error,
    fetchCertificates,
    getCertificate,
    generateCertificate,
    downloadCertificate,
    verifyCertificate,
  };
}

export default useCertificates;
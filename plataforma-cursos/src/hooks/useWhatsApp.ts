'use client';

import { useState, useEffect } from 'react';
import { WhatsAppConfig } from '@/types';

export function useWhatsApp() {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/whatsapp/config');
      const result = await response.json();
      
      if (result.success && result.data) {
        setConfig(result.data);
      } else {
        setConfig(null);
      }
    } catch (err) {
      console.error('Error fetching WhatsApp config:', err);
      setError('Failed to load WhatsApp configuration');
      setConfig(null);
    } finally {
      setIsLoading(false);
    }
  };

  const generateWhatsAppLink = async (optionId?: string, customMessage?: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/whatsapp/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          optionId,
          customMessage,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data.link;
      } else {
        throw new Error(result.error?.message || 'Failed to generate WhatsApp link');
      }
    } catch (err) {
      console.error('Error generating WhatsApp link:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate WhatsApp link');
      return null;
    }
  };

  const openWhatsApp = async (optionId?: string, customMessage?: string) => {
    const link = await generateWhatsAppLink(optionId, customMessage);
    if (link) {
      window.open(link, '_blank');
    }
  };

  const isActive = config?.isActive ?? false;
  const hasMenuOptions = config?.menuOptions && config.menuOptions.length > 0;

  return {
    config,
    isLoading,
    error,
    isActive,
    hasMenuOptions,
    fetchConfig,
    generateWhatsAppLink,
    openWhatsApp,
  };
}
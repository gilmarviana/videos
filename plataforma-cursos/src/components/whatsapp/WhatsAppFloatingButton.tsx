'use client';

import React, { useState, useEffect } from 'react';
import { WhatsAppConfig } from '@/types';
import { WhatsAppMenu } from './WhatsAppMenu';

interface WhatsAppFloatingButtonProps {
  className?: string;
}

export function WhatsAppFloatingButton({ className = '' }: WhatsAppFloatingButtonProps) {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/whatsapp/config');
      const result = await response.json();
      
      if (result.success && result.data) {
        setConfig(result.data);
      }
    } catch (error) {
      console.error('Error fetching WhatsApp config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (config?.menuOptions && config.menuOptions.length > 0) {
      setIsMenuOpen(!isMenuOpen);
    } else if (config) {
      // Direct link with welcome message
      const link = `https://wa.me/${config.phoneNumber}?text=${encodeURIComponent(config.welcomeMessage)}`;
      window.open(link, '_blank');
    }
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  // Don't render if loading or no config
  if (isLoading || !config || !config.isActive) {
    return null;
  }

  return (
    <>
      <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 ${className}`}>
        <button
          onClick={handleButtonClick}
          className="touch-target bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-full p-3 sm:p-4 shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 focus-visible"
          aria-label="Contact via WhatsApp"
        >
          <WhatsAppIcon className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      </div>

      {isMenuOpen && (
        <WhatsAppMenu
          config={config}
          onClose={handleMenuClose}
          onOptionSelect={(optionId) => {
            const option = config.menuOptions.find(opt => opt.id === optionId);
            if (option) {
              const link = `https://wa.me/${config.phoneNumber}?text=${encodeURIComponent(option.message)}`;
              window.open(link, '_blank');
            }
            setIsMenuOpen(false);
          }}
        />
      )}
    </>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
    </svg>
  );
}
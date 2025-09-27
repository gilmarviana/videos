'use client';

import { useState, useEffect } from 'react';
import { TrialStatus } from '../../types';

interface TrialStatusBannerProps {
  trialStatus: TrialStatus;
  onSubscribeClick?: () => void;
  className?: string;
}

export function TrialStatusBanner({ trialStatus, onSubscribeClick, className = '' }: TrialStatusBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!trialStatus.isActive || !isVisible) {
    return null;
  }

  const isLowTime = trialStatus.minutesRemaining < 60; // Less than 1 hour
  const isCriticalTime = trialStatus.minutesRemaining < 30; // Less than 30 minutes

  const getBannerStyle = () => {
    if (isCriticalTime) {
      return 'bg-red-50 border-red-200 text-red-800';
    }
    if (isLowTime) {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
    return 'bg-blue-50 border-blue-200 text-blue-800';
  };

  const getIcon = () => {
    if (isCriticalTime) {
      return '⚠️';
    }
    if (isLowTime) {
      return '⏰';
    }
    return 'ℹ️';
  };

  const getMessage = () => {
    if (isCriticalTime) {
      return 'Seu teste gratuito está quase expirando!';
    }
    if (isLowTime) {
      return 'Pouco tempo restante no seu teste gratuito.';
    }
    return 'Você está usando o teste gratuito.';
  };

  return (
    <div className={`trial-status-banner ${className}`}>
      <div className={`border rounded-lg p-4 ${getBannerStyle()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl">{getIcon()}</span>
            <div>
              <p className="font-medium">{getMessage()}</p>
              <p className="text-sm opacity-75">
                Restam {Math.floor(trialStatus.minutesRemaining)} minutos do seu teste gratuito.
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsVisible(false)}
              className="text-sm opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Fechar banner"
            >
              ✕
            </button>
            
            {onSubscribeClick && (
              <button
                onClick={onSubscribeClick}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isCriticalTime 
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : isLowTime
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Assinar Agora
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
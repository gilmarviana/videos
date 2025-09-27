'use client';

import { useState, useEffect } from 'react';
import { TrialStatus } from '../../types';

interface TrialTimerProps {
  trialStatus: TrialStatus;
  onTrialExpired?: () => void;
  className?: string;
}

export function TrialTimer({ trialStatus, onTrialExpired, className = '' }: TrialTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(trialStatus.minutesRemaining);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!trialStatus.isActive || trialStatus.minutesRemaining <= 0) {
      setIsExpired(true);
      onTrialExpired?.();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - (1/60); // Decrease by 1 second (1/60 minute)
        
        if (newTime <= 0) {
          setIsExpired(true);
          onTrialExpired?.();
          clearInterval(interval);
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [trialStatus, onTrialExpired]);

  const formatTime = (minutes: number): string => {
    const totalMinutes = Math.floor(minutes);
    const seconds = Math.floor((minutes - totalMinutes) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m ${seconds}s`;
    }
    return `${remainingMinutes}m ${seconds}s`;
  };

  const getProgressPercentage = (): number => {
    const totalTrialMinutes = 4 * 60; // 4 hours in minutes
    return ((totalTrialMinutes - timeRemaining) / totalTrialMinutes) * 100;
  };

  const getTimerColor = (): string => {
    if (isExpired) return 'text-red-600';
    if (timeRemaining < 30) return 'text-red-500'; // Less than 30 minutes
    if (timeRemaining < 60) return 'text-yellow-500'; // Less than 1 hour
    return 'text-green-600';
  };

  if (!trialStatus.isActive) {
    return null;
  }

  return (
    <div className={`trial-timer ${className}`}>
      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Teste Gratuito</h3>
          <span className={`text-lg font-bold ${getTimerColor()}`}>
            {isExpired ? 'EXPIRADO' : formatTime(timeRemaining)}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              isExpired ? 'bg-red-500' : 
              timeRemaining < 30 ? 'bg-red-400' :
              timeRemaining < 60 ? 'bg-yellow-400' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, getProgressPercentage())}%` }}
          />
        </div>
        
        <div className="text-xs text-gray-500">
          {isExpired ? (
            <span className="text-red-600 font-medium">
              Seu teste gratuito expirou. Assine para continuar!
            </span>
          ) : (
            <span>
              Tempo usado: {Math.floor(trialStatus.minutesUsed)} min de {4 * 60} min
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
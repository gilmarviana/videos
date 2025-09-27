'use client';

import { useEffect, useState } from 'react';
import { useTrialStatus } from '../../hooks/useTrialStatus';
import { TrialTimer } from './TrialTimer';
import { TrialStatusBanner } from './TrialStatusBanner';
import { TrialExpiredModal } from './TrialExpiredModal';

interface TrialManagerProps {
  onSubscribeClick?: () => void;
  onTrialExpired?: () => void;
  showTimer?: boolean;
  showBanner?: boolean;
  autoStartSession?: boolean;
  className?: string;
}

export function TrialManager({ 
  onSubscribeClick,
  onTrialExpired,
  showTimer = true,
  showBanner = true,
  autoStartSession = true,
  className = ''
}: TrialManagerProps) {
  const {
    trialStatus,
    sessionInfo,
    canAccessContent,
    isLoading,
    error,
    startSession,
    endSession,
  } = useTrialStatus();

  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [hasShownExpiredModal, setHasShownExpiredModal] = useState(false);

  // Auto-start session when component mounts
  useEffect(() => {
    if (autoStartSession && trialStatus?.isActive && !sessionInfo?.isActive) {
      startSession();
    }
  }, [autoStartSession, trialStatus?.isActive, sessionInfo?.isActive, startSession]);

  // Handle trial expiration
  useEffect(() => {
    if (trialStatus && !canAccessContent && !hasShownExpiredModal) {
      setShowExpiredModal(true);
      setHasShownExpiredModal(true);
      onTrialExpired?.();
    }
  }, [canAccessContent, trialStatus, hasShownExpiredModal, onTrialExpired]);

  const handleTrialExpired = () => {
    setShowExpiredModal(true);
    onTrialExpired?.();
  };

  const handleSubscribe = () => {
    setShowExpiredModal(false);
    onSubscribeClick?.();
  };

  const handleCloseModal = () => {
    setShowExpiredModal(false);
  };

  // Don't render anything while loading
  if (isLoading) {
    return null;
  }

  // Don't render if there's an error or no trial status
  if (error || !trialStatus) {
    return null;
  }

  // Don't render for inactive trials (user has subscription)
  if (!trialStatus.isActive) {
    return null;
  }

  return (
    <div className={`trial-manager ${className}`}>
      {/* Trial Status Banner */}
      {showBanner && (
        <TrialStatusBanner
          trialStatus={trialStatus}
          onSubscribeClick={onSubscribeClick}
          className="mb-4"
        />
      )}

      {/* Trial Timer */}
      {showTimer && (
        <TrialTimer
          trialStatus={trialStatus}
          onTrialExpired={handleTrialExpired}
          className="mb-4"
        />
      )}

      {/* Trial Expired Modal */}
      <TrialExpiredModal
        isOpen={showExpiredModal}
        onClose={handleCloseModal}
        onSubscribe={handleSubscribe}
        minutesUsed={trialStatus.minutesUsed}
      />

      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <details>
            <summary className="cursor-pointer font-medium">Debug Info</summary>
            <div className="mt-2 space-y-1">
              <div>Trial Active: {trialStatus.isActive ? 'Yes' : 'No'}</div>
              <div>Minutes Used: {trialStatus.minutesUsed}</div>
              <div>Minutes Remaining: {trialStatus.minutesRemaining}</div>
              <div>Can Access Content: {canAccessContent ? 'Yes' : 'No'}</div>
              <div>Session Active: {sessionInfo?.isActive ? 'Yes' : 'No'}</div>
              {sessionInfo?.isActive && (
                <div>Current Session: {sessionInfo.currentSessionMinutes} min</div>
              )}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
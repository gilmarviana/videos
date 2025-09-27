'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrialStatus } from '../types';

interface TrialSessionInfo {
  isActive: boolean;
  sessionStartTime?: Date;
  lastActivity?: Date;
  currentSessionMinutes: number;
  totalTrialMinutes: number;
  remainingMinutes: number;
}

interface UseTrialStatusReturn {
  trialStatus: TrialStatus | null;
  sessionInfo: TrialSessionInfo | null;
  canAccessContent: boolean;
  isLoading: boolean;
  error: string | null;
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  sendHeartbeat: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export function useTrialStatus(): UseTrialStatusReturn {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [sessionInfo, setSessionInfo] = useState<TrialSessionInfo | null>(null);
  const [canAccessContent, setCanAccessContent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => {
    return localStorage.getItem('accessToken');
  };

  const makeTrialRequest = async (action?: string, data?: any) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const url = '/api/auth/trial-status';
    const options: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (action) {
      options.method = 'POST';
      options.body = JSON.stringify({ action, ...data });
    } else {
      options.method = 'GET';
    }

    const response = await fetch(url, options);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'Request failed');
    }

    return result.data;
  };

  const refreshStatus = useCallback(async () => {
    try {
      setError(null);
      const data = await makeTrialRequest();
      
      setTrialStatus(data.trialStatus);
      setSessionInfo(data.sessionInfo);
      setCanAccessContent(data.canAccessContent);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching trial status:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startSession = useCallback(async () => {
    try {
      setError(null);
      const data = await makeTrialRequest('start_session');
      
      setTrialStatus(data.trialStatus);
      setSessionInfo(data.sessionInfo);
      setCanAccessContent(data.canAccessContent);
    } catch (err: any) {
      setError(err.message);
      console.error('Error starting trial session:', err);
    }
  }, []);

  const endSession = useCallback(async () => {
    try {
      setError(null);
      const data = await makeTrialRequest('end_session');
      
      setTrialStatus(data.trialStatus);
      setSessionInfo(data.sessionInfo);
      setCanAccessContent(data.canAccessContent);
    } catch (err: any) {
      setError(err.message);
      console.error('Error ending trial session:', err);
    }
  }, []);

  const sendHeartbeat = useCallback(async () => {
    try {
      const data = await makeTrialRequest('heartbeat');
      
      setTrialStatus(data.trialStatus);
      setSessionInfo(data.sessionInfo);
      setCanAccessContent(data.canAccessContent);
    } catch (err: any) {
      // Don't set error for heartbeat failures to avoid UI disruption
      console.error('Error sending heartbeat:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Auto-heartbeat every 30 seconds when session is active
  useEffect(() => {
    if (!sessionInfo?.isActive) return;

    const interval = setInterval(() => {
      sendHeartbeat();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [sessionInfo?.isActive, sendHeartbeat]);

  // End session when page is about to unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionInfo?.isActive) {
        // Use sendBeacon for reliable delivery during page unload
        const token = getAuthToken();
        if (token) {
          navigator.sendBeacon('/api/auth/trial-status', JSON.stringify({
            action: 'end_session'
          }));
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionInfo?.isActive]);

  // Handle visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && sessionInfo?.isActive) {
        // Tab became hidden, end session
        endSession();
      } else if (!document.hidden && trialStatus?.isActive && trialStatus.minutesRemaining > 0) {
        // Tab became visible, start session if trial is still active
        startSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sessionInfo?.isActive, trialStatus, startSession, endSession]);

  return {
    trialStatus,
    sessionInfo,
    canAccessContent,
    isLoading,
    error,
    startSession,
    endSession,
    sendHeartbeat,
    refreshStatus,
  };
}
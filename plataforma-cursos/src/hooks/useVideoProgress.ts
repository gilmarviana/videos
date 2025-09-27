'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { UserProgress } from '../types';
import { progressService } from '../lib/services/progress.service';

interface UseVideoProgressProps {
  userId: string;
  lessonId: string;
  autoSave?: boolean;
  saveInterval?: number; // in seconds
}

export const useVideoProgress = ({
  userId,
  lessonId,
  autoSave = true,
  saveInterval = 10
}: UseVideoProgressProps) => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const lastSavedTime = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);
        const userProgress = await progressService.getProgress(userId, lessonId);
        setProgress(userProgress);
        setError(null);
      } catch (err) {
        setError('Failed to load progress');
        console.error('Error loading progress:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId && lessonId) {
      loadProgress();
    }
  }, [userId, lessonId]);

  // Save progress function
  const saveProgress = useCallback(async (currentTime: number, duration: number, force: boolean = false) => {
    if (!userId || !lessonId || saving) return;

    // Don't save if time hasn't changed significantly (unless forced)
    if (!force && Math.abs(currentTime - lastSavedTime.current) < saveInterval) {
      return;
    }

    try {
      setSaving(true);
      const updatedProgress = await progressService.saveProgress(userId, lessonId, currentTime, duration);
      setProgress(updatedProgress);
      lastSavedTime.current = currentTime;
      setError(null);
    } catch (err) {
      setError('Failed to save progress');
      console.error('Error saving progress:', err);
    } finally {
      setSaving(false);
    }
  }, [userId, lessonId, saving, saveInterval]);

  // Auto-save progress with debouncing
  const updateProgress = useCallback((currentTime: number, duration: number) => {
    if (!autoSave) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      saveProgress(currentTime, duration);
    }, 2000); // Debounce for 2 seconds
  }, [autoSave, saveProgress]);

  // Manual save function
  const manualSave = useCallback((currentTime: number, duration: number) => {
    return saveProgress(currentTime, duration, true);
  }, [saveProgress]);

  // Mark lesson as completed
  const markCompleted = useCallback(async () => {
    if (!userId || !lessonId) return;

    try {
      setSaving(true);
      const updatedProgress = await progressService.markLessonCompleted(userId, lessonId);
      setProgress(updatedProgress);
      setError(null);
    } catch (err) {
      setError('Failed to mark lesson as completed');
      console.error('Error marking lesson as completed:', err);
    } finally {
      setSaving(false);
    }
  }, [userId, lessonId]);

  // Get resume time
  const getResumeTime = useCallback(() => {
    return progressService.getResumeTime(progress);
  }, [progress]);

  // Calculate progress percentage
  const getProgressPercentage = useCallback((currentTime: number, duration: number) => {
    return progressService.calculateProgressPercentage(currentTime, duration);
  }, []);

  // Check if lesson is completed
  const isCompleted = useCallback((currentTime: number, duration: number) => {
    return progressService.isLessonCompleted(currentTime, duration);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    progress,
    loading,
    saving,
    error,
    updateProgress,
    manualSave,
    markCompleted,
    getResumeTime,
    getProgressPercentage,
    isCompleted
  };
};
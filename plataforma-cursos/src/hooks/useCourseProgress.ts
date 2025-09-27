'use client';

import { useState, useEffect, useCallback } from 'react';
import { CourseProgress, CourseCompletion } from '../types';
import { progressService } from '../lib/services/progress.service';

interface UseCourseProgressProps {
  userId: string;
  courseId: string;
}

export const useCourseProgress = ({ userId, courseId }: UseCourseProgressProps) => {
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [completedCourses, setCompletedCourses] = useState<CourseCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load course progress
  const loadCourseProgress = useCallback(async () => {
    if (!userId || !courseId) return;

    try {
      setLoading(true);
      const progress = await progressService.getCourseProgress(userId, courseId);
      setCourseProgress(progress);
      setError(null);
    } catch (err) {
      setError('Failed to load course progress');
      console.error('Error loading course progress:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, courseId]);

  // Load completed courses
  const loadCompletedCourses = useCallback(async () => {
    try {
      const completed = await progressService.getCompletedCourses();
      setCompletedCourses(completed);
    } catch (err) {
      console.error('Error loading completed courses:', err);
    }
  }, []);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadCourseProgress();
    loadCompletedCourses();
  }, [loadCourseProgress, loadCompletedCourses]);

  // Mark course as completed
  const markCourseCompleted = useCallback(async (completionPercentage: number = 100) => {
    try {
      await progressService.markCourseCompleted(courseId, completionPercentage);
      
      // Refresh course progress and completed courses
      await Promise.all([
        loadCourseProgress(),
        loadCompletedCourses()
      ]);
      
      setError(null);
    } catch (err) {
      setError('Failed to mark course as completed');
      console.error('Error marking course as completed:', err);
      throw err;
    }
  }, [courseId, loadCourseProgress, loadCompletedCourses]);

  // Get next lesson
  const getNextLesson = useCallback(async () => {
    try {
      const nextLesson = await progressService.getNextLesson(userId, courseId);
      return nextLesson;
    } catch (err) {
      console.error('Error getting next lesson:', err);
      return null;
    }
  }, [userId, courseId]);

  // Check if course is completed
  const isCourseCompleted = useCallback(() => {
    return courseProgress?.isCompleted || false;
  }, [courseProgress]);

  // Get completion percentage
  const getCompletionPercentage = useCallback(() => {
    return courseProgress?.progressPercentage || 0;
  }, [courseProgress]);

  // Check if all lessons are watched (but not necessarily marked as completed)
  const areAllLessonsWatched = useCallback(() => {
    if (!courseProgress) return false;
    return courseProgress.progressPercentage >= 100;
  }, [courseProgress]);

  return {
    courseProgress,
    completedCourses,
    loading,
    error,
    markCourseCompleted,
    getNextLesson,
    isCourseCompleted,
    getCompletionPercentage,
    areAllLessonsWatched,
    refreshProgress: loadCourseProgress
  };
};
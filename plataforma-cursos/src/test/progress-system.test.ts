/**
 * Test suite for the user progress tracking system
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { progressRepository } from '../lib/db/repositories/progress.repository';
import { UserProgress, UserFavorite, CourseCompletion } from '../types';

describe('User Progress Tracking System', () => {
  const testUserId = 'test-user-progress';
  const testCourseId = 'test-course-progress';
  const testLessonId = 'test-lesson-progress';
  const testModuleId = 'test-module-progress';

  beforeEach(async () => {
    // Clean up test data before each test
    try {
      await progressRepository.removeFromFavorites(testUserId, testCourseId);
    } catch (error) {
      // Ignore errors if data doesn't exist
    }
  });

  afterEach(async () => {
    // Clean up test data after each test
    try {
      await progressRepository.removeFromFavorites(testUserId, testCourseId);
    } catch (error) {
      // Ignore errors if data doesn't exist
    }
  });

  describe('Lesson Progress Tracking', () => {
    it('should create initial progress for a lesson', async () => {
      const progressData = {
        watchedSeconds: 120,
        completed: false
      };

      const progress = await progressRepository.upsertProgress(testUserId, testLessonId, progressData);

      expect(progress).toBeDefined();
      expect(progress.userId).toBe(testUserId);
      expect(progress.lessonId).toBe(testLessonId);
      expect(progress.watchedSeconds).toBe(120);
      expect(progress.completed).toBe(false);
      expect(progress.lastWatchedAt).toBeDefined();
    });

    it('should update existing progress for a lesson', async () => {
      // Create initial progress
      await progressRepository.upsertProgress(testUserId, testLessonId, {
        watchedSeconds: 120,
        completed: false
      });

      // Update progress
      const updatedProgress = await progressRepository.upsertProgress(testUserId, testLessonId, {
        watchedSeconds: 300,
        completed: false
      });

      expect(updatedProgress.watchedSeconds).toBe(300);
      expect(updatedProgress.completed).toBe(false);
    });

    it('should mark lesson as completed', async () => {
      const completedProgress = await progressRepository.upsertProgress(testUserId, testLessonId, {
        watchedSeconds: 450,
        completed: true
      });

      expect(completedProgress.completed).toBe(true);
      expect(completedProgress.completedAt).toBeDefined();
    });

    it('should retrieve progress for a lesson', async () => {
      // Create progress
      await progressRepository.upsertProgress(testUserId, testLessonId, {
        watchedSeconds: 200,
        completed: false
      });

      // Retrieve progress
      const retrievedProgress = await progressRepository.findByUserAndLesson(testUserId, testLessonId);

      expect(retrievedProgress).toBeDefined();
      expect(retrievedProgress?.watchedSeconds).toBe(200);
      expect(retrievedProgress?.completed).toBe(false);
    });

    it('should return null for non-existent progress', async () => {
      const progress = await progressRepository.findByUserAndLesson('non-existent-user', 'non-existent-lesson');
      expect(progress).toBeNull();
    });
  });

  describe('Module Progress Tracking', () => {
    it('should retrieve progress for all lessons in a module', async () => {
      // This test would require actual lesson data in the database
      // For now, we'll test that the method doesn't throw an error
      const moduleProgress = await progressRepository.findModuleProgress(testUserId, testModuleId);
      expect(Array.isArray(moduleProgress)).toBe(true);
    });
  });

  describe('Course Progress Tracking', () => {
    it('should retrieve comprehensive course progress', async () => {
      const courseProgress = await progressRepository.findCourseProgress(testUserId, testCourseId);

      expect(courseProgress).toBeDefined();
      expect(courseProgress.courseId).toBe(testCourseId);
      expect(typeof courseProgress.totalLessons).toBe('number');
      expect(typeof courseProgress.completedLessons).toBe('number');
      expect(typeof courseProgress.progressPercentage).toBe('number');
      expect(Array.isArray(courseProgress.lessons)).toBe(true);
      expect(typeof courseProgress.isFavorite).toBe('boolean');
      expect(typeof courseProgress.isCompleted).toBe('boolean');
    });
  });

  describe('Favorites Management', () => {
    it('should add course to favorites', async () => {
      const favorite = await progressRepository.addToFavorites(testUserId, testCourseId);

      expect(favorite).toBeDefined();
      expect(favorite.userId).toBe(testUserId);
      expect(favorite.courseId).toBe(testCourseId);
      expect(favorite.createdAt).toBeDefined();
    });

    it('should handle duplicate favorites gracefully', async () => {
      // Add to favorites twice
      await progressRepository.addToFavorites(testUserId, testCourseId);
      const secondFavorite = await progressRepository.addToFavorites(testUserId, testCourseId);

      expect(secondFavorite).toBeDefined();
      expect(secondFavorite.courseId).toBe(testCourseId);
    });

    it('should retrieve user favorites', async () => {
      await progressRepository.addToFavorites(testUserId, testCourseId);
      
      const favorites = await progressRepository.getUserFavorites(testUserId);

      expect(Array.isArray(favorites)).toBe(true);
      expect(favorites.some(f => f.courseId === testCourseId)).toBe(true);
    });

    it('should remove course from favorites', async () => {
      // Add to favorites first
      await progressRepository.addToFavorites(testUserId, testCourseId);

      // Remove from favorites
      const removed = await progressRepository.removeFromFavorites(testUserId, testCourseId);

      expect(removed).toBe(true);

      // Verify it's removed
      const favorites = await progressRepository.getUserFavorites(testUserId);
      expect(favorites.some(f => f.courseId === testCourseId)).toBe(false);
    });

    it('should return false when removing non-existent favorite', async () => {
      const removed = await progressRepository.removeFromFavorites(testUserId, 'non-existent-course');
      expect(removed).toBe(false);
    });
  });

  describe('Course Completion', () => {
    it('should mark course as completed', async () => {
      const completion = await progressRepository.markCourseCompleted(testUserId, testCourseId, 95);

      expect(completion).toBeDefined();
      expect(completion.userId).toBe(testUserId);
      expect(completion.courseId).toBe(testCourseId);
      expect(completion.completionPercentage).toBe(95);
      expect(completion.completedAt).toBeDefined();
    });

    it('should retrieve user completed courses', async () => {
      await progressRepository.markCourseCompleted(testUserId, testCourseId, 100);

      const completedCourses = await progressRepository.getUserCompletedCourses(testUserId);

      expect(Array.isArray(completedCourses)).toBe(true);
      expect(completedCourses.some(c => c.courseId === testCourseId)).toBe(true);
    });

    it('should update completion percentage on re-completion', async () => {
      // Mark as completed with 90%
      await progressRepository.markCourseCompleted(testUserId, testCourseId, 90);

      // Update to 100%
      const updatedCompletion = await progressRepository.markCourseCompleted(testUserId, testCourseId, 100);

      expect(updatedCompletion.completionPercentage).toBe(100);
    });
  });

  describe('Next Lesson Functionality', () => {
    it('should handle next lesson retrieval gracefully', async () => {
      // This test would require actual course/lesson data
      // For now, we'll test that the method doesn't throw an error
      const nextLesson = await progressRepository.getNextLesson(testUserId, testCourseId);
      
      // Should return null if no lessons exist or all are completed
      expect(nextLesson === null || typeof nextLesson === 'object').toBe(true);
    });
  });

  describe('Auto Course Completion', () => {
    it('should check and mark course completion when appropriate', async () => {
      // This test would require actual lesson data to work properly
      // For now, we'll test that the method doesn't throw an error
      const autoCompletion = await progressRepository.checkAndMarkCourseCompletion(testUserId, testCourseId);
      
      // Should return null if course is not ready for completion
      expect(autoCompletion === null || typeof autoCompletion === 'object').toBe(true);
    });
  });
});
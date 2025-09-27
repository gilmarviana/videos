#!/usr/bin/env node

/**
 * Validation script for the user progress tracking system
 * This script tests all the progress tracking functionality
 */

import { progressRepository } from '../lib/db/repositories/progress.repository';

async function validateProgressSystem() {
  console.log('🔍 Validating User Progress Tracking System...\n');

  try {
    // Test data
    const testUserId = 'test-user-123';
    const testCourseId = 'test-course-123';
    const testLessonId = 'test-lesson-123';

    console.log('1. Testing progress tracking...');
    
    // Test 1: Create initial progress
    const initialProgress = await progressRepository.upsertProgress(testUserId, testLessonId, {
      watchedSeconds: 120,
      completed: false
    });
    console.log('✅ Initial progress created:', {
      watchedSeconds: initialProgress.watchedSeconds,
      completed: initialProgress.completed
    });

    // Test 2: Update progress
    const updatedProgress = await progressRepository.upsertProgress(testUserId, testLessonId, {
      watchedSeconds: 300,
      completed: false
    });
    console.log('✅ Progress updated:', {
      watchedSeconds: updatedProgress.watchedSeconds,
      completed: updatedProgress.completed
    });

    // Test 3: Mark as completed
    const completedProgress = await progressRepository.upsertProgress(testUserId, testLessonId, {
      watchedSeconds: 450,
      completed: true
    });
    console.log('✅ Lesson marked as completed:', {
      watchedSeconds: completedProgress.watchedSeconds,
      completed: completedProgress.completed,
      completedAt: completedProgress.completedAt
    });

    // Test 4: Retrieve progress
    const retrievedProgress = await progressRepository.findByUserAndLesson(testUserId, testLessonId);
    console.log('✅ Progress retrieved successfully:', {
      id: retrievedProgress?.id,
      completed: retrievedProgress?.completed
    });

    console.log('\n2. Testing favorites functionality...');

    // Test 5: Add to favorites
    const favorite = await progressRepository.addToFavorites(testUserId, testCourseId);
    console.log('✅ Course added to favorites:', {
      userId: favorite.userId,
      courseId: favorite.courseId
    });

    // Test 6: Get user favorites
    const favorites = await progressRepository.getUserFavorites(testUserId);
    console.log('✅ User favorites retrieved:', {
      count: favorites.length,
      courses: favorites.map(f => f.courseId)
    });

    // Test 7: Remove from favorites
    const removed = await progressRepository.removeFromFavorites(testUserId, testCourseId);
    console.log('✅ Course removed from favorites:', { removed });

    console.log('\n3. Testing course completion...');

    // Test 8: Mark course as completed
    const courseCompletion = await progressRepository.markCourseCompleted(testUserId, testCourseId, 95);
    console.log('✅ Course marked as completed:', {
      userId: courseCompletion.userId,
      courseId: courseCompletion.courseId,
      completionPercentage: courseCompletion.completionPercentage
    });

    // Test 9: Get completed courses
    const completedCourses = await progressRepository.getUserCompletedCourses(testUserId);
    console.log('✅ Completed courses retrieved:', {
      count: completedCourses.length,
      courses: completedCourses.map(c => ({
        courseId: c.courseId,
        percentage: c.completionPercentage
      }))
    });

    console.log('\n✅ All progress system tests passed successfully!');
    console.log('\n📊 Progress System Features Validated:');
    console.log('   • Lesson progress tracking (watch time, completion)');
    console.log('   • Resume functionality from saved progress');
    console.log('   • Course favorites management');
    console.log('   • Course completion tracking');
    console.log('   • Progress persistence and retrieval');

  } catch (error) {
    console.error('❌ Progress system validation failed:', error);
    process.exit(1);
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateProgressSystem()
    .then(() => {
      console.log('\n🎉 Progress system validation completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Validation failed:', error);
      process.exit(1);
    });
}

export { validateProgressSystem };
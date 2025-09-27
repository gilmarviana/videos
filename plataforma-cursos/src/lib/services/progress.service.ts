import { UserProgress } from '../../types';

export class ProgressService {
  /**
   * Save user progress for a lesson
   */
  async saveProgress(userId: string, lessonId: string, watchedSeconds: number, duration: number): Promise<UserProgress> {
    try {
      const completed = watchedSeconds >= duration * 0.9; // Consider completed if watched 90%
      
      const response = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          watchedSeconds,
          completed
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  }

  /**
   * Get user progress for a lesson
   */
  async getProgress(userId: string, lessonId: string): Promise<UserProgress | null> {
    try {
      const response = await fetch(`/api/lessons/${lessonId}/progress?userId=${userId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // No progress found
        }
        throw new Error('Failed to get progress');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error getting progress:', error);
      return null;
    }
  }

  /**
   * Get user progress for all lessons in a module
   */
  async getModuleProgress(userId: string, moduleId: string): Promise<UserProgress[]> {
    try {
      const response = await fetch(`/api/modules/${moduleId}/progress?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get module progress');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error getting module progress:', error);
      return [];
    }
  }

  /**
   * Get user progress for all lessons in a course
   */
  async getCourseProgress(userId: string, courseId: string): Promise<{
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
    lessons: UserProgress[];
    isFavorite: boolean;
    isCompleted: boolean;
  }> {
    try {
      const response = await fetch(`/api/courses/${courseId}/progress?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get course progress');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error getting course progress:', error);
      return {
        totalLessons: 0,
        completedLessons: 0,
        progressPercentage: 0,
        lessons: [],
        isFavorite: false,
        isCompleted: false
      };
    }
  }

  /**
   * Mark lesson as completed
   */
  async markLessonCompleted(userId: string, lessonId: string): Promise<UserProgress> {
    try {
      const response = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to mark lesson as completed');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
      throw error;
    }
  }

  /**
   * Calculate progress percentage
   */
  calculateProgressPercentage(watchedSeconds: number, totalSeconds: number): number {
    if (totalSeconds <= 0) return 0;
    return Math.min(100, Math.round((watchedSeconds / totalSeconds) * 100));
  }

  /**
   * Determine if lesson should be considered completed
   */
  isLessonCompleted(watchedSeconds: number, totalSeconds: number, threshold: number = 0.9): boolean {
    if (totalSeconds <= 0) return false;
    return watchedSeconds >= totalSeconds * threshold;
  }

  /**
   * Get next lesson to watch based on progress
   */
  async getNextLesson(userId: string, courseId: string): Promise<{
    moduleId: string;
    lessonId: string;
    title: string;
    progress?: UserProgress;
  } | null> {
    try {
      const response = await fetch(`/api/courses/${courseId}/next-lesson?userId=${userId}`);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error getting next lesson:', error);
      return null;
    }
  }

  /**
   * Resume lesson from saved progress
   */
  getResumeTime(progress: UserProgress | null): number {
    if (!progress || progress.completed) {
      return 0;
    }
    return progress.watchedSeconds;
  }

  /**
   * Add course to favorites
   */
  async addToFavorites(courseId: string): Promise<void> {
    try {
      const response = await fetch('/api/users/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId })
      });

      if (!response.ok) {
        throw new Error('Failed to add to favorites');
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  /**
   * Remove course from favorites
   */
  async removeFromFavorites(courseId: string): Promise<void> {
    try {
      const response = await fetch(`/api/users/favorites?courseId=${courseId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  /**
   * Get user's favorite courses
   */
  async getFavorites(): Promise<any[]> {
    try {
      const response = await fetch('/api/users/favorites');
      
      if (!response.ok) {
        throw new Error('Failed to get favorites');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  /**
   * Mark course as completed
   */
  async markCourseCompleted(courseId: string, completionPercentage: number = 100): Promise<void> {
    try {
      const response = await fetch('/api/users/completed-courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId, completionPercentage })
      });

      if (!response.ok) {
        throw new Error('Failed to mark course as completed');
      }
    } catch (error) {
      console.error('Error marking course as completed:', error);
      throw error;
    }
  }

  /**
   * Get user's completed courses
   */
  async getCompletedCourses(): Promise<any[]> {
    try {
      const response = await fetch('/api/users/completed-courses');
      
      if (!response.ok) {
        throw new Error('Failed to get completed courses');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error getting completed courses:', error);
      return [];
    }
  }
}

export const progressService = new ProgressService();
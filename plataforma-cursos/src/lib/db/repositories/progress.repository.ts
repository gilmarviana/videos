import { Pool } from 'pg';
import { UserProgress, UserFavorite, CourseCompletion, CourseProgress } from '../../../types';
import { getDbConnection } from '../connection';

export class ProgressRepository {
  private db: Pool;

  constructor() {
    this.db = getDbConnection();
  }

  /**
   * Find user progress for a specific lesson
   */
  async findByUserAndLesson(userId: string, lessonId: string): Promise<UserProgress | null> {
    const query = `
      SELECT id, user_id as "userId", lesson_id as "lessonId", 
             watched_seconds as "watchedSeconds", completed, 
             last_watched_at as "lastWatchedAt", completed_at as "completedAt"
      FROM user_progress 
      WHERE user_id = $1 AND lesson_id = $2
    `;
    
    const result = await this.db.query(query, [userId, lessonId]);
    return result.rows[0] || null;
  }

  /**
   * Create or update user progress for a lesson
   */
  async upsertProgress(userId: string, lessonId: string, data: {
    watchedSeconds: number;
    completed: boolean;
  }): Promise<UserProgress> {
    const query = `
      INSERT INTO user_progress (user_id, lesson_id, watched_seconds, completed, last_watched_at, completed_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
      ON CONFLICT (user_id, lesson_id) 
      DO UPDATE SET 
        watched_seconds = $3,
        completed = $4,
        last_watched_at = CURRENT_TIMESTAMP,
        completed_at = CASE WHEN $4 = true AND user_progress.completed = false THEN CURRENT_TIMESTAMP ELSE user_progress.completed_at END
      RETURNING id, user_id as "userId", lesson_id as "lessonId", 
                watched_seconds as "watchedSeconds", completed, 
                last_watched_at as "lastWatchedAt", completed_at as "completedAt"
    `;
    
    const completedAt = data.completed ? new Date() : null;
    const result = await this.db.query(query, [userId, lessonId, data.watchedSeconds, data.completed, completedAt]);
    return result.rows[0];
  }

  /**
   * Get all progress for lessons in a module
   */
  async findModuleProgress(userId: string, moduleId: string): Promise<UserProgress[]> {
    const query = `
      SELECT up.id, up.user_id as "userId", up.lesson_id as "lessonId", 
             up.watched_seconds as "watchedSeconds", up.completed, 
             up.last_watched_at as "lastWatchedAt", up.completed_at as "completedAt"
      FROM user_progress up
      INNER JOIN lessons l ON up.lesson_id = l.id
      WHERE up.user_id = $1 AND l.module_id = $2
      ORDER BY l.order_index
    `;
    
    const result = await this.db.query(query, [userId, moduleId]);
    return result.rows;
  }

  /**
   * Get comprehensive course progress for a user
   */
  async findCourseProgress(userId: string, courseId: string): Promise<CourseProgress> {
    // Get all lessons in the course with their progress
    const lessonsQuery = `
      SELECT l.id as lesson_id, l.title, l.order_index, m.title as module_title,
             up.id, up.user_id as "userId", up.lesson_id as "lessonId", 
             up.watched_seconds as "watchedSeconds", up.completed, 
             up.last_watched_at as "lastWatchedAt", up.completed_at as "completedAt"
      FROM lessons l
      INNER JOIN modules m ON l.module_id = m.id
      LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = $1
      WHERE m.course_id = $2
      ORDER BY m.order_index, l.order_index
    `;

    // Check if course is favorited
    const favoriteQuery = `
      SELECT id FROM user_favorites 
      WHERE user_id = $1 AND course_id = $2
    `;

    // Check if course is completed
    const completionQuery = `
      SELECT id, completed_at as "completedAt", completion_percentage as "completionPercentage"
      FROM course_completions 
      WHERE user_id = $1 AND course_id = $2
    `;

    const [lessonsResult, favoriteResult, completionResult] = await Promise.all([
      this.db.query(lessonsQuery, [userId, courseId]),
      this.db.query(favoriteQuery, [userId, courseId]),
      this.db.query(completionQuery, [userId, courseId])
    ]);

    const lessons = lessonsResult.rows;
    const totalLessons = lessons.length;
    const completedLessons = lessons.filter(lesson => lesson.completed).length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Map to UserProgress objects (only for lessons with progress)
    const userProgressList: UserProgress[] = lessons
      .filter(lesson => lesson.id) // Only lessons with progress records
      .map(lesson => ({
        id: lesson.id,
        userId: lesson.userId,
        lessonId: lesson.lessonId,
        watchedSeconds: lesson.watchedSeconds,
        completed: lesson.completed,
        lastWatchedAt: lesson.lastWatchedAt,
        completedAt: lesson.completedAt
      }));

    return {
      courseId,
      totalLessons,
      completedLessons,
      progressPercentage,
      lessons: userProgressList,
      isFavorite: favoriteResult.rows.length > 0,
      isCompleted: completionResult.rows.length > 0
    };
  }

  /**
   * Add course to user favorites
   */
  async addToFavorites(userId: string, courseId: string): Promise<UserFavorite> {
    const query = `
      INSERT INTO user_favorites (user_id, course_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, course_id) DO NOTHING
      RETURNING id, user_id as "userId", course_id as "courseId", created_at as "createdAt"
    `;
    
    const result = await this.db.query(query, [userId, courseId]);
    
    // If no rows returned due to conflict, fetch existing record
    if (result.rows.length === 0) {
      const existingQuery = `
        SELECT id, user_id as "userId", course_id as "courseId", created_at as "createdAt"
        FROM user_favorites 
        WHERE user_id = $1 AND course_id = $2
      `;
      const existingResult = await this.db.query(existingQuery, [userId, courseId]);
      return existingResult.rows[0];
    }
    
    return result.rows[0];
  }

  /**
   * Remove course from user favorites
   */
  async removeFromFavorites(userId: string, courseId: string): Promise<boolean> {
    const query = `
      DELETE FROM user_favorites 
      WHERE user_id = $1 AND course_id = $2
    `;
    
    const result = await this.db.query(query, [userId, courseId]);
    return result.rowCount > 0;
  }

  /**
   * Get user's favorite courses
   */
  async getUserFavorites(userId: string): Promise<UserFavorite[]> {
    const query = `
      SELECT id, user_id as "userId", course_id as "courseId", created_at as "createdAt"
      FROM user_favorites 
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await this.db.query(query, [userId]);
    return result.rows;
  }

  /**
   * Mark course as completed
   */
  async markCourseCompleted(userId: string, courseId: string, completionPercentage: number = 100): Promise<CourseCompletion> {
    const query = `
      INSERT INTO course_completions (user_id, course_id, completion_percentage)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, course_id) 
      DO UPDATE SET 
        completed_at = CURRENT_TIMESTAMP,
        completion_percentage = $3
      RETURNING id, user_id as "userId", course_id as "courseId", 
                completed_at as "completedAt", completion_percentage as "completionPercentage"
    `;
    
    const result = await this.db.query(query, [userId, courseId, completionPercentage]);
    return result.rows[0];
  }

  /**
   * Get user's completed courses
   */
  async getUserCompletedCourses(userId: string): Promise<CourseCompletion[]> {
    const query = `
      SELECT id, user_id as "userId", course_id as "courseId", 
             completed_at as "completedAt", completion_percentage as "completionPercentage"
      FROM course_completions 
      WHERE user_id = $1
      ORDER BY completed_at DESC
    `;
    
    const result = await this.db.query(query, [userId]);
    return result.rows;
  }

  /**
   * Get next lesson to watch in a course
   */
  async getNextLesson(userId: string, courseId: string): Promise<{
    moduleId: string;
    lessonId: string;
    title: string;
    progress?: UserProgress;
  } | null> {
    const query = `
      SELECT l.id as lesson_id, l.title, l.module_id as module_id,
             up.id, up.user_id as "userId", up.lesson_id as "lessonId", 
             up.watched_seconds as "watchedSeconds", up.completed, 
             up.last_watched_at as "lastWatchedAt", up.completed_at as "completedAt"
      FROM lessons l
      INNER JOIN modules m ON l.module_id = m.id
      LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = $1
      WHERE m.course_id = $2 AND (up.completed IS NULL OR up.completed = false)
      ORDER BY m.order_index, l.order_index
      LIMIT 1
    `;
    
    const result = await this.db.query(query, [userId, courseId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    const nextLesson = {
      moduleId: row.module_id,
      lessonId: row.lesson_id,
      title: row.title,
      progress: row.id ? {
        id: row.id,
        userId: row.userId,
        lessonId: row.lessonId,
        watchedSeconds: row.watchedSeconds,
        completed: row.completed,
        lastWatchedAt: row.lastWatchedAt,
        completedAt: row.completedAt
      } : undefined
    };
    
    return nextLesson;
  }

  /**
   * Get module progress for a user
   */
  async findModuleProgress(userId: string, moduleId: string): Promise<{
    moduleId: string;
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
    lessons: UserProgress[];
    isCompleted: boolean;
  }> {
    const query = `
      SELECT l.id as lesson_id, l.title as lesson_title,
             up.id, up.user_id as "userId", up.lesson_id as "lessonId", 
             up.watched_seconds as "watchedSeconds", up.completed, 
             up.last_watched_at as "lastWatchedAt", up.completed_at as "completedAt"
      FROM lessons l
      LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = $1
      WHERE l.module_id = $2
      ORDER BY l.order_index
    `;

    const result = await this.db.query(query, [userId, moduleId]);
    const lessons = result.rows;
    const totalLessons = lessons.length;
    const completedLessons = lessons.filter(lesson => lesson.completed).length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const userProgressList: UserProgress[] = lessons
      .filter(lesson => lesson.id)
      .map(lesson => ({
        id: lesson.id,
        userId: lesson.userId,
        lessonId: lesson.lessonId,
        watchedSeconds: lesson.watchedSeconds,
        completed: lesson.completed,
        lastWatchedAt: lesson.lastWatchedAt,
        completedAt: lesson.completedAt
      }));

    return {
      moduleId,
      totalLessons,
      completedLessons,
      progressPercentage,
      lessons: userProgressList,
      isCompleted: progressPercentage >= 100
    };
  }

  /**
   * Check if module should be marked as completed and trigger webhooks
   */
  async checkAndMarkModuleCompletion(userId: string, moduleId: string): Promise<boolean> {
    const progress = await this.findModuleProgress(userId, moduleId);
    
    // If module is now completed (100% progress)
    if (progress.isCompleted && progress.completedLessons === progress.totalLessons) {
      // Get module and course information for webhook
      const moduleInfoQuery = `
        SELECT m.title as module_name, m.course_id, c.title as course_name, u.email as user_email
        FROM modules m
        INNER JOIN courses c ON m.course_id = c.id
        INNER JOIN users u ON u.id = $1
        WHERE m.id = $2
      `;
      
      const moduleInfoResult = await this.db.query(moduleInfoQuery, [userId, moduleId]);
      
      if (moduleInfoResult.rows.length > 0) {
        const moduleInfo = moduleInfoResult.rows[0];
        
        // Import and trigger webhook (async, don't wait)
        import('../services/webhook.service').then(({ WebhookService }) => {
          const webhookService = new WebhookService();
          webhookService.triggerModuleCompleted({
            userId,
            userEmail: moduleInfo.user_email,
            moduleId,
            moduleName: moduleInfo.module_name,
            courseId: moduleInfo.course_id,
            courseName: moduleInfo.course_name,
            completedAt: new Date().toISOString()
          }).catch(error => {
            console.error('Error triggering module completion webhook:', error);
          });
        });
        
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if course should be auto-completed based on lesson completion
   */
  async checkAndMarkCourseCompletion(userId: string, courseId: string): Promise<CourseCompletion | null> {
    // Get course progress
    const progress = await this.findCourseProgress(userId, courseId);
    
    // If all lessons are completed and course isn't already marked as completed
    if (progress.progressPercentage >= 100 && !progress.isCompleted) {
      return await this.markCourseCompleted(userId, courseId, progress.progressPercentage);
    }
    
    return null;
  }
}

export const progressRepository = new ProgressRepository();
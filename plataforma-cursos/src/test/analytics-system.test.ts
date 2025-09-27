import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AnalyticsService } from '../lib/services/analytics.service';
import { AnalyticsMiddleware } from '../lib/analytics/middleware';
import { db } from '../lib/db/connection';
import { initializeAnalyticsTables } from '../scripts/init-analytics';

describe('Analytics System', () => {
  beforeAll(async () => {
    // Initialize analytics tables
    await initializeAnalyticsTables();
  });

  afterAll(async () => {
    // Clean up test data
    await db.query('DELETE FROM user_analytics WHERE event_type LIKE \'test_%\'');
    await db.query('DELETE FROM user_engagement WHERE user_id = \'test-user-id\'');
    await db.query('DELETE FROM course_analytics WHERE course_id = \'test-course-id\'');
  });

  describe('AnalyticsService', () => {
    it('should track events successfully', async () => {
      await AnalyticsService.trackEvent({
        userId: 'test-user-id',
        eventType: 'test_event',
        eventData: { test: 'data' },
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });

      const result = await db.query(`
        SELECT * FROM user_analytics 
        WHERE event_type = 'test_event' AND user_id = 'test-user-id'
      `);

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].event_type).toBe('test_event');
      expect(JSON.parse(result.rows[0].event_data)).toEqual({ test: 'data' });
    });

    it('should update user engagement metrics', async () => {
      await AnalyticsService.updateUserEngagement('test-user-id', {
        sessionDuration: 3600,
        videosWatched: 5,
        lessonsCompleted: 2,
        coursesStarted: 1
      });

      const result = await db.query(`
        SELECT * FROM user_engagement 
        WHERE user_id = 'test-user-id' AND date = CURRENT_DATE
      `);

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].session_duration_seconds).toBe(3600);
      expect(result.rows[0].videos_watched).toBe(5);
      expect(result.rows[0].lessons_completed).toBe(2);
      expect(result.rows[0].courses_started).toBe(1);
    });

    it('should update course analytics', async () => {
      await AnalyticsService.updateCourseAnalytics('test-course-id', {
        views: 10,
        uniqueViewers: 8,
        watchTimeSeconds: 7200
      });

      const result = await db.query(`
        SELECT * FROM course_analytics 
        WHERE course_id = 'test-course-id' AND date = CURRENT_DATE
      `);

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].views).toBe(10);
      expect(result.rows[0].unique_viewers).toBe(8);
      expect(result.rows[0].total_watch_time_seconds).toBe(7200);
    });

    it('should get dashboard metrics', async () => {
      const metrics = await AnalyticsService.getDashboardMetrics();

      expect(metrics).toHaveProperty('overview');
      expect(metrics).toHaveProperty('recentActivity');
      expect(metrics).toHaveProperty('subscriptionBreakdown');
      expect(metrics).toHaveProperty('topCourses');
      expect(metrics).toHaveProperty('conversionFunnel');
      expect(metrics).toHaveProperty('engagementMetrics');

      expect(metrics.overview).toHaveProperty('totalActiveUsers');
      expect(metrics.overview).toHaveProperty('trialUsers');
      expect(metrics.overview).toHaveProperty('subscribedUsers');
      expect(metrics.overview).toHaveProperty('monthlyRevenue');
      expect(metrics.overview).toHaveProperty('conversionRate');
      expect(metrics.overview).toHaveProperty('averageWatchTime');
      expect(metrics.overview).toHaveProperty('courseCompletionRate');

      expect(typeof metrics.overview.totalActiveUsers).toBe('number');
      expect(typeof metrics.overview.conversionRate).toBe('number');
    });

    it('should get course popularity report', async () => {
      const report = await AnalyticsService.getCoursePopularityReport(30);

      expect(Array.isArray(report)).toBe(true);
      
      if (report.length > 0) {
        const course = report[0];
        expect(course).toHaveProperty('id');
        expect(course).toHaveProperty('title');
        expect(course).toHaveProperty('totalViews');
        expect(course).toHaveProperty('uniqueViewers');
        expect(course).toHaveProperty('totalWatchTime');
        expect(course).toHaveProperty('averageCompletionRate');
        expect(course).toHaveProperty('enrolledUsers');
      }
    });

    it('should get user engagement report', async () => {
      const report = await AnalyticsService.getUserEngagementReport(30);

      expect(Array.isArray(report)).toBe(true);
      
      if (report.length > 0) {
        const engagement = report[0];
        expect(engagement).toHaveProperty('date');
        expect(engagement).toHaveProperty('activeUsers');
        expect(engagement).toHaveProperty('averageSessionDuration');
        expect(engagement).toHaveProperty('totalVideosWatched');
        expect(engagement).toHaveProperty('totalLessonsCompleted');
        expect(engagement).toHaveProperty('totalCoursesCompleted');
      }
    });

    it('should update daily metrics', async () => {
      await AnalyticsService.updateDailyMetrics();

      const result = await db.query(`
        SELECT * FROM daily_metrics 
        WHERE date = CURRENT_DATE
      `);

      expect(result.rows.length).toBe(1);
      expect(result.rows[0]).toHaveProperty('total_users');
      expect(result.rows[0]).toHaveProperty('active_users');
      expect(result.rows[0]).toHaveProperty('trial_users');
      expect(result.rows[0]).toHaveProperty('subscribed_users');
    });
  });

  describe('AnalyticsMiddleware', () => {
    const mockRequest = {
      headers: {
        get: (name: string) => {
          const headers: Record<string, string> = {
            'authorization': 'Bearer test-token',
            'user-agent': 'test-agent',
            'x-forwarded-for': '127.0.0.1'
          };
          return headers[name] || null;
        }
      },
      ip: '127.0.0.1'
    } as any;

    it('should track API usage', async () => {
      await AnalyticsMiddleware.trackApiUsage(
        mockRequest,
        '/api/test',
        'GET',
        200,
        150
      );

      const result = await db.query(`
        SELECT * FROM user_analytics 
        WHERE event_type = 'api_call' 
        ORDER BY created_at DESC 
        LIMIT 1
      `);

      expect(result.rows.length).toBe(1);
      const eventData = JSON.parse(result.rows[0].event_data);
      expect(eventData.endpoint).toBe('/api/test');
      expect(eventData.method).toBe('GET');
      expect(eventData.responseStatus).toBe(200);
      expect(eventData.responseTime).toBe(150);
    });

    it('should track page views', async () => {
      await AnalyticsMiddleware.trackPageView('/test-page', 'test-user-id', mockRequest);

      const result = await db.query(`
        SELECT * FROM user_analytics 
        WHERE event_type = 'page_view' AND user_id = 'test-user-id'
        ORDER BY created_at DESC 
        LIMIT 1
      `);

      expect(result.rows.length).toBe(1);
      const eventData = JSON.parse(result.rows[0].event_data);
      expect(eventData.page).toBe('/test-page');
    });

    it('should track video events', async () => {
      await AnalyticsMiddleware.trackVideoEvent(
        'test-user-id',
        'video_start',
        {
          lessonId: 'test-lesson-id',
          courseId: 'test-course-id',
          currentTime: 0,
          duration: 3600
        },
        mockRequest
      );

      const result = await db.query(`
        SELECT * FROM user_analytics 
        WHERE event_type = 'video_start' AND user_id = 'test-user-id'
        ORDER BY created_at DESC 
        LIMIT 1
      `);

      expect(result.rows.length).toBe(1);
      const eventData = JSON.parse(result.rows[0].event_data);
      expect(eventData.lessonId).toBe('test-lesson-id');
      expect(eventData.courseId).toBe('test-course-id');
    });

    it('should track lesson completion', async () => {
      await AnalyticsMiddleware.trackLessonComplete(
        'test-user-id',
        {
          lessonId: 'test-lesson-id',
          moduleId: 'test-module-id',
          courseId: 'test-course-id',
          watchTimeSeconds: 1800
        },
        mockRequest
      );

      const result = await db.query(`
        SELECT * FROM user_analytics 
        WHERE event_type = 'lesson_complete' AND user_id = 'test-user-id'
        ORDER BY created_at DESC 
        LIMIT 1
      `);

      expect(result.rows.length).toBe(1);
      const eventData = JSON.parse(result.rows[0].event_data);
      expect(eventData.lessonId).toBe('test-lesson-id');
      expect(eventData.watchTimeSeconds).toBe(1800);

      // Check if user engagement was updated
      const engagementResult = await db.query(`
        SELECT * FROM user_engagement 
        WHERE user_id = 'test-user-id' AND date = CURRENT_DATE
      `);

      expect(engagementResult.rows.length).toBe(1);
      expect(engagementResult.rows[0].lessons_completed).toBeGreaterThan(0);
    });

    it('should track course events', async () => {
      await AnalyticsMiddleware.trackCourseStart(
        'test-user-id',
        {
          courseId: 'test-course-id',
          courseTitle: 'Test Course'
        },
        mockRequest
      );

      const result = await db.query(`
        SELECT * FROM user_analytics 
        WHERE event_type = 'course_start' AND user_id = 'test-user-id'
        ORDER BY created_at DESC 
        LIMIT 1
      `);

      expect(result.rows.length).toBe(1);
      const eventData = JSON.parse(result.rows[0].event_data);
      expect(eventData.courseId).toBe('test-course-id');
      expect(eventData.courseTitle).toBe('Test Course');
    });

    it('should track quiz attempts', async () => {
      await AnalyticsMiddleware.trackQuizAttempt(
        'test-user-id',
        {
          quizId: 'test-quiz-id',
          courseId: 'test-course-id',
          score: 85,
          totalQuestions: 10
        },
        mockRequest
      );

      const result = await db.query(`
        SELECT * FROM user_analytics 
        WHERE event_type = 'quiz_attempt' AND user_id = 'test-user-id'
        ORDER BY created_at DESC 
        LIMIT 1
      `);

      expect(result.rows.length).toBe(1);
      const eventData = JSON.parse(result.rows[0].event_data);
      expect(eventData.quizId).toBe('test-quiz-id');
      expect(eventData.score).toBe(85);
      expect(eventData.totalQuestions).toBe(10);
    });
  });

  describe('Data Integrity', () => {
    it('should handle concurrent user engagement updates', async () => {
      const userId = 'concurrent-test-user';
      
      // Simulate concurrent updates
      const promises = Array.from({ length: 5 }, (_, i) =>
        AnalyticsService.updateUserEngagement(userId, {
          sessionDuration: 600,
          videosWatched: 1,
          lessonsCompleted: 1
        })
      );

      await Promise.all(promises);

      const result = await db.query(`
        SELECT * FROM user_engagement 
        WHERE user_id = $1 AND date = CURRENT_DATE
      `, [userId]);

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].session_duration_seconds).toBe(3000); // 5 * 600
      expect(result.rows[0].videos_watched).toBe(5);
      expect(result.rows[0].lessons_completed).toBe(5);

      // Clean up
      await db.query('DELETE FROM user_engagement WHERE user_id = $1', [userId]);
    });

    it('should handle invalid event data gracefully', async () => {
      // This should not throw an error
      await expect(
        AnalyticsService.trackEvent({
          userId: null as any,
          eventType: '',
          eventData: undefined,
          ipAddress: null as any,
          userAgent: null as any
        })
      ).resolves.not.toThrow();
    });

    it('should maintain data consistency across tables', async () => {
      const testUserId = 'consistency-test-user';
      const testCourseId = 'consistency-test-course';

      // Track lesson completion
      await AnalyticsMiddleware.trackLessonComplete(
        testUserId,
        {
          lessonId: 'test-lesson',
          moduleId: 'test-module',
          courseId: testCourseId,
          watchTimeSeconds: 1200
        },
        mockRequest
      );

      // Check that data is consistent across tables
      const analyticsResult = await db.query(`
        SELECT * FROM user_analytics 
        WHERE event_type = 'lesson_complete' AND user_id = $1
        ORDER BY created_at DESC LIMIT 1
      `, [testUserId]);

      const engagementResult = await db.query(`
        SELECT * FROM user_engagement 
        WHERE user_id = $1 AND date = CURRENT_DATE
      `, [testUserId]);

      const courseAnalyticsResult = await db.query(`
        SELECT * FROM course_analytics 
        WHERE course_id = $1 AND date = CURRENT_DATE
      `, [testCourseId]);

      expect(analyticsResult.rows.length).toBe(1);
      expect(engagementResult.rows.length).toBe(1);
      expect(courseAnalyticsResult.rows.length).toBe(1);

      // Verify data consistency
      const eventData = JSON.parse(analyticsResult.rows[0].event_data);
      expect(eventData.watchTimeSeconds).toBe(1200);
      expect(engagementResult.rows[0].lessons_completed).toBeGreaterThan(0);
      expect(courseAnalyticsResult.rows[0].total_watch_time_seconds).toBeGreaterThan(0);

      // Clean up
      await db.query('DELETE FROM user_analytics WHERE user_id = $1', [testUserId]);
      await db.query('DELETE FROM user_engagement WHERE user_id = $1', [testUserId]);
      await db.query('DELETE FROM course_analytics WHERE course_id = $1', [testCourseId]);
    });
  });
});
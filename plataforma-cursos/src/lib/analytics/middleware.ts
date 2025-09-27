import { NextRequest } from 'next/server';
import { AnalyticsService } from '../services/analytics.service';
import { JWTService } from '../auth/jwt';

export class AnalyticsMiddleware {
  /**
   * Track API endpoint usage
   */
  static async trackApiUsage(
    request: NextRequest,
    endpoint: string,
    method: string,
    responseStatus: number,
    responseTime?: number
  ): Promise<void> {
    try {
      const authHeader = request.headers.get('authorization');
      let userId: string | undefined;

      if (authHeader?.startsWith('Bearer ')) {
        try {
          const token = JWTService.extractTokenFromHeader(authHeader);
          if (token) {
            const payload = JWTService.verifyAccessToken(token);
            userId = payload.userId;
          }
        } catch (error) {
          // Token invalid, continue without user ID
        }
      }

      await AnalyticsService.trackEvent({
        userId,
        eventType: 'api_call',
        eventData: {
          endpoint,
          method,
          responseStatus,
          responseTime,
          timestamp: new Date().toISOString()
        },
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined
      });
    } catch (error) {
      console.error('Error tracking API usage:', error);
    }
  }

  /**
   * Track user login
   */
  static async trackLogin(userId: string, request: NextRequest): Promise<void> {
    try {
      await AnalyticsService.trackEvent({
        userId,
        eventType: 'login',
        eventData: {
          timestamp: new Date().toISOString()
        },
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined
      });
    } catch (error) {
      console.error('Error tracking login:', error);
    }
  }

  /**
   * Track user registration
   */
  static async trackRegistration(userId: string, request: NextRequest): Promise<void> {
    try {
      await AnalyticsService.trackEvent({
        userId,
        eventType: 'signup',
        eventData: {
          timestamp: new Date().toISOString()
        },
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined
      });
    } catch (error) {
      console.error('Error tracking registration:', error);
    }
  }

  /**
   * Track trial start
   */
  static async trackTrialStart(userId: string, request: NextRequest): Promise<void> {
    try {
      await AnalyticsService.trackEvent({
        userId,
        eventType: 'trial_start',
        eventData: {
          timestamp: new Date().toISOString()
        },
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined
      });
    } catch (error) {
      console.error('Error tracking trial start:', error);
    }
  }

  /**
   * Track subscription creation
   */
  static async trackSubscriptionCreated(userId: string, subscriptionData: any, request: NextRequest): Promise<void> {
    try {
      await AnalyticsService.trackEvent({
        userId,
        eventType: 'subscription_created',
        eventData: {
          amount: subscriptionData.amount,
          currency: subscriptionData.currency,
          timestamp: new Date().toISOString()
        },
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined
      });
    } catch (error) {
      console.error('Error tracking subscription creation:', error);
    }
  }

  /**
   * Track video events
   */
  static async trackVideoEvent(
    userId: string,
    eventType: 'video_start' | 'video_pause' | 'video_resume' | 'video_complete',
    videoData: {
      lessonId: string;
      courseId: string;
      currentTime?: number;
      duration?: number;
    },
    request: NextRequest
  ): Promise<void> {
    try {
      await AnalyticsService.trackEvent({
        userId,
        eventType,
        eventData: {
          ...videoData,
          timestamp: new Date().toISOString()
        },
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined
      });

      // Update user engagement metrics
      if (eventType === 'video_complete') {
        await AnalyticsService.updateUserEngagement(userId, {
          videosWatched: 1
        });
      }
    } catch (error) {
      console.error('Error tracking video event:', error);
    }
  }

  /**
   * Track lesson completion
   */
  static async trackLessonComplete(
    userId: string,
    lessonData: {
      lessonId: string;
      moduleId: string;
      courseId: string;
      watchTimeSeconds: number;
    },
    request: NextRequest
  ): Promise<void> {
    try {
      await AnalyticsService.trackEvent({
        userId,
        eventType: 'lesson_complete',
        eventData: {
          ...lessonData,
          timestamp: new Date().toISOString()
        },
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined
      });

      // Update user engagement metrics
      await AnalyticsService.updateUserEngagement(userId, {
        lessonsCompleted: 1,
        sessionDuration: lessonData.watchTimeSeconds
      });

      // Update course analytics
      await AnalyticsService.updateCourseAnalytics(lessonData.courseId, {
        views: 1,
        uniqueViewers: 1,
        watchTimeSeconds: lessonData.watchTimeSeconds
      });
    } catch (error) {
      console.error('Error tracking lesson completion:', error);
    }
  }

  /**
   * Track course start
   */
  static async trackCourseStart(
    userId: string,
    courseData: {
      courseId: string;
      courseTitle: string;
    },
    request: NextRequest
  ): Promise<void> {
    try {
      await AnalyticsService.trackEvent({
        userId,
        eventType: 'course_start',
        eventData: {
          ...courseData,
          timestamp: new Date().toISOString()
        },
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined
      });

      // Update user engagement metrics
      await AnalyticsService.updateUserEngagement(userId, {
        coursesStarted: 1
      });
    } catch (error) {
      console.error('Error tracking course start:', error);
    }
  }

  /**
   * Track course completion
   */
  static async trackCourseComplete(
    userId: string,
    courseData: {
      courseId: string;
      courseTitle: string;
      totalWatchTime: number;
    },
    request: NextRequest
  ): Promise<void> {
    try {
      await AnalyticsService.trackEvent({
        userId,
        eventType: 'course_complete',
        eventData: {
          ...courseData,
          timestamp: new Date().toISOString()
        },
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined
      });

      // Update user engagement metrics
      await AnalyticsService.updateUserEngagement(userId, {
        coursesCompleted: 1
      });
    } catch (error) {
      console.error('Error tracking course completion:', error);
    }
  }

  /**
   * Track quiz attempt
   */
  static async trackQuizAttempt(
    userId: string,
    quizData: {
      quizId: string;
      courseId: string;
      score: number;
      totalQuestions: number;
    },
    request: NextRequest
  ): Promise<void> {
    try {
      await AnalyticsService.trackEvent({
        userId,
        eventType: 'quiz_attempt',
        eventData: {
          ...quizData,
          timestamp: new Date().toISOString()
        },
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined
      });

      // Update user engagement metrics
      await AnalyticsService.updateUserEngagement(userId, {
        quizAttempts: 1
      });
    } catch (error) {
      console.error('Error tracking quiz attempt:', error);
    }
  }

  /**
   * Track page view (for landing page analytics)
   */
  static async trackPageView(
    page: string,
    userId?: string,
    request?: NextRequest
  ): Promise<void> {
    try {
      await AnalyticsService.trackEvent({
        userId,
        eventType: 'page_view',
        eventData: {
          page,
          timestamp: new Date().toISOString()
        },
        ipAddress: request ? this.getClientIP(request) : undefined,
        userAgent: request?.headers.get('user-agent') || undefined
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  /**
   * Get client IP address from request
   */
  private static getClientIP(request: NextRequest): string | undefined {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    return request.ip;
  }
}
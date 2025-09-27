import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '../../../../lib/auth/jwt';
import { AnalyticsService } from '../../../../lib/services/analytics.service';
import { AnalyticsMiddleware } from '../../../../lib/analytics/middleware';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { eventType, eventData } = body;

    if (!eventType) {
      await AnalyticsMiddleware.trackApiUsage(request, '/api/analytics/track', 'POST', 400, Date.now() - startTime);
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Event type é obrigatório' } },
        { status: 400 }
      );
    }

    // Get user ID from token if available
    let userId: string | undefined;
    const authHeader = request.headers.get('authorization');
    
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = JWTService.extractTokenFromHeader(authHeader);
        if (token) {
          const payload = JWTService.verifyAccessToken(token);
          userId = payload.userId;
        }
      } catch (error) {
        // Token invalid, continue without user ID for anonymous tracking
      }
    }

    // Track the event based on type
    switch (eventType) {
      case 'page_view':
        await AnalyticsMiddleware.trackPageView(eventData.page, userId, request);
        break;
        
      case 'video_start':
      case 'video_pause':
      case 'video_resume':
      case 'video_complete':
        if (userId && eventData.lessonId && eventData.courseId) {
          await AnalyticsMiddleware.trackVideoEvent(userId, eventType, eventData, request);
        }
        break;
        
      case 'lesson_complete':
        if (userId && eventData.lessonId && eventData.moduleId && eventData.courseId) {
          await AnalyticsMiddleware.trackLessonComplete(userId, eventData, request);
        }
        break;
        
      case 'course_start':
        if (userId && eventData.courseId) {
          await AnalyticsMiddleware.trackCourseStart(userId, eventData, request);
        }
        break;
        
      case 'course_complete':
        if (userId && eventData.courseId) {
          await AnalyticsMiddleware.trackCourseComplete(userId, eventData, request);
        }
        break;
        
      case 'quiz_attempt':
        if (userId && eventData.quizId && eventData.courseId) {
          await AnalyticsMiddleware.trackQuizAttempt(userId, eventData, request);
        }
        break;
        
      default:
        // Generic event tracking
        await AnalyticsService.trackEvent({
          userId,
          eventType,
          eventData,
          ipAddress: request.headers.get('x-forwarded-for') || request.ip,
          userAgent: request.headers.get('user-agent') || undefined
        });
    }

    // Track successful API usage
    await AnalyticsMiddleware.trackApiUsage(request, '/api/analytics/track', 'POST', 200, Date.now() - startTime);

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking analytics event:', error);
    await AnalyticsMiddleware.trackApiUsage(request, '/api/analytics/track', 'POST', 500, Date.now() - startTime);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    );
  }
}
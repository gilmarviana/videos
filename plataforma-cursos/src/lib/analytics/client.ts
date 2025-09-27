/**
 * Client-side analytics tracking utility
 */

interface TrackEventOptions {
  eventType: string;
  eventData?: any;
  userId?: string;
}

class ClientAnalytics {
  private static instance: ClientAnalytics;
  private baseUrl: string;
  private sessionId: string;

  constructor() {
    this.baseUrl = '/api/analytics/track';
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): ClientAnalytics {
    if (!ClientAnalytics.instance) {
      ClientAnalytics.instance = new ClientAnalytics();
    }
    return ClientAnalytics.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendEvent(options: TrackEventOptions): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          eventType: options.eventType,
          eventData: {
            ...options.eventData,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            referrer: document.referrer
          }
        })
      });

      if (!response.ok) {
        console.warn('Failed to track analytics event:', response.statusText);
      }
    } catch (error) {
      console.warn('Error tracking analytics event:', error);
    }
  }

  /**
   * Track page view
   */
  trackPageView(page: string, additionalData?: any): void {
    this.sendEvent({
      eventType: 'page_view',
      eventData: {
        page,
        title: document.title,
        ...additionalData
      }
    });
  }

  /**
   * Track video events
   */
  trackVideoStart(lessonId: string, courseId: string, videoData?: any): void {
    this.sendEvent({
      eventType: 'video_start',
      eventData: {
        lessonId,
        courseId,
        ...videoData
      }
    });
  }

  trackVideoPause(lessonId: string, courseId: string, currentTime: number): void {
    this.sendEvent({
      eventType: 'video_pause',
      eventData: {
        lessonId,
        courseId,
        currentTime
      }
    });
  }

  trackVideoResume(lessonId: string, courseId: string, currentTime: number): void {
    this.sendEvent({
      eventType: 'video_resume',
      eventData: {
        lessonId,
        courseId,
        currentTime
      }
    });
  }

  trackVideoComplete(lessonId: string, courseId: string, duration: number): void {
    this.sendEvent({
      eventType: 'video_complete',
      eventData: {
        lessonId,
        courseId,
        duration
      }
    });
  }

  /**
   * Track lesson completion
   */
  trackLessonComplete(lessonId: string, moduleId: string, courseId: string, watchTimeSeconds: number): void {
    this.sendEvent({
      eventType: 'lesson_complete',
      eventData: {
        lessonId,
        moduleId,
        courseId,
        watchTimeSeconds
      }
    });
  }

  /**
   * Track course events
   */
  trackCourseStart(courseId: string, courseTitle: string): void {
    this.sendEvent({
      eventType: 'course_start',
      eventData: {
        courseId,
        courseTitle
      }
    });
  }

  trackCourseComplete(courseId: string, courseTitle: string, totalWatchTime: number): void {
    this.sendEvent({
      eventType: 'course_complete',
      eventData: {
        courseId,
        courseTitle,
        totalWatchTime
      }
    });
  }

  /**
   * Track quiz events
   */
  trackQuizAttempt(quizId: string, courseId: string, score: number, totalQuestions: number): void {
    this.sendEvent({
      eventType: 'quiz_attempt',
      eventData: {
        quizId,
        courseId,
        score,
        totalQuestions
      }
    });
  }

  /**
   * Track user interactions
   */
  trackButtonClick(buttonName: string, context?: string): void {
    this.sendEvent({
      eventType: 'button_click',
      eventData: {
        buttonName,
        context
      }
    });
  }

  trackFormSubmit(formName: string, success: boolean): void {
    this.sendEvent({
      eventType: 'form_submit',
      eventData: {
        formName,
        success
      }
    });
  }

  trackSearch(query: string, resultsCount: number): void {
    this.sendEvent({
      eventType: 'search',
      eventData: {
        query,
        resultsCount
      }
    });
  }

  /**
   * Track errors
   */
  trackError(errorType: string, errorMessage: string, context?: any): void {
    this.sendEvent({
      eventType: 'error',
      eventData: {
        errorType,
        errorMessage,
        context
      }
    });
  }

  /**
   * Track custom events
   */
  trackCustomEvent(eventType: string, eventData?: any): void {
    this.sendEvent({
      eventType,
      eventData
    });
  }

  /**
   * Track session duration (call this periodically)
   */
  trackSessionHeartbeat(): void {
    this.sendEvent({
      eventType: 'session_heartbeat',
      eventData: {
        sessionId: this.sessionId
      }
    });
  }

  /**
   * Start automatic session tracking
   */
  startSessionTracking(): void {
    // Track initial page view
    this.trackPageView(window.location.pathname);

    // Track session heartbeat every 30 seconds
    setInterval(() => {
      this.trackSessionHeartbeat();
    }, 30000);

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.sendEvent({
          eventType: 'page_hidden',
          eventData: { sessionId: this.sessionId }
        });
      } else {
        this.sendEvent({
          eventType: 'page_visible',
          eventData: { sessionId: this.sessionId }
        });
      }
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.sendEvent({
        eventType: 'page_unload',
        eventData: { sessionId: this.sessionId }
      });
    });
  }
}

// Export singleton instance
export const analytics = ClientAnalytics.getInstance();

// Auto-start session tracking in browser environment
if (typeof window !== 'undefined') {
  // Start tracking after a short delay to ensure the page is loaded
  setTimeout(() => {
    analytics.startSessionTracking();
  }, 1000);
}
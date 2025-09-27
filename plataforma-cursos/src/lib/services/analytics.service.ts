import { db } from '../db/connection';

export interface AnalyticsEvent {
  userId?: string;
  sessionId?: string;
  eventType: string;
  eventData?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface DashboardMetrics {
  overview: {
    totalActiveUsers: number;
    trialUsers: number;
    subscribedUsers: number;
    monthlyRevenue: number;
    newUsersThisMonth: number;
    conversionRate: number;
    averageWatchTime: number;
    courseCompletionRate: number;
  };
  recentActivity: Array<{
    date: string;
    newUsers: number;
    activeUsers: number;
    watchTime: number;
  }>;
  subscriptionBreakdown: Array<{
    status: string;
    count: number;
  }>;
  topCourses: Array<{
    title: string;
    enrolledUsers: number;
    completionRate: number;
    averageWatchTime: number;
  }>;
  conversionFunnel: {
    visitors: number;
    signups: number;
    trialStarts: number;
    subscriptions: number;
  };
  engagementMetrics: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
  };
}

export class AnalyticsService {
  /**
   * Track user behavior events
   */
  static async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await db.query(`
        INSERT INTO user_analytics (user_id, session_id, event_type, event_data, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        event.userId || null,
        event.sessionId || null,
        event.eventType,
        JSON.stringify(event.eventData || {}),
        event.ipAddress || null,
        event.userAgent || null
      ]);
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      // Don't throw error to avoid breaking main functionality
    }
  }

  /**
   * Update daily user engagement metrics
   */
  static async updateUserEngagement(userId: string, data: {
    sessionDuration?: number;
    videosWatched?: number;
    lessonsCompleted?: number;
    coursesStarted?: number;
    coursesCompleted?: number;
    quizAttempts?: number;
  }): Promise<void> {
    try {
      await db.query(`
        INSERT INTO user_engagement (
          user_id, date, session_duration_seconds, videos_watched, 
          lessons_completed, courses_started, courses_completed, quiz_attempts
        )
        VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id, date)
        DO UPDATE SET
          session_duration_seconds = user_engagement.session_duration_seconds + EXCLUDED.session_duration_seconds,
          videos_watched = user_engagement.videos_watched + EXCLUDED.videos_watched,
          lessons_completed = user_engagement.lessons_completed + EXCLUDED.lessons_completed,
          courses_started = user_engagement.courses_started + EXCLUDED.courses_started,
          courses_completed = user_engagement.courses_completed + EXCLUDED.courses_completed,
          quiz_attempts = user_engagement.quiz_attempts + EXCLUDED.quiz_attempts,
          last_activity_at = CURRENT_TIMESTAMP
      `, [
        userId,
        data.sessionDuration || 0,
        data.videosWatched || 0,
        data.lessonsCompleted || 0,
        data.coursesStarted || 0,
        data.coursesCompleted || 0,
        data.quizAttempts || 0
      ]);
    } catch (error) {
      console.error('Error updating user engagement:', error);
    }
  }

  /**
   * Update course analytics
   */
  static async updateCourseAnalytics(courseId: string, data: {
    views?: number;
    uniqueViewers?: number;
    watchTimeSeconds?: number;
  }): Promise<void> {
    try {
      await db.query(`
        INSERT INTO course_analytics (course_id, date, views, unique_viewers, total_watch_time_seconds)
        VALUES ($1, CURRENT_DATE, $2, $3, $4)
        ON CONFLICT (course_id, date)
        DO UPDATE SET
          views = course_analytics.views + EXCLUDED.views,
          unique_viewers = GREATEST(course_analytics.unique_viewers, EXCLUDED.unique_viewers),
          total_watch_time_seconds = course_analytics.total_watch_time_seconds + EXCLUDED.total_watch_time_seconds,
          updated_at = CURRENT_TIMESTAMP
      `, [courseId, data.views || 0, data.uniqueViewers || 0, data.watchTimeSeconds || 0]);
    } catch (error) {
      console.error('Error updating course analytics:', error);
    }
  }

  /**
   * Get comprehensive dashboard metrics
   */
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Overview metrics
      const overviewQueries = await Promise.all([
        // Total active users
        db.query(`
          SELECT COUNT(*) as total_active_users 
          FROM users 
          WHERE is_active = true AND role = 'student'
        `),
        
        // Trial users
        db.query(`
          SELECT COUNT(*) as trial_users 
          FROM users u
          LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
          WHERE u.trial_start_time IS NOT NULL 
          AND s.id IS NULL 
          AND u.is_active = true
          AND u.role = 'student'
        `),
        
        // Subscribed users
        db.query(`
          SELECT COUNT(*) as subscribed_users 
          FROM users u
          INNER JOIN subscriptions s ON u.id = s.user_id 
          WHERE s.status = 'active' 
          AND u.is_active = true
          AND u.role = 'student'
        `),
        
        // Monthly revenue
        db.query(`
          SELECT COALESCE(SUM(amount), 0) as monthly_revenue
          FROM subscriptions 
          WHERE status = 'active'
          AND current_period_start <= NOW()
          AND current_period_end >= NOW()
        `),
        
        // New users this month
        db.query(`
          SELECT COUNT(*) as new_users_this_month
          FROM users 
          WHERE created_at >= DATE_TRUNC('month', NOW())
          AND role = 'student'
        `),
        
        // Conversion rate
        db.query(`
          SELECT 
            COUNT(CASE WHEN u.trial_start_time IS NOT NULL THEN 1 END) as total_trial_users,
            COUNT(CASE WHEN u.trial_start_time IS NOT NULL AND s.id IS NOT NULL THEN 1 END) as converted_users
          FROM users u
          LEFT JOIN subscriptions s ON u.id = s.user_id
          WHERE u.role = 'student'
        `),
        
        // Average watch time (last 30 days)
        db.query(`
          SELECT COALESCE(AVG(session_duration_seconds), 0) as avg_watch_time
          FROM user_engagement
          WHERE date >= CURRENT_DATE - INTERVAL '30 days'
        `),
        
        // Course completion rate
        db.query(`
          SELECT 
            COUNT(DISTINCT ue.user_id) as users_with_progress,
            COUNT(CASE WHEN ue.courses_completed > 0 THEN 1 END) as users_completed
          FROM user_engagement ue
          WHERE ue.date >= CURRENT_DATE - INTERVAL '30 days'
        `)
      ]);

      const [
        totalActiveUsersResult,
        trialUsersResult,
        subscribedUsersResult,
        monthlyRevenueResult,
        newUsersThisMonthResult,
        conversionRateResult,
        avgWatchTimeResult,
        completionRateResult
      ] = overviewQueries;

      // Calculate metrics
      const trialData = conversionRateResult.rows[0];
      const conversionRate = trialData.total_trial_users > 0 
        ? (trialData.converted_users / trialData.total_trial_users * 100)
        : 0;

      const completionData = completionRateResult.rows[0];
      const courseCompletionRate = completionData.users_with_progress > 0
        ? (completionData.users_completed / completionData.users_with_progress * 100)
        : 0;

      // Recent activity (last 7 days)
      const recentActivityResult = await db.query(`
        SELECT 
          DATE(u.created_at) as date,
          COUNT(DISTINCT u.id) as new_users,
          COUNT(DISTINCT ue.user_id) as active_users,
          COALESCE(SUM(ue.session_duration_seconds), 0) as watch_time
        FROM users u
        LEFT JOIN user_engagement ue ON u.id = ue.user_id AND DATE(u.created_at) = ue.date
        WHERE u.created_at >= NOW() - INTERVAL '7 days'
        AND u.role = 'student'
        GROUP BY DATE(u.created_at)
        ORDER BY date DESC
      `);

      // Subscription breakdown
      const subscriptionStatusResult = await db.query(`
        SELECT status, COUNT(*) as count
        FROM subscriptions
        GROUP BY status
      `);

      // Top courses with enhanced metrics
      const topCoursesResult = await db.query(`
        SELECT 
          c.title,
          COUNT(DISTINCT up.user_id) as enrolled_users,
          COALESCE(AVG(ca.completion_rate), 0) as completion_rate,
          COALESCE(AVG(ca.total_watch_time_seconds), 0) as avg_watch_time
        FROM courses c
        LEFT JOIN modules m ON c.id = m.course_id
        LEFT JOIN lessons l ON m.id = l.module_id
        LEFT JOIN user_progress up ON l.id = up.lesson_id
        LEFT JOIN course_analytics ca ON c.id = ca.course_id AND ca.date >= CURRENT_DATE - INTERVAL '30 days'
        WHERE c.is_active = true
        GROUP BY c.id, c.title
        ORDER BY enrolled_users DESC
        LIMIT 5
      `);

      // Conversion funnel
      const conversionFunnelResult = await db.query(`
        SELECT 
          COUNT(CASE WHEN ua.event_type = 'page_view' THEN 1 END) as visitors,
          COUNT(CASE WHEN ua.event_type = 'signup' THEN 1 END) as signups,
          COUNT(CASE WHEN ua.event_type = 'trial_start' THEN 1 END) as trial_starts,
          COUNT(CASE WHEN ua.event_type = 'subscription_created' THEN 1 END) as subscriptions
        FROM user_analytics ua
        WHERE ua.created_at >= CURRENT_DATE - INTERVAL '30 days'
      `);

      // Engagement metrics
      const engagementResult = await db.query(`
        SELECT 
          COUNT(DISTINCT CASE WHEN ue.date = CURRENT_DATE THEN ue.user_id END) as daily_active_users,
          COUNT(DISTINCT CASE WHEN ue.date >= CURRENT_DATE - INTERVAL '7 days' THEN ue.user_id END) as weekly_active_users,
          COUNT(DISTINCT CASE WHEN ue.date >= CURRENT_DATE - INTERVAL '30 days' THEN ue.user_id END) as monthly_active_users,
          COALESCE(AVG(ue.session_duration_seconds), 0) as avg_session_duration
        FROM user_engagement ue
        WHERE ue.date >= CURRENT_DATE - INTERVAL '30 days'
      `);

      const dashboardData: DashboardMetrics = {
        overview: {
          totalActiveUsers: parseInt(totalActiveUsersResult.rows[0].total_active_users),
          trialUsers: parseInt(trialUsersResult.rows[0].trial_users),
          subscribedUsers: parseInt(subscribedUsersResult.rows[0].subscribed_users),
          monthlyRevenue: parseFloat(monthlyRevenueResult.rows[0].monthly_revenue),
          newUsersThisMonth: parseInt(newUsersThisMonthResult.rows[0].new_users_this_month),
          conversionRate: parseFloat(conversionRate.toFixed(2)),
          averageWatchTime: parseFloat(avgWatchTimeResult.rows[0].avg_watch_time),
          courseCompletionRate: parseFloat(courseCompletionRate.toFixed(2))
        },
        recentActivity: recentActivityResult.rows.map((row: any) => ({
          date: row.date,
          newUsers: parseInt(row.new_users),
          activeUsers: parseInt(row.active_users),
          watchTime: parseInt(row.watch_time)
        })),
        subscriptionBreakdown: subscriptionStatusResult.rows.map((row: any) => ({
          status: row.status,
          count: parseInt(row.count)
        })),
        topCourses: topCoursesResult.rows.map((row: any) => ({
          title: row.title,
          enrolledUsers: parseInt(row.enrolled_users),
          completionRate: parseFloat(row.completion_rate),
          averageWatchTime: parseFloat(row.avg_watch_time)
        })),
        conversionFunnel: {
          visitors: parseInt(conversionFunnelResult.rows[0]?.visitors || 0),
          signups: parseInt(conversionFunnelResult.rows[0]?.signups || 0),
          trialStarts: parseInt(conversionFunnelResult.rows[0]?.trial_starts || 0),
          subscriptions: parseInt(conversionFunnelResult.rows[0]?.subscriptions || 0)
        },
        engagementMetrics: {
          dailyActiveUsers: parseInt(engagementResult.rows[0].daily_active_users),
          weeklyActiveUsers: parseInt(engagementResult.rows[0].weekly_active_users),
          monthlyActiveUsers: parseInt(engagementResult.rows[0].monthly_active_users),
          averageSessionDuration: parseFloat(engagementResult.rows[0].avg_session_duration)
        }
      };

      return dashboardData;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Get course popularity report
   */
  static async getCoursePopularityReport(days: number = 30) {
    try {
      const result = await db.query(`
        SELECT 
          c.id,
          c.title,
          c.created_at,
          COALESCE(SUM(ca.views), 0) as total_views,
          COALESCE(SUM(ca.unique_viewers), 0) as unique_viewers,
          COALESCE(SUM(ca.total_watch_time_seconds), 0) as total_watch_time,
          COALESCE(AVG(ca.completion_rate), 0) as avg_completion_rate,
          COUNT(DISTINCT up.user_id) as enrolled_users
        FROM courses c
        LEFT JOIN course_analytics ca ON c.id = ca.course_id 
          AND ca.date >= CURRENT_DATE - INTERVAL '${days} days'
        LEFT JOIN modules m ON c.id = m.course_id
        LEFT JOIN lessons l ON m.id = l.module_id
        LEFT JOIN user_progress up ON l.id = up.lesson_id
        WHERE c.is_active = true
        GROUP BY c.id, c.title, c.created_at
        ORDER BY total_views DESC, enrolled_users DESC
      `);

      return result.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        createdAt: row.created_at,
        totalViews: parseInt(row.total_views),
        uniqueViewers: parseInt(row.unique_viewers),
        totalWatchTime: parseInt(row.total_watch_time),
        averageCompletionRate: parseFloat(row.avg_completion_rate),
        enrolledUsers: parseInt(row.enrolled_users)
      }));
    } catch (error) {
      console.error('Error fetching course popularity report:', error);
      throw error;
    }
  }

  /**
   * Get user engagement report
   */
  static async getUserEngagementReport(days: number = 30) {
    try {
      const result = await db.query(`
        SELECT 
          DATE(ue.date) as date,
          COUNT(DISTINCT ue.user_id) as active_users,
          AVG(ue.session_duration_seconds) as avg_session_duration,
          SUM(ue.videos_watched) as total_videos_watched,
          SUM(ue.lessons_completed) as total_lessons_completed,
          SUM(ue.courses_completed) as total_courses_completed
        FROM user_engagement ue
        WHERE ue.date >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY DATE(ue.date)
        ORDER BY date DESC
      `);

      return result.rows.map((row: any) => ({
        date: row.date,
        activeUsers: parseInt(row.active_users),
        averageSessionDuration: parseFloat(row.avg_session_duration || 0),
        totalVideosWatched: parseInt(row.total_videos_watched || 0),
        totalLessonsCompleted: parseInt(row.total_lessons_completed || 0),
        totalCoursesCompleted: parseInt(row.total_courses_completed || 0)
      }));
    } catch (error) {
      console.error('Error fetching user engagement report:', error);
      throw error;
    }
  }

  /**
   * Calculate and update daily metrics (should be run daily via cron)
   */
  static async updateDailyMetrics(): Promise<void> {
    try {
      const metricsResult = await db.query(`
        WITH daily_stats AS (
          SELECT 
            COUNT(DISTINCT u.id) as total_users,
            COUNT(DISTINCT CASE WHEN ue.user_id IS NOT NULL THEN u.id END) as active_users,
            COUNT(DISTINCT CASE WHEN u.trial_start_time IS NOT NULL AND s.id IS NULL THEN u.id END) as trial_users,
            COUNT(DISTINCT CASE WHEN s.status = 'active' THEN u.id END) as subscribed_users,
            COUNT(DISTINCT CASE WHEN u.created_at::date = CURRENT_DATE THEN u.id END) as new_registrations,
            COALESCE(SUM(s.amount), 0) as revenue,
            COALESCE(SUM(ue.session_duration_seconds), 0) as total_watch_time
          FROM users u
          LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
          LEFT JOIN user_engagement ue ON u.id = ue.user_id AND ue.date = CURRENT_DATE
          WHERE u.role = 'student' AND u.is_active = true
        )
        INSERT INTO daily_metrics (
          date, total_users, active_users, trial_users, subscribed_users, 
          new_registrations, revenue, total_watch_time_seconds
        )
        SELECT 
          CURRENT_DATE, total_users, active_users, trial_users, subscribed_users,
          new_registrations, revenue, total_watch_time
        FROM daily_stats
        ON CONFLICT (date)
        DO UPDATE SET
          total_users = EXCLUDED.total_users,
          active_users = EXCLUDED.active_users,
          trial_users = EXCLUDED.trial_users,
          subscribed_users = EXCLUDED.subscribed_users,
          new_registrations = EXCLUDED.new_registrations,
          revenue = EXCLUDED.revenue,
          total_watch_time_seconds = EXCLUDED.total_watch_time_seconds
      `);

      console.log('Daily metrics updated successfully');
    } catch (error) {
      console.error('Error updating daily metrics:', error);
      throw error;
    }
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../../../lib/db/connection';
import { authMiddleware } from '../../../../lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_001', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const courseId = url.searchParams.get('courseId');
    const userId = url.searchParams.get('userId') || authResult.user.id;

    // Admin can view any user's stats, students can only view their own
    if (authResult.user.role !== 'admin' && userId !== authResult.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_003', message: 'Access denied' } },
        { status: 403 }
      );
    }

    const db = await getConnection();

    if (courseId) {
      // Get course-specific quiz statistics
      const courseStatsQuery = `
        SELECT 
          COUNT(DISTINCT q.id) as total_quizzes,
          COUNT(qa.id) as total_attempts,
          AVG(qa.score) as average_score,
          MAX(qa.score) as best_score,
          COUNT(DISTINCT qa.user_id) as unique_users
        FROM quizzes q
        LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
        WHERE q.course_id = $1 AND q.is_active = true
        ${authResult.user.role !== 'admin' ? 'AND qa.user_id = $2' : ''}
      `;

      const params = authResult.user.role === 'admin' ? [courseId] : [courseId, userId];
      const result = await db.query(courseStatsQuery, params);
      
      const stats = result.rows[0];
      
      // Get quiz breakdown by type
      const quizBreakdownQuery = `
        SELECT 
          q.quiz_type as type,
          COUNT(q.id) as count,
          AVG(qa.score) as average_score
        FROM quizzes q
        LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
        WHERE q.course_id = $1 AND q.is_active = true
        ${authResult.user.role !== 'admin' ? 'AND qa.user_id = $2' : ''}
        GROUP BY q.quiz_type
      `;

      const breakdownResult = await db.query(quizBreakdownQuery, params);

      return NextResponse.json({
        success: true,
        data: {
          courseId,
          totalQuizzes: parseInt(stats.total_quizzes) || 0,
          totalAttempts: parseInt(stats.total_attempts) || 0,
          averageScore: parseFloat(stats.average_score) || 0,
          bestScore: parseFloat(stats.best_score) || 0,
          uniqueUsers: parseInt(stats.unique_users) || 0,
          quizBreakdown: breakdownResult.rows.map(row => ({
            type: row.type,
            count: parseInt(row.count),
            averageScore: parseFloat(row.average_score) || 0,
          })),
        },
      });
    } else {
      // Get overall user quiz statistics
      const userStatsQuery = `
        SELECT 
          COUNT(DISTINCT qa.quiz_id) as quizzes_taken,
          COUNT(qa.id) as total_attempts,
          AVG(qa.score) as average_score,
          MAX(qa.score) as best_score,
          COUNT(CASE WHEN qa.score >= 70 THEN 1 END) as passed_attempts
        FROM quiz_attempts qa
        WHERE qa.user_id = $1
      `;

      const result = await db.query(userStatsQuery, [userId]);
      const stats = result.rows[0];

      // Get recent attempts
      const recentAttemptsQuery = `
        SELECT 
          qa.id,
          qa.score,
          qa.completed_at,
          q.quiz_type as type,
          COALESCE(l.title, m.title, c.title) as content_title
        FROM quiz_attempts qa
        JOIN quizzes q ON qa.quiz_id = q.id
        LEFT JOIN lessons l ON q.lesson_id = l.id
        LEFT JOIN modules m ON q.module_id = m.id
        LEFT JOIN courses c ON q.course_id = c.id
        WHERE qa.user_id = $1
        ORDER BY qa.completed_at DESC
        LIMIT 10
      `;

      const recentResult = await db.query(recentAttemptsQuery, [userId]);

      return NextResponse.json({
        success: true,
        data: {
          userId,
          quizzesTaken: parseInt(stats.quizzes_taken) || 0,
          totalAttempts: parseInt(stats.total_attempts) || 0,
          averageScore: parseFloat(stats.average_score) || 0,
          bestScore: parseFloat(stats.best_score) || 0,
          passedAttempts: parseInt(stats.passed_attempts) || 0,
          passRate: stats.total_attempts > 0 ? (parseInt(stats.passed_attempts) / parseInt(stats.total_attempts)) * 100 : 0,
          recentAttempts: recentResult.rows.map(row => ({
            id: row.id,
            score: parseFloat(row.score),
            completedAt: row.completed_at,
            type: row.type,
            contentTitle: row.content_title,
          })),
        },
      });
    }

  } catch (error) {
    console.error('Quiz stats error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'QUIZ_001', message: 'Failed to fetch quiz statistics' } },
      { status: 500 }
    );
  }
}
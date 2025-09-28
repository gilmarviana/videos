import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../../../../lib/db/connection';
import { QuizService } from '../../../../../lib/services/quiz.service';
import { authMiddleware } from '../../../../../lib/auth/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_001', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Admin only for analytics
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_003', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    const quizId = params.id;
    const db = await getConnection();
    const quizService = new QuizService(db);

    const analytics = await quizService.getQuizPerformanceAnalytics(quizId);

    return NextResponse.json({
      success: true,
      data: analytics,
    });

  } catch (error) {
    console.error('Quiz analytics error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'QUIZ_001', message: 'Failed to fetch quiz analytics' } },
      { status: 500 }
    );
  }
}
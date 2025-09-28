import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../../../../lib/db/connection';
import { QuizService } from '../../../../../lib/services/quiz.service';
import { authMiddleware } from '../../../../../lib/auth/middleware';
import { z } from 'zod';

const submitAttemptSchema = z.object({
  answers: z.array(z.number().min(0).max(3)),
});

export async function POST(
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

    const quizId = params.id;
    const body = await request.json();
    const { answers } = submitAttemptSchema.parse(body);

    const db = await getConnection();
    const quizService = new QuizService(db);

    const attempt = await quizService.submitQuizAttempt({
      userId: authResult.user.id,
      quizId,
      answers,
    });

    return NextResponse.json({
      success: true,
      data: attempt,
    });

  } catch (error) {
    console.error('Quiz attempt submission error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'QUIZ_003', message: 'Failed to submit quiz attempt' } },
      { status: 500 }
    );
  }
}

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

    const quizId = params.id;
    const db = await getConnection();
    const quizService = new QuizService(db);

    const attempts = await quizService.getUserQuizAttempts(authResult.user.id, quizId);

    return NextResponse.json({
      success: true,
      data: attempts,
    });

  } catch (error) {
    console.error('Quiz attempts fetch error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'QUIZ_001', message: 'Failed to fetch quiz attempts' } },
      { status: 500 }
    );
  }
}
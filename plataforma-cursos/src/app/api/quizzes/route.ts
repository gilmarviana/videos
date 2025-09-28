import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db/connection';
import { QuizService } from '../../../lib/services/quiz.service';
import { authMiddleware } from '../../../lib/auth/middleware';
import { z } from 'zod';

const createQuizSchema = z.object({
  targetId: z.string().uuid(),
  type: z.enum(['lesson', 'module', 'course']),
});

const submitAttemptSchema = z.object({
  quizId: z.string().uuid(),
  answers: z.array(z.number().min(0).max(3)),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_001', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    const db = await getConnection();
    const quizService = new QuizService(db);

    if (action === 'generate') {
      // Admin only - generate new quiz
      if (authResult.user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: { code: 'AUTH_003', message: 'Admin access required' } },
          { status: 403 }
        );
      }

      const { targetId, type } = createQuizSchema.parse(body);

      let quiz;
      switch (type) {
        case 'lesson':
          quiz = await quizService.generateAndSaveQuizForLesson(targetId);
          break;
        case 'module':
          quiz = await quizService.generateAndSaveQuizForModule(targetId);
          break;
        case 'course':
          quiz = await quizService.generateAndSaveQuizForCourse(targetId);
          break;
      }

      return NextResponse.json({
        success: true,
        data: quiz,
      });
    }

    if (action === 'regenerate') {
      // Admin only - regenerate existing quiz
      if (authResult.user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: { code: 'AUTH_003', message: 'Admin access required' } },
          { status: 403 }
        );
      }

      const { targetId, type } = createQuizSchema.parse(body);

      const quiz = await quizService.regenerateQuiz(targetId, type);

      return NextResponse.json({
        success: true,
        data: quiz,
      });
    }

    if (action === 'attempt') {
      // Submit quiz attempt
      const { quizId, answers } = submitAttemptSchema.parse(body);

      const attempt = await quizService.submitQuizAttempt({
        userId: authResult.user.id,
        quizId,
        answers,
      });

      return NextResponse.json({
        success: true,
        data: attempt,
      });
    }

    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ACTION', message: 'Invalid action specified' } },
      { status: 400 }
    );

  } catch (error) {
    console.error('Quiz API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'QUIZ_001', message: 'Failed to process quiz request' } },
      { status: 500 }
    );
  }
}

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
    const targetId = url.searchParams.get('targetId');
    const type = url.searchParams.get('type') as 'lesson' | 'module' | 'course';
    const action = url.searchParams.get('action');

    if (!targetId || !type) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'targetId and type are required' } },
        { status: 400 }
      );
    }

    const db = await getConnection();
    const quizService = new QuizService(db);

    if (action === 'config') {
      // Get quiz configuration
      const config = await quizService.getQuizConfiguration(targetId, type);
      return NextResponse.json({
        success: true,
        data: config,
      });
    }

    // Get quiz for target
    const quiz = await quizService.getQuizByTarget(targetId, type);
    
    if (!quiz) {
      return NextResponse.json(
        { success: false, error: { code: 'QUIZ_002', message: 'Quiz not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: quiz,
    });

  } catch (error) {
    console.error('Quiz GET API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'QUIZ_001', message: 'Failed to fetch quiz' } },
      { status: 500 }
    );
  }
}
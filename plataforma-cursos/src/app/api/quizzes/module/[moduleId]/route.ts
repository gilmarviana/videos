import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../../../../lib/db/connection';
import { QuizService } from '../../../../../lib/services/quiz.service';
import { authMiddleware } from '../../../../../lib/auth/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_001', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const moduleId = params.moduleId;
    const db = await getConnection();
    const quizService = new QuizService(db);

    const quiz = await quizService.getQuizByTarget(moduleId, 'module');
    
    if (!quiz) {
      return NextResponse.json(
        { success: false, error: { code: 'QUIZ_002', message: 'Quiz not found for this module' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: quiz,
    });

  } catch (error) {
    console.error('Module quiz GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'QUIZ_001', message: 'Failed to fetch module quiz' } },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_001', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Admin only
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_003', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    const moduleId = params.moduleId;
    const db = await getConnection();
    const quizService = new QuizService(db);

    // Check if quiz already exists
    const existingQuiz = await quizService.getQuizByTarget(moduleId, 'module');
    if (existingQuiz) {
      return NextResponse.json(
        { success: false, error: { code: 'QUIZ_003', message: 'Quiz already exists for this module' } },
        { status: 409 }
      );
    }

    const quiz = await quizService.generateAndSaveQuizForModule(moduleId);

    return NextResponse.json({
      success: true,
      data: quiz,
    });

  } catch (error) {
    console.error('Module quiz generation error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'QUIZ_001', message: 'Failed to generate module quiz' } },
      { status: 500 }
    );
  }
}
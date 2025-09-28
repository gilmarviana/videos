import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../../../../lib/db/connection';
import { QuizService } from '../../../../../lib/services/quiz.service';
import { authMiddleware } from '../../../../../lib/auth/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_001', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const lessonId = params.lessonId;
    const db = await getConnection();
    const quizService = new QuizService(db);

    const quiz = await quizService.getQuizByTarget(lessonId, 'lesson');
    
    if (!quiz) {
      return NextResponse.json(
        { success: false, error: { code: 'QUIZ_002', message: 'Quiz not found for this lesson' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: quiz,
    });

  } catch (error) {
    console.error('Lesson quiz GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'QUIZ_001', message: 'Failed to fetch lesson quiz' } },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
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

    const lessonId = params.lessonId;
    const db = await getConnection();
    const quizService = new QuizService(db);

    // Check if quiz already exists
    const existingQuiz = await quizService.getQuizByTarget(lessonId, 'lesson');
    if (existingQuiz) {
      return NextResponse.json(
        { success: false, error: { code: 'QUIZ_003', message: 'Quiz already exists for this lesson' } },
        { status: 409 }
      );
    }

    const quiz = await quizService.generateAndSaveQuizForLesson(lessonId);

    return NextResponse.json({
      success: true,
      data: quiz,
    });

  } catch (error) {
    console.error('Lesson quiz generation error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'QUIZ_001', message: 'Failed to generate lesson quiz' } },
      { status: 500 }
    );
  }
}
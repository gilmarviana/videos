import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../../../lib/db/connection';
import { QuizService } from '../../../../lib/services/quiz.service';
import { authMiddleware } from '../../../../lib/auth/middleware';
import { z } from 'zod';

const updateQuizSchema = z.object({
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    options: z.array(z.string()).length(4),
    correctAnswer: z.number().min(0).max(3),
    explanation: z.string().optional(),
  })),
});

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
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    const db = await getConnection();
    const quizService = new QuizService(db);

    if (action === 'attempts') {
      // Get user's attempts for this quiz
      const attempts = await quizService.getUserQuizAttempts(authResult.user.id, quizId);
      
      return NextResponse.json({
        success: true,
        data: attempts,
      });
    }

    // Get specific quiz by ID
    const query = `
      SELECT id, lesson_id, module_id, course_id, quiz_type as type, questions, is_active, created_at
      FROM quizzes
      WHERE id = $1 AND is_active = true
    `;

    const result = await db.query(query, [quizId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'QUIZ_002', message: 'Quiz not found' } },
        { status: 404 }
      );
    }

    const row = result.rows[0];
    const quiz = {
      id: row.id,
      lessonId: row.lesson_id,
      moduleId: row.module_id,
      courseId: row.course_id,
      type: row.type,
      questions: row.questions,
      isActive: row.is_active,
      createdAt: row.created_at,
    };

    return NextResponse.json({
      success: true,
      data: quiz,
    });

  } catch (error) {
    console.error('Quiz GET by ID error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'QUIZ_001', message: 'Failed to fetch quiz' } },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Admin only
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_003', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    const quizId = params.id;
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    const db = await getConnection();
    const quizService = new QuizService(db);

    if (action === 'toggle') {
      // Toggle quiz active status
      const updatedQuiz = await quizService.toggleQuizStatus(quizId);
      
      return NextResponse.json({
        success: true,
        data: updatedQuiz,
      });
    }

    // Default: Update quiz questions
    const body = await request.json();
    const { questions } = updateQuizSchema.parse(body);

    const updatedQuiz = await quizService.updateQuiz(quizId, questions);

    return NextResponse.json({
      success: true,
      data: updatedQuiz,
    });

  } catch (error) {
    console.error('Quiz UPDATE error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'QUIZ_001', message: 'Failed to update quiz' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Admin only
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_003', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    const quizId = params.id;

    const db = await getConnection();
    const quizService = new QuizService(db);

    await quizService.deleteQuiz(quizId);

    return NextResponse.json({
      success: true,
      data: { message: 'Quiz deleted successfully' },
    });

  } catch (error) {
    console.error('Quiz DELETE error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'QUIZ_001', message: 'Failed to delete quiz' } },
      { status: 500 }
    );
  }
}
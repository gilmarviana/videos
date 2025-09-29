import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../../../lib/db/connection';
import { QuizService } from '../../../../lib/services/quiz.service';
import { authMiddleware } from '../../../../lib/auth/middleware';
import { z } from 'zod';

const bulkGenerateSchema = z.object({
  courseId: z.string().uuid(),
  generateForLessons: z.boolean().default(false),
  generateForModules: z.boolean().default(false),
  generateForCourse: z.boolean().default(false),
});

const bulkToggleSchema = z.object({
  quizIds: z.array(z.string().uuid()),
  enable: z.boolean(),
});

export async function GET(request: NextRequest) {
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

    const url = new URL(request.url);
    const courseId = url.searchParams.get('courseId');
    const type = url.searchParams.get('type') as 'lesson' | 'module' | 'course' | null;

    const db = await getConnection();

    let query = `
      SELECT 
        q.id,
        q.lesson_id,
        q.module_id,
        q.course_id,
        q.quiz_type as type,
        q.is_active,
        q.created_at,
        COALESCE(l.title, m.title, c.title) as content_title,
        COUNT(qa.id) as total_attempts,
        AVG(qa.score) as average_score
      FROM quizzes q
      LEFT JOIN lessons l ON q.lesson_id = l.id
      LEFT JOIN modules m ON q.module_id = m.id
      LEFT JOIN courses c ON q.course_id = c.id
      LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (courseId) {
      query += ` AND q.course_id = $${paramIndex}`;
      params.push(courseId);
      paramIndex++;
    }

    if (type) {
      query += ` AND q.quiz_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    query += `
      GROUP BY q.id, q.lesson_id, q.module_id, q.course_id, q.quiz_type, q.is_active, q.created_at, l.title, m.title, c.title
      ORDER BY q.created_at DESC
    `;

    const result = await db.query(query, params);

    const quizzes = result.rows.map(row => ({
      id: row.id,
      lessonId: row.lesson_id,
      moduleId: row.module_id,
      courseId: row.course_id,
      type: row.type,
      isActive: row.is_active,
      createdAt: row.created_at,
      contentTitle: row.content_title,
      totalAttempts: parseInt(row.total_attempts) || 0,
      averageScore: parseFloat(row.average_score) || 0,
    }));

    return NextResponse.json({
      success: true,
      data: quizzes,
    });

  } catch (error) {
    console.error('Admin quizzes GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'QUIZ_001', message: 'Failed to fetch quizzes' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    const db = await getConnection();
    const quizService = new QuizService(db);

    if (action === 'bulk-generate') {
      const { courseId, generateForLessons, generateForModules, generateForCourse } = bulkGenerateSchema.parse(body);

      const results = {
        lessonQuizzes: [] as any[],
        moduleQuizzes: [] as any[],
        courseQuiz: null as any,
        errors: [] as string[],
      };

      // Generate lesson quizzes
      if (generateForLessons) {
        const lessonsQuery = `
          SELECT l.id 
          FROM lessons l
          JOIN modules m ON l.module_id = m.id
          WHERE m.course_id = $1
          ORDER BY m.order_index, l.order_index
        `;
        
        const lessonsResult = await db.query(lessonsQuery, [courseId]);
        
        for (const lesson of lessonsResult.rows) {
          try {
            const existingQuiz = await quizService.getQuizByTarget(lesson.id, 'lesson');
            if (!existingQuiz) {
              const quiz = await quizService.generateAndSaveQuizForLesson(lesson.id);
              results.lessonQuizzes.push(quiz);
            }
          } catch (error) {
            results.errors.push(`Failed to generate quiz for lesson ${lesson.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

      // Generate module quizzes
      if (generateForModules) {
        const modulesQuery = `
          SELECT id FROM modules WHERE course_id = $1 ORDER BY order_index
        `;
        
        const modulesResult = await db.query(modulesQuery, [courseId]);
        
        for (const module of modulesResult.rows) {
          try {
            const existingQuiz = await quizService.getQuizByTarget(module.id, 'module');
            if (!existingQuiz) {
              const quiz = await quizService.generateAndSaveQuizForModule(module.id);
              results.moduleQuizzes.push(quiz);
            }
          } catch (error) {
            results.errors.push(`Failed to generate quiz for module ${module.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

      // Generate course quiz
      if (generateForCourse) {
        try {
          const existingQuiz = await quizService.getQuizByTarget(courseId, 'course');
          if (!existingQuiz) {
            results.courseQuiz = await quizService.generateAndSaveQuizForCourse(courseId);
          }
        } catch (error) {
          results.errors.push(`Failed to generate quiz for course ${courseId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return NextResponse.json({
        success: true,
        data: results,
      });
    }

    if (action === 'bulk-toggle') {
      const { quizIds, enable } = bulkToggleSchema.parse(body);

      const query = `
        UPDATE quizzes 
        SET is_active = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ANY($2)
        RETURNING id, is_active
      `;

      const result = await db.query(query, [enable, quizIds]);

      return NextResponse.json({
        success: true,
        data: {
          updatedQuizzes: result.rows.map(row => ({
            id: row.id,
            isActive: row.is_active,
          })),
        },
      });
    }

    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ACTION', message: 'Invalid action specified' } },
      { status: 400 }
    );

  } catch (error) {
    console.error('Admin quizzes POST error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'QUIZ_001', message: 'Failed to process admin quiz request' } },
      { status: 500 }
    );
  }
}
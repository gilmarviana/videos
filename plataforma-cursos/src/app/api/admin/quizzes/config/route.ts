import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../../../../lib/db/connection';
import { authMiddleware } from '../../../../../lib/auth/middleware';
import { z } from 'zod';

const configUpdateSchema = z.object({
  courseId: z.string().uuid(),
  lessonQuizEnabled: z.boolean().default(false),
  moduleQuizEnabled: z.boolean().default(false),
  courseQuizEnabled: z.boolean().default(false),
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

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'courseId is required' } },
        { status: 400 }
      );
    }

    const db = await getConnection();

    // Get quiz configuration for the course
    const configQuery = `
      SELECT 
        COUNT(CASE WHEN q.quiz_type = 'lesson' AND q.is_active = true THEN 1 END) as active_lesson_quizzes,
        COUNT(CASE WHEN q.quiz_type = 'lesson' THEN 1 END) as total_lesson_quizzes,
        COUNT(CASE WHEN q.quiz_type = 'module' AND q.is_active = true THEN 1 END) as active_module_quizzes,
        COUNT(CASE WHEN q.quiz_type = 'module' THEN 1 END) as total_module_quizzes,
        COUNT(CASE WHEN q.quiz_type = 'course' AND q.is_active = true THEN 1 END) as active_course_quizzes,
        COUNT(CASE WHEN q.quiz_type = 'course' THEN 1 END) as total_course_quizzes,
        COUNT(l.id) as total_lessons,
        COUNT(m.id) as total_modules
      FROM courses c
      LEFT JOIN modules m ON c.id = m.course_id
      LEFT JOIN lessons l ON m.id = l.module_id
      LEFT JOIN quizzes q ON (q.lesson_id = l.id OR q.module_id = m.id OR q.course_id = c.id)
      WHERE c.id = $1
      GROUP BY c.id
    `;

    const result = await db.query(configQuery, [courseId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'COURSE_NOT_FOUND', message: 'Course not found' } },
        { status: 404 }
      );
    }

    const stats = result.rows[0];

    const config = {
      courseId,
      lessonQuizzes: {
        enabled: parseInt(stats.active_lesson_quizzes) > 0,
        total: parseInt(stats.total_lessons) || 0,
        generated: parseInt(stats.total_lesson_quizzes) || 0,
        active: parseInt(stats.active_lesson_quizzes) || 0,
      },
      moduleQuizzes: {
        enabled: parseInt(stats.active_module_quizzes) > 0,
        total: parseInt(stats.total_modules) || 0,
        generated: parseInt(stats.total_module_quizzes) || 0,
        active: parseInt(stats.active_module_quizzes) || 0,
      },
      courseQuizzes: {
        enabled: parseInt(stats.active_course_quizzes) > 0,
        total: 1,
        generated: parseInt(stats.total_course_quizzes) || 0,
        active: parseInt(stats.active_course_quizzes) || 0,
      },
    };

    return NextResponse.json({
      success: true,
      data: config,
    });

  } catch (error) {
    console.error('Quiz config GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'QUIZ_001', message: 'Failed to fetch quiz configuration' } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { courseId, lessonQuizEnabled, moduleQuizEnabled, courseQuizEnabled } = configUpdateSchema.parse(body);

    const db = await getConnection();

    // Update lesson quizzes
    if (lessonQuizEnabled !== undefined) {
      const lessonQuizQuery = `
        UPDATE quizzes 
        SET is_active = $1, updated_at = CURRENT_TIMESTAMP
        WHERE lesson_id IN (
          SELECT l.id 
          FROM lessons l
          JOIN modules m ON l.module_id = m.id
          WHERE m.course_id = $2
        )
      `;
      await db.query(lessonQuizQuery, [lessonQuizEnabled, courseId]);
    }

    // Update module quizzes
    if (moduleQuizEnabled !== undefined) {
      const moduleQuizQuery = `
        UPDATE quizzes 
        SET is_active = $1, updated_at = CURRENT_TIMESTAMP
        WHERE module_id IN (
          SELECT id FROM modules WHERE course_id = $2
        )
      `;
      await db.query(moduleQuizQuery, [moduleQuizEnabled, courseId]);
    }

    // Update course quiz
    if (courseQuizEnabled !== undefined) {
      const courseQuizQuery = `
        UPDATE quizzes 
        SET is_active = $1, updated_at = CURRENT_TIMESTAMP
        WHERE course_id = $2
      `;
      await db.query(courseQuizQuery, [courseQuizEnabled, courseId]);
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Quiz configuration updated successfully',
        courseId,
        lessonQuizEnabled,
        moduleQuizEnabled,
        courseQuizEnabled,
      },
    });

  } catch (error) {
    console.error('Quiz config PUT error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'QUIZ_001', message: 'Failed to update quiz configuration' } },
      { status: 500 }
    );
  }
}
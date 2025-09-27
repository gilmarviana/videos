import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware, createAuthErrorResponse } from '../../../../../lib/auth/middleware';
import { ApiResponse } from '../../../../../types';
import { progressRepository } from '../../../../../lib/db/repositories/progress.repository';

// POST /api/lessons/[id]/complete - Mark lesson as completed
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from auth
    const user = await AuthMiddleware.getUser(request);
    if (!user) {
      return createAuthErrorResponse('Authentication required', 401);
    }

    const lessonId = params.id;
    const body = await request.json();
    const { userId } = body;

    // Only allow users to complete their own lessons (unless admin)
    const targetUserId = userId || user.id;
    if (targetUserId !== user.id && user.role !== 'admin') {
      return createAuthErrorResponse('Access denied', 403);
    }

    // Get existing progress or create new
    const existingProgress = await progressRepository.findByUserAndLesson(targetUserId, lessonId);
    
    const progress = await progressRepository.upsertProgress(targetUserId, lessonId, {
      watchedSeconds: existingProgress?.watchedSeconds || 0,
      completed: true
    });

    // Check if this lesson completion triggers module and course completion
    // First, get the module and course ID from the lesson
    const { getDbConnection } = await import('../../../../../lib/db/connection');
    const db = getDbConnection();
    const moduleQuery = `
      SELECT l.module_id, m.course_id 
      FROM lessons l 
      INNER JOIN modules m ON l.module_id = m.id 
      WHERE l.id = $1
    `;
    const moduleResult = await db.query(moduleQuery, [lessonId]);
    
    if (moduleResult.rows.length > 0) {
      const { module_id: moduleId, course_id: courseId } = moduleResult.rows[0];
      
      // Check for module completion first
      await progressRepository.checkAndMarkModuleCompletion(targetUserId, moduleId);
      
      // Then check for course completion
      await progressRepository.checkAndMarkCourseCompletion(targetUserId, courseId);
    }

    const response: ApiResponse = {
      success: true,
      data: progress
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error marking lesson as completed:', error);
    
    if (error.message.includes('token') || error.message.includes('Authentication')) {
      return createAuthErrorResponse(error.message, 401);
    }
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to mark lesson as completed'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
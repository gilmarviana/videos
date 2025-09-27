import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware, createAuthErrorResponse } from '../../../../../lib/auth/middleware';
import { ApiResponse } from '../../../../../types';
import { progressRepository } from '../../../../../lib/db/repositories/progress.repository';

// GET /api/courses/[id]/next-lesson - Get next lesson to watch in course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from auth
    const user = await AuthMiddleware.getUser(request);
    if (!user) {
      return createAuthErrorResponse('Authentication required', 401);
    }

    const courseId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || user.id;

    // Only allow users to see their own progress (unless admin)
    if (userId !== user.id && user.role !== 'admin') {
      return createAuthErrorResponse('Access denied', 403);
    }

    const nextLesson = await progressRepository.getNextLesson(userId, courseId);

    if (!nextLesson) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'CONTENT_001',
          message: 'No next lesson found - course may be completed'
        }
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: nextLesson
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching next lesson:', error);
    
    if (error.message.includes('token') || error.message.includes('Authentication')) {
      return createAuthErrorResponse(error.message, 401);
    }
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to fetch next lesson'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
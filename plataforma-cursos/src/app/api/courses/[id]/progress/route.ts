import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware, createAuthErrorResponse } from '../../../../../lib/auth/middleware';
import { ApiResponse } from '../../../../../types';
import { progressRepository } from '../../../../../lib/db/repositories/progress.repository';

// GET /api/courses/[id]/progress - Get user progress for entire course
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

    const courseProgress = await progressRepository.findCourseProgress(userId, courseId);

    const response: ApiResponse = {
      success: true,
      data: courseProgress
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching course progress:', error);
    
    if (error.message.includes('token') || error.message.includes('Authentication')) {
      return createAuthErrorResponse(error.message, 401);
    }
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to fetch course progress'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware, createAuthErrorResponse } from '../../../../../lib/auth/middleware';
import { ApiResponse } from '../../../../../types';
import { progressRepository } from '../../../../../lib/db/repositories/progress.repository';

// GET /api/lessons/[id]/progress - Get user progress for lesson
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

    const lessonId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || user.id;

    // Only allow users to see their own progress (unless admin)
    if (userId !== user.id && user.role !== 'admin') {
      return createAuthErrorResponse('Access denied', 403);
    }

    const progress = await progressRepository.findByUserAndLesson(userId, lessonId);

    if (!progress) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'CONTENT_001',
          message: 'Progress not found'
        }
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: progress
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching progress:', error);
    
    if (error.message.includes('token') || error.message.includes('Authentication')) {
      return createAuthErrorResponse(error.message, 401);
    }
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to fetch progress'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/lessons/[id]/progress - Update user progress for lesson
export async function PUT(
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
    const { userId, watchedSeconds, completed } = body;

    // Only allow users to update their own progress (unless admin)
    const targetUserId = userId || user.id;
    if (targetUserId !== user.id && user.role !== 'admin') {
      return createAuthErrorResponse('Access denied', 403);
    }

    if (typeof watchedSeconds !== 'number' || watchedSeconds < 0) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid watchedSeconds value'
        }
      };
      return NextResponse.json(response, { status: 400 });
    }

    const progress = await progressRepository.upsertProgress(targetUserId, lessonId, {
      watchedSeconds,
      completed: completed || false
    });

    const response: ApiResponse = {
      success: true,
      data: progress
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error updating progress:', error);
    
    if (error.message.includes('token') || error.message.includes('Authentication')) {
      return createAuthErrorResponse(error.message, 401);
    }
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to update progress'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
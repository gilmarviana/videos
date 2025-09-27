import { NextRequest, NextResponse } from 'next/server';
import { courseService } from '../../../../lib/services/course.service';
import { AuthMiddleware, createAuthErrorResponse } from '../../../../lib/auth/middleware';
import { ApiResponse } from '../../../../types';

// GET /api/lessons/[id] - Get lesson by ID (requires trial or subscription)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check trial/subscription access and track usage
    await AuthMiddleware.requireContentAccess(request);
    
    const lesson = await courseService.getLessonById(params.id);

    if (!lesson) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'CONTENT_001',
          message: 'Lesson not found'
        }
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: lesson
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching lesson:', error);
    
    // Check if it's an auth/trial error
    if (error.message.includes('Trial') || error.message.includes('subscription')) {
      return createAuthErrorResponse(error.message, 403);
    }
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_001',
        message: 'Failed to fetch lesson'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/lessons/[id] - Update lesson (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin role
    await AuthMiddleware.requireAdmin(request);
    
    const body = await request.json();
    
    const { 
      title, 
      description, 
      videoUrl, 
      videoSource, 
      videoFormat, 
      durationSeconds, 
      orderIndex 
    } = body;

    // Validate video URL if provided
    if (videoUrl && videoSource) {
      const validation = await courseService.validateVideoUrl(videoUrl, videoSource);
      if (!validation.isValid) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error || 'Invalid video URL'
          }
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    const lesson = await courseService.updateLesson(params.id, {
      title,
      description,
      videoUrl,
      videoSource,
      videoFormat,
      durationSeconds: durationSeconds ? parseInt(durationSeconds) : undefined,
      orderIndex: orderIndex ? parseInt(orderIndex) : undefined
    });

    if (!lesson) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'CONTENT_001',
          message: 'Lesson not found'
        }
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: lesson
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error updating lesson:', error);
    
    // Check if it's an auth error
    if (error.message.includes('token') || error.message.includes('Access denied')) {
      return createAuthErrorResponse(error.message, 401);
    }
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to update lesson'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/lessons/[id] - Delete lesson (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin role
    await AuthMiddleware.requireAdmin(request);
    
    const deleted = await courseService.deleteLesson(params.id);

    if (!deleted) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'CONTENT_001',
          message: 'Lesson not found'
        }
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: { message: 'Lesson deleted successfully' }
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error deleting lesson:', error);
    
    // Check if it's an auth error
    if (error.message.includes('token') || error.message.includes('Access denied')) {
      return createAuthErrorResponse(error.message, 401);
    }
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to delete lesson'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
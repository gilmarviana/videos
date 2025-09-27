import { NextRequest, NextResponse } from 'next/server';
import { courseService } from '../../../../../lib/services/course.service';
import { ApiResponse } from '../../../../../types';

// GET /api/modules/[id]/lessons - Get lessons for a module
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessons = await courseService.getLessonsByModule(params.id);

    const response: ApiResponse = {
      success: true,
      data: lessons
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_001',
        message: 'Failed to fetch lessons'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/modules/[id]/lessons - Create a new lesson (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // TODO: Add authentication middleware to verify admin role
    
    const { 
      title, 
      description, 
      videoUrl, 
      videoSource, 
      videoFormat, 
      durationSeconds, 
      orderIndex 
    } = body;

    if (!title || !description) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title and description are required'
        }
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verify module exists
    const module = await courseService.getModuleById(params.id);
    if (!module) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'CONTENT_001',
          message: 'Module not found'
        }
      };
      return NextResponse.json(response, { status: 404 });
    }

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

    const lesson = await courseService.createLesson({
      moduleId: params.id,
      title,
      description,
      videoUrl,
      videoSource,
      videoFormat,
      durationSeconds: durationSeconds ? parseInt(durationSeconds) : undefined,
      orderIndex: orderIndex ? parseInt(orderIndex) : undefined
    });

    const response: ApiResponse = {
      success: true,
      data: lesson
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to create lesson'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
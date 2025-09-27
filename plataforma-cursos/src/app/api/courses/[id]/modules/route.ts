import { NextRequest, NextResponse } from 'next/server';
import { courseService } from '../../../../../lib/services/course.service';
import { ApiResponse } from '../../../../../types';

// GET /api/courses/[id]/modules - Get modules for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const modules = await courseService.getModulesByCourse(params.id);

    const response: ApiResponse = {
      success: true,
      data: modules
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching modules:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_001',
        message: 'Failed to fetch modules'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/courses/[id]/modules - Create a new module (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // TODO: Add authentication middleware to verify admin role
    
    const { title, description, orderIndex } = body;

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

    // Verify course exists
    const course = await courseService.getCourseById(params.id);
    if (!course) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'CONTENT_001',
          message: 'Course not found'
        }
      };
      return NextResponse.json(response, { status: 404 });
    }

    const module = await courseService.createModule({
      courseId: params.id,
      title,
      description,
      orderIndex: orderIndex ? parseInt(orderIndex) : undefined
    });

    const response: ApiResponse = {
      success: true,
      data: module
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating module:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to create module'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { courseService } from '../../../../lib/services/course.service';
import { ApiResponse } from '../../../../types';

// GET /api/courses/[id] - Get course by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const response: ApiResponse = {
      success: true,
      data: course
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching course:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_001',
        message: 'Failed to fetch course'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/courses/[id] - Update course (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // TODO: Add authentication middleware to verify admin role
    
    const { title, description, coverImageUrl, price, isActive } = body;

    const course = await courseService.updateCourse(params.id, {
      title,
      description,
      coverImageUrl,
      price: price ? parseFloat(price) : undefined,
      isActive
    });

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

    const response: ApiResponse = {
      success: true,
      data: course
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating course:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to update course'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/courses/[id] - Delete course (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication middleware to verify admin role
    
    const deleted = await courseService.deleteCourse(params.id);

    if (!deleted) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'CONTENT_001',
          message: 'Course not found'
        }
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: { message: 'Course deleted successfully' }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting course:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to delete course'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
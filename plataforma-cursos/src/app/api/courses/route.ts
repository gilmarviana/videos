import { NextRequest, NextResponse } from 'next/server';
import { courseService } from '../../../lib/services/course.service';
import { AuthMiddleware, createAuthErrorResponse } from '../../../lib/auth/middleware';
import { ApiResponse } from '../../../types';

// GET /api/courses - Get all courses (requires trial or subscription)
export async function GET(request: NextRequest) {
  try {
    // Check trial/subscription access and track usage
    await AuthMiddleware.requireContentAccess(request);
    
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active');
    
    const courses = await courseService.getAllCourses(
      isActive ? isActive === 'true' : undefined
    );

    const response: ApiResponse = {
      success: true,
      data: courses
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    
    // Check if it's an auth/trial error
    if (error.message.includes('Trial') || error.message.includes('subscription')) {
      return createAuthErrorResponse(error.message, 403);
    }
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_001',
        message: 'Failed to fetch courses'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/courses - Create a new course (admin only)
export async function POST(request: NextRequest) {
  try {
    // Require admin role
    const payload = await AuthMiddleware.requireAdmin(request);
    
    const body = await request.json();
    const createdBy = payload.userId;

    const { title, description, coverImageUrl, price, isActive } = body;

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

    const course = await courseService.createCourse({
      title,
      description,
      coverImageUrl,
      price: price ? parseFloat(price) : undefined,
      isActive: isActive ?? true,
      createdBy
    });

    const response: ApiResponse = {
      success: true,
      data: course
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error creating course:', error);
    
    // Check if it's an auth error
    if (error.message.includes('token') || error.message.includes('Access denied')) {
      return createAuthErrorResponse(error.message, 401);
    }
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to create course'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
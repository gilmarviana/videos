import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware, createAuthErrorResponse } from '../../../../lib/auth/middleware';
import { ApiResponse } from '../../../../types';
import { progressRepository } from '../../../../lib/db/repositories/progress.repository';

// GET /api/users/favorites - Get user's favorite courses
export async function GET(request: NextRequest) {
  try {
    // Get user from auth
    const user = await AuthMiddleware.getUser(request);
    if (!user) {
      return createAuthErrorResponse('Authentication required', 401);
    }

    const favorites = await progressRepository.getUserFavorites(user.id);

    const response: ApiResponse = {
      success: true,
      data: favorites
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching user favorites:', error);
    
    if (error.message.includes('token') || error.message.includes('Authentication')) {
      return createAuthErrorResponse(error.message, 401);
    }
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to fetch favorites'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/users/favorites - Add course to favorites
export async function POST(request: NextRequest) {
  try {
    // Get user from auth
    const user = await AuthMiddleware.getUser(request);
    if (!user) {
      return createAuthErrorResponse('Authentication required', 401);
    }

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Course ID is required'
        }
      };
      return NextResponse.json(response, { status: 400 });
    }

    const favorite = await progressRepository.addToFavorites(user.id, courseId);

    const response: ApiResponse = {
      success: true,
      data: favorite
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error adding to favorites:', error);
    
    if (error.message.includes('token') || error.message.includes('Authentication')) {
      return createAuthErrorResponse(error.message, 401);
    }
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to add to favorites'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/users/favorites - Remove course from favorites
export async function DELETE(request: NextRequest) {
  try {
    // Get user from auth
    const user = await AuthMiddleware.getUser(request);
    if (!user) {
      return createAuthErrorResponse('Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Course ID is required'
        }
      };
      return NextResponse.json(response, { status: 400 });
    }

    const removed = await progressRepository.removeFromFavorites(user.id, courseId);

    const response: ApiResponse = {
      success: true,
      data: { removed }
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error removing from favorites:', error);
    
    if (error.message.includes('token') || error.message.includes('Authentication')) {
      return createAuthErrorResponse(error.message, 401);
    }
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to remove from favorites'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
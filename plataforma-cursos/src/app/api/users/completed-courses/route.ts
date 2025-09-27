import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware, createAuthErrorResponse } from '../../../../lib/auth/middleware';
import { ApiResponse } from '../../../../types';
import { progressRepository } from '../../../../lib/db/repositories/progress.repository';
import { NotificationService } from '../../../../lib/services/notification.service';
import { db } from '../../../../lib/db/connection';

// GET /api/users/completed-courses - Get user's completed courses
export async function GET(request: NextRequest) {
  try {
    // Get user from auth
    const user = await AuthMiddleware.getUser(request);
    if (!user) {
      return createAuthErrorResponse('Authentication required', 401);
    }

    const completedCourses = await progressRepository.getUserCompletedCourses(user.id);

    const response: ApiResponse = {
      success: true,
      data: completedCourses
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching completed courses:', error);
    
    if (error.message.includes('token') || error.message.includes('Authentication')) {
      return createAuthErrorResponse(error.message, 401);
    }
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to fetch completed courses'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/users/completed-courses - Mark course as completed
export async function POST(request: NextRequest) {
  try {
    // Get user from auth
    const user = await AuthMiddleware.getUser(request);
    if (!user) {
      return createAuthErrorResponse('Authentication required', 401);
    }

    const body = await request.json();
    const { courseId, completionPercentage = 100 } = body;

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

    const completion = await progressRepository.markCourseCompleted(user.id, courseId, completionPercentage);

    // Get course title for notification
    const courseResult = await db.query('SELECT title FROM courses WHERE id = $1', [courseId]);
    const courseTitle = courseResult.rows[0]?.title || 'Unknown Course';

    // Send course completion notification
    NotificationService.processNotification({
      type: 'course_completed',
      userId: user.id,
      data: {
        userId: user.id,
        courseTitle
      }
    }).catch(error => {
      console.error('Failed to send course completion notification:', error);
    });

    const response: ApiResponse = {
      success: true,
      data: completion
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error marking course as completed:', error);
    
    if (error.message.includes('token') || error.message.includes('Authentication')) {
      return createAuthErrorResponse(error.message, 401);
    }
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to mark course as completed'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
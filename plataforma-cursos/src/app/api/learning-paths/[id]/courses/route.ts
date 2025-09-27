import { NextRequest, NextResponse } from 'next/server';
import { learningPathService } from '../../../../../lib/services/learning-path.service';
import { authMiddleware } from '../../../../../lib/auth/middleware';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: { code: 'AUTH_001', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseId, orderIndex } = body;

    if (!courseId) {
      return NextResponse.json(
        { 
          error: { 
            code: 'LEARNING_PATH_009', 
            message: 'Course ID is required' 
          } 
        },
        { status: 400 }
      );
    }

    const learningPathCourse = await learningPathService.addCourseToPath(
      params.id,
      authResult.user.id,
      courseId,
      orderIndex
    );

    return NextResponse.json({
      success: true,
      data: learningPathCourse
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding course to learning path:', error);
    return NextResponse.json(
      { 
        error: { 
          code: 'LEARNING_PATH_010', 
          message: error instanceof Error ? error.message : 'Failed to add course to learning path' 
        } 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: { code: 'AUTH_001', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseOrders } = body;

    if (!Array.isArray(courseOrders)) {
      return NextResponse.json(
        { 
          error: { 
            code: 'LEARNING_PATH_011', 
            message: 'Course orders must be an array' 
          } 
        },
        { status: 400 }
      );
    }

    await learningPathService.reorderCourses(
      params.id,
      authResult.user.id,
      courseOrders
    );

    return NextResponse.json({
      success: true,
      data: { message: 'Courses reordered successfully' }
    });
  } catch (error) {
    console.error('Error reordering courses:', error);
    return NextResponse.json(
      { 
        error: { 
          code: 'LEARNING_PATH_012', 
          message: error instanceof Error ? error.message : 'Failed to reorder courses' 
        } 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: { code: 'AUTH_001', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { 
          error: { 
            code: 'LEARNING_PATH_009', 
            message: 'Course ID is required' 
          } 
        },
        { status: 400 }
      );
    }

    const success = await learningPathService.removeCourseFromPath(
      params.id,
      authResult.user.id,
      courseId
    );

    if (!success) {
      return NextResponse.json(
        { error: { code: 'LEARNING_PATH_013', message: 'Course not found in learning path' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Course removed from learning path successfully' }
    });
  } catch (error) {
    console.error('Error removing course from learning path:', error);
    return NextResponse.json(
      { 
        error: { 
          code: 'LEARNING_PATH_014', 
          message: error instanceof Error ? error.message : 'Failed to remove course from learning path' 
        } 
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { learningPathService } from '../../../../lib/services/learning-path.service';
import { authMiddleware } from '../../../../lib/auth/middleware';

export async function GET(
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

    const learningPath = await learningPathService.getLearningPath(params.id);
    
    if (!learningPath) {
      return NextResponse.json(
        { error: { code: 'LEARNING_PATH_004', message: 'Learning path not found' } },
        { status: 404 }
      );
    }

    // Check if user has access (owner or public path)
    if (learningPath.userId !== authResult.user.id && !learningPath.isPublic) {
      return NextResponse.json(
        { error: { code: 'LEARNING_PATH_005', message: 'Access denied' } },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: learningPath
    });
  } catch (error) {
    console.error('Error fetching learning path:', error);
    return NextResponse.json(
      { 
        error: { 
          code: 'LEARNING_PATH_006', 
          message: 'Failed to fetch learning path' 
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
    const { title, description, coverImageUrl, isPublic } = body;

    if (!title || !description) {
      return NextResponse.json(
        { 
          error: { 
            code: 'LEARNING_PATH_002', 
            message: 'Title and description are required' 
          } 
        },
        { status: 400 }
      );
    }

    const learningPath = await learningPathService.updateLearningPath(
      params.id,
      authResult.user.id,
      title,
      description,
      coverImageUrl,
      isPublic
    );

    if (!learningPath) {
      return NextResponse.json(
        { error: { code: 'LEARNING_PATH_004', message: 'Learning path not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: learningPath
    });
  } catch (error) {
    console.error('Error updating learning path:', error);
    return NextResponse.json(
      { 
        error: { 
          code: 'LEARNING_PATH_007', 
          message: error instanceof Error ? error.message : 'Failed to update learning path' 
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

    const success = await learningPathService.deleteLearningPath(params.id, authResult.user.id);

    if (!success) {
      return NextResponse.json(
        { error: { code: 'LEARNING_PATH_004', message: 'Learning path not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Learning path deleted successfully' }
    });
  } catch (error) {
    console.error('Error deleting learning path:', error);
    return NextResponse.json(
      { 
        error: { 
          code: 'LEARNING_PATH_008', 
          message: error instanceof Error ? error.message : 'Failed to delete learning path' 
        } 
      },
      { status: 500 }
    );
  }
}
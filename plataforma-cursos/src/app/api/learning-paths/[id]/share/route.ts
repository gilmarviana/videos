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

    const newShareToken = await learningPathService.regenerateShareToken(
      params.id,
      authResult.user.id
    );

    return NextResponse.json({
      success: true,
      data: { shareToken: newShareToken }
    });
  } catch (error) {
    console.error('Error regenerating share token:', error);
    return NextResponse.json(
      { 
        error: { 
          code: 'LEARNING_PATH_015', 
          message: error instanceof Error ? error.message : 'Failed to regenerate share token' 
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
    const { isPublic } = body;

    if (typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { 
          error: { 
            code: 'LEARNING_PATH_016', 
            message: 'isPublic must be a boolean value' 
          } 
        },
        { status: 400 }
      );
    }

    const learningPath = await learningPathService.togglePublicAccess(
      params.id,
      authResult.user.id,
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
    console.error('Error toggling public access:', error);
    return NextResponse.json(
      { 
        error: { 
          code: 'LEARNING_PATH_017', 
          message: error instanceof Error ? error.message : 'Failed to toggle public access' 
        } 
      },
      { status: 500 }
    );
  }
}
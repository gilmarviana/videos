import { NextRequest, NextResponse } from 'next/server';
import { learningPathService } from '../../../lib/services/learning-path.service';
import { authMiddleware } from '../../../lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: { code: 'AUTH_001', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const learningPaths = await learningPathService.getUserLearningPaths(authResult.user.id);

    return NextResponse.json({
      success: true,
      data: learningPaths
    });
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    return NextResponse.json(
      { 
        error: { 
          code: 'LEARNING_PATH_001', 
          message: 'Failed to fetch learning paths' 
        } 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: { code: 'AUTH_001', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, coverImageUrl } = body;

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

    const learningPath = await learningPathService.createLearningPath(
      authResult.user.id,
      title,
      description,
      coverImageUrl
    );

    return NextResponse.json({
      success: true,
      data: learningPath
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating learning path:', error);
    return NextResponse.json(
      { 
        error: { 
          code: 'LEARNING_PATH_003', 
          message: error instanceof Error ? error.message : 'Failed to create learning path' 
        } 
      },
      { status: 500 }
    );
  }
}
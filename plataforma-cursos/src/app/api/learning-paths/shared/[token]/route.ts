import { NextRequest, NextResponse } from 'next/server';
import { learningPathService } from '../../../../../lib/services/learning-path.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const learningPath = await learningPathService.getSharedLearningPath(params.token);
    
    if (!learningPath) {
      return NextResponse.json(
        { error: { code: 'LEARNING_PATH_004', message: 'Learning path not found' } },
        { status: 404 }
      );
    }

    // Remove sensitive information for public access
    const publicLearningPath = {
      ...learningPath,
      userId: undefined, // Don't expose the owner's user ID
    };

    return NextResponse.json({
      success: true,
      data: publicLearningPath
    });
  } catch (error) {
    console.error('Error fetching shared learning path:', error);
    return NextResponse.json(
      { 
        error: { 
          code: 'LEARNING_PATH_018', 
          message: 'Failed to fetch shared learning path' 
        } 
      },
      { status: 500 }
    );
  }
}
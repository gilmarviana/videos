import { NextRequest, NextResponse } from 'next/server';
import { courseService } from '../../../../../lib/services/course.service';
import { ApiResponse } from '../../../../../types';

// GET /api/videos/metadata/[id] - Get video metadata
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = params.id;
    
    // TODO: Add authentication middleware to verify user access
    
    const lesson = await courseService.getLessonById(lessonId);
    
    if (!lesson) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'CONTENT_001',
          message: 'Lesson not found'
        }
      };
      return NextResponse.json(response, { status: 404 });
    }

    if (!lesson.videoUrl) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'CONTENT_001',
          message: 'No video available for this lesson'
        }
      };
      return NextResponse.json(response, { status: 404 });
    }

    const metadata = {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      videoSource: lesson.videoSource,
      videoFormat: lesson.videoFormat,
      durationSeconds: lesson.durationSeconds,
      orderIndex: lesson.orderIndex,
      materials: lesson.materials,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt
    };

    const response: ApiResponse = {
      success: true,
      data: metadata
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to fetch video metadata'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
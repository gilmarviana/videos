import { NextRequest, NextResponse } from 'next/server';
import { courseService } from '../../../../../lib/services/course.service';
import { videoService } from '../../../../../lib/services/video.service';
import { ApiResponse } from '../../../../../types';

// GET /api/videos/stream/[id] - Stream video content
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = params.id;
    
    // TODO: Add authentication middleware to verify user access
    // TODO: Add trial/subscription validation
    
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

    try {
      // Create video object for streaming
      const video = {
        id: lesson.id,
        lessonId: lesson.id,
        url: lesson.videoUrl,
        source: lesson.videoSource,
        format: lesson.videoFormat,
        durationSeconds: lesson.durationSeconds,
        metadata: {
          format: lesson.videoFormat,
          durationSeconds: lesson.durationSeconds,
          size: 0,
          resolution: 'unknown'
        },
        isProcessed: true,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt
      };

      // Get streamable URL
      const streamUrl = await videoService.getStreamableUrl(video);
      
      // For direct streaming, we can redirect to the URL
      if (lesson.videoSource === 'direct') {
        return NextResponse.redirect(streamUrl);
      }
      
      // For cloud storage (Google Drive, OneDrive), return the stream URL
      const response: ApiResponse = {
        success: true,
        data: {
          streamUrl,
          format: lesson.videoFormat,
          duration: lesson.durationSeconds,
          source: lesson.videoSource
        }
      };

      return NextResponse.json(response);
    } catch (error) {
      console.error('Error generating stream URL:', error);
      
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'CONTENT_003',
          message: 'Failed to generate video stream URL'
        }
      };

      return NextResponse.json(response, { status: 500 });
    }
  } catch (error) {
    console.error('Error streaming video:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to stream video'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { videoService } from '../../../../lib/services/video.service';
import { ApiResponse } from '../../../../types';

// POST /api/videos/validate - Validate video URL (admin only)
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication middleware to verify admin role
    
    const body = await request.json();
    const { url, source } = body;

    if (!url || !source) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'URL and source are required'
        }
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!['google_drive', 'onedrive', 'direct'].includes(source)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid source. Must be one of: google_drive, onedrive, direct'
        }
      };
      return NextResponse.json(response, { status: 400 });
    }

    const validation = await videoService.validateVideoUrl(url, source);

    const response: ApiResponse = {
      success: true,
      data: validation
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error validating video URL:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to validate video URL'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { courseService } from '../../../../../lib/services/course.service';
import { fileUploadService } from '../../../../../lib/services/file-upload.service';
import { ApiResponse } from '../../../../../types';

// POST /api/lessons/[id]/materials - Upload material to lesson (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication middleware to verify admin role
    
    // Verify lesson exists
    const lesson = await courseService.getLessonById(params.id);
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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No file provided'
        }
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Convert File to UploadedFile format
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadedFile = {
      fieldname: 'file',
      originalname: file.name,
      encoding: '7bit',
      mimetype: file.type,
      size: file.size,
      destination: '',
      filename: '',
      path: '',
      buffer
    };

    // Save file
    const saveResult = await fileUploadService.saveFile(uploadedFile);
    if (!saveResult.success) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'CONTENT_003',
          message: saveResult.error || 'Failed to save file'
        }
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Create material object
    const material = fileUploadService.createLessonMaterial(uploadedFile, saveResult.filePath!);

    // Add material to lesson
    const updatedLesson = await courseService.addMaterialToLesson(params.id, material);
    if (!updatedLesson) {
      // Clean up uploaded file if lesson update fails
      await fileUploadService.deleteFile(saveResult.filePath!);
      
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'CONTENT_003',
          message: 'Failed to add material to lesson'
        }
      };
      return NextResponse.json(response, { status: 500 });
    }

    const response: ApiResponse = {
      success: true,
      data: {
        material,
        lesson: updatedLesson
      }
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error uploading material:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to upload material'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// GET /api/lessons/[id]/materials - Get materials for a lesson
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lesson = await courseService.getLessonById(params.id);

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

    const response: ApiResponse = {
      success: true,
      data: lesson.materials
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching materials:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_001',
        message: 'Failed to fetch materials'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
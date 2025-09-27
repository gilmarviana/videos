import { NextRequest, NextResponse } from 'next/server';
import { courseService } from '../../../../../../lib/services/course.service';
import { fileUploadService } from '../../../../../../lib/services/file-upload.service';
import { ApiResponse } from '../../../../../../types';

// DELETE /api/lessons/[id]/materials/[materialId] - Remove material from lesson (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; materialId: string } }
) {
  try {
    // TODO: Add authentication middleware to verify admin role
    
    // Get lesson to find the material
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

    // Find the material to get its file path
    const material = lesson.materials.find(m => m.id === params.materialId);
    if (!material) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'CONTENT_001',
          message: 'Material not found'
        }
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Remove material from lesson
    const updatedLesson = await courseService.removeMaterialFromLesson(params.id, params.materialId);
    if (!updatedLesson) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'CONTENT_003',
          message: 'Failed to remove material from lesson'
        }
      };
      return NextResponse.json(response, { status: 500 });
    }

    // Delete the physical file
    await fileUploadService.deleteFile(material.url);

    const response: ApiResponse = {
      success: true,
      data: { 
        message: 'Material deleted successfully',
        lesson: updatedLesson
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting material:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to delete material'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/lessons/[id]/materials/[materialId] - Update material metadata (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; materialId: string } }
) {
  try {
    // TODO: Add authentication middleware to verify admin role
    
    const body = await request.json();
    const { name } = body;

    if (!name) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Material name is required'
        }
      };
      return NextResponse.json(response, { status: 400 });
    }

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

    // Check if material exists
    const materialExists = lesson.materials.some(m => m.id === params.materialId);
    if (!materialExists) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'CONTENT_001',
          message: 'Material not found'
        }
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Update material
    const updatedLesson = await courseService.updateLessonMaterial(params.id, params.materialId, { name });
    if (!updatedLesson) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'CONTENT_003',
          message: 'Failed to update material'
        }
      };
      return NextResponse.json(response, { status: 500 });
    }

    const updatedMaterial = updatedLesson.materials.find(m => m.id === params.materialId);

    const response: ApiResponse = {
      success: true,
      data: {
        material: updatedMaterial,
        lesson: updatedLesson
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating material:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to update material'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { courseService } from '../../../../lib/services/course.service';
import { ApiResponse } from '../../../../types';

// GET /api/modules/[id] - Get module by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const module = await courseService.getModuleById(params.id);

    if (!module) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'CONTENT_001',
          message: 'Module not found'
        }
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: module
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching module:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_001',
        message: 'Failed to fetch module'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/modules/[id] - Update module (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // TODO: Add authentication middleware to verify admin role
    
    const { title, description, orderIndex } = body;

    const module = await courseService.updateModule(params.id, {
      title,
      description,
      orderIndex: orderIndex ? parseInt(orderIndex) : undefined
    });

    if (!module) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'CONTENT_001',
          message: 'Module not found'
        }
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: module
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating module:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to update module'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/modules/[id] - Delete module (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication middleware to verify admin role
    
    const deleted = await courseService.deleteModule(params.id);

    if (!deleted) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'CONTENT_001',
          message: 'Module not found'
        }
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: { message: 'Module deleted successfully' }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting module:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONTENT_003',
        message: 'Failed to delete module'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/lib/services/whatsapp.service';
import { authMiddleware } from '@/lib/auth/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const authResult = await authMiddleware(request);
    if (!authResult.success || authResult.user?.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Admin access required'
          }
        },
        { status: 401 }
      );
    }

    const config = await whatsappService.getConfig(params.id);
    
    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFIG_NOT_FOUND',
            message: 'WhatsApp configuration not found'
          }
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error getting WhatsApp config:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'WHATSAPP_CONFIG_ERROR',
          message: 'Failed to get WhatsApp configuration'
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
    // Check if user is admin
    const authResult = await authMiddleware(request);
    if (!authResult.success || authResult.user?.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Admin access required'
          }
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { phoneNumber, welcomeMessage, menuOptions, isActive } = body;

    const config = await whatsappService.updateConfig(params.id, {
      phoneNumber,
      welcomeMessage,
      menuOptions,
      isActive
    });

    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFIG_NOT_FOUND',
            message: 'WhatsApp configuration not found'
          }
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error updating WhatsApp config:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'WHATSAPP_CONFIG_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update WhatsApp configuration'
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
    // Check if user is admin
    const authResult = await authMiddleware(request);
    if (!authResult.success || authResult.user?.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Admin access required'
          }
        },
        { status: 401 }
      );
    }

    const success = await whatsappService.deleteConfig(params.id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFIG_NOT_FOUND',
            message: 'WhatsApp configuration not found'
          }
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { deleted: true }
    });
  } catch (error) {
    console.error('Error deleting WhatsApp config:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'WHATSAPP_CONFIG_ERROR',
          message: 'Failed to delete WhatsApp configuration'
        }
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/lib/services/whatsapp.service';
import { authMiddleware } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const config = await whatsappService.getActiveConfig();
    
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

export async function POST(request: NextRequest) {
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

    if (!phoneNumber || !welcomeMessage || !menuOptions) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Phone number, welcome message, and menu options are required'
          }
        },
        { status: 400 }
      );
    }

    const config = await whatsappService.createConfig({
      phoneNumber,
      welcomeMessage,
      menuOptions,
      isActive
    });

    return NextResponse.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error creating WhatsApp config:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'WHATSAPP_CONFIG_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create WhatsApp configuration'
        }
      },
      { status: 500 }
    );
  }
}
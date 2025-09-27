import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth/auth.service';
import { NotificationService } from '../../../../lib/services/notification.service';
import { RegisterData, ApiResponse } from '../../../../types';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'AUTH_010',
          message: 'Name, email, and password are required',
          timestamp: new Date().toISOString(),
        },
      } as ApiResponse, { status: 400 });
    }

    // Register user
    const result = await AuthService.register(body);

    // Send welcome email and admin notification (don't block the response)
    NotificationService.processNotification({
      type: 'user_registered',
      userId: result.user.id,
      data: { email: result.user.email, name: result.user.name }
    }).catch(error => {
      console.error('Failed to send welcome notifications:', error);
    });

    return NextResponse.json({
      success: true,
      data: {
        user: result.user,
        tokens: result.tokens,
      },
    } as ApiResponse, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);

    // Handle known auth errors
    if (error.code) {
      return NextResponse.json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          timestamp: new Date().toISOString(),
        },
      } as ApiResponse, { status: 400 });
    }

    // Handle unknown errors
    return NextResponse.json({
      success: false,
      error: {
        code: 'AUTH_500',
        message: 'Internal server error during registration',
        timestamp: new Date().toISOString(),
      },
    } as ApiResponse, { status: 500 });
  }
}
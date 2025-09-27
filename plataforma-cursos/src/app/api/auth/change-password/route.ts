import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware, createAuthErrorResponse } from '../../../../lib/auth/middleware';
import { AuthService } from '../../../../lib/auth/auth.service';
import { ApiResponse } from '../../../../types';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const payload = await AuthMiddleware.authenticate(request);
    
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'AUTH_010',
          message: 'Current password and new password are required',
          timestamp: new Date().toISOString(),
        },
      } as ApiResponse, { status: 400 });
    }

    // Change password
    await AuthService.changePassword(payload.userId, currentPassword, newPassword);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Password changed successfully',
      },
    } as ApiResponse, { status: 200 });

  } catch (error: any) {
    console.error('Change password error:', error);

    if (error.message === 'Current password is incorrect') {
      return createAuthErrorResponse(error.message, 400);
    }

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

    return createAuthErrorResponse('Failed to change password', 500);
  }
}
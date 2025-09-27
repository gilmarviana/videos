import { NextRequest, NextResponse } from 'next/server';
import { PasswordResetService } from '../../../../lib/auth/password-reset.service';
import { ApiResponse } from '../../../../types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'AUTH_010',
          message: 'Token and new password are required',
          timestamp: new Date().toISOString(),
        },
      } as ApiResponse, { status: 400 });
    }

    // Confirm password reset
    await PasswordResetService.confirmPasswordReset(token, newPassword);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Password has been reset successfully',
      },
    } as ApiResponse, { status: 200 });

  } catch (error: any) {
    console.error('Password reset confirmation error:', error);

    return NextResponse.json({
      success: false,
      error: {
        code: 'AUTH_012',
        message: error.message || 'Failed to reset password',
        timestamp: new Date().toISOString(),
      },
    } as ApiResponse, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'AUTH_010',
          message: 'Token is required',
          timestamp: new Date().toISOString(),
        },
      } as ApiResponse, { status: 400 });
    }

    // Validate reset token
    const isValid = await PasswordResetService.validateResetToken(token);

    return NextResponse.json({
      success: true,
      data: { isValid },
    } as ApiResponse, { status: 200 });

  } catch (error: any) {
    console.error('Token validation error:', error);

    return NextResponse.json({
      success: false,
      error: {
        code: 'AUTH_500',
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
    } as ApiResponse, { status: 500 });
  }
}
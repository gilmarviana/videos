import { NextRequest, NextResponse } from 'next/server';
import { PasswordResetService } from '../../../../lib/auth/password-reset.service';
import { ApiResponse } from '../../../../types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'AUTH_010',
          message: 'Email is required',
          timestamp: new Date().toISOString(),
        },
      } as ApiResponse, { status: 400 });
    }

    // Request password reset
    await PasswordResetService.requestPasswordReset(email);

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      data: {
        message: 'If the email exists, a password reset link has been sent',
      },
    } as ApiResponse, { status: 200 });

  } catch (error: any) {
    console.error('Password reset request error:', error);

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
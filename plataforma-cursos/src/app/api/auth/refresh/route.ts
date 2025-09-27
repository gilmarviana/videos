import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth/auth.service';
import { ApiResponse } from '../../../../types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'AUTH_001',
          message: 'Refresh token is required',
          timestamp: new Date().toISOString(),
        },
      } as ApiResponse, { status: 400 });
    }

    // Refresh tokens
    const tokens = await AuthService.refreshToken(refreshToken);

    return NextResponse.json({
      success: true,
      data: { tokens },
    } as ApiResponse, { status: 200 });

  } catch (error: any) {
    console.error('Token refresh error:', error);

    // Handle known auth errors
    if (error.code) {
      return NextResponse.json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      } as ApiResponse, { status: 401 });
    }

    // Handle unknown errors
    return NextResponse.json({
      success: false,
      error: {
        code: 'AUTH_500',
        message: 'Internal server error during token refresh',
        timestamp: new Date().toISOString(),
      },
    } as ApiResponse, { status: 500 });
  }
}
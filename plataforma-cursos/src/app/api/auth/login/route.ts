import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth/auth.service';
import { LoginCredentials, ApiResponse } from '../../../../types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json();

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'AUTH_010',
          message: 'Email and password are required',
          timestamp: new Date().toISOString(),
        },
      } as ApiResponse, { status: 400 });
    }

    // Authenticate user
    const result = await AuthService.login(body);

    return NextResponse.json({
      success: true,
      data: {
        user: result.user,
        tokens: result.tokens,
      },
    } as ApiResponse, { status: 200 });

  } catch (error: any) {
    console.error('Login error:', error);

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
      } as ApiResponse, { status: 401 });
    }

    // Handle unknown errors
    return NextResponse.json({
      success: false,
      error: {
        code: 'AUTH_500',
        message: 'Internal server error during login',
        timestamp: new Date().toISOString(),
      },
    } as ApiResponse, { status: 500 });
  }
}
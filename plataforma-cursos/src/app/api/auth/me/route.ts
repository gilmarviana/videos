import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware, createAuthErrorResponse } from '../../../../lib/auth/middleware';
import { AuthService } from '../../../../lib/auth/auth.service';
import { ApiResponse } from '../../../../types';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const payload = await AuthMiddleware.authenticate(request);
    
    // Get current user data
    const user = await AuthService.getCurrentUser(payload.userId);

    return NextResponse.json({
      success: true,
      data: { user },
    } as ApiResponse, { status: 200 });

  } catch (error: any) {
    console.error('Get current user error:', error);
    return createAuthErrorResponse(error.message, 401);
  }
}
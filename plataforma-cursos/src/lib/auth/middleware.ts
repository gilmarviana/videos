import { NextRequest } from 'next/server';
import { JWTService, JWTPayload } from './jwt';
import { AuthService } from './auth.service';
import { TrialMiddleware } from './trial-middleware';

export interface AuthenticatedRequest extends NextRequest {
  user: JWTPayload;
}

export class AuthMiddleware {
  static async authenticate(request: NextRequest): Promise<JWTPayload> {
    const authHeader = request.headers.get('authorization');
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (!token) {
      throw new Error('No token provided');
    }

    try {
      const payload = JWTService.verifyAccessToken(token);
      
      // Verify user still exists and is active
      await AuthService.getCurrentUser(payload.userId);
      
      return payload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static async requireRole(request: NextRequest, requiredRole: 'admin' | 'student'): Promise<JWTPayload> {
    const payload = await this.authenticate(request);
    
    if (payload.role !== requiredRole) {
      throw new Error(`Access denied. Required role: ${requiredRole}`);
    }

    return payload;
  }

  static async requireAdmin(request: NextRequest): Promise<JWTPayload> {
    return this.requireRole(request, 'admin');
  }

  static async requireStudent(request: NextRequest): Promise<JWTPayload> {
    return this.requireRole(request, 'student');
  }

  static async requireActiveSubscriptionOrTrial(request: NextRequest): Promise<JWTPayload> {
    const payload = await this.authenticate(request);
    
    // Use enhanced trial middleware for access checking and time tracking
    await TrialMiddleware.requireTrialOrSubscription(payload);
    
    return payload;
  }

  static async requireContentAccess(request: NextRequest): Promise<JWTPayload> {
    const payload = await this.authenticate(request);
    
    // Track trial usage and check access for content endpoints
    await TrialMiddleware.requireTrialOrSubscription(payload);
    
    return payload;
  }
}

// Helper function to create error responses
export function createAuthErrorResponse(message: string, status: number = 401) {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: `AUTH_${status}`,
        message,
        timestamp: new Date().toISOString(),
      },
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware, createAuthErrorResponse } from '../../../../lib/auth/middleware';
import { AuthService } from '../../../../lib/auth/auth.service';
import { TrialSessionService } from '../../../../lib/services/trial-session.service';
import { ApiResponse } from '../../../../types';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const payload = await AuthMiddleware.authenticate(request);
    
    // Get comprehensive trial and session status
    const trialStatus = await AuthService.getTrialStatus(payload.userId);
    const sessionInfo = await TrialSessionService.getSessionInfo(payload.userId);
    const accessCheck = await TrialSessionService.checkContentAccess(payload.userId);

    return NextResponse.json({
      success: true,
      data: { 
        trialStatus,
        sessionInfo,
        canAccessContent: accessCheck.canAccess,
        accessReason: accessCheck.reason,
      },
    } as ApiResponse, { status: 200 });

  } catch (error: any) {
    console.error('Get trial status error:', error);
    return createAuthErrorResponse(error.message, 401);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const payload = await AuthMiddleware.authenticate(request);
    
    const body = await request.json();
    const { action, minutesUsed } = body;

    // Handle different actions
    switch (action) {
      case 'start_session':
        await TrialSessionService.startSession(payload.userId);
        break;
        
      case 'end_session':
        await TrialSessionService.endSession(payload.userId);
        break;
        
      case 'heartbeat':
        await TrialSessionService.updateActivity(payload.userId);
        break;
        
      case 'update_usage':
        if (typeof minutesUsed !== 'number' || minutesUsed < 0) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'AUTH_010',
              message: 'Valid minutesUsed is required for update_usage action',
              timestamp: new Date().toISOString(),
            },
          } as ApiResponse, { status: 400 });
        }
        await AuthService.updateTrialUsage(payload.userId, minutesUsed);
        break;
        
      default:
        return NextResponse.json({
          success: false,
          error: {
            code: 'AUTH_011',
            message: 'Invalid action. Supported actions: start_session, end_session, heartbeat, update_usage',
            timestamp: new Date().toISOString(),
          },
        } as ApiResponse, { status: 400 });
    }

    // Get updated status
    const trialStatus = await AuthService.getTrialStatus(payload.userId);
    const sessionInfo = await TrialSessionService.getSessionInfo(payload.userId);
    const accessCheck = await TrialSessionService.checkContentAccess(payload.userId);

    return NextResponse.json({
      success: true,
      data: { 
        trialStatus,
        sessionInfo,
        canAccessContent: accessCheck.canAccess,
        accessReason: accessCheck.reason,
      },
    } as ApiResponse, { status: 200 });

  } catch (error: any) {
    console.error('Trial status action error:', error);
    return createAuthErrorResponse(error.message, 500);
  }
}
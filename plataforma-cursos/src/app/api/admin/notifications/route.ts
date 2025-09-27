import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '../../../../lib/services/notification.service';
import { CronService } from '../../../../lib/services/cron.service';
import { authMiddleware } from '../../../../lib/auth/middleware';
import { ApiResponse } from '../../../../types';

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const authResult = await authMiddleware(request);
    if (!authResult.success || authResult.user?.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'AUTH_003',
          message: 'Admin access required',
          timestamp: new Date().toISOString(),
        },
      } as ApiResponse, { status: 403 });
    }

    const body = await request.json();
    const { action, type, data } = body;

    switch (action) {
      case 'trigger_trial_warnings':
        await CronService.triggerTrialWarningCheck();
        return NextResponse.json({
          success: true,
          data: { message: 'Trial warning check triggered successfully' },
        } as ApiResponse);

      case 'trigger_daily_summary':
        await CronService.triggerDailyAdminSummary();
        return NextResponse.json({
          success: true,
          data: { message: 'Daily admin summary triggered successfully' },
        } as ApiResponse);

      case 'send_notification':
        if (!type || !data) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'NOTIFICATION_001',
              message: 'Type and data are required for sending notifications',
              timestamp: new Date().toISOString(),
            },
          } as ApiResponse, { status: 400 });
        }

        await NotificationService.processNotification({
          type,
          data,
        });

        return NextResponse.json({
          success: true,
          data: { message: 'Notification sent successfully' },
        } as ApiResponse);

      case 'send_admin_alert':
        if (!data.message || !data.severity) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'NOTIFICATION_002',
              message: 'Message and severity are required for admin alerts',
              timestamp: new Date().toISOString(),
            },
          } as ApiResponse, { status: 400 });
        }

        await NotificationService.sendAdminNotification({
          type: data.type || 'system_error',
          message: data.message,
          severity: data.severity,
          details: data.details,
        });

        return NextResponse.json({
          success: true,
          data: { message: 'Admin alert sent successfully' },
        } as ApiResponse);

      default:
        return NextResponse.json({
          success: false,
          error: {
            code: 'NOTIFICATION_003',
            message: 'Invalid action specified',
            timestamp: new Date().toISOString(),
          },
        } as ApiResponse, { status: 400 });
    }

  } catch (error: any) {
    console.error('Notification API error:', error);

    return NextResponse.json({
      success: false,
      error: {
        code: 'NOTIFICATION_500',
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
    } as ApiResponse, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const authResult = await authMiddleware(request);
    if (!authResult.success || authResult.user?.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'AUTH_003',
          message: 'Admin access required',
          timestamp: new Date().toISOString(),
        },
      } as ApiResponse, { status: 403 });
    }

    // Return notification system status
    return NextResponse.json({
      success: true,
      data: {
        status: 'active',
        availableActions: [
          'trigger_trial_warnings',
          'trigger_daily_summary',
          'send_notification',
          'send_admin_alert'
        ],
        notificationTypes: [
          'user_registered',
          'trial_warning',
          'trial_expired',
          'payment_confirmed',
          'payment_failed',
          'subscription_cancelled',
          'course_completed',
          'certificate_generated',
          'admin_alert'
        ]
      },
    } as ApiResponse);

  } catch (error: any) {
    console.error('Notification status error:', error);

    return NextResponse.json({
      success: false,
      error: {
        code: 'NOTIFICATION_500',
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
    } as ApiResponse, { status: 500 });
  }
}
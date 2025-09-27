import { NextRequest, NextResponse } from 'next/server';
import { WebhookService } from '@/lib/services/webhook.service';
import { authMiddleware } from '@/lib/auth/middleware';

const webhookService = new WebhookService();

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const authResult = await authMiddleware(request);
    if (!authResult.success || authResult.user?.role !== 'admin') {
      return NextResponse.json(
        { error: { code: 'AUTH_003', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    const logs = await webhookService.getAllWebhookLogs(limit);
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching all webhook logs:', error);
    return NextResponse.json(
      { error: { code: 'WEBHOOK_011', message: 'Failed to fetch webhook logs' } },
      { status: 500 }
    );
  }
}
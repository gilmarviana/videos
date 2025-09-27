import { NextRequest, NextResponse } from 'next/server';
import { WebhookService } from '@/lib/services/webhook.service';
import { authMiddleware } from '@/lib/auth/middleware';

const webhookService = new WebhookService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const limit = parseInt(searchParams.get('limit') || '50');

    const logs = await webhookService.getWebhookLogs(params.id, limit);
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching webhook logs:', error);
    return NextResponse.json(
      { error: { code: 'WEBHOOK_011', message: 'Failed to fetch webhook logs' } },
      { status: 500 }
    );
  }
}
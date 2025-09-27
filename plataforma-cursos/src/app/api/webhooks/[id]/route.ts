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

    const webhook = await webhookService.getWebhookById(params.id);
    if (!webhook) {
      return NextResponse.json(
        { error: { code: 'WEBHOOK_006', message: 'Webhook not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ webhook });
  } catch (error) {
    console.error('Error fetching webhook:', error);
    return NextResponse.json(
      { error: { code: 'WEBHOOK_001', message: 'Failed to fetch webhook' } },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await request.json();
    const { name, url, eventType, headers, isActive } = body;

    // Validate event type if provided
    if (eventType) {
      const validEventTypes = ['site_visit', 'trial_generated', 'module_completed', 'certificate_generated'];
      if (!validEventTypes.includes(eventType)) {
        return NextResponse.json(
          { error: { code: 'WEBHOOK_003', message: 'Invalid event type' } },
          { status: 400 }
        );
      }
    }

    const webhook = await webhookService.updateWebhook(params.id, {
      name,
      url,
      eventType,
      headers,
      isActive
    });

    if (!webhook) {
      return NextResponse.json(
        { error: { code: 'WEBHOOK_006', message: 'Webhook not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ webhook });
  } catch (error) {
    console.error('Error updating webhook:', error);
    
    if (error instanceof Error && error.message === 'Invalid URL format') {
      return NextResponse.json(
        { error: { code: 'WEBHOOK_004', message: 'Invalid URL format' } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { code: 'WEBHOOK_007', message: 'Failed to update webhook' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const deleted = await webhookService.deleteWebhook(params.id);
    if (!deleted) {
      return NextResponse.json(
        { error: { code: 'WEBHOOK_006', message: 'Webhook not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return NextResponse.json(
      { error: { code: 'WEBHOOK_008', message: 'Failed to delete webhook' } },
      { status: 500 }
    );
  }
}
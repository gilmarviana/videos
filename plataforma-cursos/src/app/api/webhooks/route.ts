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

    const webhooks = await webhookService.getAllWebhooks();
    return NextResponse.json({ webhooks });
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json(
      { error: { code: 'WEBHOOK_001', message: 'Failed to fetch webhooks' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (!name || !url || !eventType) {
      return NextResponse.json(
        { error: { code: 'WEBHOOK_002', message: 'Name, URL, and event type are required' } },
        { status: 400 }
      );
    }

    // Validate event type
    const validEventTypes = ['site_visit', 'trial_generated', 'module_completed', 'certificate_generated'];
    if (!validEventTypes.includes(eventType)) {
      return NextResponse.json(
        { error: { code: 'WEBHOOK_003', message: 'Invalid event type' } },
        { status: 400 }
      );
    }

    const webhook = await webhookService.createWebhook({
      name,
      url,
      eventType,
      headers: headers || {},
      isActive: isActive !== undefined ? isActive : true
    });

    return NextResponse.json({ webhook }, { status: 201 });
  } catch (error) {
    console.error('Error creating webhook:', error);
    
    if (error instanceof Error && error.message === 'Invalid URL format') {
      return NextResponse.json(
        { error: { code: 'WEBHOOK_004', message: 'Invalid URL format' } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { code: 'WEBHOOK_005', message: 'Failed to create webhook' } },
      { status: 500 }
    );
  }
}
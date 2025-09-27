import { NextRequest, NextResponse } from 'next/server';
import { WebhookService } from '@/lib/services/webhook.service';

const webhookService = new WebhookService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, data } = body;

    // Validate required fields
    if (!eventType || !data) {
      return NextResponse.json(
        { error: { code: 'WEBHOOK_012', message: 'Event type and data are required' } },
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

    // Trigger webhooks (this is async and doesn't wait for completion)
    webhookService.triggerWebhooks(eventType, data).catch(error => {
      console.error('Error triggering webhooks:', error);
    });

    return NextResponse.json({ success: true, message: 'Webhooks triggered' });
  } catch (error) {
    console.error('Error in webhook trigger endpoint:', error);
    return NextResponse.json(
      { error: { code: 'WEBHOOK_013', message: 'Failed to trigger webhooks' } },
      { status: 500 }
    );
  }
}
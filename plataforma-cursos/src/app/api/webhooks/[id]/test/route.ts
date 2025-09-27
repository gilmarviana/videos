import { NextRequest, NextResponse } from 'next/server';
import { WebhookService } from '@/lib/services/webhook.service';
import { authMiddleware } from '@/lib/auth/middleware';

const webhookService = new WebhookService();

export async function POST(
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

    const result = await webhookService.testWebhook(params.id);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: { 
            code: 'WEBHOOK_009', 
            message: result.error || 'Webhook test failed' 
          },
          testResult: result
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      testResult: result 
    });
  } catch (error) {
    console.error('Error testing webhook:', error);
    return NextResponse.json(
      { error: { code: 'WEBHOOK_010', message: 'Failed to test webhook' } },
      { status: 500 }
    );
  }
}
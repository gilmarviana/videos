import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe.config';
import { PaymentService } from '@/lib/payments/payment.service';
import { STRIPE_CONFIG } from '@/lib/payments/stripe.config';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_CONFIG.webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`Received webhook event: ${event.type}`);

    // Handle the event
    const paymentService = new PaymentService();
    await paymentService.handleWebhook(event);

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { 
        error: { 
          code: 'PAY_004', 
          message: 'Webhook inválido' 
        } 
      },
      { status: 500 }
    );
  }
}
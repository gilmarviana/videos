import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payments/payment.service';
import { JWTService } from '@/lib/auth/jwt';
import { z } from 'zod';

const createSubscriptionSchema = z.object({
  paymentMethodId: z.string().min(1, 'Payment method ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: { code: 'AUTH_001', message: 'Token não fornecido' } },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = JWTService.verifyAccessToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: { code: 'AUTH_001', message: 'Token inválido' } },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const validatedData = createSubscriptionSchema.parse(body);

    // Create subscription
    const paymentService = new PaymentService();
    const result = await paymentService.createSubscription({
      userId: decoded.userId,
      paymentMethodId: validatedData.paymentMethodId,
      customerEmail: decoded.email,
      customerName: decoded.name,
    });

    return NextResponse.json({
      subscriptionId: result.subscription.id,
      status: result.subscription.status,
      clientSecret: result.clientSecret,
    });

  } catch (error) {
    console.error('Error creating subscription:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Dados inválidos',
            details: error.issues 
          } 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: { 
          code: 'PAY_001', 
          message: 'Falha no processamento do pagamento' 
        } 
      },
      { status: 500 }
    );
  }
}
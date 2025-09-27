import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payments/payment.service';
import { JWTService } from '@/lib/auth/jwt';

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

    // Cancel subscription
    const paymentService = new PaymentService();
    await paymentService.cancelSubscription(decoded.userId);

    return NextResponse.json({
      message: 'Assinatura cancelada com sucesso',
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);

    if (error instanceof Error && error.message === 'Subscription not found') {
      return NextResponse.json(
        { 
          error: { 
            code: 'PAY_003', 
            message: 'Assinatura não encontrada' 
          } 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: { 
          code: 'PAY_001', 
          message: 'Falha no cancelamento da assinatura' 
        } 
      },
      { status: 500 }
    );
  }
}
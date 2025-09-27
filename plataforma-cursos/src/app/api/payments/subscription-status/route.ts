import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payments/payment.service';
import { JWTService } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
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

    // Get subscription status
    const paymentService = new PaymentService();
    const status = await paymentService.getSubscriptionStatus(decoded.userId);

    return NextResponse.json(status);

  } catch (error) {
    console.error('Error getting subscription status:', error);

    return NextResponse.json(
      { 
        error: { 
          code: 'PAY_001', 
          message: 'Falha ao obter status da assinatura' 
        } 
      },
      { status: 500 }
    );
  }
}
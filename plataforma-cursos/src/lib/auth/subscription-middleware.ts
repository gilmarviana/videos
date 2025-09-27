import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from './jwt';
import { SubscriptionRepository } from '../db/repositories/subscription.repository';
import { UserRepository } from '../db/repositories/user.repository';

export interface SubscriptionCheckResult {
  hasAccess: boolean;
  reason?: 'trial' | 'subscription' | 'expired' | 'no_subscription';
  trialMinutesRemaining?: number;
}

export async function checkUserAccess(userId: string): Promise<SubscriptionCheckResult> {
  try {
    const subscriptionRepo = new SubscriptionRepository();

    const user = await UserRepository.findById(userId);
    if (!user) {
      return { hasAccess: false, reason: 'no_subscription' };
    }

    // Check if user has active subscription
    const subscription = await subscriptionRepo.findByUserId(userId);
    if (subscription && subscription.status === 'active') {
      return { hasAccess: true, reason: 'subscription' };
    }

    // Check trial access
    if (user.trialStartTime) {
      const trialHours = parseInt(process.env.TRIAL_HOURS || '4');
      const trialMinutes = trialHours * 60;
      const trialMinutesRemaining = trialMinutes - user.trialMinutesUsed;

      if (trialMinutesRemaining > 0) {
        return { 
          hasAccess: true, 
          reason: 'trial',
          trialMinutesRemaining 
        };
      } else {
        return { 
          hasAccess: false, 
          reason: 'expired',
          trialMinutesRemaining: 0 
        };
      }
    }

    return { hasAccess: false, reason: 'no_subscription' };
  } catch (error) {
    console.error('Error checking user access:', error);
    return { hasAccess: false, reason: 'no_subscription' };
  }
}

export async function requireSubscriptionAccess(request: NextRequest): Promise<NextResponse | null> {
  try {
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

    const accessCheck = await checkUserAccess(decoded.userId);
    
    if (!accessCheck.hasAccess) {
      let message = 'Acesso negado';
      let code = 'AUTH_005';

      switch (accessCheck.reason) {
        case 'expired':
          message = 'Teste gratuito expirado. Assine para continuar acessando.';
          code = 'AUTH_004';
          break;
        case 'no_subscription':
          message = 'Assinatura inativa. Assine para acessar o conteúdo.';
          code = 'AUTH_005';
          break;
      }

      return NextResponse.json(
        { 
          error: { 
            code, 
            message,
            trialMinutesRemaining: accessCheck.trialMinutesRemaining 
          } 
        },
        { status: 403 }
      );
    }

    // Add user info to request headers for use in the route handler
    const response = NextResponse.next();
    response.headers.set('x-user-id', decoded.userId);
    response.headers.set('x-user-email', decoded.email);
    response.headers.set('x-access-reason', accessCheck.reason || 'subscription');
    
    if (accessCheck.trialMinutesRemaining !== undefined) {
      response.headers.set('x-trial-minutes-remaining', accessCheck.trialMinutesRemaining.toString());
    }

    return null; // Allow access
  } catch (error) {
    console.error('Error in subscription middleware:', error);
    return NextResponse.json(
      { error: { code: 'AUTH_001', message: 'Erro de autenticação' } },
      { status: 500 }
    );
  }
}

export function withSubscriptionAccess(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const accessResponse = await requireSubscriptionAccess(request);
    if (accessResponse) {
      return accessResponse;
    }
    return handler(request);
  };
}
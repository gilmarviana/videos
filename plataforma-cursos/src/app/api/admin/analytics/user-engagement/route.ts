import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '../../../../../lib/auth/jwt';
import { UserRepository } from '../../../../../lib/db/repositories/user.repository';
import { AnalyticsService } from '../../../../../lib/services/analytics.service';
import { AnalyticsMiddleware } from '../../../../../lib/analytics/middleware';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      await AnalyticsMiddleware.trackApiUsage(request, '/api/admin/analytics/user-engagement', 'GET', 401, Date.now() - startTime);
      return NextResponse.json(
        { error: { code: 'AUTH_001', message: 'Token de acesso requerido' } },
        { status: 401 }
      );
    }

    const token = JWTService.extractTokenFromHeader(authHeader);
    if (!token) {
      await AnalyticsMiddleware.trackApiUsage(request, '/api/admin/analytics/user-engagement', 'GET', 401, Date.now() - startTime);
      return NextResponse.json(
        { error: { code: 'AUTH_001', message: 'Token inválido' } },
        { status: 401 }
      );
    }
    
    let payload;
    try {
      payload = JWTService.verifyAccessToken(token);
    } catch (error) {
      await AnalyticsMiddleware.trackApiUsage(request, '/api/admin/analytics/user-engagement', 'GET', 401, Date.now() - startTime);
      return NextResponse.json(
        { error: { code: 'AUTH_001', message: 'Token inválido ou expirado' } },
        { status: 401 }
      );
    }

    // Verify admin role
    const adminUser = await UserRepository.findById(payload.userId);
    if (!adminUser || adminUser.role !== 'admin') {
      await AnalyticsMiddleware.trackApiUsage(request, '/api/admin/analytics/user-engagement', 'GET', 403, Date.now() - startTime);
      return NextResponse.json(
        { error: { code: 'AUTH_003', message: 'Acesso negado - apenas administradores' } },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Get user engagement report
    const engagementData = await AnalyticsService.getUserEngagementReport(days);

    // Track successful API usage
    await AnalyticsMiddleware.trackApiUsage(request, '/api/admin/analytics/user-engagement', 'GET', 200, Date.now() - startTime);

    return NextResponse.json({
      success: true,
      data: {
        engagement: engagementData,
        period: `${days} days`,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching user engagement data:', error);
    await AnalyticsMiddleware.trackApiUsage(request, '/api/admin/analytics/user-engagement', 'GET', 500, Date.now() - startTime);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    );
  }
}
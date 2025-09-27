import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '../../../../lib/auth/jwt';
import { UserRepository } from '../../../../lib/db/repositories/user.repository';
import { db } from '../../../../lib/db/connection';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { code: 'AUTH_001', message: 'Token de acesso requerido' } },
        { status: 401 }
      );
    }

    const token = JWTService.extractTokenFromHeader(authHeader);
    if (!token) {
      return NextResponse.json(
        { error: { code: 'AUTH_001', message: 'Token inválido' } },
        { status: 401 }
      );
    }
    
    let payload;
    try {
      payload = JWTService.verifyAccessToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: { code: 'AUTH_001', message: 'Token inválido ou expirado' } },
        { status: 401 }
      );
    }

    // Verify admin role
    const adminUser = await UserRepository.findById(payload.userId);
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: { code: 'AUTH_003', message: 'Acesso negado - apenas administradores' } },
        { status: 403 }
      );
    }

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    const offset = (page - 1) * limit;

    // Build query with filters
    let whereConditions = [];
    let queryParams: any[] = [];
    let paramCount = 1;

    if (search) {
      whereConditions.push(`(u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    if (role) {
      whereConditions.push(`u.role = $${paramCount}`);
      queryParams.push(role);
      paramCount++;
    }

    if (status === 'active') {
      whereConditions.push(`u.is_active = true`);
    } else if (status === 'inactive') {
      whereConditions.push(`u.is_active = false`);
    } else if (status === 'trial') {
      whereConditions.push(`u.trial_start_time IS NOT NULL AND s.id IS NULL`);
    } else if (status === 'subscribed') {
      whereConditions.push(`s.status = 'active'`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get users with subscription info
    const usersQuery = `
      SELECT u.*, 
             s.id as subscription_id, s.amount, s.currency, s.status as subscription_status,
             s.current_period_start, s.current_period_end, s.payment_gateway_id,
             s.created_at as subscription_created_at, s.updated_at as subscription_updated_at
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    queryParams.push(limit, offset);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
      ${whereClause}
    `;

    const [usersResult, countResult] = await Promise.all([
      db.query(usersQuery, queryParams),
      db.query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
    ]);

    const users = usersResult.rows.map((row: any) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      trialStartTime: row.trial_start_time,
      trialMinutesUsed: row.trial_minutes_used || 0,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      subscription: row.subscription_id ? {
        id: row.subscription_id,
        amount: parseFloat(row.amount),
        currency: row.currency,
        status: row.subscription_status,
        currentPeriodStart: row.current_period_start,
        currentPeriodEnd: row.current_period_end,
        paymentGatewayId: row.payment_gateway_id,
        createdAt: row.subscription_created_at,
        updatedAt: row.subscription_updated_at,
      } : null
    }));

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    );
  }
}
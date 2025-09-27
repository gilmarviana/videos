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
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * limit;

    // Build query with filters
    let whereConditions = ['u.role = \'student\''];
    let queryParams: any[] = [];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`s.status = $${paramCount}`);
      queryParams.push(status);
      paramCount++;
    }

    if (search) {
      whereConditions.push(`(u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get subscriptions with user info
    const subscriptionsQuery = `
      SELECT 
        s.*,
        u.name as user_name,
        u.email as user_email,
        u.is_active as user_active
      FROM subscriptions s
      INNER JOIN users u ON s.user_id = u.id
      ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    queryParams.push(limit, offset);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM subscriptions s
      INNER JOIN users u ON s.user_id = u.id
      ${whereClause}
    `;

    const [subscriptionsResult, countResult] = await Promise.all([
      db.query(subscriptionsQuery, queryParams),
      db.query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
    ]);

    const subscriptions = subscriptionsResult.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      amount: parseFloat(row.amount),
      currency: row.currency,
      status: row.status,
      currentPeriodStart: row.current_period_start,
      currentPeriodEnd: row.current_period_end,
      paymentGatewayId: row.payment_gateway_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        name: row.user_name,
        email: row.user_email,
        isActive: row.user_active
      }
    }));

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        subscriptions,
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
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    );
  }
}
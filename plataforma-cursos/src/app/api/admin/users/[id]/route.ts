import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '../../../../../lib/auth/jwt';
import { UserRepository } from '../../../../../lib/db/repositories/user.repository';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await request.json();

    // Validate user exists
    const user = await UserRepository.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_001', message: 'Usuário não encontrado' } },
        { status: 404 }
      );
    }

    // Prevent admin from deactivating themselves
    if (id === adminUser.id && body.isActive === false) {
      return NextResponse.json(
        { error: { code: 'USER_002', message: 'Não é possível desativar sua própria conta' } },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await UserRepository.update(id, {
      isActive: body.isActive,
      name: body.name,
      email: body.email
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: { code: 'USER_003', message: 'Erro ao atualizar usuário' } },
        { status: 500 }
      );
    }

    // Remove sensitive data
    const { passwordHash, ...userResponse } = updatedUser;

    return NextResponse.json({
      success: true,
      data: userResponse
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    const user = await UserRepository.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_001', message: 'Usuário não encontrado' } },
        { status: 404 }
      );
    }

    // Remove sensitive data
    const { passwordHash, ...userResponse } = user;

    return NextResponse.json({
      success: true,
      data: userResponse
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    );
  }
}
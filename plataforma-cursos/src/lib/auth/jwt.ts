import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'student';
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JWTService {
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';

  static generateTokenPair(userId: string, email: string, role: 'admin' | 'student'): TokenPair {
    const accessPayload: JWTPayload = {
      userId,
      email,
      role,
      type: 'access',
    };

    const refreshPayload: JWTPayload = {
      userId,
      email,
      role,
      type: 'refresh',
    };

    const accessToken = jwt.sign(accessPayload, config.jwt.secret, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(refreshPayload, config.jwt.refreshSecret, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as JWTPayload;
      
      if (payload.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  static verifyRefreshToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, config.jwt.refreshSecret) as JWTPayload;
      
      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}
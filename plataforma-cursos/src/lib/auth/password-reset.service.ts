import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../db/repositories/user.repository';
import { PasswordService } from './password';
import { EmailService } from '../services/email.service';
import redisClient from '../redis/client';

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export class PasswordResetService {
  private static readonly RESET_TOKEN_EXPIRY = 60 * 60; // 1 hour in seconds
  private static readonly RESET_TOKEN_PREFIX = 'password_reset:';

  static async requestPasswordReset(email: string): Promise<void> {
    // Find user by email
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return;
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Generate reset token
    const resetToken = uuidv4();
    const redisKey = `${this.RESET_TOKEN_PREFIX}${resetToken}`;

    // Store token in Redis with expiry
    const client = await redisClient.connect();
    await client.setex(redisKey, this.RESET_TOKEN_EXPIRY, user.id);

    // Send reset email
    await EmailService.sendPasswordResetEmail(user.email, user.name, resetToken);
  }

  static async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    // Validate new password
    const passwordValidation = PasswordService.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(`Invalid password: ${passwordValidation.errors.join(', ')}`);
    }

    // Get user ID from Redis
    const redisKey = `${this.RESET_TOKEN_PREFIX}${token}`;
    const client = await redisClient.connect();
    const userId = await client.get(redisKey);

    if (!userId) {
      throw new Error('Invalid or expired reset token');
    }

    // Verify user still exists
    const user = await UserRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    // Hash new password
    const passwordHash = await PasswordService.hash(newPassword);

    // Update user password
    await UserRepository.update(userId, { passwordHash });

    // Delete reset token from Redis
    await client.del(redisKey);
  }

  static async validateResetToken(token: string): Promise<boolean> {
    const redisKey = `${this.RESET_TOKEN_PREFIX}${token}`;
    const client = await redisClient.connect();
    const userId = await client.get(redisKey);
    return userId !== null;
  }
}
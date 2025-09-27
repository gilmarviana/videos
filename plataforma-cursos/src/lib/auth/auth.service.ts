import { UserRepository } from '../db/repositories/user.repository';
import { PasswordService } from './password';
import { JWTService, TokenPair } from './jwt';
import { User, AuthUser, LoginCredentials, RegisterData, TrialStatus } from '../../types';
import { config } from '../config';

export interface AuthResult {
  user: AuthUser;
  tokens: TokenPair;
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

export class AuthService {
  static async register(registerData: RegisterData): Promise<AuthResult> {
    // Validate input
    this.validateEmail(registerData.email);
    this.validateName(registerData.name);
    
    const passwordValidation = PasswordService.validatePassword(registerData.password);
    if (!passwordValidation.isValid) {
      throw this.createError('AUTH_006', 'Invalid password', passwordValidation.errors);
    }

    // Check if email already exists
    const existingUser = await UserRepository.findByEmail(registerData.email);
    if (existingUser) {
      throw this.createError('AUTH_007', 'Email already registered');
    }

    // Hash password
    const passwordHash = await PasswordService.hash(registerData.password);

    // Create user
    const user = await UserRepository.create({
      email: registerData.email,
      passwordHash,
      name: registerData.name,
      role: 'student',
    });

    // Start trial automatically for students
    const userWithTrial = await UserRepository.startTrial(user.id);
    if (!userWithTrial) {
      throw this.createError('AUTH_008', 'Failed to start trial');
    }

    // Trigger webhook for trial generation (async, don't wait)
    import('../services/webhook.service').then(({ WebhookService }) => {
      const webhookService = new WebhookService();
      webhookService.triggerTrialGenerated({
        userId: userWithTrial.id,
        userEmail: userWithTrial.email,
        trialStartTime: userWithTrial.trialStartTime?.toISOString() || new Date().toISOString()
      }).catch(error => {
        console.error('Error triggering trial generation webhook:', error);
      });
    });

    // Generate tokens
    const tokens = JWTService.generateTokenPair(user.id, user.email, user.role);

    return {
      user: this.mapToAuthUser(userWithTrial),
      tokens,
    };
  }

  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    // Validate input
    this.validateEmail(credentials.email);
    
    if (!credentials.password) {
      throw this.createError('AUTH_002', 'Password is required');
    }

    // Find user
    const user = await UserRepository.findByEmail(credentials.email);
    if (!user) {
      throw this.createError('AUTH_002', 'Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw this.createError('AUTH_009', 'Account is deactivated');
    }

    // Verify password
    const isValidPassword = await PasswordService.verify(credentials.password, user.passwordHash);
    if (!isValidPassword) {
      throw this.createError('AUTH_002', 'Invalid credentials');
    }

    // Generate tokens
    const tokens = JWTService.generateTokenPair(user.id, user.email, user.role);

    return {
      user: this.mapToAuthUser(user),
      tokens,
    };
  }

  static async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = JWTService.verifyRefreshToken(refreshToken);
      
      // Verify user still exists and is active
      const user = await UserRepository.findById(payload.userId);
      if (!user || !user.isActive) {
        throw this.createError('AUTH_003', 'User not found or inactive');
      }

      // Generate new token pair
      return JWTService.generateTokenPair(user.id, user.email, user.role);
    } catch (error) {
      throw this.createError('AUTH_001', 'Invalid refresh token');
    }
  }

  static async getCurrentUser(userId: string): Promise<AuthUser> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw this.createError('AUTH_003', 'User not found');
    }

    if (!user.isActive) {
      throw this.createError('AUTH_009', 'Account is deactivated');
    }

    return this.mapToAuthUser(user);
  }

  static async getTrialStatus(userId: string): Promise<TrialStatus> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw this.createError('AUTH_003', 'User not found');
    }

    const trialHours = config.app.trialHours;
    const trialMinutes = trialHours * 60;

    if (!user.trialStartTime) {
      return {
        isActive: false,
        minutesUsed: 0,
        minutesRemaining: 0,
        startTime: null,
        expiresAt: null,
      };
    }

    const minutesUsed = user.trialMinutesUsed;
    const minutesRemaining = Math.max(0, trialMinutes - minutesUsed);
    const isActive = minutesRemaining > 0 && !user.subscription;

    const expiresAt = new Date(user.trialStartTime);
    expiresAt.setMinutes(expiresAt.getMinutes() + trialMinutes);

    return {
      isActive,
      minutesUsed,
      minutesRemaining,
      startTime: user.trialStartTime,
      expiresAt,
    };
  }

  static async updateTrialUsage(userId: string, minutesUsed: number): Promise<void> {
    await UserRepository.updateTrialUsage(userId, minutesUsed);
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw this.createError('AUTH_003', 'User not found');
    }

    // Verify current password
    const isValidPassword = await PasswordService.verify(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw this.createError('AUTH_002', 'Current password is incorrect');
    }

    // Validate new password
    const passwordValidation = PasswordService.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw this.createError('AUTH_006', 'Invalid new password', passwordValidation.errors);
    }

    // Hash new password
    const newPasswordHash = await PasswordService.hash(newPassword);

    // Update password
    await UserRepository.update(userId, { passwordHash: newPasswordHash });
  }

  private static mapToAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      trialMinutesUsed: user.trialMinutesUsed,
      trialStartTime: user.trialStartTime,
      subscription: user.subscription ? {
        status: user.subscription.status,
        currentPeriodEnd: user.subscription.currentPeriodEnd,
      } : undefined,
    };
  }

  private static validateEmail(email: string): void {
    if (!email) {
      throw this.createError('AUTH_010', 'Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw this.createError('AUTH_010', 'Invalid email format');
    }

    if (email.length > 255) {
      throw this.createError('AUTH_010', 'Email is too long');
    }
  }

  private static validateName(name: string): void {
    if (!name) {
      throw this.createError('AUTH_011', 'Name is required');
    }

    if (name.length < 2) {
      throw this.createError('AUTH_011', 'Name must be at least 2 characters');
    }

    if (name.length > 255) {
      throw this.createError('AUTH_011', 'Name is too long');
    }
  }

  private static createError(code: string, message: string, details?: any): AuthError {
    return { code, message, details };
  }
}
/**
 * Authentication Service Unit Tests
 * 
 * Tests for the authentication service functions including
 * user registration, login, password reset, and JWT operations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../lib/auth/auth.service';
import { userRepository } from '../../lib/db/repositories/user.repository';
import { hashPassword, verifyPassword } from '../../lib/auth/password';
import { generateToken, verifyToken } from '../../lib/auth/jwt';

// Mock dependencies
vi.mock('../../lib/db/repositories/user.repository');
vi.mock('../../lib/auth/password');
vi.mock('../../lib/auth/jwt');

describe('AuthService', () => {
  let authService: AuthService;
  const mockUserRepository = vi.mocked(userRepository);
  const mockHashPassword = vi.mocked(hashPassword);
  const mockVerifyPassword = vi.mocked(verifyPassword);
  const mockGenerateToken = vi.mocked(generateToken);
  const mockVerifyToken = vi.mocked(verifyToken);

  beforeEach(() => {
    authService = new AuthService();
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockHashPassword.mockResolvedValue('hashed-password');
      mockUserRepository.create.mockResolvedValue({
        ...testUtils.createMockUser(),
        email: userData.email,
        name: userData.name,
      });

      const result = await authService.register(userData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockHashPassword).toHaveBeenCalledWith(userData.password);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: userData.email,
        passwordHash: 'hashed-password',
        name: userData.name,
        role: 'student',
        trialStartTime: expect.any(Date),
        trialMinutesUsed: 0,
        isActive: true,
      });
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });

    it('should fail if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      };

      mockUserRepository.findByEmail.mockResolvedValue(testUtils.createMockUser());

      const result = await authService.register(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User already exists');
      expect(mockHashPassword).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      };

      const result = await authService.register(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should validate password strength', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User',
      };

      const result = await authService.register(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 6 characters long');
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = testUtils.createMockUser();
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockVerifyPassword.mockResolvedValue(true);
      mockGenerateToken.mockReturnValue('access-token');

      const result = await authService.login(credentials);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(mockVerifyPassword).toHaveBeenCalledWith(credentials.password, expect.any(String));
      expect(mockGenerateToken).toHaveBeenCalledWith({ userId: mockUser.id, role: mockUser.role });
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.accessToken).toBe('access-token');
    });

    it('should fail with invalid email', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await authService.login(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    it('should fail with invalid password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = testUtils.createMockUser();
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockVerifyPassword.mockResolvedValue(false);

      const result = await authService.login(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    it('should fail if user is inactive', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = testUtils.createMockUser({ isActive: false });
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await authService.login(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Account is deactivated');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const token = 'valid-token';
      const payload = { userId: 'user-id', role: 'student' };

      mockVerifyToken.mockReturnValue(payload);
      mockUserRepository.findById.mockResolvedValue(testUtils.createMockUser());

      const result = await authService.verifyToken(token);

      expect(mockVerifyToken).toHaveBeenCalledWith(token);
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });

    it('should fail with invalid token', async () => {
      const token = 'invalid-token';

      mockVerifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await authService.verifyToken(token);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid token');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const userId = 'user-id';
      const oldPassword = 'oldpassword';
      const newPassword = 'newpassword123';

      const mockUser = testUtils.createMockUser();
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockVerifyPassword.mockResolvedValue(true);
      mockHashPassword.mockResolvedValue('new-hashed-password');
      mockUserRepository.updatePassword.mockResolvedValue(true);

      const result = await authService.changePassword(userId, oldPassword, newPassword);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockVerifyPassword).toHaveBeenCalledWith(oldPassword, expect.any(String));
      expect(mockHashPassword).toHaveBeenCalledWith(newPassword);
      expect(mockUserRepository.updatePassword).toHaveBeenCalledWith(userId, 'new-hashed-password');
      expect(result.success).toBe(true);
    });

    it('should fail with incorrect old password', async () => {
      const userId = 'user-id';
      const oldPassword = 'wrongpassword';
      const newPassword = 'newpassword123';

      const mockUser = testUtils.createMockUser();
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockVerifyPassword.mockResolvedValue(false);

      const result = await authService.changePassword(userId, oldPassword, newPassword);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Current password is incorrect');
    });
  });

  describe('requestPasswordReset', () => {
    it('should generate password reset token', async () => {
      const email = 'test@example.com';
      const mockUser = testUtils.createMockUser();

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockUserRepository.createPasswordResetToken.mockResolvedValue('reset-token');

      const result = await authService.requestPasswordReset(email);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockUserRepository.createPasswordResetToken).toHaveBeenCalledWith(mockUser.id);
      expect(result.success).toBe(true);
      expect(result.resetToken).toBe('reset-token');
    });

    it('should fail for non-existent user', async () => {
      const email = 'nonexistent@example.com';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await authService.requestPasswordReset(email);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const token = 'valid-reset-token';
      const newPassword = 'newpassword123';

      mockUserRepository.findByPasswordResetToken.mockResolvedValue(testUtils.createMockUser());
      mockHashPassword.mockResolvedValue('new-hashed-password');
      mockUserRepository.updatePassword.mockResolvedValue(true);
      mockUserRepository.deletePasswordResetToken.mockResolvedValue(true);

      const result = await authService.resetPassword(token, newPassword);

      expect(mockUserRepository.findByPasswordResetToken).toHaveBeenCalledWith(token);
      expect(mockHashPassword).toHaveBeenCalledWith(newPassword);
      expect(mockUserRepository.deletePasswordResetToken).toHaveBeenCalledWith(token);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid token', async () => {
      const token = 'invalid-token';
      const newPassword = 'newpassword123';

      mockUserRepository.findByPasswordResetToken.mockResolvedValue(null);

      const result = await authService.resetPassword(token, newPassword);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid or expired reset token');
    });
  });
});
/**
 * Authentication API Integration Tests
 * 
 * Tests for authentication API endpoints including
 * registration, login, password reset, and token validation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Import API handlers
import { POST as registerHandler } from '../../app/api/auth/register/route';
import { POST as loginHandler } from '../../app/api/auth/login/route';
import { GET as meHandler } from '../../app/api/auth/me/route';
import { POST as forgotPasswordHandler } from '../../app/api/auth/forgot-password/route';
import { POST as resetPasswordHandler } from '../../app/api/auth/reset-password/route';
import { POST as changePasswordHandler } from '../../app/api/auth/change-password/route';

// Mock database and services
vi.mock('../../lib/db/repositories/user.repository');
vi.mock('../../lib/auth/auth.service');
vi.mock('../../lib/services/email.service');

describe('Authentication API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const requestBody = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Mock successful registration
      const mockAuthService = await import('../../lib/auth/auth.service');
      vi.mocked(mockAuthService.AuthService.prototype.register).mockResolvedValue({
        success: true,
        user: testUtils.createMockUser({
          email: requestBody.email,
          name: requestBody.name,
        }),
      });

      const response = await registerHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.success).toBe(true);
      expect(responseData.user).toBeDefined();
      expect(responseData.user.email).toBe(requestBody.email);
    });

    it('should return 400 for invalid email', async () => {
      const requestBody = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      };

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await registerHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('email');
    });

    it('should return 400 for missing required fields', async () => {
      const requestBody = {
        email: 'test@example.com',
        // Missing password and name
      };

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await registerHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });

    it('should return 409 for existing user', async () => {
      const requestBody = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Mock user already exists
      const mockAuthService = await import('../../lib/auth/auth.service');
      vi.mocked(mockAuthService.AuthService.prototype.register).mockResolvedValue({
        success: false,
        error: 'User already exists',
      });

      const response = await registerHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(409);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      const requestBody = {
        email: 'test@example.com',
        password: 'password123',
      };

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Mock successful login
      const mockAuthService = await import('../../lib/auth/auth.service');
      vi.mocked(mockAuthService.AuthService.prototype.login).mockResolvedValue({
        success: true,
        user: testUtils.createMockUser({ email: requestBody.email }),
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });

      const response = await loginHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.user).toBeDefined();
      expect(responseData.accessToken).toBe('mock-access-token');
    });

    it('should return 401 for invalid credentials', async () => {
      const requestBody = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Mock invalid credentials
      const mockAuthService = await import('../../lib/auth/auth.service');
      vi.mocked(mockAuthService.AuthService.prototype.login).mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });

      const response = await loginHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile for valid token', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      });

      // Mock token verification
      const mockAuthService = await import('../../lib/auth/auth.service');
      vi.mocked(mockAuthService.AuthService.prototype.verifyToken).mockResolvedValue({
        success: true,
        user: testUtils.createMockUser(),
      });

      const response = await meHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.user).toBeDefined();
    });

    it('should return 401 for invalid token', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      });

      // Mock invalid token
      const mockAuthService = await import('../../lib/auth/auth.service');
      vi.mocked(mockAuthService.AuthService.prototype.verifyToken).mockResolvedValue({
        success: false,
        error: 'Invalid token',
      });

      const response = await meHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
    });

    it('should return 401 for missing token', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/me', {
        method: 'GET',
      });

      const response = await meHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset email successfully', async () => {
      const requestBody = {
        email: 'test@example.com',
      };

      const request = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Mock successful password reset request
      const mockAuthService = await import('../../lib/auth/auth.service');
      vi.mocked(mockAuthService.AuthService.prototype.requestPasswordReset).mockResolvedValue({
        success: true,
        resetToken: 'reset-token-123',
      });

      const response = await forgotPasswordHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toContain('reset email sent');
    });

    it('should return 404 for non-existent user', async () => {
      const requestBody = {
        email: 'nonexistent@example.com',
      };

      const request = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Mock user not found
      const mockAuthService = await import('../../lib/auth/auth.service');
      vi.mocked(mockAuthService.AuthService.prototype.requestPasswordReset).mockResolvedValue({
        success: false,
        error: 'User not found',
      });

      const response = await forgotPasswordHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.success).toBe(false);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password successfully', async () => {
      const requestBody = {
        token: 'valid-reset-token',
        newPassword: 'newpassword123',
      };

      const request = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Mock successful password reset
      const mockAuthService = await import('../../lib/auth/auth.service');
      vi.mocked(mockAuthService.AuthService.prototype.resetPassword).mockResolvedValue({
        success: true,
      });

      const response = await resetPasswordHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
    });

    it('should return 400 for invalid token', async () => {
      const requestBody = {
        token: 'invalid-token',
        newPassword: 'newpassword123',
      };

      const request = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Mock invalid token
      const mockAuthService = await import('../../lib/auth/auth.service');
      vi.mocked(mockAuthService.AuthService.prototype.resetPassword).mockResolvedValue({
        success: false,
        error: 'Invalid or expired reset token',
      });

      const response = await resetPasswordHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      const requestBody = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      };

      const request = new NextRequest('http://localhost:3000/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
      });

      // Mock successful password change
      const mockAuthService = await import('../../lib/auth/auth.service');
      vi.mocked(mockAuthService.AuthService.prototype.verifyToken).mockResolvedValue({
        success: true,
        user: testUtils.createMockUser(),
      });
      vi.mocked(mockAuthService.AuthService.prototype.changePassword).mockResolvedValue({
        success: true,
      });

      const response = await changePasswordHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
    });

    it('should return 400 for incorrect current password', async () => {
      const requestBody = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      };

      const request = new NextRequest('http://localhost:3000/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
      });

      // Mock incorrect current password
      const mockAuthService = await import('../../lib/auth/auth.service');
      vi.mocked(mockAuthService.AuthService.prototype.verifyToken).mockResolvedValue({
        success: true,
        user: testUtils.createMockUser(),
      });
      vi.mocked(mockAuthService.AuthService.prototype.changePassword).mockResolvedValue({
        success: false,
        error: 'Current password is incorrect',
      });

      const response = await changePasswordHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });
  });
});
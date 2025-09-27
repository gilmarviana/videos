import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthService } from '../lib/auth/auth.service';
import { TrialMiddleware } from '../lib/auth/trial-middleware';
import { TrialSessionService } from '../lib/services/trial-session.service';

// Mock dependencies
vi.mock('../lib/auth/auth.service');
vi.mock('../lib/db/repositories/user.repository');

describe('Trial System', () => {
  const mockUserId = 'test-user-id';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any active sessions
    TrialMiddleware.cleanupInactiveSessions();
  });

  describe('TrialMiddleware', () => {
    it('should start a trial session', async () => {
      await TrialMiddleware.startTrialSession(mockUserId);
      
      const session = TrialMiddleware.getSessionInfo(mockUserId);
      expect(session).toBeTruthy();
      expect(session?.userId).toBe(mockUserId);
      expect(session?.accumulatedMinutes).toBe(0);
    });

    it('should update trial activity', async () => {
      await TrialMiddleware.startTrialSession(mockUserId);
      
      // Wait a bit and update activity
      await new Promise(resolve => setTimeout(resolve, 100));
      await TrialMiddleware.updateTrialActivity(mockUserId);
      
      const session = TrialMiddleware.getSessionInfo(mockUserId);
      expect(session?.lastActivity).toBeTruthy();
    });

    it('should end trial session and save time', async () => {
      // Mock AuthService methods
      vi.mocked(AuthService.getTrialStatus).mockResolvedValue({
        isActive: true,
        minutesUsed: 10,
        minutesRemaining: 230,
        startTime: new Date(),
        expiresAt: new Date(Date.now() + 230 * 60 * 1000),
      });
      
      vi.mocked(AuthService.updateTrialUsage).mockResolvedValue();

      await TrialMiddleware.startTrialSession(mockUserId);
      await TrialMiddleware.endTrialSession(mockUserId);
      
      const session = TrialMiddleware.getSessionInfo(mockUserId);
      expect(session).toBeNull();
      expect(AuthService.updateTrialUsage).toHaveBeenCalled();
    });

    it('should check trial access correctly', async () => {
      const mockPayload = {
        userId: mockUserId,
        email: 'test@example.com',
        role: 'student' as const,
        iat: Date.now(),
        exp: Date.now() + 3600000,
      };

      // Mock user with active trial
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue({
        id: mockUserId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        trialMinutesUsed: 60,
        trialStartTime: new Date(),
      });

      vi.mocked(AuthService.getTrialStatus).mockResolvedValue({
        isActive: true,
        minutesUsed: 60,
        minutesRemaining: 180,
        startTime: new Date(),
        expiresAt: new Date(Date.now() + 180 * 60 * 1000),
      });

      const accessCheck = await TrialMiddleware.checkTrialAccess(mockPayload);
      expect(accessCheck.hasAccess).toBe(true);
    });

    it('should deny access for expired trial', async () => {
      const mockPayload = {
        userId: mockUserId,
        email: 'test@example.com',
        role: 'student' as const,
        iat: Date.now(),
        exp: Date.now() + 3600000,
      };

      // Mock user with expired trial
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue({
        id: mockUserId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        trialMinutesUsed: 240,
        trialStartTime: new Date(),
      });

      vi.mocked(AuthService.getTrialStatus).mockResolvedValue({
        isActive: true,
        minutesUsed: 240,
        minutesRemaining: 0,
        startTime: new Date(),
        expiresAt: new Date(Date.now() - 1000),
      });

      const accessCheck = await TrialMiddleware.checkTrialAccess(mockPayload);
      expect(accessCheck.hasAccess).toBe(false);
      expect(accessCheck.reason).toBe('Trial expired');
    });

    it('should allow admin access regardless of trial', async () => {
      const mockAdminPayload = {
        userId: 'admin-id',
        email: 'admin@example.com',
        role: 'admin' as const,
        iat: Date.now(),
        exp: Date.now() + 3600000,
      };

      const accessCheck = await TrialMiddleware.checkTrialAccess(mockAdminPayload);
      expect(accessCheck.hasAccess).toBe(true);
    });
  });

  describe('TrialSessionService', () => {
    it('should start and track session info', async () => {
      // Mock AuthService
      vi.mocked(AuthService.getTrialStatus).mockResolvedValue({
        isActive: true,
        minutesUsed: 30,
        minutesRemaining: 210,
        startTime: new Date(),
        expiresAt: new Date(Date.now() + 210 * 60 * 1000),
      });

      const sessionInfo = await TrialSessionService.startSession(mockUserId);
      
      expect(sessionInfo.isActive).toBe(true);
      expect(sessionInfo.totalTrialMinutes).toBe(30);
      expect(sessionInfo.remainingMinutes).toBe(210);
    });

    it('should check content access correctly', async () => {
      // Mock user with active subscription
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue({
        id: mockUserId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        trialMinutesUsed: 60,
        trialStartTime: new Date(),
        subscription: {
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      vi.mocked(AuthService.getTrialStatus).mockResolvedValue({
        isActive: false,
        minutesUsed: 60,
        minutesRemaining: 0,
        startTime: new Date(),
        expiresAt: new Date(),
      });

      const accessCheck = await TrialSessionService.checkContentAccess(mockUserId);
      expect(accessCheck.canAccess).toBe(true);
    });

    it('should deny content access for expired trial without subscription', async () => {
      // Mock user without subscription and expired trial
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue({
        id: mockUserId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        trialMinutesUsed: 240,
        trialStartTime: new Date(),
      });

      vi.mocked(AuthService.getTrialStatus).mockResolvedValue({
        isActive: true,
        minutesUsed: 240,
        minutesRemaining: 0,
        startTime: new Date(),
        expiresAt: new Date(Date.now() - 1000),
      });

      const accessCheck = await TrialSessionService.checkContentAccess(mockUserId);
      expect(accessCheck.canAccess).toBe(false);
      expect(accessCheck.reason).toBe('Trial time expired');
    });
  });

  describe('Session Cleanup', () => {
    it('should cleanup inactive sessions', async () => {
      await TrialMiddleware.startTrialSession(mockUserId);
      
      // Manually set last activity to old time
      const session = TrialMiddleware.getSessionInfo(mockUserId);
      if (session) {
        session.lastActivity = new Date(Date.now() - 35 * 60 * 1000); // 35 minutes ago
      }

      // Mock AuthService for cleanup
      vi.mocked(AuthService.getTrialStatus).mockResolvedValue({
        isActive: true,
        minutesUsed: 10,
        minutesRemaining: 230,
        startTime: new Date(),
        expiresAt: new Date(Date.now() + 230 * 60 * 1000),
      });
      
      vi.mocked(AuthService.updateTrialUsage).mockResolvedValue();

      TrialMiddleware.cleanupInactiveSessions();
      
      // Session should be cleaned up
      const cleanedSession = TrialMiddleware.getSessionInfo(mockUserId);
      expect(cleanedSession).toBeNull();
    });
  });
});
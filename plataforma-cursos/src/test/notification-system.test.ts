import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationService } from '../lib/services/notification.service';
import { CronService } from '../lib/services/cron.service';
import { EmailService } from '../lib/services/email.service';
import { UserRepository } from '../lib/db/repositories/user.repository';

// Mock dependencies
vi.mock('../lib/services/email.service');
vi.mock('../lib/db/repositories/user.repository');

describe('Notification System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    CronService.stopAll();
  });

  describe('NotificationService', () => {
    describe('processNotification', () => {
      it('should handle user registration notification', async () => {
        const mockSendWelcomeEmail = vi.spyOn(EmailService, 'sendWelcomeEmail').mockResolvedValue();
        const mockSendEmail = vi.spyOn(EmailService, 'sendEmail').mockResolvedValue();

        await NotificationService.processNotification({
          type: 'user_registered',
          userId: 'user123',
          data: { email: 'test@example.com', name: 'Test User' }
        });

        expect(mockSendWelcomeEmail).toHaveBeenCalledWith('test@example.com', 'Test User');
        expect(mockSendEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            subject: expect.stringContaining('Notificação Administrativa')
          })
        );
      });

      it('should handle trial warning notification', async () => {
        const mockUser = {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'student' as const,
          passwordHash: 'hash',
          trialStartTime: new Date(),
          trialMinutesUsed: 210,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        vi.mocked(UserRepository.findById).mockResolvedValue(mockUser);
        const mockSendTrialWarning = vi.spyOn(EmailService, 'sendTrialExpirationWarning').mockResolvedValue();

        await NotificationService.processNotification({
          type: 'trial_warning',
          userId: 'user123',
          data: { userId: 'user123', minutesRemaining: 30 }
        });

        expect(mockSendTrialWarning).toHaveBeenCalledWith('test@example.com', 'Test User', 30);
      });

      it('should handle trial expired notification', async () => {
        const mockUser = {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'student' as const,
          passwordHash: 'hash',
          trialStartTime: new Date(),
          trialMinutesUsed: 240,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        vi.mocked(UserRepository.findById).mockResolvedValue(mockUser);
        const mockSendEmail = vi.spyOn(EmailService, 'sendEmail').mockResolvedValue();

        await NotificationService.processNotification({
          type: 'trial_expired',
          userId: 'user123',
          data: { userId: 'user123' }
        });

        expect(mockSendEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            to: 'test@example.com',
            subject: 'Seu teste gratuito expirou'
          })
        );
      });

      it('should handle payment confirmation notification', async () => {
        const mockUser = {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'student' as const,
          passwordHash: 'hash',
          trialStartTime: new Date(),
          trialMinutesUsed: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        vi.mocked(UserRepository.findById).mockResolvedValue(mockUser);
        const mockSendPaymentConfirmation = vi.spyOn(EmailService, 'sendPaymentConfirmation').mockResolvedValue();

        await NotificationService.processNotification({
          type: 'payment_confirmed',
          userId: 'user123',
          data: { userId: 'user123', amount: 30.00, currency: 'BRL' }
        });

        expect(mockSendPaymentConfirmation).toHaveBeenCalledWith('test@example.com', 'Test User', 30.00, 'BRL');
      });

      it('should handle payment failed notification', async () => {
        const mockUser = {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'student' as const,
          passwordHash: 'hash',
          trialStartTime: new Date(),
          trialMinutesUsed: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        vi.mocked(UserRepository.findById).mockResolvedValue(mockUser);
        const mockSendPaymentFailed = vi.spyOn(EmailService, 'sendPaymentFailed').mockResolvedValue();
        const mockSendEmail = vi.spyOn(EmailService, 'sendEmail').mockResolvedValue();

        await NotificationService.processNotification({
          type: 'payment_failed',
          userId: 'user123',
          data: { userId: 'user123', reason: 'Card declined' }
        });

        expect(mockSendPaymentFailed).toHaveBeenCalledWith('test@example.com', 'Test User');
        expect(mockSendEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            subject: expect.stringContaining('[WARNING]')
          })
        );
      });

      it('should handle course completion notification', async () => {
        const mockUser = {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'student' as const,
          passwordHash: 'hash',
          trialStartTime: new Date(),
          trialMinutesUsed: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        vi.mocked(UserRepository.findById).mockResolvedValue(mockUser);
        const mockSendEmail = vi.spyOn(EmailService, 'sendEmail').mockResolvedValue();

        await NotificationService.processNotification({
          type: 'course_completed',
          userId: 'user123',
          data: { userId: 'user123', courseTitle: 'JavaScript Fundamentals' }
        });

        expect(mockSendEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            to: 'test@example.com',
            subject: 'Parabéns! Curso concluído'
          })
        );
      });

      it('should handle certificate generation notification', async () => {
        const mockUser = {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'student' as const,
          passwordHash: 'hash',
          trialStartTime: new Date(),
          trialMinutesUsed: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        vi.mocked(UserRepository.findById).mockResolvedValue(mockUser);
        const mockSendEmail = vi.spyOn(EmailService, 'sendEmail').mockResolvedValue();

        await NotificationService.processNotification({
          type: 'certificate_generated',
          userId: 'user123',
          data: { userId: 'user123', courseTitle: 'JavaScript Fundamentals', certificateId: 'cert123' }
        });

        expect(mockSendEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            to: 'test@example.com',
            subject: 'Seu certificado está pronto!'
          })
        );
      });

      it('should handle admin alert notification', async () => {
        const mockSendEmail = vi.spyOn(EmailService, 'sendEmail').mockResolvedValue();

        await NotificationService.processNotification({
          type: 'admin_alert',
          data: {
            type: 'system_error',
            message: 'Database connection failed',
            severity: 'critical' as const,
            details: { error: 'Connection timeout' }
          }
        });

        expect(mockSendEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            subject: expect.stringContaining('[CRITICAL]')
          })
        );
      });

      it('should handle unknown notification type gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        await NotificationService.processNotification({
          type: 'unknown_type' as any,
          data: {}
        });

        expect(consoleSpy).toHaveBeenCalledWith('Unknown notification type: unknown_type');
      });

      it('should not throw errors when notification fails', async () => {
        vi.mocked(UserRepository.findById).mockRejectedValue(new Error('Database error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await expect(NotificationService.processNotification({
          type: 'trial_warning',
          userId: 'user123',
          data: { userId: 'user123', minutesRemaining: 30 }
        })).resolves.not.toThrow();

        expect(consoleSpy).toHaveBeenCalled();
      });
    });

    describe('checkTrialWarnings', () => {
      it('should check and send trial warnings for users near expiration', async () => {
        const mockUsers = [
          {
            id: 'user1',
            email: 'user1@example.com',
            name: 'User 1',
            role: 'student' as const,
            passwordHash: 'hash',
            trialStartTime: new Date(),
            trialMinutesUsed: 210, // 30 minutes remaining
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'user2',
            email: 'user2@example.com',
            name: 'User 2',
            role: 'student' as const,
            passwordHash: 'hash',
            trialStartTime: new Date(),
            trialMinutesUsed: 230, // 10 minutes remaining
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        vi.mocked(UserRepository.findUsersNearTrialExpiration).mockResolvedValue(mockUsers);
        const mockSendTrialWarning = vi.spyOn(EmailService, 'sendTrialExpirationWarning').mockResolvedValue();

        await NotificationService.checkTrialWarnings();

        expect(mockSendTrialWarning).toHaveBeenCalledTimes(2);
        expect(mockSendTrialWarning).toHaveBeenCalledWith('user1@example.com', 'User 1', 30);
        expect(mockSendTrialWarning).toHaveBeenCalledWith('user2@example.com', 'User 2', 10);
      });

      it('should handle errors gracefully when checking trial warnings', async () => {
        vi.mocked(UserRepository.findUsersNearTrialExpiration).mockRejectedValue(new Error('Database error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await expect(NotificationService.checkTrialWarnings()).resolves.not.toThrow();
        expect(consoleSpy).toHaveBeenCalledWith('Failed to check trial warnings:', expect.any(Error));
      });
    });

    describe('sendAdminNotification', () => {
      it('should send admin notification with correct format', async () => {
        const mockSendEmail = vi.spyOn(EmailService, 'sendEmail').mockResolvedValue();

        await NotificationService.sendAdminNotification({
          type: 'new_user',
          message: 'New user registered',
          severity: 'info',
          details: { userId: 'user123' }
        });

        expect(mockSendEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            subject: expect.stringContaining('[INFO]')
          })
        );
      });
    });
  });

  describe('CronService', () => {
    it('should start and stop cron jobs', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      CronService.startAll();
      expect(consoleSpy).toHaveBeenCalledWith('✅ Trial warning checker started (runs every 5 minutes)');
      expect(consoleSpy).toHaveBeenCalledWith('✅ Daily admin summary started (runs at 9 AM daily)');

      CronService.stopAll();
      // Should not throw any errors
    });

    it('should manually trigger trial warning check', async () => {
      vi.mocked(UserRepository.findUsersNearTrialExpiration).mockResolvedValue([]);

      await expect(CronService.triggerTrialWarningCheck()).resolves.not.toThrow();
    });

    it('should manually trigger daily admin summary', async () => {
      const mockSendEmail = vi.spyOn(EmailService, 'sendEmail').mockResolvedValue();

      await expect(CronService.triggerDailyAdminSummary()).resolves.not.toThrow();
    });
  });

  describe('Email Templates', () => {
    it('should generate welcome email with correct content', async () => {
      const mockSendEmail = vi.spyOn(EmailService, 'sendEmail').mockResolvedValue();

      await EmailService.sendWelcomeEmail('test@example.com', 'Test User');

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Bem-vindo à Plataforma de Cursos!',
          html: expect.stringContaining('Test User')
        })
      );
    });

    it('should generate trial expiration warning with correct content', async () => {
      const mockSendEmail = vi.spyOn(EmailService, 'sendEmail').mockResolvedValue();

      await EmailService.sendTrialExpirationWarning('test@example.com', 'Test User', 30);

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Seu teste gratuito está acabando!',
          html: expect.stringContaining('30 minutos')
        })
      );
    });

    it('should generate payment confirmation with correct content', async () => {
      const mockSendEmail = vi.spyOn(EmailService, 'sendEmail').mockResolvedValue();

      await EmailService.sendPaymentConfirmation('test@example.com', 'Test User', 30.00, 'BRL');

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Pagamento Confirmado - Plataforma de Cursos',
          html: expect.stringContaining('BRL 30.00')
        })
      );
    });

    it('should generate payment failed notification with correct content', async () => {
      const mockSendEmail = vi.spyOn(EmailService, 'sendEmail').mockResolvedValue();

      await EmailService.sendPaymentFailed('test@example.com', 'Test User');

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Problema com seu Pagamento - Plataforma de Cursos',
          html: expect.stringContaining('não conseguimos processar')
        })
      );
    });
  });
});
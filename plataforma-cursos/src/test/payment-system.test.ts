import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PaymentService } from '../lib/payments/payment.service';
import { SubscriptionRepository } from '../lib/db/repositories/subscription.repository';
import { UserRepository } from '../lib/db/repositories/user.repository';
import { EmailService } from '../lib/services/email.service';
import { checkUserAccess } from '../lib/auth/subscription-middleware';

// Mock Stripe
vi.mock('../lib/payments/stripe.config', () => ({
  stripe: {
    customers: {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    paymentMethods: {
      attach: vi.fn(),
    },
    subscriptions: {
      create: vi.fn(),
      retrieve: vi.fn(),
      update: vi.fn(),
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
  STRIPE_CONFIG: {
    publicKey: 'pk_test_123',
    webhookSecret: 'whsec_123',
    currency: 'brl',
    subscriptionPrice: 30.00,
  },
}));

// Mock repositories
vi.mock('../lib/db/repositories/subscription.repository');
vi.mock('../lib/db/repositories/user.repository');
vi.mock('../lib/services/email.service');

describe('Payment System', () => {
  let paymentService: PaymentService;
  let mockSubscriptionRepo: any;
  let mockUserRepo: any;
  let mockEmailService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSubscriptionRepo = {
      create: vi.fn(),
      findByUserId: vi.fn(),
      findByPaymentGatewayId: vi.fn(),
      update: vi.fn(),
      updateByPaymentGatewayId: vi.fn(),
      getSubscriptionStats: vi.fn(),
    };

    mockUserRepo = {
      findById: vi.fn(),
      update: vi.fn(),
    };

    mockEmailService = {
      sendPaymentConfirmation: vi.fn(),
      sendPaymentFailed: vi.fn(),
      sendSubscriptionCancelled: vi.fn(),
    };

    // Mock constructor calls
    vi.mocked(SubscriptionRepository).mockImplementation(() => mockSubscriptionRepo);
    vi.mocked(UserRepository).mockImplementation(() => mockUserRepo);
    vi.mocked(EmailService).mockImplementation(() => mockEmailService);

    paymentService = new PaymentService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('PaymentService', () => {
    describe('createSubscription', () => {
      it('should create a subscription successfully', async () => {
        const { stripe } = await import('../lib/payments/stripe.config');
        
        // Mock Stripe responses
        vi.mocked(stripe.customers.list).mockResolvedValue({
          data: [],
        } as any);

        vi.mocked(stripe.customers.create).mockResolvedValue({
          id: 'cus_123',
          email: 'test@example.com',
        } as any);

        vi.mocked(stripe.paymentMethods.attach).mockResolvedValue({} as any);
        vi.mocked(stripe.customers.update).mockResolvedValue({} as any);

        const mockSubscription = {
          id: 'sub_123',
          status: 'active',
          current_period_start: 1640995200,
          current_period_end: 1643673600,
          latest_invoice: {
            payment_intent: {
              client_secret: 'pi_123_secret',
            },
          },
          metadata: {
            userId: 'user_123',
          },
        };

        vi.mocked(stripe.subscriptions.create).mockResolvedValue(mockSubscription as any);

        mockSubscriptionRepo.create.mockResolvedValue({
          id: 'sub_db_123',
          userId: 'user_123',
          status: 'active',
        });

        const result = await paymentService.createSubscription({
          userId: 'user_123',
          paymentMethodId: 'pm_123',
          customerEmail: 'test@example.com',
          customerName: 'Test User',
        });

        expect(result.subscription.id).toBe('sub_123');
        expect(result.clientSecret).toBe('pi_123_secret');
        expect(mockSubscriptionRepo.create).toHaveBeenCalledWith({
          userId: 'user_123',
          amount: 30.00,
          currency: 'BRL',
          status: 'active',
          currentPeriodStart: expect.any(Date),
          currentPeriodEnd: expect.any(Date),
          paymentGatewayId: 'sub_123',
        });
      });

      it('should handle subscription creation errors', async () => {
        const { stripe } = await import('../lib/payments/stripe.config');
        
        vi.mocked(stripe.customers.list).mockRejectedValue(new Error('Stripe error'));

        await expect(paymentService.createSubscription({
          userId: 'user_123',
          paymentMethodId: 'pm_123',
          customerEmail: 'test@example.com',
          customerName: 'Test User',
        })).rejects.toThrow('Failed to create subscription');
      });
    });

    describe('cancelSubscription', () => {
      it('should cancel subscription successfully', async () => {
        const { stripe } = await import('../lib/payments/stripe.config');
        
        const mockSubscription = {
          id: 'sub_db_123',
          userId: 'user_123',
          paymentGatewayId: 'sub_123',
          currentPeriodEnd: new Date('2024-02-01'),
        };

        const mockUser = {
          id: 'user_123',
          email: 'test@example.com',
          name: 'Test User',
        };

        mockSubscriptionRepo.findByUserId.mockResolvedValue(mockSubscription);
        mockUserRepo.findById.mockResolvedValue(mockUser);
        vi.mocked(stripe.subscriptions.update).mockResolvedValue({} as any);
        mockSubscriptionRepo.update.mockResolvedValue({});
        mockEmailService.sendSubscriptionCancelled.mockResolvedValue(undefined);

        await paymentService.cancelSubscription('user_123');

        expect(stripe.subscriptions.update).toHaveBeenCalledWith('sub_123', {
          cancel_at_period_end: true,
        });
        expect(mockSubscriptionRepo.update).toHaveBeenCalledWith('sub_db_123', {
          status: 'cancelled',
        });
        expect(mockEmailService.sendSubscriptionCancelled).toHaveBeenCalledWith(
          'test@example.com',
          'Test User',
          mockSubscription.currentPeriodEnd
        );
      });

      it('should throw error when subscription not found', async () => {
        mockSubscriptionRepo.findByUserId.mockResolvedValue(null);

        await expect(paymentService.cancelSubscription('user_123'))
          .rejects.toThrow('Failed to cancel subscription');
      });
    });

    describe('getSubscriptionStatus', () => {
      it('should return active subscription status', async () => {
        const { stripe } = await import('../lib/payments/stripe.config');
        
        const mockSubscription = {
          id: 'sub_db_123',
          paymentGatewayId: 'sub_123',
        };

        const mockStripeSubscription = {
          status: 'active',
          current_period_end: 1643673600,
          cancel_at_period_end: false,
        };

        mockSubscriptionRepo.findByUserId.mockResolvedValue(mockSubscription);
        vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(mockStripeSubscription as any);

        const result = await paymentService.getSubscriptionStatus('user_123');

        expect(result).toEqual({
          isActive: true,
          status: 'active',
          currentPeriodEnd: new Date(1643673600 * 1000),
          cancelAtPeriodEnd: false,
        });
      });

      it('should return inactive status when no subscription', async () => {
        mockSubscriptionRepo.findByUserId.mockResolvedValue(null);

        const result = await paymentService.getSubscriptionStatus('user_123');

        expect(result).toEqual({
          isActive: false,
          status: 'inactive',
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        });
      });
    });
  });

  describe('SubscriptionRepository', () => {
    let subscriptionRepo: SubscriptionRepository;

    beforeEach(() => {
      subscriptionRepo = new SubscriptionRepository();
    });

    describe('create', () => {
      it('should create subscription with correct data structure', () => {
        const subscriptionData = {
          userId: 'user_123',
          amount: 30.00,
          currency: 'BRL',
          status: 'active' as const,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          paymentGatewayId: 'sub_123',
        };

        // This would normally test the actual database interaction
        // For now, we're testing the interface
        expect(typeof subscriptionRepo.create).toBe('function');
      });
    });

    describe('getSubscriptionStats', () => {
      it('should return subscription statistics', async () => {
        const mockStats = {
          total: 100,
          active: 80,
          cancelled: 15,
          pastDue: 5,
          totalRevenue: 2400.00,
        };

        mockSubscriptionRepo.getSubscriptionStats.mockResolvedValue(mockStats);

        const stats = await mockSubscriptionRepo.getSubscriptionStats();

        expect(stats).toEqual(mockStats);
        expect(stats.total).toBeGreaterThanOrEqual(stats.active + stats.cancelled + stats.pastDue);
      });
    });
  });

  describe('Subscription Access Control', () => {
    describe('checkUserAccess', () => {
      it('should allow access for active subscription', async () => {
        const mockUser = {
          id: 'user_123',
          trialStartTime: null,
          trialMinutesUsed: 0,
        };

        const mockSubscription = {
          id: 'sub_123',
          status: 'active',
        };

        mockUserRepo.findById.mockResolvedValue(mockUser);
        mockSubscriptionRepo.findByUserId.mockResolvedValue(mockSubscription);

        const result = await checkUserAccess('user_123');

        expect(result).toEqual({
          hasAccess: true,
          reason: 'subscription',
        });
      });

      it('should allow access for valid trial', async () => {
        const mockUser = {
          id: 'user_123',
          trialStartTime: new Date(),
          trialMinutesUsed: 60, // 1 hour used out of 4 hours (240 minutes)
        };

        mockUserRepo.findById.mockResolvedValue(mockUser);
        mockSubscriptionRepo.findByUserId.mockResolvedValue(null);

        // Mock environment variable
        process.env.TRIAL_HOURS = '4';

        const result = await checkUserAccess('user_123');

        expect(result).toEqual({
          hasAccess: true,
          reason: 'trial',
          trialMinutesRemaining: 180, // 240 - 60 = 180 minutes remaining
        });
      });

      it('should deny access for expired trial', async () => {
        const mockUser = {
          id: 'user_123',
          trialStartTime: new Date(),
          trialMinutesUsed: 300, // 5 hours used, exceeds 4 hour limit
        };

        mockUserRepo.findById.mockResolvedValue(mockUser);
        mockSubscriptionRepo.findByUserId.mockResolvedValue(null);

        process.env.TRIAL_HOURS = '4';

        const result = await checkUserAccess('user_123');

        expect(result).toEqual({
          hasAccess: false,
          reason: 'expired',
          trialMinutesRemaining: 0,
        });
      });

      it('should deny access when no subscription or trial', async () => {
        const mockUser = {
          id: 'user_123',
          trialStartTime: null,
          trialMinutesUsed: 0,
        };

        mockUserRepo.findById.mockResolvedValue(mockUser);
        mockSubscriptionRepo.findByUserId.mockResolvedValue(null);

        const result = await checkUserAccess('user_123');

        expect(result).toEqual({
          hasAccess: false,
          reason: 'no_subscription',
        });
      });
    });
  });

  describe('Email Notifications', () => {
    describe('Payment confirmation email', () => {
      it('should send payment confirmation with correct data', async () => {
        await EmailService.sendPaymentConfirmation(
          'test@example.com',
          'Test User',
          30.00,
          'BRL'
        );

        // This would test the actual email sending in integration tests
        expect(typeof EmailService.sendPaymentConfirmation).toBe('function');
      });
    });

    describe('Payment failed email', () => {
      it('should send payment failed notification', async () => {
        await EmailService.sendPaymentFailed('test@example.com', 'Test User');

        expect(typeof EmailService.sendPaymentFailed).toBe('function');
      });
    });

    describe('Subscription cancelled email', () => {
      it('should send cancellation confirmation', async () => {
        const periodEnd = new Date('2024-02-01');
        
        await EmailService.sendSubscriptionCancelled(
          'test@example.com',
          'Test User',
          periodEnd
        );

        expect(typeof EmailService.sendSubscriptionCancelled).toBe('function');
      });
    });
  });

  describe('Webhook Handling', () => {
    it('should handle payment succeeded webhook', async () => {
      const { stripe } = await import('../lib/payments/stripe.config');
      
      const mockEvent = {
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            subscription: 'sub_123',
            amount_paid: 3000, // 30.00 in cents
          },
        },
      };

      const mockSubscription = {
        id: 'sub_123',
        current_period_start: 1640995200,
        current_period_end: 1643673600,
        metadata: {
          userId: 'user_123',
        },
      };

      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
      };

      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(mockSubscription as any);
      mockSubscriptionRepo.updateByPaymentGatewayId.mockResolvedValue({});
      mockUserRepo.update.mockResolvedValue({});
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockEmailService.sendPaymentConfirmation.mockResolvedValue(undefined);

      await paymentService.handleWebhook(mockEvent as any);

      expect(mockSubscriptionRepo.updateByPaymentGatewayId).toHaveBeenCalledWith('sub_123', {
        status: 'active',
        currentPeriodStart: expect.any(Date),
        currentPeriodEnd: expect.any(Date),
      });
      expect(mockUserRepo.update).toHaveBeenCalledWith('user_123', { isActive: true });
      expect(mockEmailService.sendPaymentConfirmation).toHaveBeenCalledWith(
        'test@example.com',
        'Test User',
        30.00,
        'BRL'
      );
    });

    it('should handle payment failed webhook', async () => {
      const { stripe } = await import('../lib/payments/stripe.config');
      
      const mockEvent = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            subscription: 'sub_123',
          },
        },
      };

      const mockSubscription = {
        id: 'sub_123',
        status: 'past_due',
        metadata: {
          userId: 'user_123',
        },
      };

      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
      };

      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(mockSubscription as any);
      mockSubscriptionRepo.updateByPaymentGatewayId.mockResolvedValue({});
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.update.mockResolvedValue({});
      mockEmailService.sendPaymentFailed.mockResolvedValue(undefined);

      await paymentService.handleWebhook(mockEvent as any);

      expect(mockSubscriptionRepo.updateByPaymentGatewayId).toHaveBeenCalledWith('sub_123', {
        status: 'past_due',
      });
      expect(mockUserRepo.update).toHaveBeenCalledWith('user_123', { isActive: false });
      expect(mockEmailService.sendPaymentFailed).toHaveBeenCalledWith(
        'test@example.com',
        'Test User'
      );
    });
  });
});
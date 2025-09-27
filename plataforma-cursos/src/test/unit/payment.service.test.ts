/**
 * Payment Service Unit Tests
 * 
 * Tests for payment service functions including
 * subscription creation, payment processing, and webhook handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentService } from '../../lib/payments/payment.service';
import { subscriptionRepository } from '../../lib/db/repositories/subscription.repository';
import Stripe from 'stripe';

// Mock dependencies
vi.mock('../../lib/db/repositories/subscription.repository');
vi.mock('stripe');

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockStripe: any;
  const mockSubscriptionRepository = vi.mocked(subscriptionRepository);

  beforeEach(() => {
    mockStripe = {
      customers: {
        create: vi.fn(),
        retrieve: vi.fn(),
        update: vi.fn(),
      },
      subscriptions: {
        create: vi.fn(),
        retrieve: vi.fn(),
        update: vi.fn(),
        cancel: vi.fn(),
      },
      paymentMethods: {
        attach: vi.fn(),
      },
      webhooks: {
        constructEvent: vi.fn(),
      },
      prices: {
        retrieve: vi.fn(),
      },
    };

    vi.mocked(Stripe).mockImplementation(() => mockStripe);
    paymentService = new PaymentService();
    vi.clearAllMocks();
  });

  describe('createSubscription', () => {
    it('should create subscription successfully', async () => {
      const subscriptionData = {
        userId: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        paymentMethodId: 'pm_test_123',
      };

      const mockCustomer = {
        id: 'cus_test_123',
        email: subscriptionData.email,
      };

      const mockSubscription = {
        id: 'sub_test_123',
        customer: mockCustomer.id,
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        items: {
          data: [{
            price: {
              id: 'price_test_123',
              unit_amount: 3000,
              currency: 'brl',
            },
          }],
        },
      };

      mockStripe.customers.create.mockResolvedValue(mockCustomer);
      mockStripe.paymentMethods.attach.mockResolvedValue({});
      mockStripe.subscriptions.create.mockResolvedValue(mockSubscription);
      mockSubscriptionRepository.create.mockResolvedValue(testUtils.createMockSubscription());

      const result = await paymentService.createSubscription(subscriptionData);

      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: subscriptionData.email,
        name: subscriptionData.name,
        payment_method: subscriptionData.paymentMethodId,
        invoice_settings: {
          default_payment_method: subscriptionData.paymentMethodId,
        },
      });

      expect(mockStripe.subscriptions.create).toHaveBeenCalledWith({
        customer: mockCustomer.id,
        items: [{ price: expect.any(String) }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      expect(result.success).toBe(true);
      expect(result.subscription).toBeDefined();
    });

    it('should handle Stripe customer creation failure', async () => {
      const subscriptionData = {
        userId: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        paymentMethodId: 'pm_test_123',
      };

      mockStripe.customers.create.mockRejectedValue(new Error('Customer creation failed'));

      const result = await paymentService.createSubscription(subscriptionData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create customer');
    });

    it('should handle Stripe subscription creation failure', async () => {
      const subscriptionData = {
        userId: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        paymentMethodId: 'pm_test_123',
      };

      const mockCustomer = { id: 'cus_test_123' };
      mockStripe.customers.create.mockResolvedValue(mockCustomer);
      mockStripe.paymentMethods.attach.mockResolvedValue({});
      mockStripe.subscriptions.create.mockRejectedValue(new Error('Subscription creation failed'));

      const result = await paymentService.createSubscription(subscriptionData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create subscription');
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription successfully', async () => {
      const subscriptionId = 'sub_test_123';
      const mockSubscription = testUtils.createMockSubscription({
        paymentGatewayId: subscriptionId,
      });

      mockSubscriptionRepository.findByPaymentGatewayId.mockResolvedValue(mockSubscription);
      mockStripe.subscriptions.cancel.mockResolvedValue({
        id: subscriptionId,
        status: 'canceled',
      });
      mockSubscriptionRepository.updateStatus.mockResolvedValue(true);

      const result = await paymentService.cancelSubscription(subscriptionId);

      expect(mockSubscriptionRepository.findByPaymentGatewayId).toHaveBeenCalledWith(subscriptionId);
      expect(mockStripe.subscriptions.cancel).toHaveBeenCalledWith(subscriptionId);
      expect(mockSubscriptionRepository.updateStatus).toHaveBeenCalledWith(
        mockSubscription.id,
        'canceled'
      );
      expect(result.success).toBe(true);
    });

    it('should fail if subscription not found', async () => {
      const subscriptionId = 'nonexistent_sub';

      mockSubscriptionRepository.findByPaymentGatewayId.mockResolvedValue(null);

      const result = await paymentService.cancelSubscription(subscriptionId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Subscription not found');
      expect(mockStripe.subscriptions.cancel).not.toHaveBeenCalled();
    });
  });

  describe('handleWebhook', () => {
    it('should handle subscription updated webhook', async () => {
      const webhookPayload = JSON.stringify({
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test_123',
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          },
        },
      });

      const signature = 'test_signature';
      const mockEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test_123',
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          },
        },
      };

      const mockSubscription = testUtils.createMockSubscription({
        paymentGatewayId: 'sub_test_123',
      });

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);
      mockSubscriptionRepository.findByPaymentGatewayId.mockResolvedValue(mockSubscription);
      mockSubscriptionRepository.updateStatus.mockResolvedValue(true);
      mockSubscriptionRepository.updatePeriod.mockResolvedValue(true);

      const result = await paymentService.handleWebhook(webhookPayload, signature);

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        webhookPayload,
        signature,
        expect.any(String)
      );
      expect(result.success).toBe(true);
    });

    it('should handle subscription deleted webhook', async () => {
      const webhookPayload = JSON.stringify({
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test_123',
            status: 'canceled',
          },
        },
      });

      const signature = 'test_signature';
      const mockEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test_123',
            status: 'canceled',
          },
        },
      };

      const mockSubscription = testUtils.createMockSubscription({
        paymentGatewayId: 'sub_test_123',
      });

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);
      mockSubscriptionRepository.findByPaymentGatewayId.mockResolvedValue(mockSubscription);
      mockSubscriptionRepository.updateStatus.mockResolvedValue(true);

      const result = await paymentService.handleWebhook(webhookPayload, signature);

      expect(result.success).toBe(true);
    });

    it('should handle invalid webhook signature', async () => {
      const webhookPayload = 'invalid payload';
      const signature = 'invalid_signature';

      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const result = await paymentService.handleWebhook(webhookPayload, signature);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid webhook signature');
    });

    it('should ignore unhandled webhook events', async () => {
      const webhookPayload = JSON.stringify({
        type: 'invoice.payment_succeeded',
        data: { object: {} },
      });

      const signature = 'test_signature';
      const mockEvent = {
        type: 'invoice.payment_succeeded',
        data: { object: {} },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      const result = await paymentService.handleWebhook(webhookPayload, signature);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Event type not handled');
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should get subscription status successfully', async () => {
      const userId = 'user-id';
      const mockSubscription = testUtils.createMockSubscription({ userId });

      mockSubscriptionRepository.findByUserId.mockResolvedValue(mockSubscription);

      const result = await paymentService.getSubscriptionStatus(userId);

      expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result.success).toBe(true);
      expect(result.subscription).toEqual(mockSubscription);
    });

    it('should return null if no subscription found', async () => {
      const userId = 'user-id';

      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);

      const result = await paymentService.getSubscriptionStatus(userId);

      expect(result.success).toBe(true);
      expect(result.subscription).toBeNull();
    });
  });

  describe('updateSubscription', () => {
    it('should update subscription successfully', async () => {
      const subscriptionId = 'sub_test_123';
      const updateData = {
        status: 'past_due' as const,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      const mockSubscription = testUtils.createMockSubscription({
        paymentGatewayId: subscriptionId,
      });

      mockSubscriptionRepository.findByPaymentGatewayId.mockResolvedValue(mockSubscription);
      mockSubscriptionRepository.update.mockResolvedValue({
        ...mockSubscription,
        ...updateData,
      });

      const result = await paymentService.updateSubscription(subscriptionId, updateData);

      expect(mockSubscriptionRepository.findByPaymentGatewayId).toHaveBeenCalledWith(subscriptionId);
      expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(mockSubscription.id, updateData);
      expect(result.success).toBe(true);
    });

    it('should fail if subscription not found', async () => {
      const subscriptionId = 'nonexistent_sub';
      const updateData = { status: 'past_due' as const };

      mockSubscriptionRepository.findByPaymentGatewayId.mockResolvedValue(null);

      const result = await paymentService.updateSubscription(subscriptionId, updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Subscription not found');
      expect(mockSubscriptionRepository.update).not.toHaveBeenCalled();
    });
  });
});
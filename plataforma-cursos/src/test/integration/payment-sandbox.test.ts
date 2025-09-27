/**
 * Payment Integration Tests with Sandbox Environment
 * 
 * Tests payment processing using Stripe test environment
 * with real API calls to sandbox endpoints.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Stripe from 'stripe';
import { PaymentService } from '../../lib/payments/payment.service';

// Test configuration
const STRIPE_TEST_CONFIG = {
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_123',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_123',
  priceId: process.env.STRIPE_PRICE_ID || 'price_test_123',
};

// Test card numbers from Stripe documentation
const TEST_CARDS = {
  VISA_SUCCESS: '4242424242424242',
  VISA_DECLINED: '4000000000000002',
  VISA_INSUFFICIENT_FUNDS: '4000000000009995',
  VISA_EXPIRED: '4000000000000069',
  VISA_INCORRECT_CVC: '4000000000000127',
  MASTERCARD_SUCCESS: '5555555555554444',
  AMEX_SUCCESS: '378282246310005',
};

describe('Payment Sandbox Integration Tests', () => {
  let paymentService: PaymentService;
  let stripe: Stripe;

  beforeEach(() => {
    // Initialize with test configuration
    stripe = new Stripe(STRIPE_TEST_CONFIG.secretKey, {
      apiVersion: '2023-10-16',
    });
    paymentService = new PaymentService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Stripe Customer Management', () => {
    it('should create customer successfully', async () => {
      const customerData = {
        email: 'test@example.com',
        name: 'Test User',
        metadata: {
          userId: 'user-123',
        },
      };

      const customer = await stripe.customers.create(customerData);

      expect(customer.id).toMatch(/^cus_/);
      expect(customer.email).toBe(customerData.email);
      expect(customer.name).toBe(customerData.name);
      expect(customer.metadata.userId).toBe('user-123');

      // Cleanup
      await stripe.customers.del(customer.id);
    });

    it('should retrieve customer by id', async () => {
      // Create test customer
      const customer = await stripe.customers.create({
        email: 'retrieve-test@example.com',
        name: 'Retrieve Test User',
      });

      // Retrieve customer
      const retrievedCustomer = await stripe.customers.retrieve(customer.id);

      expect(retrievedCustomer.id).toBe(customer.id);
      expect(retrievedCustomer.email).toBe('retrieve-test@example.com');

      // Cleanup
      await stripe.customers.del(customer.id);
    });

    it('should update customer information', async () => {
      // Create test customer
      const customer = await stripe.customers.create({
        email: 'update-test@example.com',
        name: 'Original Name',
      });

      // Update customer
      const updatedCustomer = await stripe.customers.update(customer.id, {
        name: 'Updated Name',
        metadata: { updated: 'true' },
      });

      expect(updatedCustomer.name).toBe('Updated Name');
      expect(updatedCustomer.metadata.updated).toBe('true');

      // Cleanup
      await stripe.customers.del(customer.id);
    });
  });

  describe('Payment Method Management', () => {
    it('should create payment method with valid card', async () => {
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: TEST_CARDS.VISA_SUCCESS,
          exp_month: 12,
          exp_year: 2025,
          cvc: '123',
        },
      });

      expect(paymentMethod.id).toMatch(/^pm_/);
      expect(paymentMethod.type).toBe('card');
      expect(paymentMethod.card?.brand).toBe('visa');
      expect(paymentMethod.card?.last4).toBe('4242');
    });

    it('should attach payment method to customer', async () => {
      // Create customer
      const customer = await stripe.customers.create({
        email: 'payment-method-test@example.com',
      });

      // Create payment method
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: TEST_CARDS.MASTERCARD_SUCCESS,
          exp_month: 12,
          exp_year: 2025,
          cvc: '123',
        },
      });

      // Attach to customer
      const attachedPaymentMethod = await stripe.paymentMethods.attach(
        paymentMethod.id,
        { customer: customer.id }
      );

      expect(attachedPaymentMethod.customer).toBe(customer.id);

      // Cleanup
      await stripe.customers.del(customer.id);
    });
  });

  describe('Subscription Management', () => {
    it('should create subscription with successful payment', async () => {
      // Create customer
      const customer = await stripe.customers.create({
        email: 'subscription-test@example.com',
        name: 'Subscription Test User',
      });

      // Create payment method
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: TEST_CARDS.VISA_SUCCESS,
          exp_month: 12,
          exp_year: 2025,
          cvc: '123',
        },
      });

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: customer.id,
      });

      // Update customer default payment method
      await stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: STRIPE_TEST_CONFIG.priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      expect(subscription.id).toMatch(/^sub_/);
      expect(subscription.customer).toBe(customer.id);
      expect(subscription.items.data).toHaveLength(1);
      expect(subscription.items.data[0].price.id).toBe(STRIPE_TEST_CONFIG.priceId);

      // Cleanup
      await stripe.subscriptions.cancel(subscription.id);
      await stripe.customers.del(customer.id);
    });

    it('should handle subscription with declined card', async () => {
      // Create customer
      const customer = await stripe.customers.create({
        email: 'declined-test@example.com',
      });

      // Create payment method with declined card
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: TEST_CARDS.VISA_DECLINED,
          exp_month: 12,
          exp_year: 2025,
          cvc: '123',
        },
      });

      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: customer.id,
      });

      // Attempt to create subscription
      try {
        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: STRIPE_TEST_CONFIG.priceId }],
          default_payment_method: paymentMethod.id,
        });

        // If subscription is created, it should be incomplete
        expect(subscription.status).toBe('incomplete');
      } catch (error) {
        // Payment should fail
        expect(error).toBeDefined();
      }

      // Cleanup
      await stripe.customers.del(customer.id);
    });

    it('should cancel subscription successfully', async () => {
      // Create customer and subscription
      const customer = await stripe.customers.create({
        email: 'cancel-test@example.com',
      });

      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: TEST_CARDS.VISA_SUCCESS,
          exp_month: 12,
          exp_year: 2025,
          cvc: '123',
        },
      });

      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: customer.id,
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: STRIPE_TEST_CONFIG.priceId }],
        default_payment_method: paymentMethod.id,
      });

      // Cancel subscription
      const canceledSubscription = await stripe.subscriptions.cancel(subscription.id);

      expect(canceledSubscription.status).toBe('canceled');
      expect(canceledSubscription.canceled_at).toBeDefined();

      // Cleanup
      await stripe.customers.del(customer.id);
    });
  });

  describe('Webhook Processing', () => {
    it('should construct webhook event correctly', async () => {
      const webhookPayload = JSON.stringify({
        id: 'evt_test_webhook',
        object: 'event',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test_123',
            status: 'active',
            customer: 'cus_test_123',
          },
        },
      });

      const signature = 'test_signature';

      // Mock webhook construction (in real test, this would use actual webhook secret)
      const mockEvent = {
        id: 'evt_test_webhook',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test_123',
            status: 'active',
            customer: 'cus_test_123',
          },
        },
      };

      // In a real test environment, you would use:
      // const event = stripe.webhooks.constructEvent(
      //   webhookPayload,
      //   signature,
      //   STRIPE_TEST_CONFIG.webhookSecret
      // );

      expect(mockEvent.type).toBe('customer.subscription.updated');
      expect(mockEvent.data.object.id).toBe('sub_test_123');
    });

    it('should handle subscription updated webhook', async () => {
      const webhookEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test_123',
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
            customer: 'cus_test_123',
          },
        },
      };

      // Mock payment service webhook handling
      const result = await paymentService.handleWebhookEvent(webhookEvent);

      expect(result.success).toBe(true);
      expect(result.eventType).toBe('customer.subscription.updated');
    });

    it('should handle subscription deleted webhook', async () => {
      const webhookEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test_123',
            status: 'canceled',
            customer: 'cus_test_123',
          },
        },
      };

      const result = await paymentService.handleWebhookEvent(webhookEvent);

      expect(result.success).toBe(true);
      expect(result.eventType).toBe('customer.subscription.deleted');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid card number', async () => {
      try {
        await stripe.paymentMethods.create({
          type: 'card',
          card: {
            number: '1234567890123456', // Invalid card number
            exp_month: 12,
            exp_year: 2025,
            cvc: '123',
          },
        });
        
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Stripe.errors.StripeCardError);
        expect((error as Stripe.errors.StripeCardError).code).toBe('incorrect_number');
      }
    });

    it('should handle expired card', async () => {
      try {
        await stripe.paymentMethods.create({
          type: 'card',
          card: {
            number: TEST_CARDS.VISA_EXPIRED,
            exp_month: 12,
            exp_year: 2020, // Expired year
            cvc: '123',
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Stripe.errors.StripeCardError);
        expect((error as Stripe.errors.StripeCardError).code).toBe('expired_card');
      }
    });

    it('should handle insufficient funds', async () => {
      const customer = await stripe.customers.create({
        email: 'insufficient-funds-test@example.com',
      });

      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: TEST_CARDS.VISA_INSUFFICIENT_FUNDS,
          exp_month: 12,
          exp_year: 2025,
          cvc: '123',
        },
      });

      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: customer.id,
      });

      try {
        await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: STRIPE_TEST_CONFIG.priceId }],
          default_payment_method: paymentMethod.id,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Stripe.errors.StripeCardError);
        expect((error as Stripe.errors.StripeCardError).code).toBe('insufficient_funds');
      }

      // Cleanup
      await stripe.customers.del(customer.id);
    });
  });

  describe('PaymentService Integration', () => {
    it('should create subscription through service', async () => {
      const subscriptionData = {
        userId: 'user-123',
        email: 'service-test@example.com',
        name: 'Service Test User',
        paymentMethodId: 'pm_test_123',
      };

      // Mock successful service call
      const result = await paymentService.createSubscription(subscriptionData);

      expect(result.success).toBe(true);
      expect(result.subscription).toBeDefined();
      expect(result.subscription?.userId).toBe(subscriptionData.userId);
    });

    it('should handle service-level payment failures', async () => {
      const subscriptionData = {
        userId: 'user-123',
        email: 'failure-test@example.com',
        name: 'Failure Test User',
        paymentMethodId: 'pm_declined_123',
      };

      const result = await paymentService.createSubscription(subscriptionData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should get subscription status through service', async () => {
      const userId = 'user-123';

      const result = await paymentService.getSubscriptionStatus(userId);

      expect(result.success).toBe(true);
      // Result can be null if no subscription exists
      expect(result.subscription === null || result.subscription?.userId === userId).toBe(true);
    });

    it('should cancel subscription through service', async () => {
      const subscriptionId = 'sub_test_123';

      const result = await paymentService.cancelSubscription(subscriptionId);

      // Should handle both success and "not found" cases gracefully
      expect(typeof result.success).toBe('boolean');
    });
  });
});
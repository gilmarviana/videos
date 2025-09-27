import { stripe, STRIPE_CONFIG } from './stripe.config';
import { SubscriptionRepository } from '../db/repositories/subscription.repository';
import { UserRepository } from '../db/repositories/user.repository';
import { NotificationService } from '../services/notification.service';
import Stripe from 'stripe';

export interface CreateSubscriptionParams {
  userId: string;
  paymentMethodId: string;
  customerEmail: string;
  customerName: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  status: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

export class PaymentService {
  private subscriptionRepo: SubscriptionRepository;

  constructor() {
    this.subscriptionRepo = new SubscriptionRepository();
  }

  async createSubscription(params: CreateSubscriptionParams): Promise<{ 
    subscription: Stripe.Subscription; 
    clientSecret?: string 
  }> {
    try {
      // Create or retrieve customer
      const customer = await this.createOrGetCustomer(params.customerEmail, params.customerName);

      // Attach payment method to customer
      await stripe.paymentMethods.attach(params.paymentMethodId, {
        customer: customer.id,
      });

      // Set as default payment method
      await stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: params.paymentMethodId,
        },
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price_data: {
            currency: STRIPE_CONFIG.currency,
            unit_amount: Math.round(STRIPE_CONFIG.subscriptionPrice * 100), // Convert to cents
            recurring: {
              interval: 'month',
            },
            product_data: {
              name: 'Plataforma de Cursos Online - Assinatura Mensal',
            },
          },
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: params.userId,
        },
      });

      // Save subscription to database
      await this.subscriptionRepo.create({
        userId: params.userId,
        amount: STRIPE_CONFIG.subscriptionPrice,
        currency: STRIPE_CONFIG.currency.toUpperCase(),
        status: subscription.status === 'active' ? 'active' : 'inactive',
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        paymentGatewayId: subscription.id,
      });

      const invoice = (subscription as any).latest_invoice as Stripe.Invoice;
      const paymentIntent = (invoice as any).payment_intent as Stripe.PaymentIntent;

      return {
        subscription,
        clientSecret: paymentIntent?.client_secret || undefined,
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  async cancelSubscription(userId: string): Promise<void> {
    try {
      const subscription = await this.subscriptionRepo.findByUserId(userId);
      if (!subscription || !subscription.paymentGatewayId) {
        throw new Error('Subscription not found');
      }

      // Cancel at period end to maintain access until paid period expires
      await stripe.subscriptions.update(subscription.paymentGatewayId, {
        cancel_at_period_end: true,
      });

      // Update local database
      await this.subscriptionRepo.update(subscription.id, {
        status: 'cancelled',
      });

      // Send cancellation notification
      await NotificationService.processNotification({
        type: 'subscription_cancelled',
        userId,
        data: { userId, periodEnd: subscription.currentPeriodEnd }
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      const subscription = await this.subscriptionRepo.findByUserId(userId);
      
      if (!subscription || !subscription.paymentGatewayId) {
        return {
          isActive: false,
          status: 'inactive',
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        };
      }

      const stripeSubscription = await stripe.subscriptions.retrieve(subscription.paymentGatewayId);

      return {
        isActive: stripeSubscription.status === 'active',
        status: stripeSubscription.status,
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return {
        isActive: false,
        status: 'error',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    }
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  private async createOrGetCustomer(email: string, name: string): Promise<Stripe.Customer> {
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    return await stripe.customers.create({
      email,
      name,
    });
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
    const userId = (subscription as any).metadata.userId;

    if (!userId) {
      console.error('No userId found in subscription metadata');
      return;
    }

    // Update subscription status
    await this.subscriptionRepo.updateByPaymentGatewayId(subscription.id, {
      status: 'active',
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    });

    // Activate user account
    await UserRepository.update(userId, { isActive: true });

    // Send payment confirmation notification
    await NotificationService.processNotification({
      type: 'payment_confirmed',
      userId,
      data: { 
        userId, 
        amount: invoice.amount_paid / 100,
        currency: STRIPE_CONFIG.currency.toUpperCase()
      }
    });
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
    const userId = (subscription as any).metadata.userId;

    if (!userId) {
      console.error('No userId found in subscription metadata');
      return;
    }

    // Update subscription status
    await this.subscriptionRepo.updateByPaymentGatewayId(subscription.id, {
      status: 'past_due',
    });

    // Send payment failed notification
    await NotificationService.processNotification({
      type: 'payment_failed',
      userId,
      data: { userId, reason: 'Payment failed for subscription' }
    });

    // Block access if payment fails multiple times
    if (subscription.status === 'past_due') {
      await UserRepository.update(userId, { isActive: false });
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const userId = (subscription as any).metadata.userId;

    if (!userId) {
      console.error('No userId found in subscription metadata');
      return;
    }

    await this.subscriptionRepo.updateByPaymentGatewayId(subscription.id, {
      status: subscription.status === 'active' ? 'active' : 'inactive',
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const userId = (subscription as any).metadata.userId;

    if (!userId) {
      console.error('No userId found in subscription metadata');
      return;
    }

    // Update subscription status
    await this.subscriptionRepo.updateByPaymentGatewayId(subscription.id, {
      status: 'cancelled',
    });

    // Deactivate user account
    await UserRepository.update(userId, { isActive: false });
  }
}
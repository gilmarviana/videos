import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});

export const STRIPE_CONFIG = {
  publicKey: process.env.STRIPE_PUBLIC_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  currency: process.env.SUBSCRIPTION_CURRENCY || 'brl',
  subscriptionPrice: parseFloat(process.env.SUBSCRIPTION_PRICE || '30.00'),
} as const;
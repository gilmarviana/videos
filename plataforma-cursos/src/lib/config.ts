import { z } from 'zod';

const configSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Redis
  REDIS_URL: z.string().url(),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  
  // Next.js
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  
  // Email
  EMAIL_FROM: z.string().email(),
  ADMIN_EMAIL: z.string().email().optional(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform(Number),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string(),
  
  // Payment Gateway
  STRIPE_PUBLIC_KEY: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  
  // AI Service
  OPENAI_API_KEY: z.string(),
  
  // File Storage
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  AWS_S3_BUCKET: z.string(),
  
  // App Configuration
  TRIAL_HOURS: z.string().transform(Number),
  SUBSCRIPTION_PRICE: z.string().transform(Number),
  SUBSCRIPTION_CURRENCY: z.string(),
});

function validateConfig() {
  try {
    const env = configSchema.parse(process.env);
    
    // Parse DATABASE_URL for individual connection parameters
    const dbUrl = new URL(env.DATABASE_URL);
    
    return {
      ...env,
      database: {
        host: dbUrl.hostname,
        port: parseInt(dbUrl.port) || 5432,
        name: dbUrl.pathname.slice(1), // Remove leading slash
        user: dbUrl.username,
        password: dbUrl.password,
        url: env.DATABASE_URL,
      },
      redis: {
        url: env.REDIS_URL,
      },
      jwt: {
        secret: env.JWT_SECRET,
        refreshSecret: env.JWT_REFRESH_SECRET,
      },
      email: {
        from: env.EMAIL_FROM,
        adminEmail: env.ADMIN_EMAIL || env.EMAIL_FROM,
        smtp: {
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      },
      stripe: {
        publicKey: env.STRIPE_PUBLIC_KEY,
        secretKey: env.STRIPE_SECRET_KEY,
        webhookSecret: env.STRIPE_WEBHOOK_SECRET,
      },
      openai: {
        apiKey: env.OPENAI_API_KEY,
      },
      aws: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        region: env.AWS_REGION,
        s3Bucket: env.AWS_S3_BUCKET,
      },
      app: {
        trialHours: env.TRIAL_HOURS,
        subscriptionPrice: env.SUBSCRIPTION_PRICE,
        subscriptionCurrency: env.SUBSCRIPTION_CURRENCY,
        nextAuthUrl: env.NEXTAUTH_URL,
        nextAuthSecret: env.NEXTAUTH_SECRET,
      },
    };
  } catch (error) {
    console.error('❌ Invalid environment configuration:', error);
    process.exit(1);
  }
}

export const config = validateConfig();

export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';
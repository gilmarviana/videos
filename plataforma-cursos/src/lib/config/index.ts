export const config = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'plataforma_cursos',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  email: {
    provider: process.env.EMAIL_PROVIDER || 'sendgrid',
    apiKey: process.env.EMAIL_API_KEY || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@plataforma-cursos.com',
    fromName: process.env.FROM_NAME || 'Plataforma de Cursos',
  },
  payment: {
    provider: process.env.PAYMENT_PROVIDER || 'stripe',
    publicKey: process.env.PAYMENT_PUBLIC_KEY || '',
    secretKey: process.env.PAYMENT_SECRET_KEY || '',
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || '',
  },
  app: {
    url: process.env.APP_URL || 'http://localhost:3000',
    environment: process.env.NODE_ENV || 'development',
  },
  trial: {
    durationMinutes: parseInt(process.env.TRIAL_DURATION_MINUTES || '240'), // 4 hours
  },
  subscription: {
    monthlyPrice: parseFloat(process.env.MONTHLY_PRICE || '30.00'),
    currency: process.env.CURRENCY || 'BRL',
  },
};
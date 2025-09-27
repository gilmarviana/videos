/**
 * Test Setup Configuration
 * 
 * This file configures the testing environment for the entire application.
 * It includes mocks, global setup, and test utilities.
 */

import { vi } from 'vitest';
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123456789';
process.env.EMAIL_FROM = 'test@example.com';
process.env.SMTP_HOST = 'localhost';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test';
process.env.SMTP_PASS = 'test';
process.env.OPENAI_API_KEY = 'sk-test-123456789';
process.env.UPLOAD_DIR = './test-uploads';
process.env.MAX_FILE_SIZE = '52428800'; // 50MB

// Global mocks
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    has: vi.fn(),
    getAll: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    entries: vi.fn(),
    forEach: vi.fn(),
    toString: vi.fn(),
  }),
  usePathname: () => '/test-path',
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
    getAll: vi.fn(),
  }),
  headers: () => ({
    get: vi.fn(),
    has: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    entries: vi.fn(),
    forEach: vi.fn(),
  }),
}));

// Mock Redis client
vi.mock('../lib/redis/client', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    exists: vi.fn(),
    expire: vi.fn(),
    ttl: vi.fn(),
    flushall: vi.fn(),
    quit: vi.fn(),
  },
}));

// Mock database connection
vi.mock('../lib/db/connection', () => ({
  pool: {
    query: vi.fn(),
    connect: vi.fn(),
    end: vi.fn(),
  },
  getConnection: vi.fn(),
}));

// Mock Stripe
vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      customers: {
        create: vi.fn(),
        retrieve: vi.fn(),
        update: vi.fn(),
        del: vi.fn(),
      },
      subscriptions: {
        create: vi.fn(),
        retrieve: vi.fn(),
        update: vi.fn(),
        cancel: vi.fn(),
        list: vi.fn(),
      },
      paymentMethods: {
        attach: vi.fn(),
        detach: vi.fn(),
        list: vi.fn(),
      },
      webhooks: {
        constructEvent: vi.fn(),
      },
      prices: {
        create: vi.fn(),
        retrieve: vi.fn(),
        list: vi.fn(),
      },
      products: {
        create: vi.fn(),
        retrieve: vi.fn(),
        list: vi.fn(),
      },
    })),
  };
});

// Mock nodemailer
vi.mock('nodemailer', () => ({
  createTransport: vi.fn(() => ({
    sendMail: vi.fn().mockResolvedValue({
      messageId: 'test-message-id',
      accepted: ['test@example.com'],
      rejected: [],
    }),
    verify: vi.fn().mockResolvedValue(true),
  })),
}));

// Mock file system operations
vi.mock('fs/promises', () => ({
  writeFile: vi.fn(),
  readFile: vi.fn(),
  unlink: vi.fn(),
  mkdir: vi.fn(),
  access: vi.fn(),
  stat: vi.fn(),
}));

// Mock multer
vi.mock('multer', () => ({
  default: vi.fn(() => ({
    single: vi.fn(),
    array: vi.fn(),
    fields: vi.fn(),
    none: vi.fn(),
    any: vi.fn(),
  })),
  memoryStorage: vi.fn(),
  diskStorage: vi.fn(),
}));

// Mock PDFKit
vi.mock('pdfkit', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      fontSize: vi.fn().mockReturnThis(),
      text: vi.fn().mockReturnThis(),
      font: vi.fn().mockReturnThis(),
      fillColor: vi.fn().mockReturnThis(),
      rect: vi.fn().mockReturnThis(),
      fill: vi.fn().mockReturnThis(),
      stroke: vi.fn().mockReturnThis(),
      image: vi.fn().mockReturnThis(),
      end: vi.fn(),
      pipe: vi.fn(),
      on: vi.fn(),
    })),
  };
});

// Global test utilities
global.testUtils = {
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'student' as const,
    trialStartTime: new Date(),
    trialMinutesUsed: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createMockCourse: (overrides = {}) => ({
    id: 'test-course-id',
    title: 'Test Course',
    description: 'Test course description',
    coverImageUrl: 'https://example.com/cover.jpg',
    price: 30.00,
    isActive: true,
    createdBy: 'test-admin-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createMockModule: (overrides = {}) => ({
    id: 'test-module-id',
    courseId: 'test-course-id',
    title: 'Test Module',
    description: 'Test module description',
    orderIndex: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createMockLesson: (overrides = {}) => ({
    id: 'test-lesson-id',
    moduleId: 'test-module-id',
    title: 'Test Lesson',
    description: 'Test lesson description',
    videoUrl: 'https://example.com/video.mp4',
    videoSource: 'direct' as const,
    videoFormat: 'mp4' as const,
    durationSeconds: 600,
    orderIndex: 1,
    materials: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createMockSubscription: (overrides = {}) => ({
    id: 'test-subscription-id',
    userId: 'test-user-id',
    amount: 30.00,
    currency: 'BRL',
    status: 'active' as const,
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    paymentGatewayId: 'sub_test_123',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createMockRequest: (overrides = {}) => ({
    method: 'GET',
    url: '/test',
    headers: {},
    body: {},
    query: {},
    params: {},
    ...overrides,
  }),

  createMockResponse: () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
      getHeader: vi.fn(),
      removeHeader: vi.fn().mockReturnThis(),
      cookie: vi.fn().mockReturnThis(),
      clearCookie: vi.fn().mockReturnThis(),
      redirect: vi.fn().mockReturnThis(),
    };
    return res;
  },

  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  generateRandomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
};

// Extend global types
declare global {
  var testUtils: typeof global.testUtils;
}

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Global error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
# Testing Suite Documentation

This document describes the comprehensive testing suite implemented for the Plataforma Cursos Online project.

## Overview

The testing suite includes:
- **Unit Tests**: Test individual service functions and utilities
- **Integration Tests**: Test API endpoints and database interactions
- **End-to-End Tests**: Test complete user workflows
- **Performance Tests**: Test system performance under load
- **Payment Integration Tests**: Test payment processing with sandbox environment

## Test Structure

```
src/test/
├── setup.ts                    # Global test configuration and mocks
├── basic.test.ts              # Basic test verification
├── unit/                      # Unit tests
│   ├── auth.service.test.ts   # Authentication service tests
│   ├── course.service.test.ts # Course management service tests
│   └── payment.service.test.ts # Payment service tests
├── integration/               # Integration tests
│   ├── auth.api.test.ts      # Authentication API tests
│   ├── courses.api.test.ts   # Course management API tests
│   └── payment-sandbox.test.ts # Payment integration tests
├── e2e/                      # End-to-end tests
│   ├── user-registration-flow.test.ts # Complete user registration flow
│   └── subscription-flow.test.ts      # Complete subscription flow
├── performance/              # Performance tests
│   ├── video-streaming.test.ts        # Video streaming performance
│   └── database-queries.test.ts       # Database query performance
└── test-runner.ts           # Comprehensive test runner
```

## Configuration

### Environment Variables

The test suite uses `.env.test` for configuration:

```bash
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5432/test_plataforma_cursos
REDIS_URL=redis://localhost:6379/1
JWT_SECRET=test-jwt-secret-key-for-testing-only
STRIPE_SECRET_KEY=sk_test_51234567890abcdef
# ... other test configuration
```

### Vitest Configuration

Tests are configured using `vitest.config.mjs`:

```javascript
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
```

## Running Tests

### Individual Test Suites

```bash
# Run all tests
npm run test:run

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run end-to-end tests only
npm run test:e2e

# Run performance tests only
npm run test:performance

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch

# Interactive UI
npm run test:ui
```

### Comprehensive Test Runner

Run all test suites with detailed reporting:

```bash
npx tsx src/test/test-runner.ts
```

This generates:
- JSON report: `test-reports/test-report-{timestamp}.json`
- HTML report: `test-reports/test-report-{timestamp}.html`
- Console summary with recommendations

## Test Categories

### 1. Unit Tests

Test individual functions and services in isolation.

**Coverage:**
- Authentication service (login, register, password reset)
- Course management service (CRUD operations, validation)
- Payment service (subscription management, webhooks)
- Utility functions and helpers

**Example:**
```typescript
describe('AuthService', () => {
  it('should register a new user successfully', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const result = await authService.register(userData);

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
  });
});
```

### 2. Integration Tests

Test API endpoints with mocked dependencies.

**Coverage:**
- Authentication endpoints (`/api/auth/*`)
- Course management endpoints (`/api/courses/*`)
- Payment endpoints (`/api/payments/*`)
- User management endpoints (`/api/users/*`)

**Example:**
```typescript
describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }),
    });

    const response = await registerHandler(request);
    expect(response.status).toBe(201);
  });
});
```

### 3. End-to-End Tests

Test complete user workflows from start to finish.

**Coverage:**
- User registration and trial activation
- Complete subscription process
- Course access and progress tracking
- Mobile device compatibility

**Example:**
```typescript
describe('User Registration Flow', () => {
  it('should complete full user journey from landing page to watching first lesson', async () => {
    // Step 1: Visit landing page
    await page.goto('http://localhost:3000');
    
    // Step 2: Register user
    await page.fill('[data-testid="register-email"]', 'test@example.com');
    // ... more steps
    
    // Step 10: Verify video player loads
    await page.waitForSelector('[data-testid="video-player"]');
  });
});
```

### 4. Performance Tests

Test system performance under various load conditions.

**Coverage:**
- Video streaming performance
- Database query optimization
- Concurrent user handling
- Memory usage monitoring

**Example:**
```typescript
describe('Video Streaming Performance', () => {
  it('should handle 50 concurrent video streams within 1 second', async () => {
    const promises = Array.from({ length: 50 }, () => 
      videoService.createVideoStream('video-123')
    );
    
    const startTime = performance.now();
    await Promise.all(promises);
    const duration = performance.now() - startTime;
    
    expect(duration).toBeLessThan(1000);
  });
});
```

### 5. Payment Integration Tests

Test payment processing with real Stripe sandbox environment.

**Coverage:**
- Customer creation and management
- Subscription lifecycle (create, update, cancel)
- Webhook event handling
- Payment method validation
- Error handling for declined cards

**Example:**
```typescript
describe('Stripe Integration', () => {
  it('should create subscription with valid payment method', async () => {
    const customer = await stripe.customers.create({
      email: 'test@example.com',
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: 'price_test_123' }],
    });

    expect(subscription.status).toBe('active');
  });
});
```

## Test Utilities

### Global Test Utilities

Available in all tests via `testUtils`:

```typescript
// Create mock objects
const mockUser = testUtils.createMockUser();
const mockCourse = testUtils.createMockCourse();
const mockSubscription = testUtils.createMockSubscription();

// HTTP mocks
const mockRequest = testUtils.createMockRequest();
const mockResponse = testUtils.createMockResponse();

// Utilities
await testUtils.sleep(1000);
const randomString = testUtils.generateRandomString(10);
```

### Mocking Strategy

- **Database**: All database operations are mocked using Vitest mocks
- **External APIs**: Stripe, email services, and AI services are mocked
- **File System**: File operations are mocked for testing
- **Environment**: Test-specific environment variables are used

## Coverage Requirements

The test suite aims for:
- **80%+ line coverage** across all modules
- **80%+ function coverage** for service classes
- **80%+ branch coverage** for conditional logic
- **100% coverage** for critical paths (authentication, payments)

## Continuous Integration

Tests are designed to run in CI/CD environments:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    npm run test:run
    npm run test:coverage
```

## Performance Benchmarks

### Expected Performance Metrics

- **Unit Tests**: < 5 seconds total
- **Integration Tests**: < 30 seconds total
- **E2E Tests**: < 2 minutes total
- **Performance Tests**: < 5 minutes total

### Performance Test Criteria

- Video metadata retrieval: < 100ms
- Database queries: < 50ms for simple queries
- API endpoints: < 200ms response time
- Concurrent users: Support 50+ simultaneous connections

## Troubleshooting

### Common Issues

1. **Environment Configuration**
   - Ensure `.env.test` has all required variables
   - Check database connection settings

2. **Mock Failures**
   - Verify mock implementations match actual service interfaces
   - Check that mocks are properly cleared between tests

3. **Timeout Issues**
   - Increase `testTimeout` for slow operations
   - Use `vi.useFakeTimers()` for time-dependent tests

4. **Memory Leaks**
   - Ensure proper cleanup in `afterEach` hooks
   - Monitor memory usage in performance tests

### Debug Mode

Enable debug logging:

```bash
DEBUG=true npm run test:run
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Descriptive Names**: Use clear, descriptive test names
3. **Arrange-Act-Assert**: Follow the AAA pattern
4. **Mock External Dependencies**: Don't rely on external services
5. **Test Edge Cases**: Include error conditions and boundary cases
6. **Performance Awareness**: Monitor test execution time
7. **Documentation**: Keep tests well-documented and maintainable

## Reporting

### Test Reports

Generated reports include:
- Test execution summary
- Coverage metrics
- Performance benchmarks
- Failure analysis
- Recommendations for improvement

### Metrics Tracked

- Test pass/fail rates
- Code coverage percentages
- Performance regression detection
- Flaky test identification
- Test execution trends

## Future Enhancements

Planned improvements:
- Visual regression testing
- Accessibility testing
- Security testing (OWASP)
- Load testing with realistic user patterns
- Cross-browser compatibility testing
- Mobile device testing automation
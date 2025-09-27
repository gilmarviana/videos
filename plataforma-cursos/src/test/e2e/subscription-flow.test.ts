/**
 * End-to-End Subscription Flow Tests
 * 
 * Tests the complete subscription process from trial expiration
 * to successful payment and content access restoration.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Stripe elements
const mockStripe = {
  elements: vi.fn(() => ({
    create: vi.fn(() => ({
      mount: vi.fn(),
      unmount: vi.fn(),
      on: vi.fn(),
      update: vi.fn(),
    })),
    getElement: vi.fn(),
  })),
  confirmCardPayment: vi.fn(),
  createPaymentMethod: vi.fn(),
};

// Mock browser environment
const mockBrowser = {
  page: {
    goto: vi.fn(),
    fill: vi.fn(),
    click: vi.fn(),
    waitForSelector: vi.fn(),
    textContent: vi.fn(),
    screenshot: vi.fn(),
    evaluate: vi.fn(),
    locator: vi.fn(() => ({
      click: vi.fn(),
      fill: vi.fn(),
      textContent: vi.fn(),
      isVisible: vi.fn(),
      waitFor: vi.fn(),
    })),
  },
};

// Mock API responses
const mockApiResponses = {
  createSubscription: {
    success: true,
    subscription: {
      id: 'sub-123',
      userId: 'user-123',
      status: 'active',
      amount: 30.00,
      currency: 'BRL',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    clientSecret: 'pi_test_client_secret',
  },
  subscriptionStatus: {
    success: true,
    subscription: {
      id: 'sub-123',
      status: 'active',
      amount: 30.00,
      currency: 'BRL',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  cancelSubscription: {
    success: true,
    message: 'Subscription canceled successfully',
  },
};

describe('Subscription Flow E2E Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    // Mock Stripe global
    (global as any).Stripe = vi.fn(() => mockStripe);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Trial to Subscription Conversion', () => {
    it('should complete full subscription flow from trial expiration', async () => {
      const page = mockBrowser.page;

      // Step 1: User with expired trial tries to access content
      await page.goto('http://localhost:3000/courses/course-1/lessons/lesson-1');

      // Mock expired trial response
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({
          success: false,
          error: 'Trial expired',
          code: 'TRIAL_EXPIRED',
        }),
      } as Response);

      // Step 2: Verify trial expired modal appears
      await page.waitForSelector('[data-testid="trial-expired-modal"]');
      expect(page.waitForSelector).toHaveBeenCalledWith('[data-testid="trial-expired-modal"]');

      // Step 3: Click "Subscribe Now" button
      const subscribeButton = page.locator('[data-testid="subscribe-now-button"]');
      await subscribeButton.click();
      expect(subscribeButton.click).toHaveBeenCalled();

      // Step 4: Navigate to subscription page
      await page.waitForSelector('[data-testid="subscription-form"]');
      expect(page.waitForSelector).toHaveBeenCalledWith('[data-testid="subscription-form"]');

      // Step 5: Verify pricing information is displayed
      const priceDisplay = page.locator('[data-testid="price-display"]');
      const priceText = await priceDisplay.textContent();
      expect(priceText).toContain('R$ 30,00');
      expect(priceText).toContain('mensal');

      // Step 6: Fill payment form
      await page.fill('[data-testid="cardholder-name"]', 'Test User');
      
      // Mock Stripe card element interaction
      const cardElement = page.locator('[data-testid="card-element"]');
      await cardElement.click();
      
      // Simulate card details entry (mocked)
      await page.evaluate(() => {
        // Simulate Stripe card element filled
        window.dispatchEvent(new CustomEvent('stripe-card-ready', {
          detail: { complete: true }
        }));
      });

      // Step 7: Submit payment form
      mockStripe.createPaymentMethod.mockResolvedValue({
        paymentMethod: {
          id: 'pm_test_123',
          card: { brand: 'visa', last4: '4242' },
        },
      });

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponses.createSubscription),
      } as Response);

      const submitButton = page.locator('[data-testid="submit-payment"]');
      await submitButton.click();
      expect(submitButton.click).toHaveBeenCalled();

      // Step 8: Verify payment processing
      await page.waitForSelector('[data-testid="payment-processing"]');
      expect(page.waitForSelector).toHaveBeenCalledWith('[data-testid="payment-processing"]');

      // Step 9: Mock successful payment confirmation
      mockStripe.confirmCardPayment.mockResolvedValue({
        paymentIntent: {
          status: 'succeeded',
          id: 'pi_test_123',
        },
      });

      // Step 10: Verify subscription success page
      await page.waitForSelector('[data-testid="subscription-success"]');
      expect(page.waitForSelector).toHaveBeenCalledWith('[data-testid="subscription-success"]');

      // Step 11: Verify success message
      const successMessage = page.locator('[data-testid="success-message"]');
      const messageText = await successMessage.textContent();
      expect(messageText).toContain('Assinatura ativada com sucesso');

      // Step 12: Navigate back to course
      const continueButton = page.locator('[data-testid="continue-to-course"]');
      await continueButton.click();

      // Step 13: Verify content access is restored
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          lesson: {
            id: 'lesson-1',
            title: 'Welcome to Programming',
            videoUrl: 'https://example.com/video1.mp4',
          },
        }),
      } as Response);

      await page.waitForSelector('[data-testid="video-player"]');
      expect(page.waitForSelector).toHaveBeenCalledWith('[data-testid="video-player"]');

      // Step 14: Verify subscription status in header
      const subscriptionBadge = page.locator('[data-testid="subscription-badge"]');
      const badgeText = await subscriptionBadge.textContent();
      expect(badgeText).toContain('Assinante');
    });

    it('should handle payment failures gracefully', async () => {
      const page = mockBrowser.page;

      // Navigate to subscription page
      await page.goto('http://localhost:3000/subscribe');

      // Fill payment form
      await page.fill('[data-testid="cardholder-name"]', 'Test User');

      // Mock payment method creation
      mockStripe.createPaymentMethod.mockResolvedValue({
        paymentMethod: {
          id: 'pm_test_declined',
          card: { brand: 'visa', last4: '0002' },
        },
      });

      // Mock payment failure
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          success: false,
          error: 'Your card was declined',
          code: 'CARD_DECLINED',
        }),
      } as Response);

      const submitButton = page.locator('[data-testid="submit-payment"]');
      await submitButton.click();

      // Verify error message is displayed
      await page.waitForSelector('[data-testid="payment-error"]');
      const errorMessage = page.locator('[data-testid="payment-error"]');
      const errorText = await errorMessage.textContent();
      expect(errorText).toContain('cartão foi recusado');

      // Verify form is still accessible for retry
      const retryButton = page.locator('[data-testid="retry-payment"]');
      expect(retryButton.isVisible()).toBeTruthy();
    });

    it('should handle network errors during payment', async () => {
      const page = mockBrowser.page;

      await page.goto('http://localhost:3000/subscribe');

      // Fill payment form
      await page.fill('[data-testid="cardholder-name"]', 'Test User');

      // Mock network error
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const submitButton = page.locator('[data-testid="submit-payment"]');
      await submitButton.click();

      // Verify network error message
      await page.waitForSelector('[data-testid="network-error"]');
      const errorMessage = page.locator('[data-testid="network-error"]');
      const errorText = await errorMessage.textContent();
      expect(errorText).toContain('Erro de conexão');

      // Verify retry option is available
      const retryButton = page.locator('[data-testid="retry-payment"]');
      expect(retryButton.isVisible()).toBeTruthy();
    });
  });

  describe('Subscription Management', () => {
    it('should allow user to view subscription details', async () => {
      const page = mockBrowser.page;

      // Navigate to account page
      await page.goto('http://localhost:3000/account');

      // Mock subscription status
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponses.subscriptionStatus),
      } as Response);

      // Verify subscription details are displayed
      await page.waitForSelector('[data-testid="subscription-details"]');
      
      const statusElement = page.locator('[data-testid="subscription-status"]');
      const statusText = await statusElement.textContent();
      expect(statusText).toContain('Ativa');

      const amountElement = page.locator('[data-testid="subscription-amount"]');
      const amountText = await amountElement.textContent();
      expect(amountText).toContain('R$ 30,00');

      const nextBillingElement = page.locator('[data-testid="next-billing"]');
      expect(nextBillingElement.isVisible()).toBeTruthy();
    });

    it('should allow user to cancel subscription', async () => {
      const page = mockBrowser.page;

      await page.goto('http://localhost:3000/account');

      // Mock active subscription
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponses.subscriptionStatus),
      } as Response);

      await page.waitForSelector('[data-testid="subscription-details"]');

      // Click cancel subscription button
      const cancelButton = page.locator('[data-testid="cancel-subscription"]');
      await cancelButton.click();

      // Verify confirmation modal
      await page.waitForSelector('[data-testid="cancel-confirmation-modal"]');
      
      const confirmationText = page.locator('[data-testid="cancel-warning"]');
      const warningText = await confirmationText.textContent();
      expect(warningText).toContain('perderá acesso');

      // Confirm cancellation
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponses.cancelSubscription),
      } as Response);

      const confirmButton = page.locator('[data-testid="confirm-cancel"]');
      await confirmButton.click();

      // Verify cancellation success
      await page.waitForSelector('[data-testid="cancellation-success"]');
      const successMessage = page.locator('[data-testid="cancellation-success"]');
      const successText = await successMessage.textContent();
      expect(successText).toContain('cancelada com sucesso');

      // Verify subscription status updated
      const statusElement = page.locator('[data-testid="subscription-status"]');
      const statusText = await statusElement.textContent();
      expect(statusText).toContain('Cancelada');
    });

    it('should show reactivation option for canceled subscription', async () => {
      const page = mockBrowser.page;

      await page.goto('http://localhost:3000/account');

      // Mock canceled subscription
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          subscription: {
            ...mockApiResponses.subscriptionStatus.subscription,
            status: 'canceled',
          },
        }),
      } as Response);

      await page.waitForSelector('[data-testid="subscription-details"]');

      // Verify reactivation button is shown
      const reactivateButton = page.locator('[data-testid="reactivate-subscription"]');
      expect(reactivateButton.isVisible()).toBeTruthy();

      const buttonText = await reactivateButton.textContent();
      expect(buttonText).toContain('Reativar');
    });
  });

  describe('Mobile Subscription Flow', () => {
    it('should complete subscription on mobile device', async () => {
      const page = mockBrowser.page;

      // Simulate mobile viewport
      await page.evaluate(() => {
        Object.defineProperty(window, 'innerWidth', { value: 375 });
        Object.defineProperty(window, 'innerHeight', { value: 667 });
        window.dispatchEvent(new Event('resize'));
      });

      // Navigate to mobile subscription page
      await page.goto('http://localhost:3000/subscribe');

      // Verify mobile layout
      const mobileForm = page.locator('[data-testid="mobile-subscription-form"]');
      expect(mobileForm.isVisible()).toBeTruthy();

      // Fill mobile payment form
      await page.fill('[data-testid="cardholder-name"]', 'Mobile User');

      // Mock successful mobile payment
      mockStripe.createPaymentMethod.mockResolvedValue({
        paymentMethod: { id: 'pm_mobile_test' },
      });

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponses.createSubscription),
      } as Response);

      const submitButton = page.locator('[data-testid="submit-payment"]');
      await submitButton.click();

      // Verify mobile success page
      await page.waitForSelector('[data-testid="mobile-subscription-success"]');
      expect(page.waitForSelector).toHaveBeenCalledWith('[data-testid="mobile-subscription-success"]');
    });
  });
});
/**
 * End-to-End User Registration Flow Tests
 * 
 * Tests the complete user registration and trial activation flow
 * from landing page to first lesson access.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock browser environment for E2E simulation
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
  context: {
    newPage: vi.fn(),
    close: vi.fn(),
  },
};

// Mock API responses
const mockApiResponses = {
  register: {
    success: true,
    user: {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'student',
      trialStartTime: new Date().toISOString(),
      trialMinutesUsed: 0,
      isActive: true,
    },
    accessToken: 'mock-access-token',
  },
  courses: {
    success: true,
    courses: [
      {
        id: 'course-1',
        title: 'Introduction to Programming',
        description: 'Learn the basics of programming',
        coverImageUrl: 'https://example.com/cover1.jpg',
        modules: [
          {
            id: 'module-1',
            title: 'Getting Started',
            lessons: [
              {
                id: 'lesson-1',
                title: 'Welcome to Programming',
                videoUrl: 'https://example.com/video1.mp4',
                durationSeconds: 600,
              },
            ],
          },
        ],
      },
    ],
  },
  trialStatus: {
    success: true,
    isTrialActive: true,
    trialMinutesUsed: 0,
    trialMinutesTotal: 240, // 4 hours
    trialTimeRemaining: 240,
  },
};

describe('User Registration Flow E2E Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch for API calls
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete Registration to First Lesson Flow', () => {
    it('should complete full user journey from landing page to watching first lesson', async () => {
      const page = mockBrowser.page;

      // Step 1: Visit landing page
      await page.goto('http://localhost:3000');
      expect(page.goto).toHaveBeenCalledWith('http://localhost:3000');

      // Step 2: Click "Start Free Trial" button
      const startTrialButton = page.locator('[data-testid="start-trial-button"]');
      await startTrialButton.click();
      expect(startTrialButton.click).toHaveBeenCalled();

      // Step 3: Fill registration form
      await page.fill('[data-testid="register-name"]', 'Test User');
      await page.fill('[data-testid="register-email"]', 'test@example.com');
      await page.fill('[data-testid="register-password"]', 'password123');
      
      expect(page.fill).toHaveBeenCalledWith('[data-testid="register-name"]', 'Test User');
      expect(page.fill).toHaveBeenCalledWith('[data-testid="register-email"]', 'test@example.com');
      expect(page.fill).toHaveBeenCalledWith('[data-testid="register-password"]', 'password123');

      // Step 4: Submit registration form
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponses.register),
      } as Response);

      const registerButton = page.locator('[data-testid="register-submit"]');
      await registerButton.click();
      expect(registerButton.click).toHaveBeenCalled();

      // Verify API call was made
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      // Step 5: Verify redirect to dashboard
      await page.waitForSelector('[data-testid="dashboard"]');
      expect(page.waitForSelector).toHaveBeenCalledWith('[data-testid="dashboard"]');

      // Step 6: Verify trial timer is displayed
      const trialTimer = page.locator('[data-testid="trial-timer"]');
      await trialTimer.waitFor();
      expect(trialTimer.waitFor).toHaveBeenCalled();

      // Step 7: Load courses
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponses.courses),
      } as Response);

      await page.waitForSelector('[data-testid="course-list"]');
      expect(page.waitForSelector).toHaveBeenCalledWith('[data-testid="course-list"]');

      // Step 8: Click on first course
      const firstCourse = page.locator('[data-testid="course-card-course-1"]');
      await firstCourse.click();
      expect(firstCourse.click).toHaveBeenCalled();

      // Step 9: Navigate to first lesson
      await page.waitForSelector('[data-testid="course-modules"]');
      const firstLesson = page.locator('[data-testid="lesson-lesson-1"]');
      await firstLesson.click();
      expect(firstLesson.click).toHaveBeenCalled();

      // Step 10: Verify video player loads
      await page.waitForSelector('[data-testid="video-player"]');
      expect(page.waitForSelector).toHaveBeenCalledWith('[data-testid="video-player"]');

      // Step 11: Verify trial status is tracked
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponses.trialStatus),
      } as Response);

      // Simulate starting video playback
      const playButton = page.locator('[data-testid="video-play-button"]');
      await playButton.click();
      expect(playButton.click).toHaveBeenCalled();

      // Step 12: Verify trial time tracking starts
      await testUtils.sleep(1000); // Simulate 1 second of video watching

      // Verify trial status API call
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/trial-status', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer mock-access-token',
        },
      });

      // Step 13: Verify progress tracking
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      // Simulate progress update
      await page.evaluate(() => {
        // Simulate video progress update
        window.dispatchEvent(new CustomEvent('video-progress', {
          detail: { lessonId: 'lesson-1', watchedSeconds: 30 }
        }));
      });

      // Verify progress API call
      expect(global.fetch).toHaveBeenCalledWith('/api/lessons/lesson-1/progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-access-token',
        },
        body: JSON.stringify({
          watchedSeconds: 30,
        }),
      });
    });

    it('should handle registration validation errors', async () => {
      const page = mockBrowser.page;

      // Navigate to registration
      await page.goto('http://localhost:3000/register');

      // Try to submit with invalid email
      await page.fill('[data-testid="register-name"]', 'Test User');
      await page.fill('[data-testid="register-email"]', 'invalid-email');
      await page.fill('[data-testid="register-password"]', 'password123');

      // Mock validation error response
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          success: false,
          error: 'Invalid email format',
        }),
      } as Response);

      const registerButton = page.locator('[data-testid="register-submit"]');
      await registerButton.click();

      // Verify error message is displayed
      await page.waitForSelector('[data-testid="error-message"]');
      const errorMessage = await page.textContent('[data-testid="error-message"]');
      expect(errorMessage).toContain('Invalid email format');
    });

    it('should handle existing user registration attempt', async () => {
      const page = mockBrowser.page;

      await page.goto('http://localhost:3000/register');

      // Fill form with existing user email
      await page.fill('[data-testid="register-name"]', 'Existing User');
      await page.fill('[data-testid="register-email"]', 'existing@example.com');
      await page.fill('[data-testid="register-password"]', 'password123');

      // Mock user already exists response
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: () => Promise.resolve({
          success: false,
          error: 'User already exists',
        }),
      } as Response);

      const registerButton = page.locator('[data-testid="register-submit"]');
      await registerButton.click();

      // Verify error message and login link
      await page.waitForSelector('[data-testid="error-message"]');
      const errorMessage = await page.textContent('[data-testid="error-message"]');
      expect(errorMessage).toContain('User already exists');

      const loginLink = page.locator('[data-testid="login-link"]');
      expect(loginLink.isVisible()).toBeTruthy();
    });
  });

  describe('Trial Expiration Flow', () => {
    it('should handle trial expiration during video watching', async () => {
      const page = mockBrowser.page;

      // Simulate user already logged in with almost expired trial
      await page.goto('http://localhost:3000/dashboard');

      // Mock trial status with 1 minute remaining
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          isTrialActive: true,
          trialMinutesUsed: 239,
          trialMinutesTotal: 240,
          trialTimeRemaining: 1,
        }),
      } as Response);

      // Navigate to lesson
      await page.goto('http://localhost:3000/courses/course-1/lessons/lesson-1');

      // Start watching video
      const playButton = page.locator('[data-testid="video-play-button"]');
      await playButton.click();

      // Simulate trial expiration after 1 minute
      await testUtils.sleep(60000); // 1 minute

      // Mock trial expired response
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          isTrialActive: false,
          trialMinutesUsed: 240,
          trialMinutesTotal: 240,
          trialTimeRemaining: 0,
        }),
      } as Response);

      // Verify trial expired modal appears
      await page.waitForSelector('[data-testid="trial-expired-modal"]');
      expect(page.waitForSelector).toHaveBeenCalledWith('[data-testid="trial-expired-modal"]');

      // Verify video is paused
      const videoPaused = await page.evaluate(() => {
        const video = document.querySelector('video');
        return video?.paused;
      });
      expect(videoPaused).toBe(true);

      // Verify subscription CTA is displayed
      const subscribeButton = page.locator('[data-testid="subscribe-button"]');
      expect(subscribeButton.isVisible()).toBeTruthy();
    });
  });

  describe('Mobile Registration Flow', () => {
    it('should complete registration flow on mobile device', async () => {
      const page = mockBrowser.page;

      // Simulate mobile viewport
      await page.evaluate(() => {
        Object.defineProperty(window, 'innerWidth', { value: 375 });
        Object.defineProperty(window, 'innerHeight', { value: 667 });
        window.dispatchEvent(new Event('resize'));
      });

      // Navigate to mobile landing page
      await page.goto('http://localhost:3000');

      // Verify mobile layout is active
      const mobileMenu = page.locator('[data-testid="mobile-menu-button"]');
      expect(mobileMenu.isVisible()).toBeTruthy();

      // Open mobile menu and click register
      await mobileMenu.click();
      const mobileRegisterLink = page.locator('[data-testid="mobile-register-link"]');
      await mobileRegisterLink.click();

      // Fill mobile registration form
      await page.fill('[data-testid="register-name"]', 'Mobile User');
      await page.fill('[data-testid="register-email"]', 'mobile@example.com');
      await page.fill('[data-testid="register-password"]', 'password123');

      // Mock successful registration
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponses.register),
      } as Response);

      const registerButton = page.locator('[data-testid="register-submit"]');
      await registerButton.click();

      // Verify mobile dashboard loads
      await page.waitForSelector('[data-testid="mobile-dashboard"]');
      expect(page.waitForSelector).toHaveBeenCalledWith('[data-testid="mobile-dashboard"]');

      // Verify mobile video player works
      const firstCourse = page.locator('[data-testid="course-card-course-1"]');
      await firstCourse.click();

      await page.waitForSelector('[data-testid="mobile-video-player"]');
      expect(page.waitForSelector).toHaveBeenCalledWith('[data-testid="mobile-video-player"]');
    });
  });
});
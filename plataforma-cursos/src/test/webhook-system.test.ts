import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebhookService } from '../lib/services/webhook.service';
import { WebhookRepository } from '../lib/db/repositories/webhook.repository';

// Mock the repository
vi.mock('../lib/db/repositories/webhook.repository');
vi.mock('../lib/db/connection');

// Mock fetch globally
global.fetch = vi.fn();

describe('Webhook System', () => {
  let webhookService: WebhookService;
  let mockWebhookRepository: any;

  beforeEach(() => {
    webhookService = new WebhookService();
    mockWebhookRepository = vi.mocked(WebhookRepository);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('WebhookService', () => {
    describe('createWebhook', () => {
      it('should create a webhook with valid data', async () => {
        const webhookData = {
          name: 'Test Webhook',
          url: 'https://example.com/webhook',
          eventType: 'site_visit' as const,
          headers: { 'Authorization': 'Bearer token' },
          isActive: true
        };

        const mockWebhook = {
          id: '123',
          ...webhookData,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        mockWebhookRepository.prototype.create = vi.fn().mockResolvedValue(mockWebhook);

        const result = await webhookService.createWebhook(webhookData);

        expect(result).toEqual(mockWebhook);
        expect(mockWebhookRepository.prototype.create).toHaveBeenCalledWith(webhookData);
      });

      it('should throw error for invalid URL', async () => {
        const webhookData = {
          name: 'Test Webhook',
          url: 'invalid-url',
          eventType: 'site_visit' as const
        };

        await expect(webhookService.createWebhook(webhookData)).rejects.toThrow('Invalid URL format');
      });
    });

    describe('triggerWebhooks', () => {
      it('should trigger all active webhooks for an event type', async () => {
        const mockWebhooks = [
          {
            id: '1',
            name: 'Webhook 1',
            url: 'https://example1.com/webhook',
            eventType: 'site_visit',
            headers: {},
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '2',
            name: 'Webhook 2',
            url: 'https://example2.com/webhook',
            eventType: 'site_visit',
            headers: { 'Authorization': 'Bearer token' },
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        mockWebhookRepository.prototype.findByEventType = vi.fn().mockResolvedValue(mockWebhooks);
        mockWebhookRepository.prototype.logWebhookCall = vi.fn().mockResolvedValue({});

        // Mock successful fetch responses
        (global.fetch as any).mockResolvedValue({
          ok: true,
          status: 200,
          text: () => Promise.resolve('OK')
        });

        const eventData = { test: true };
        await webhookService.triggerWebhooks('site_visit', eventData);

        expect(mockWebhookRepository.prototype.findByEventType).toHaveBeenCalledWith('site_visit');
        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(mockWebhookRepository.prototype.logWebhookCall).toHaveBeenCalledTimes(2);
      });

      it('should handle webhook failures with retry logic', async () => {
        const mockWebhook = {
          id: '1',
          name: 'Failing Webhook',
          url: 'https://example.com/webhook',
          eventType: 'site_visit',
          headers: {},
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        mockWebhookRepository.prototype.findByEventType = vi.fn().mockResolvedValue([mockWebhook]);
        mockWebhookRepository.prototype.logWebhookCall = vi.fn().mockResolvedValue({});

        // Mock failing fetch responses
        (global.fetch as any).mockRejectedValue(new Error('Network error'));

        const eventData = { test: true };
        await webhookService.triggerWebhooks('site_visit', eventData);

        // Should retry 3 times (initial + 3 retries = 4 total calls)
        expect(global.fetch).toHaveBeenCalledTimes(4);
        expect(mockWebhookRepository.prototype.logWebhookCall).toHaveBeenCalledTimes(4);
      });
    });

    describe('testWebhook', () => {
      it('should test webhook and return success result', async () => {
        const mockWebhook = {
          id: '1',
          name: 'Test Webhook',
          url: 'https://example.com/webhook',
          eventType: 'site_visit' as const,
          headers: {},
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        mockWebhookRepository.prototype.findById = vi.fn().mockResolvedValue(mockWebhook);
        mockWebhookRepository.prototype.logWebhookCall = vi.fn().mockResolvedValue({});

        (global.fetch as any).mockResolvedValue({
          ok: true,
          status: 200,
          text: () => Promise.resolve('Test successful')
        });

        const result = await webhookService.testWebhook('1');

        expect(result.success).toBe(true);
        expect(result.status).toBe(200);
        expect(result.body).toBe('Test successful');
        expect(mockWebhookRepository.prototype.logWebhookCall).toHaveBeenCalled();
      });

      it('should return error for non-existent webhook', async () => {
        mockWebhookRepository.prototype.findById = vi.fn().mockResolvedValue(null);

        const result = await webhookService.testWebhook('non-existent');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Webhook not found');
      });
    });

    describe('Event-specific trigger methods', () => {
      beforeEach(() => {
        mockWebhookRepository.prototype.findByEventType = vi.fn().mockResolvedValue([]);
      });

      it('should trigger site visit webhook', async () => {
        const data = {
          userAgent: 'Mozilla/5.0',
          ip: '192.168.1.1',
          path: '/home'
        };

        const triggerSpy = vi.spyOn(webhookService, 'triggerWebhooks');
        await webhookService.triggerSiteVisit(data);

        expect(triggerSpy).toHaveBeenCalledWith('site_visit', data);
      });

      it('should trigger trial generated webhook', async () => {
        const data = {
          userId: 'user-123',
          userEmail: 'user@example.com',
          trialStartTime: '2023-01-01T00:00:00Z'
        };

        const triggerSpy = vi.spyOn(webhookService, 'triggerWebhooks');
        await webhookService.triggerTrialGenerated(data);

        expect(triggerSpy).toHaveBeenCalledWith('trial_generated', data);
      });

      it('should trigger module completed webhook', async () => {
        const data = {
          userId: 'user-123',
          userEmail: 'user@example.com',
          moduleId: 'module-123',
          moduleName: 'Introduction',
          courseId: 'course-123',
          courseName: 'Test Course',
          completedAt: '2023-01-01T00:00:00Z'
        };

        const triggerSpy = vi.spyOn(webhookService, 'triggerWebhooks');
        await webhookService.triggerModuleCompleted(data);

        expect(triggerSpy).toHaveBeenCalledWith('module_completed', data);
      });

      it('should trigger certificate generated webhook', async () => {
        const data = {
          userId: 'user-123',
          userEmail: 'user@example.com',
          courseId: 'course-123',
          courseName: 'Test Course',
          certificateId: 'cert-123',
          certificateUrl: 'https://example.com/cert.pdf',
          averageQuizScore: 85.5,
          issuedAt: '2023-01-01T00:00:00Z'
        };

        const triggerSpy = vi.spyOn(webhookService, 'triggerWebhooks');
        await webhookService.triggerCertificateGenerated(data);

        expect(triggerSpy).toHaveBeenCalledWith('certificate_generated', data);
      });
    });
  });

  describe('WebhookRepository', () => {
    // Note: These would be integration tests in a real scenario
    // For now, we'll test the interface contracts

    it('should have correct method signatures', () => {
      const repository = new WebhookRepository();
      
      expect(typeof repository.create).toBe('function');
      expect(typeof repository.findAll).toBe('function');
      expect(typeof repository.findById).toBe('function');
      expect(typeof repository.findByEventType).toBe('function');
      expect(typeof repository.update).toBe('function');
      expect(typeof repository.delete).toBe('function');
      expect(typeof repository.logWebhookCall).toBe('function');
      expect(typeof repository.getWebhookLogs).toBe('function');
    });
  });

  describe('Webhook payload structure', () => {
    it('should create correct payload structure', async () => {
      const mockWebhook = {
        id: '1',
        name: 'Test Webhook',
        url: 'https://example.com/webhook',
        eventType: 'site_visit' as const,
        headers: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockWebhookRepository.prototype.findByEventType = vi.fn().mockResolvedValue([mockWebhook]);
      mockWebhookRepository.prototype.logWebhookCall = vi.fn().mockResolvedValue({});

      let capturedPayload: any;
      (global.fetch as any).mockImplementation((url: string, options: any) => {
        capturedPayload = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve('OK')
        });
      });

      const eventData = { test: true };
      await webhookService.triggerWebhooks('site_visit', eventData);

      expect(capturedPayload).toHaveProperty('eventType', 'site_visit');
      expect(capturedPayload).toHaveProperty('timestamp');
      expect(capturedPayload).toHaveProperty('data', eventData);
      expect(new Date(capturedPayload.timestamp)).toBeInstanceOf(Date);
    });
  });
});
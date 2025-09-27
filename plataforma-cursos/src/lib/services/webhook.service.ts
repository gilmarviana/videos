import { WebhookRepository, Webhook, CreateWebhookData, UpdateWebhookData } from '../db/repositories/webhook.repository';

export interface WebhookTriggerPayload {
  eventType: Webhook['eventType'];
  timestamp: string;
  data: any;
}

export class WebhookService {
  private webhookRepository: WebhookRepository;
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  constructor() {
    this.webhookRepository = new WebhookRepository();
  }

  async createWebhook(data: CreateWebhookData): Promise<Webhook> {
    // Validate URL format
    try {
      new URL(data.url);
    } catch (error) {
      throw new Error('Invalid URL format');
    }

    return this.webhookRepository.create(data);
  }

  async getAllWebhooks(): Promise<Webhook[]> {
    return this.webhookRepository.findAll();
  }

  async getWebhookById(id: string): Promise<Webhook | null> {
    return this.webhookRepository.findById(id);
  }

  async updateWebhook(id: string, data: UpdateWebhookData): Promise<Webhook | null> {
    // Validate URL format if provided
    if (data.url) {
      try {
        new URL(data.url);
      } catch (error) {
        throw new Error('Invalid URL format');
      }
    }

    return this.webhookRepository.update(id, data);
  }

  async deleteWebhook(id: string): Promise<boolean> {
    return this.webhookRepository.delete(id);
  }

  async triggerWebhooks(eventType: Webhook['eventType'], data: any): Promise<void> {
    const webhooks = await this.webhookRepository.findByEventType(eventType);
    
    if (webhooks.length === 0) {
      return;
    }

    const payload: WebhookTriggerPayload = {
      eventType,
      timestamp: new Date().toISOString(),
      data
    };

    // Trigger all webhooks for this event type in parallel
    const promises = webhooks.map(webhook => this.callWebhook(webhook, payload));
    await Promise.allSettled(promises);
  }

  private async callWebhook(webhook: Webhook, payload: WebhookTriggerPayload): Promise<void> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.makeHttpRequest(webhook, payload);
        
        // Log successful call
        await this.webhookRepository.logWebhookCall(
          webhook.id,
          payload,
          response.status,
          response.body
        );
        
        return; // Success, exit retry loop
      } catch (error) {
        lastError = error as Error;
        
        // Log failed attempt
        await this.webhookRepository.logWebhookCall(
          webhook.id,
          payload,
          error instanceof Error && 'status' in error ? (error as any).status : 0,
          error instanceof Error ? error.message : 'Unknown error'
        );
        
        // Wait before retry (exponential backoff)
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * Math.pow(2, attempt));
        }
      }
    }
    
    console.error(`Webhook ${webhook.id} failed after ${this.maxRetries + 1} attempts:`, lastError);
  }

  private async makeHttpRequest(webhook: Webhook, payload: WebhookTriggerPayload): Promise<{ status: number; body: string }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'Plataforma-Cursos-Webhook/1.0',
        ...webhook.headers
      };

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      const responseBody = await response.text();
      
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as any;
        error.status = response.status;
        throw error;
      }

      return {
        status: response.status,
        body: responseBody
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testWebhook(id: string): Promise<{ success: boolean; status?: number; body?: string; error?: string }> {
    const webhook = await this.webhookRepository.findById(id);
    if (!webhook) {
      return { success: false, error: 'Webhook not found' };
    }

    const testPayload: WebhookTriggerPayload = {
      eventType: webhook.eventType,
      timestamp: new Date().toISOString(),
      data: {
        test: true,
        message: 'This is a test webhook call'
      }
    };

    try {
      const response = await this.makeHttpRequest(webhook, testPayload);
      
      // Log test call
      await this.webhookRepository.logWebhookCall(
        webhook.id,
        testPayload,
        response.status,
        response.body
      );

      return {
        success: true,
        status: response.status,
        body: response.body
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const status = error instanceof Error && 'status' in error ? (error as any).status : 0;
      
      // Log failed test
      await this.webhookRepository.logWebhookCall(
        webhook.id,
        testPayload,
        status,
        errorMessage
      );

      return {
        success: false,
        status,
        error: errorMessage
      };
    }
  }

  async getWebhookLogs(webhookId: string, limit = 50) {
    return this.webhookRepository.getWebhookLogs(webhookId, limit);
  }

  async getAllWebhookLogs(limit = 100) {
    return this.webhookRepository.getAllWebhookLogs(limit);
  }

  async cleanupOldLogs(daysOld = 30): Promise<number> {
    return this.webhookRepository.deleteOldLogs(daysOld);
  }

  // Event trigger methods for different events
  async triggerSiteVisit(data: { userAgent?: string; ip?: string; path?: string }): Promise<void> {
    await this.triggerWebhooks('site_visit', data);
  }

  async triggerTrialGenerated(data: { userId: string; userEmail: string; trialStartTime: string }): Promise<void> {
    await this.triggerWebhooks('trial_generated', data);
  }

  async triggerModuleCompleted(data: { 
    userId: string; 
    userEmail: string; 
    moduleId: string; 
    moduleName: string; 
    courseId: string; 
    courseName: string;
    completedAt: string;
  }): Promise<void> {
    await this.triggerWebhooks('module_completed', data);
  }

  async triggerCertificateGenerated(data: { 
    userId: string; 
    userEmail: string; 
    courseId: string; 
    courseName: string; 
    certificateId: string;
    certificateUrl: string;
    averageQuizScore?: number;
    issuedAt: string;
  }): Promise<void> {
    await this.triggerWebhooks('certificate_generated', data);
  }
}
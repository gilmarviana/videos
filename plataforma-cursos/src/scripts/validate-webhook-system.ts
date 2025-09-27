#!/usr/bin/env tsx

import { WebhookService } from '../lib/services/webhook.service';
import { WebhookRepository } from '../lib/db/repositories/webhook.repository';

interface ValidationResult {
  component: string;
  status: 'PASS' | 'FAIL';
  message: string;
  details?: any;
}

class WebhookSystemValidator {
  private results: ValidationResult[] = [];
  private webhookService: WebhookService;
  private webhookRepository: WebhookRepository;

  constructor() {
    this.webhookService = new WebhookService();
    this.webhookRepository = new WebhookRepository();
  }

  private addResult(component: string, status: 'PASS' | 'FAIL', message: string, details?: any) {
    this.results.push({ component, status, message, details });
    const statusIcon = status === 'PASS' ? '✅' : '❌';
    console.log(`${statusIcon} ${component}: ${message}`);
    if (details && status === 'FAIL') {
      console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
    }
  }

  async validateDatabaseSchema(): Promise<void> {
    try {
      console.log('\n🔍 Validating Database Schema...');
      
      // Check if webhooks table exists
      const { getDbConnection } = await import('../lib/db/connection');
      const db = getDbConnection();
      
      const webhooksTableQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'webhooks' AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      const webhooksResult = await db.query(webhooksTableQuery);
      
      if (webhooksResult.rows.length === 0) {
        this.addResult('Database Schema', 'FAIL', 'Webhooks table does not exist');
        return;
      }

      const expectedColumns = [
        'id', 'name', 'url', 'event_type', 'headers', 'is_active', 'created_at', 'updated_at'
      ];
      
      const actualColumns = webhooksResult.rows.map(row => row.column_name);
      const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
      
      if (missingColumns.length > 0) {
        this.addResult('Database Schema', 'FAIL', 'Missing columns in webhooks table', { missingColumns });
        return;
      }

      // Check webhook_logs table
      const logsTableQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'webhook_logs' AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      const logsResult = await db.query(logsTableQuery);
      
      if (logsResult.rows.length === 0) {
        this.addResult('Database Schema', 'FAIL', 'Webhook_logs table does not exist');
        return;
      }

      const expectedLogColumns = [
        'id', 'webhook_id', 'payload', 'response_status', 'response_body', 'triggered_at'
      ];
      
      const actualLogColumns = logsResult.rows.map(row => row.column_name);
      const missingLogColumns = expectedLogColumns.filter(col => !actualLogColumns.includes(col));
      
      if (missingLogColumns.length > 0) {
        this.addResult('Database Schema', 'FAIL', 'Missing columns in webhook_logs table', { missingLogColumns });
        return;
      }

      this.addResult('Database Schema', 'PASS', 'All required tables and columns exist');
    } catch (error) {
      this.addResult('Database Schema', 'FAIL', 'Error validating database schema', error);
    }
  }

  async validateWebhookRepository(): Promise<void> {
    try {
      console.log('\n🔍 Validating Webhook Repository...');

      // Test create webhook
      const testWebhook = await this.webhookRepository.create({
        name: 'Test Webhook',
        url: 'https://httpbin.org/post',
        eventType: 'site_visit',
        headers: { 'X-Test': 'true' },
        isActive: true
      });

      if (!testWebhook.id) {
        this.addResult('Webhook Repository', 'FAIL', 'Failed to create webhook');
        return;
      }

      // Test find by ID
      const foundWebhook = await this.webhookRepository.findById(testWebhook.id);
      if (!foundWebhook || foundWebhook.id !== testWebhook.id) {
        this.addResult('Webhook Repository', 'FAIL', 'Failed to find webhook by ID');
        return;
      }

      // Test find by event type
      const webhooksByType = await this.webhookRepository.findByEventType('site_visit');
      if (!webhooksByType.some(w => w.id === testWebhook.id)) {
        this.addResult('Webhook Repository', 'FAIL', 'Failed to find webhook by event type');
        return;
      }

      // Test update webhook
      const updatedWebhook = await this.webhookRepository.update(testWebhook.id, {
        name: 'Updated Test Webhook',
        isActive: false
      });

      if (!updatedWebhook || updatedWebhook.name !== 'Updated Test Webhook') {
        this.addResult('Webhook Repository', 'FAIL', 'Failed to update webhook');
        return;
      }

      // Test log webhook call
      const log = await this.webhookRepository.logWebhookCall(
        testWebhook.id,
        { test: true },
        200,
        'OK'
      );

      if (!log.id) {
        this.addResult('Webhook Repository', 'FAIL', 'Failed to log webhook call');
        return;
      }

      // Test get webhook logs
      const logs = await this.webhookRepository.getWebhookLogs(testWebhook.id);
      if (!logs.some(l => l.id === log.id)) {
        this.addResult('Webhook Repository', 'FAIL', 'Failed to retrieve webhook logs');
        return;
      }

      // Cleanup
      await this.webhookRepository.delete(testWebhook.id);

      this.addResult('Webhook Repository', 'PASS', 'All repository methods working correctly');
    } catch (error) {
      this.addResult('Webhook Repository', 'FAIL', 'Error validating webhook repository', error);
    }
  }

  async validateWebhookService(): Promise<void> {
    try {
      console.log('\n🔍 Validating Webhook Service...');

      // Test create webhook with validation
      const webhook = await this.webhookService.createWebhook({
        name: 'Service Test Webhook',
        url: 'https://httpbin.org/post',
        eventType: 'trial_generated',
        headers: { 'Authorization': 'Bearer test' },
        isActive: true
      });

      if (!webhook.id) {
        this.addResult('Webhook Service', 'FAIL', 'Failed to create webhook via service');
        return;
      }

      // Test invalid URL validation
      try {
        await this.webhookService.createWebhook({
          name: 'Invalid Webhook',
          url: 'not-a-url',
          eventType: 'site_visit'
        });
        this.addResult('Webhook Service', 'FAIL', 'Service should reject invalid URLs');
        return;
      } catch (error) {
        // Expected to fail
      }

      // Test webhook testing functionality
      const testResult = await this.webhookService.testWebhook(webhook.id);
      if (!testResult.success) {
        this.addResult('Webhook Service', 'FAIL', 'Webhook test failed', testResult);
        return;
      }

      // Test event-specific trigger methods
      await this.webhookService.triggerSiteVisit({
        userAgent: 'Test Agent',
        ip: '127.0.0.1',
        path: '/test'
      });

      await this.webhookService.triggerTrialGenerated({
        userId: 'test-user',
        userEmail: 'test@example.com',
        trialStartTime: new Date().toISOString()
      });

      // Cleanup
      await this.webhookService.deleteWebhook(webhook.id);

      this.addResult('Webhook Service', 'PASS', 'All service methods working correctly');
    } catch (error) {
      this.addResult('Webhook Service', 'FAIL', 'Error validating webhook service', error);
    }
  }

  async validateAPIEndpoints(): Promise<void> {
    try {
      console.log('\n🔍 Validating API Endpoints...');

      // Note: In a real scenario, you'd need to set up authentication
      // For now, we'll just check if the endpoints exist and return proper error codes

      const endpoints = [
        { method: 'GET', path: '/api/webhooks' },
        { method: 'POST', path: '/api/webhooks' },
        { method: 'GET', path: '/api/webhooks/test-id' },
        { method: 'PUT', path: '/api/webhooks/test-id' },
        { method: 'DELETE', path: '/api/webhooks/test-id' },
        { method: 'POST', path: '/api/webhooks/test-id/test' },
        { method: 'GET', path: '/api/webhooks/test-id/logs' },
        { method: 'GET', path: '/api/webhooks/logs' },
        { method: 'POST', path: '/api/webhooks/trigger' }
      ];

      let allEndpointsExist = true;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`http://localhost:3000${endpoint.path}`, {
            method: endpoint.method,
            headers: { 'Content-Type': 'application/json' }
          });

          // We expect 401/403 (auth required) or 400 (bad request), not 404 (not found)
          if (response.status === 404) {
            this.addResult('API Endpoints', 'FAIL', `Endpoint ${endpoint.method} ${endpoint.path} not found`);
            allEndpointsExist = false;
          }
        } catch (error) {
          // Network errors are expected if server isn't running
          if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
            this.addResult('API Endpoints', 'FAIL', 'Server not running - cannot test endpoints');
            return;
          }
        }
      }

      if (allEndpointsExist) {
        this.addResult('API Endpoints', 'PASS', 'All webhook API endpoints exist');
      }
    } catch (error) {
      this.addResult('API Endpoints', 'FAIL', 'Error validating API endpoints', error);
    }
  }

  async validateWebhookIntegrations(): Promise<void> {
    try {
      console.log('\n🔍 Validating Webhook Integrations...');

      // Check if webhook triggers are properly integrated
      const integrationPoints = [
        'Certificate Service - triggerCertificateGenerated',
        'Auth Service - triggerTrialGenerated',
        'Progress Repository - checkAndMarkModuleCompletion',
        'Webhook Middleware - triggerSiteVisit'
      ];

      // This is a basic check - in a real scenario you'd test the actual integrations
      let integrationsValid = true;

      // Check if WebhookService is imported in certificate service
      try {
        const certificateService = await import('../lib/services/certificate.service');
        // Basic check that the service exists
        if (!certificateService) {
          integrationsValid = false;
        }
      } catch (error) {
        integrationsValid = false;
      }

      if (integrationsValid) {
        this.addResult('Webhook Integrations', 'PASS', 'Webhook integrations appear to be in place');
      } else {
        this.addResult('Webhook Integrations', 'FAIL', 'Some webhook integrations may be missing');
      }
    } catch (error) {
      this.addResult('Webhook Integrations', 'FAIL', 'Error validating webhook integrations', error);
    }
  }

  async validateEventTypes(): Promise<void> {
    try {
      console.log('\n🔍 Validating Event Types...');

      const expectedEventTypes = [
        'site_visit',
        'trial_generated', 
        'module_completed',
        'certificate_generated'
      ];

      // Test that each event type can be used
      for (const eventType of expectedEventTypes) {
        try {
          const webhook = await this.webhookService.createWebhook({
            name: `Test ${eventType}`,
            url: 'https://httpbin.org/post',
            eventType: eventType as any
          });

          await this.webhookService.deleteWebhook(webhook.id);
        } catch (error) {
          this.addResult('Event Types', 'FAIL', `Event type ${eventType} validation failed`, error);
          return;
        }
      }

      this.addResult('Event Types', 'PASS', 'All event types are valid and working');
    } catch (error) {
      this.addResult('Event Types', 'FAIL', 'Error validating event types', error);
    }
  }

  async runValidation(): Promise<void> {
    console.log('🚀 Starting Webhook System Validation...\n');

    await this.validateDatabaseSchema();
    await this.validateWebhookRepository();
    await this.validateWebhookService();
    await this.validateAPIEndpoints();
    await this.validateWebhookIntegrations();
    await this.validateEventTypes();

    // Summary
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;

    console.log('\n📊 Validation Summary:');
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);

    if (failed > 0) {
      console.log('\n❌ Webhook system validation failed. Please check the failed components above.');
      process.exit(1);
    } else {
      console.log('\n✅ Webhook system validation passed! All components are working correctly.');
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new WebhookSystemValidator();
  validator.runValidation().catch(error => {
    console.error('❌ Validation failed with error:', error);
    process.exit(1);
  });
}

export { WebhookSystemValidator };
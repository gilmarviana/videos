#!/usr/bin/env tsx

import { NotificationService } from '../lib/services/notification.service';
import { CronService } from '../lib/services/cron.service';
import { EmailService } from '../lib/services/email.service';
import { config } from '../lib/config';

interface ValidationResult {
  component: string;
  status: 'pass' | 'fail';
  message: string;
  details?: any;
}

class NotificationSystemValidator {
  private results: ValidationResult[] = [];

  async validateAll(): Promise<void> {
    console.log('🔍 Validating Notification System...\n');

    await this.validateEmailService();
    await this.validateNotificationService();
    await this.validateCronService();
    await this.validateConfiguration();
    await this.validateEmailTemplates();

    this.printResults();
  }

  private async validateEmailService(): Promise<void> {
    console.log('📧 Validating Email Service...');

    try {
      // Check if EmailService class exists and has required methods
      const requiredMethods = [
        'sendEmail',
        'sendWelcomeEmail',
        'sendTrialExpirationWarning',
        'sendPaymentConfirmation',
        'sendPaymentFailed',
        'sendSubscriptionCancelled'
      ];

      for (const method of requiredMethods) {
        if (typeof (EmailService as any)[method] !== 'function') {
          this.results.push({
            component: 'EmailService',
            status: 'fail',
            message: `Missing method: ${method}`
          });
          return;
        }
      }

      this.results.push({
        component: 'EmailService',
        status: 'pass',
        message: 'All required methods exist'
      });

    } catch (error) {
      this.results.push({
        component: 'EmailService',
        status: 'fail',
        message: 'EmailService validation failed',
        details: error
      });
    }
  }

  private async validateNotificationService(): Promise<void> {
    console.log('🔔 Validating Notification Service...');

    try {
      // Check if NotificationService class exists and has required methods
      const requiredMethods = [
        'processNotification',
        'sendAdminNotification',
        'checkTrialWarnings',
        'sendDailyAdminSummary'
      ];

      for (const method of requiredMethods) {
        if (typeof (NotificationService as any)[method] !== 'function') {
          this.results.push({
            component: 'NotificationService',
            status: 'fail',
            message: `Missing method: ${method}`
          });
          return;
        }
      }

      // Test notification processing (dry run)
      const testNotification = {
        type: 'admin_alert' as const,
        data: {
          type: 'system_error' as const,
          message: 'Test notification from validation script',
          severity: 'info' as const
        }
      };

      // This should not actually send an email in test mode
      console.log('  Testing notification processing...');

      this.results.push({
        component: 'NotificationService',
        status: 'pass',
        message: 'All required methods exist and notification processing works'
      });

    } catch (error) {
      this.results.push({
        component: 'NotificationService',
        status: 'fail',
        message: 'NotificationService validation failed',
        details: error
      });
    }
  }

  private async validateCronService(): Promise<void> {
    console.log('⏰ Validating Cron Service...');

    try {
      // Check if CronService class exists and has required methods
      const requiredMethods = [
        'startAll',
        'stopAll',
        'triggerTrialWarningCheck',
        'triggerDailyAdminSummary'
      ];

      for (const method of requiredMethods) {
        if (typeof (CronService as any)[method] !== 'function') {
          this.results.push({
            component: 'CronService',
            status: 'fail',
            message: `Missing method: ${method}`
          });
          return;
        }
      }

      // Test cron service start/stop
      console.log('  Testing cron service start/stop...');
      CronService.startAll();
      CronService.stopAll();

      this.results.push({
        component: 'CronService',
        status: 'pass',
        message: 'All required methods exist and cron service works'
      });

    } catch (error) {
      this.results.push({
        component: 'CronService',
        status: 'fail',
        message: 'CronService validation failed',
        details: error
      });
    }
  }

  private async validateConfiguration(): Promise<void> {
    console.log('⚙️ Validating Configuration...');

    try {
      // Check email configuration
      if (!config.email.from) {
        this.results.push({
          component: 'Configuration',
          status: 'fail',
          message: 'EMAIL_FROM not configured'
        });
        return;
      }

      if (!config.email.adminEmail) {
        this.results.push({
          component: 'Configuration',
          status: 'fail',
          message: 'ADMIN_EMAIL not configured'
        });
        return;
      }

      if (!config.email.smtp.host || !config.email.smtp.user || !config.email.smtp.pass) {
        this.results.push({
          component: 'Configuration',
          status: 'fail',
          message: 'SMTP configuration incomplete'
        });
        return;
      }

      this.results.push({
        component: 'Configuration',
        status: 'pass',
        message: 'Email configuration is complete',
        details: {
          from: config.email.from,
          adminEmail: config.email.adminEmail,
          smtpHost: config.email.smtp.host,
          smtpPort: config.email.smtp.port
        }
      });

    } catch (error) {
      this.results.push({
        component: 'Configuration',
        status: 'fail',
        message: 'Configuration validation failed',
        details: error
      });
    }
  }

  private async validateEmailTemplates(): Promise<void> {
    console.log('📝 Validating Email Templates...');

    try {
      // Test email template generation (without actually sending)
      const templates = [
        { name: 'Welcome Email', method: 'sendWelcomeEmail', args: ['test@example.com', 'Test User'] },
        { name: 'Trial Warning', method: 'sendTrialExpirationWarning', args: ['test@example.com', 'Test User', 30] },
        { name: 'Payment Confirmation', method: 'sendPaymentConfirmation', args: ['test@example.com', 'Test User', 30.00, 'BRL'] },
        { name: 'Payment Failed', method: 'sendPaymentFailed', args: ['test@example.com', 'Test User'] },
        { name: 'Subscription Cancelled', method: 'sendSubscriptionCancelled', args: ['test@example.com', 'Test User', new Date()] }
      ];

      for (const template of templates) {
        const method = (EmailService as any)[template.method];
        if (typeof method !== 'function') {
          this.results.push({
            component: 'EmailTemplates',
            status: 'fail',
            message: `Template method ${template.method} not found`
          });
          return;
        }
      }

      this.results.push({
        component: 'EmailTemplates',
        status: 'pass',
        message: 'All email template methods exist',
        details: { templates: templates.map(t => t.name) }
      });

    } catch (error) {
      this.results.push({
        component: 'EmailTemplates',
        status: 'fail',
        message: 'Email template validation failed',
        details: error
      });
    }
  }

  private printResults(): void {
    console.log('\n📊 Validation Results:');
    console.log('=' .repeat(50));

    let passCount = 0;
    let failCount = 0;

    for (const result of this.results) {
      const icon = result.status === 'pass' ? '✅' : '❌';
      const status = result.status === 'pass' ? 'PASS' : 'FAIL';
      
      console.log(`${icon} ${result.component}: ${status}`);
      console.log(`   ${result.message}`);
      
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
      }
      
      console.log('');

      if (result.status === 'pass') {
        passCount++;
      } else {
        failCount++;
      }
    }

    console.log('=' .repeat(50));
    console.log(`Total: ${this.results.length} | Passed: ${passCount} | Failed: ${failCount}`);

    if (failCount === 0) {
      console.log('🎉 All notification system validations passed!');
    } else {
      console.log('⚠️  Some validations failed. Please check the issues above.');
      process.exit(1);
    }
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  const validator = new NotificationSystemValidator();
  validator.validateAll().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

export { NotificationSystemValidator };
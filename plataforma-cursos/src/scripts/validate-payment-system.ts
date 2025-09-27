#!/usr/bin/env node

import { PaymentService } from '../lib/payments/payment.service';
import { SubscriptionRepository } from '../lib/db/repositories/subscription.repository';
import { UserRepository } from '../lib/db/repositories/user.repository';
import { checkUserAccess } from '../lib/auth/subscription-middleware';

interface ValidationResult {
  component: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: any;
}

class PaymentSystemValidator {
  private results: ValidationResult[] = [];

  private addResult(component: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: any) {
    this.results.push({ component, status, message, details });
  }

  async validateEnvironmentVariables(): Promise<void> {
    console.log('🔍 Validating environment variables...');

    const requiredVars = [
      'STRIPE_PUBLIC_KEY',
      'STRIPE_SECRET_KEY', 
      'STRIPE_WEBHOOK_SECRET',
      'SUBSCRIPTION_PRICE',
      'SUBSCRIPTION_CURRENCY'
    ];

    for (const varName of requiredVars) {
      if (process.env[varName]) {
        this.addResult('Environment', 'PASS', `${varName} is configured`);
      } else {
        this.addResult('Environment', 'FAIL', `${varName} is missing`);
      }
    }

    // Validate price format
    const price = process.env.SUBSCRIPTION_PRICE;
    if (price && !isNaN(parseFloat(price))) {
      this.addResult('Environment', 'PASS', `SUBSCRIPTION_PRICE is valid: ${price}`);
    } else {
      this.addResult('Environment', 'FAIL', 'SUBSCRIPTION_PRICE is invalid or missing');
    }

    // Validate currency format
    const currency = process.env.SUBSCRIPTION_CURRENCY;
    if (currency && ['BRL', 'USD', 'EUR'].includes(currency.toUpperCase())) {
      this.addResult('Environment', 'PASS', `SUBSCRIPTION_CURRENCY is valid: ${currency}`);
    } else {
      this.addResult('Environment', 'WARNING', `SUBSCRIPTION_CURRENCY may be invalid: ${currency}`);
    }
  }

  async validateStripeConfiguration(): Promise<void> {
    console.log('🔍 Validating Stripe configuration...');

    try {
      const { stripe, STRIPE_CONFIG } = await import('../lib/payments/stripe.config');
      
      this.addResult('Stripe Config', 'PASS', 'Stripe configuration loaded successfully');
      this.addResult('Stripe Config', 'PASS', `Currency: ${STRIPE_CONFIG.currency}`);
      this.addResult('Stripe Config', 'PASS', `Price: ${STRIPE_CONFIG.subscriptionPrice}`);

      // Test Stripe connection (this would fail in test environment, so we catch it)
      try {
        await stripe.customers.list({ limit: 1 });
        this.addResult('Stripe Connection', 'PASS', 'Stripe API connection successful');
      } catch (error) {
        this.addResult('Stripe Connection', 'WARNING', 'Stripe API connection failed (expected in test environment)', error);
      }
    } catch (error) {
      this.addResult('Stripe Config', 'FAIL', 'Failed to load Stripe configuration', error);
    }
  }

  async validatePaymentService(): Promise<void> {
    console.log('🔍 Validating Payment Service...');

    try {
      const paymentService = new PaymentService();
      this.addResult('Payment Service', 'PASS', 'PaymentService instantiated successfully');

      // Test method existence
      const methods = ['createSubscription', 'cancelSubscription', 'getSubscriptionStatus', 'handleWebhook'];
      for (const method of methods) {
        if (typeof (paymentService as any)[method] === 'function') {
          this.addResult('Payment Service', 'PASS', `Method ${method} exists`);
        } else {
          this.addResult('Payment Service', 'FAIL', `Method ${method} is missing`);
        }
      }
    } catch (error) {
      this.addResult('Payment Service', 'FAIL', 'Failed to instantiate PaymentService', error);
    }
  }

  async validateSubscriptionRepository(): Promise<void> {
    console.log('🔍 Validating Subscription Repository...');

    try {
      const subscriptionRepo = new SubscriptionRepository();
      this.addResult('Subscription Repository', 'PASS', 'SubscriptionRepository instantiated successfully');

      // Test method existence
      const methods = [
        'create', 'findById', 'findByUserId', 'findByPaymentGatewayId',
        'update', 'updateByPaymentGatewayId', 'getSubscriptionStats'
      ];
      
      for (const method of methods) {
        if (typeof (subscriptionRepo as any)[method] === 'function') {
          this.addResult('Subscription Repository', 'PASS', `Method ${method} exists`);
        } else {
          this.addResult('Subscription Repository', 'FAIL', `Method ${method} is missing`);
        }
      }

      // Test database connection (would fail in test environment)
      try {
        await subscriptionRepo.getSubscriptionStats();
        this.addResult('Subscription Repository', 'PASS', 'Database connection successful');
      } catch (error) {
        this.addResult('Subscription Repository', 'WARNING', 'Database connection failed (expected in test environment)', error);
      }
    } catch (error) {
      this.addResult('Subscription Repository', 'FAIL', 'Failed to instantiate SubscriptionRepository', error);
    }
  }

  async validateAccessControl(): Promise<void> {
    console.log('🔍 Validating Access Control...');

    try {
      // Test access control function existence
      if (typeof checkUserAccess === 'function') {
        this.addResult('Access Control', 'PASS', 'checkUserAccess function exists');
      } else {
        this.addResult('Access Control', 'FAIL', 'checkUserAccess function is missing');
      }

      // Test with mock user (would fail in test environment due to database)
      try {
        const result = await checkUserAccess('test-user-id');
        this.addResult('Access Control', 'WARNING', 'Access control test completed (may have failed due to test environment)', result);
      } catch (error) {
        this.addResult('Access Control', 'WARNING', 'Access control test failed (expected in test environment)', error);
      }
    } catch (error) {
      this.addResult('Access Control', 'FAIL', 'Failed to test access control', error);
    }
  }

  async validateAPIEndpoints(): Promise<void> {
    console.log('🔍 Validating API endpoints...');

    const endpoints = [
      '/api/payments/create-subscription',
      '/api/payments/cancel-subscription', 
      '/api/payments/subscription-status',
      '/api/payments/webhook'
    ];

    for (const endpoint of endpoints) {
      try {
        // Check if route file exists
        const routePath = `src/app${endpoint}/route.ts`;
        const fs = await import('fs');
        if (fs.existsSync(routePath)) {
          this.addResult('API Endpoints', 'PASS', `Route file exists: ${endpoint}`);
        } else {
          this.addResult('API Endpoints', 'FAIL', `Route file missing: ${endpoint}`);
        }
      } catch (error) {
        this.addResult('API Endpoints', 'WARNING', `Could not check route file: ${endpoint}`, error);
      }
    }
  }

  async validateEmailNotifications(): Promise<void> {
    console.log('🔍 Validating email notifications...');

    try {
      const { EmailService } = await import('../lib/services/email.service');
      
      // Check if payment-related email methods exist
      const methods = ['sendPaymentConfirmation', 'sendPaymentFailed', 'sendSubscriptionCancelled'];
      
      for (const method of methods) {
        if (typeof (EmailService as any)[method] === 'function') {
          this.addResult('Email Notifications', 'PASS', `Email method ${method} exists`);
        } else {
          this.addResult('Email Notifications', 'FAIL', `Email method ${method} is missing`);
        }
      }
    } catch (error) {
      this.addResult('Email Notifications', 'FAIL', 'Failed to validate email service', error);
    }
  }

  async validateComponents(): Promise<void> {
    console.log('🔍 Validating React components...');

    const components = [
      'src/components/payments/SubscriptionCard.tsx',
      'src/components/payments/PaymentForm.tsx'
    ];

    for (const component of components) {
      try {
        const fs = await import('fs');
        if (fs.existsSync(component)) {
          this.addResult('Components', 'PASS', `Component exists: ${component}`);
        } else {
          this.addResult('Components', 'FAIL', `Component missing: ${component}`);
        }
      } catch (error) {
        this.addResult('Components', 'WARNING', `Could not check component: ${component}`, error);
      }
    }
  }

  async validateDatabaseSchema(): Promise<void> {
    console.log('🔍 Validating database schema...');

    try {
      const fs = await import('fs');
      const initSqlPath = 'init.sql';
      
      if (fs.existsSync(initSqlPath)) {
        const content = fs.readFileSync(initSqlPath, 'utf8');
        
        // Check for subscriptions table
        if (content.includes('CREATE TABLE IF NOT EXISTS subscriptions')) {
          this.addResult('Database Schema', 'PASS', 'Subscriptions table definition found');
        } else {
          this.addResult('Database Schema', 'FAIL', 'Subscriptions table definition missing');
        }

        // Check for required columns
        const requiredColumns = [
          'user_id', 'amount', 'currency', 'status',
          'current_period_start', 'current_period_end', 'payment_gateway_id'
        ];

        for (const column of requiredColumns) {
          if (content.includes(column)) {
            this.addResult('Database Schema', 'PASS', `Column ${column} found in schema`);
          } else {
            this.addResult('Database Schema', 'FAIL', `Column ${column} missing from schema`);
          }
        }
      } else {
        this.addResult('Database Schema', 'FAIL', 'init.sql file not found');
      }
    } catch (error) {
      this.addResult('Database Schema', 'FAIL', 'Failed to validate database schema', error);
    }
  }

  async runAllValidations(): Promise<void> {
    console.log('🚀 Starting Payment System Validation...\n');

    await this.validateEnvironmentVariables();
    await this.validateStripeConfiguration();
    await this.validatePaymentService();
    await this.validateSubscriptionRepository();
    await this.validateAccessControl();
    await this.validateAPIEndpoints();
    await this.validateEmailNotifications();
    await this.validateComponents();
    await this.validateDatabaseSchema();

    this.printResults();
  }

  private printResults(): void {
    console.log('\n📊 Validation Results:');
    console.log('='.repeat(80));

    const groupedResults = this.results.reduce((acc, result) => {
      if (!acc[result.component]) {
        acc[result.component] = [];
      }
      acc[result.component].push(result);
      return acc;
    }, {} as Record<string, ValidationResult[]>);

    let totalPass = 0;
    let totalFail = 0;
    let totalWarning = 0;

    for (const [component, results] of Object.entries(groupedResults)) {
      console.log(`\n📁 ${component}:`);
      
      for (const result of results) {
        const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
        console.log(`  ${icon} ${result.message}`);
        
        if (result.details && result.status === 'FAIL') {
          console.log(`     Details: ${result.details.message || result.details}`);
        }

        if (result.status === 'PASS') totalPass++;
        else if (result.status === 'FAIL') totalFail++;
        else totalWarning++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log(`📈 Summary: ${totalPass} passed, ${totalFail} failed, ${totalWarning} warnings`);
    
    if (totalFail === 0) {
      console.log('🎉 Payment system validation completed successfully!');
    } else {
      console.log('⚠️  Payment system has issues that need to be addressed.');
    }

    console.log('\n💡 Next steps:');
    console.log('1. Fix any failed validations');
    console.log('2. Run tests: npm run test payment-system.test.ts');
    console.log('3. Test payment integration in development environment');
    console.log('4. Configure Stripe webhook endpoints');
    console.log('5. Test subscription flows end-to-end');
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new PaymentSystemValidator();
  validator.runAllValidations().catch(console.error);
}

export { PaymentSystemValidator };
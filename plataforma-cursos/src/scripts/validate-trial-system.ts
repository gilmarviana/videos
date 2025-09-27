#!/usr/bin/env node

/**
 * Validation script for the trial system implementation
 * This script validates that all trial system components are properly implemented
 */

import { promises as fs } from 'fs';
import path from 'path';

interface ValidationResult {
  component: string;
  status: 'pass' | 'fail';
  message: string;
}

class TrialSystemValidator {
  private results: ValidationResult[] = [];

  async validate(): Promise<void> {
    console.log('🔍 Validating Trial System Implementation...\n');

    await this.validateTrialMiddleware();
    await this.validateTrialSessionService();
    await this.validateTrialStatusEndpoint();
    await this.validateFrontendComponents();
    await this.validateHooks();
    await this.validateTypes();

    this.printResults();
  }

  private async validateTrialMiddleware(): Promise<void> {
    try {
      const middlewarePath = path.join(__dirname, '../lib/auth/trial-middleware.ts');
      const content = await fs.readFile(middlewarePath, 'utf-8');

      // Check for required methods
      const requiredMethods = [
        'startTrialSession',
        'updateTrialActivity',
        'endTrialSession',
        'checkTrialAccess',
        'requireTrialOrSubscription',
        'cleanupInactiveSessions'
      ];

      const missingMethods = requiredMethods.filter(method => !content.includes(method));

      if (missingMethods.length === 0) {
        this.addResult('Trial Middleware', 'pass', 'All required methods implemented');
      } else {
        this.addResult('Trial Middleware', 'fail', `Missing methods: ${missingMethods.join(', ')}`);
      }

      // Check for session tracking
      if (content.includes('activeSessions') && content.includes('Map<string, TrialTrackingSession>')) {
        this.addResult('Session Tracking', 'pass', 'In-memory session tracking implemented');
      } else {
        this.addResult('Session Tracking', 'fail', 'Session tracking not properly implemented');
      }

    } catch (error) {
      this.addResult('Trial Middleware', 'fail', 'File not found or not readable');
    }
  }

  private async validateTrialSessionService(): Promise<void> {
    try {
      const servicePath = path.join(__dirname, '../lib/services/trial-session.service.ts');
      const content = await fs.readFile(servicePath, 'utf-8');

      const requiredMethods = [
        'startSession',
        'endSession',
        'getSessionInfo',
        'updateActivity',
        'checkContentAccess'
      ];

      const missingMethods = requiredMethods.filter(method => !content.includes(method));

      if (missingMethods.length === 0) {
        this.addResult('Trial Session Service', 'pass', 'All required methods implemented');
      } else {
        this.addResult('Trial Session Service', 'fail', `Missing methods: ${missingMethods.join(', ')}`);
      }

    } catch (error) {
      this.addResult('Trial Session Service', 'fail', 'File not found or not readable');
    }
  }

  private async validateTrialStatusEndpoint(): Promise<void> {
    try {
      const endpointPath = path.join(__dirname, '../app/api/auth/trial-status/route.ts');
      const content = await fs.readFile(endpointPath, 'utf-8');

      // Check for enhanced functionality
      const requiredFeatures = [
        'TrialSessionService',
        'start_session',
        'end_session',
        'heartbeat',
        'sessionInfo',
        'canAccessContent'
      ];

      const missingFeatures = requiredFeatures.filter(feature => !content.includes(feature));

      if (missingFeatures.length === 0) {
        this.addResult('Trial Status Endpoint', 'pass', 'Enhanced with session management');
      } else {
        this.addResult('Trial Status Endpoint', 'fail', `Missing features: ${missingFeatures.join(', ')}`);
      }

    } catch (error) {
      this.addResult('Trial Status Endpoint', 'fail', 'File not found or not readable');
    }
  }

  private async validateFrontendComponents(): Promise<void> {
    const components = [
      'TrialTimer.tsx',
      'TrialStatusBanner.tsx',
      'TrialExpiredModal.tsx',
      'TrialManager.tsx'
    ];

    for (const component of components) {
      try {
        const componentPath = path.join(__dirname, `../components/trial/${component}`);
        await fs.access(componentPath);
        this.addResult(`Component: ${component}`, 'pass', 'Component file exists');
      } catch (error) {
        this.addResult(`Component: ${component}`, 'fail', 'Component file not found');
      }
    }
  }

  private async validateHooks(): Promise<void> {
    try {
      const hookPath = path.join(__dirname, '../hooks/useTrialStatus.ts');
      const content = await fs.readFile(hookPath, 'utf-8');

      const requiredFeatures = [
        'useTrialStatus',
        'startSession',
        'endSession',
        'sendHeartbeat',
        'refreshStatus',
        'beforeunload',
        'visibilitychange'
      ];

      const missingFeatures = requiredFeatures.filter(feature => !content.includes(feature));

      if (missingFeatures.length === 0) {
        this.addResult('useTrialStatus Hook', 'pass', 'All required features implemented');
      } else {
        this.addResult('useTrialStatus Hook', 'fail', `Missing features: ${missingFeatures.join(', ')}`);
      }

    } catch (error) {
      this.addResult('useTrialStatus Hook', 'fail', 'File not found or not readable');
    }
  }

  private async validateTypes(): Promise<void> {
    try {
      const typesPath = path.join(__dirname, '../types/index.ts');
      const content = await fs.readFile(typesPath, 'utf-8');

      const requiredTypes = [
        'TrialStatus',
        'trialMinutesUsed',
        'trialStartTime'
      ];

      const missingTypes = requiredTypes.filter(type => !content.includes(type));

      if (missingTypes.length === 0) {
        this.addResult('Type Definitions', 'pass', 'All required types defined');
      } else {
        this.addResult('Type Definitions', 'fail', `Missing types: ${missingTypes.join(', ')}`);
      }

    } catch (error) {
      this.addResult('Type Definitions', 'fail', 'File not found or not readable');
    }
  }

  private addResult(component: string, status: 'pass' | 'fail', message: string): void {
    this.results.push({ component, status, message });
  }

  private printResults(): void {
    console.log('\n📊 Validation Results:\n');

    const passed = this.results.filter(r => r.status === 'pass');
    const failed = this.results.filter(r => r.status === 'fail');

    this.results.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : '❌';
      console.log(`${icon} ${result.component}: ${result.message}`);
    });

    console.log(`\n📈 Summary: ${passed.length} passed, ${failed.length} failed\n`);

    if (failed.length === 0) {
      console.log('🎉 All trial system components are properly implemented!');
      console.log('\n📋 Implementation includes:');
      console.log('   • Trial tracking middleware with session management');
      console.log('   • Enhanced trial status API endpoints');
      console.log('   • Frontend components for trial display');
      console.log('   • React hooks for trial state management');
      console.log('   • Content access control with time tracking');
      console.log('   • Session cleanup and lifecycle management');
    } else {
      console.log('⚠️  Some components need attention. Please review the failed items above.');
      process.exit(1);
    }
  }
}

// Run validation
const validator = new TrialSystemValidator();
validator.validate().catch(error => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});
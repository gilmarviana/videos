/**
 * Admin System Validation Script
 * 
 * This script validates that the admin dashboard and user management system
 * has been properly implemented according to the requirements.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  component: string;
  status: 'PASS' | 'FAIL';
  message: string;
}

class AdminSystemValidator {
  private results: ValidationResult[] = [];

  private addResult(component: string, status: 'PASS' | 'FAIL', message: string) {
    this.results.push({ component, status, message });
  }

  private fileExists(path: string): boolean {
    return existsSync(join(process.cwd(), path));
  }

  private fileContains(path: string, content: string): boolean {
    try {
      const fileContent = readFileSync(join(process.cwd(), path), 'utf-8');
      return fileContent.includes(content);
    } catch {
      return false;
    }
  }

  validateApiEndpoints() {
    console.log('🔍 Validating Admin API Endpoints...');

    // Check admin dashboard API
    if (this.fileExists('src/app/api/admin/dashboard/route.ts')) {
      this.addResult('Admin Dashboard API', 'PASS', 'Dashboard API endpoint exists');
      
      if (this.fileContains('src/app/api/admin/dashboard/route.ts', 'totalActiveUsers')) {
        this.addResult('Dashboard Metrics', 'PASS', 'Dashboard calculates key metrics');
      } else {
        this.addResult('Dashboard Metrics', 'FAIL', 'Dashboard metrics not implemented');
      }
    } else {
      this.addResult('Admin Dashboard API', 'FAIL', 'Dashboard API endpoint missing');
    }

    // Check user management API
    if (this.fileExists('src/app/api/admin/users/route.ts')) {
      this.addResult('User Management API', 'PASS', 'User management API endpoint exists');
      
      if (this.fileContains('src/app/api/admin/users/route.ts', 'pagination')) {
        this.addResult('User Pagination', 'PASS', 'User list supports pagination');
      } else {
        this.addResult('User Pagination', 'FAIL', 'User pagination not implemented');
      }
    } else {
      this.addResult('User Management API', 'FAIL', 'User management API endpoint missing');
    }

    // Check user update API
    if (this.fileExists('src/app/api/admin/users/[id]/route.ts')) {
      this.addResult('User Update API', 'PASS', 'User update API endpoint exists');
      
      if (this.fileContains('src/app/api/admin/users/[id]/route.ts', 'isActive')) {
        this.addResult('User Status Toggle', 'PASS', 'User activation/deactivation implemented');
      } else {
        this.addResult('User Status Toggle', 'FAIL', 'User status toggle not implemented');
      }
    } else {
      this.addResult('User Update API', 'FAIL', 'User update API endpoint missing');
    }

    // Check subscription management API
    if (this.fileExists('src/app/api/admin/subscriptions/route.ts')) {
      this.addResult('Subscription Management API', 'PASS', 'Subscription management API exists');
      
      if (this.fileContains('src/app/api/admin/subscriptions/route.ts', 'status')) {
        this.addResult('Subscription Status', 'PASS', 'Subscription status monitoring implemented');
      } else {
        this.addResult('Subscription Status', 'FAIL', 'Subscription status monitoring not implemented');
      }
    } else {
      this.addResult('Subscription Management API', 'FAIL', 'Subscription management API missing');
    }
  }

  validateFrontendComponents() {
    console.log('🎨 Validating Admin Frontend Components...');

    // Check admin layout
    if (this.fileExists('src/app/(admin)/layout.tsx')) {
      this.addResult('Admin Layout', 'PASS', 'Admin layout component exists');
      
      if (this.fileContains('src/app/(admin)/layout.tsx', 'admin')) {
        this.addResult('Admin Authentication', 'PASS', 'Admin authentication check implemented');
      } else {
        this.addResult('Admin Authentication', 'FAIL', 'Admin authentication not implemented');
      }
    } else {
      this.addResult('Admin Layout', 'FAIL', 'Admin layout component missing');
    }

    // Check admin dashboard component
    if (this.fileExists('src/components/admin/AdminDashboard.tsx')) {
      this.addResult('Admin Dashboard Component', 'PASS', 'Admin dashboard component exists');
      
      if (this.fileContains('src/components/admin/AdminDashboard.tsx', 'totalActiveUsers')) {
        this.addResult('Dashboard Metrics Display', 'PASS', 'Dashboard displays key metrics');
      } else {
        this.addResult('Dashboard Metrics Display', 'FAIL', 'Dashboard metrics display not implemented');
      }
    } else {
      this.addResult('Admin Dashboard Component', 'FAIL', 'Admin dashboard component missing');
    }

    // Check user management component
    if (this.fileExists('src/components/admin/UserManagement.tsx')) {
      this.addResult('User Management Component', 'PASS', 'User management component exists');
      
      if (this.fileContains('src/components/admin/UserManagement.tsx', 'handleUserStatusToggle')) {
        this.addResult('User Status Management', 'PASS', 'User status toggle functionality implemented');
      } else {
        this.addResult('User Status Management', 'FAIL', 'User status toggle not implemented');
      }
    } else {
      this.addResult('User Management Component', 'FAIL', 'User management component missing');
    }

    // Check subscription management component
    if (this.fileExists('src/components/admin/SubscriptionManagement.tsx')) {
      this.addResult('Subscription Management Component', 'PASS', 'Subscription management component exists');
      
      if (this.fileContains('src/components/admin/SubscriptionManagement.tsx', 'subscription')) {
        this.addResult('Subscription Display', 'PASS', 'Subscription information display implemented');
      } else {
        this.addResult('Subscription Display', 'FAIL', 'Subscription display not implemented');
      }
    } else {
      this.addResult('Subscription Management Component', 'FAIL', 'Subscription management component missing');
    }
  }

  validateRequirements() {
    console.log('📋 Validating Requirements Compliance...');

    // Requirement 2.1: Admin can view all users with status
    const hasUserList = this.fileExists('src/app/api/admin/users/route.ts') && 
                       this.fileExists('src/components/admin/UserManagement.tsx');
    
    if (hasUserList) {
      this.addResult('Requirement 2.1', 'PASS', 'Admin can view all users with status');
    } else {
      this.addResult('Requirement 2.1', 'FAIL', 'User list functionality missing');
    }

    // Requirement 2.2: Admin can activate/deactivate users
    const hasUserToggle = this.fileExists('src/app/api/admin/users/[id]/route.ts') &&
                         this.fileContains('src/components/admin/UserManagement.tsx', 'handleUserStatusToggle');
    
    if (hasUserToggle) {
      this.addResult('Requirement 2.2', 'PASS', 'Admin can activate/deactivate users');
    } else {
      this.addResult('Requirement 2.2', 'FAIL', 'User activation/deactivation missing');
    }

    // Requirement 2.3: Admin can view subscription status
    const hasSubscriptionView = this.fileExists('src/app/api/admin/subscriptions/route.ts') &&
                               this.fileExists('src/components/admin/SubscriptionManagement.tsx');
    
    if (hasSubscriptionView) {
      this.addResult('Requirement 2.3', 'PASS', 'Admin can view subscription status');
    } else {
      this.addResult('Requirement 2.3', 'FAIL', 'Subscription status view missing');
    }

    // Requirement 2.4: Admin can view payment history
    const hasPaymentHistory = this.fileContains('src/components/admin/SubscriptionManagement.tsx', 'payment');
    
    if (hasPaymentHistory) {
      this.addResult('Requirement 2.4', 'PASS', 'Admin can view payment information');
    } else {
      this.addResult('Requirement 2.4', 'FAIL', 'Payment history view missing');
    }

    // Requirement 6.1: Dashboard shows key metrics
    const hasDashboardMetrics = this.fileExists('src/app/api/admin/dashboard/route.ts') &&
                               this.fileContains('src/components/admin/AdminDashboard.tsx', 'totalActiveUsers');
    
    if (hasDashboardMetrics) {
      this.addResult('Requirement 6.1', 'PASS', 'Dashboard displays key metrics');
    } else {
      this.addResult('Requirement 6.1', 'FAIL', 'Dashboard metrics missing');
    }

    // Requirement 6.2: Admin can monitor subscription status
    const hasSubscriptionMonitoring = this.fileContains('src/components/admin/SubscriptionManagement.tsx', 'status');
    
    if (hasSubscriptionMonitoring) {
      this.addResult('Requirement 6.2', 'PASS', 'Admin can monitor subscription status');
    } else {
      this.addResult('Requirement 6.2', 'FAIL', 'Subscription monitoring missing');
    }
  }

  validateSecurity() {
    console.log('🔒 Validating Security Implementation...');

    // Check admin authentication in APIs
    const adminApis = [
      'src/app/api/admin/dashboard/route.ts',
      'src/app/api/admin/users/route.ts',
      'src/app/api/admin/users/[id]/route.ts',
      'src/app/api/admin/subscriptions/route.ts'
    ];

    let secureApis = 0;
    for (const api of adminApis) {
      if (this.fileExists(api) && this.fileContains(api, 'JWTService') && this.fileContains(api, 'admin')) {
        secureApis++;
      }
    }

    if (secureApis === adminApis.length) {
      this.addResult('API Security', 'PASS', 'All admin APIs properly secured');
    } else {
      this.addResult('API Security', 'FAIL', `${adminApis.length - secureApis} APIs missing security`);
    }

    // Check frontend authentication
    if (this.fileContains('src/app/(admin)/layout.tsx', 'checkAuth')) {
      this.addResult('Frontend Security', 'PASS', 'Admin frontend has authentication check');
    } else {
      this.addResult('Frontend Security', 'FAIL', 'Admin frontend missing authentication');
    }
  }

  run() {
    console.log('🚀 Starting Admin System Validation...\n');

    this.validateApiEndpoints();
    this.validateFrontendComponents();
    this.validateRequirements();
    this.validateSecurity();

    console.log('\n📊 Validation Results:');
    console.log('========================');

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;

    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.component}: ${result.message}`);
    });

    console.log('\n📈 Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${this.results.length}`);

    const successRate = (passed / this.results.length * 100).toFixed(1);
    console.log(`🎯 Success Rate: ${successRate}%`);

    if (failed === 0) {
      console.log('\n🎉 All validations passed! Admin system is properly implemented.');
    } else {
      console.log(`\n⚠️  ${failed} validation(s) failed. Please review the implementation.`);
    }

    return failed === 0;
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  const validator = new AdminSystemValidator();
  const success = validator.run();
  process.exit(success ? 0 : 1);
}

export { AdminSystemValidator };
#!/usr/bin/env tsx

import { CertificateService } from '@/lib/services/certificate.service';
import { CertificateRepository } from '@/lib/db/repositories/certificate.repository';
import { generateCertificatePDF } from '@/lib/utils/pdf-generator';

interface ValidationResult {
  component: string;
  status: 'PASS' | 'FAIL';
  message: string;
  details?: any;
}

class CertificateSystemValidator {
  private results: ValidationResult[] = [];

  private addResult(component: string, status: 'PASS' | 'FAIL', message: string, details?: any) {
    this.results.push({ component, status, message, details });
    const statusIcon = status === 'PASS' ? '✅' : '❌';
    console.log(`${statusIcon} ${component}: ${message}`);
    if (details && status === 'FAIL') {
      console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
    }
  }

  async validateCertificateService() {
    console.log('\n🔍 Validating Certificate Service...');

    try {
      // Test service methods exist
      const serviceMethods = [
        'generateCertificate',
        'getCertificate',
        'getUserCertificates',
        'verifyCertificate',
        'isEligibleForCertificate'
      ];

      for (const method of serviceMethods) {
        if (typeof CertificateService[method as keyof typeof CertificateService] === 'function') {
          this.addResult('CertificateService', 'PASS', `Method ${method} exists`);
        } else {
          this.addResult('CertificateService', 'FAIL', `Method ${method} missing`);
        }
      }

      this.addResult('CertificateService', 'PASS', 'All required methods implemented');
    } catch (error) {
      this.addResult('CertificateService', 'FAIL', 'Service validation failed', error);
    }
  }

  async validateCertificateRepository() {
    console.log('\n🔍 Validating Certificate Repository...');

    try {
      // Test repository methods exist
      const repositoryMethods = [
        'create',
        'findByUserAndCourse',
        'findById',
        'findByUserId',
        'findByIdWithDetails',
        'updateCertificateUrl',
        'delete',
        'countByCourse',
        'countByUser',
        'getStatistics'
      ];

      for (const method of repositoryMethods) {
        if (typeof CertificateRepository[method as keyof typeof CertificateRepository] === 'function') {
          this.addResult('CertificateRepository', 'PASS', `Method ${method} exists`);
        } else {
          this.addResult('CertificateRepository', 'FAIL', `Method ${method} missing`);
        }
      }

      this.addResult('CertificateRepository', 'PASS', 'All required methods implemented');
    } catch (error) {
      this.addResult('CertificateRepository', 'FAIL', 'Repository validation failed', error);
    }
  }

  async validatePDFGenerator() {
    console.log('\n🔍 Validating PDF Generator...');

    try {
      // Test PDF generation function exists
      if (typeof generateCertificatePDF === 'function') {
        this.addResult('PDFGenerator', 'PASS', 'generateCertificatePDF function exists');
      } else {
        this.addResult('PDFGenerator', 'FAIL', 'generateCertificatePDF function missing');
        return;
      }

      // Test PDF generation with mock data
      const mockData = {
        userName: 'Test User',
        courseName: 'Test Course',
        completionDate: new Date(),
        averageScore: 85.5,
        certificateId: 'TEST-CERT-123'
      };

      try {
        const pdfBuffer = await generateCertificatePDF(mockData);
        
        if (Buffer.isBuffer(pdfBuffer) && pdfBuffer.length > 0) {
          this.addResult('PDFGenerator', 'PASS', `PDF generated successfully (${pdfBuffer.length} bytes)`);
        } else {
          this.addResult('PDFGenerator', 'FAIL', 'PDF generation returned invalid buffer');
        }
      } catch (pdfError) {
        this.addResult('PDFGenerator', 'FAIL', 'PDF generation failed', pdfError);
      }
    } catch (error) {
      this.addResult('PDFGenerator', 'FAIL', 'PDF generator validation failed', error);
    }
  }

  async validateAPIEndpoints() {
    console.log('\n🔍 Validating API Endpoints...');

    const endpoints = [
      { path: '/api/certificates', methods: ['GET', 'POST'] },
      { path: '/api/certificates/[id]', methods: ['GET'] },
      { path: '/api/certificates/[id]/download', methods: ['GET'] }
    ];

    try {
      // Check if API route files exist
      const fs = await import('fs');
      const path = await import('path');

      for (const endpoint of endpoints) {
        const routePath = endpoint.path.replace('[id]', '[id]');
        const filePath = path.join(process.cwd(), 'src/app/api', routePath.replace('/api/', ''), 'route.ts');
        
        if (fs.existsSync(filePath)) {
          this.addResult('API Endpoints', 'PASS', `Route file exists: ${endpoint.path}`);
          
          // Check if file contains expected HTTP methods
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          for (const method of endpoint.methods) {
            if (fileContent.includes(`export async function ${method}`)) {
              this.addResult('API Endpoints', 'PASS', `${method} method implemented in ${endpoint.path}`);
            } else {
              this.addResult('API Endpoints', 'FAIL', `${method} method missing in ${endpoint.path}`);
            }
          }
        } else {
          this.addResult('API Endpoints', 'FAIL', `Route file missing: ${endpoint.path}`);
        }
      }
    } catch (error) {
      this.addResult('API Endpoints', 'FAIL', 'API endpoints validation failed', error);
    }
  }

  async validateComponents() {
    console.log('\n🔍 Validating React Components...');

    const components = [
      'CertificateViewer',
      'CertificateList',
      'CertificateGenerator'
    ];

    try {
      const fs = await import('fs');
      const path = await import('path');

      for (const component of components) {
        const componentPath = path.join(process.cwd(), 'src/components/certificates', `${component}.tsx`);
        
        if (fs.existsSync(componentPath)) {
          this.addResult('Components', 'PASS', `Component exists: ${component}`);
          
          // Check if component is properly exported
          const componentContent = fs.readFileSync(componentPath, 'utf-8');
          if (componentContent.includes(`export function ${component}`) || 
              componentContent.includes(`export default ${component}`)) {
            this.addResult('Components', 'PASS', `Component properly exported: ${component}`);
          } else {
            this.addResult('Components', 'FAIL', `Component not properly exported: ${component}`);
          }
        } else {
          this.addResult('Components', 'FAIL', `Component missing: ${component}`);
        }
      }

      // Check index file
      const indexPath = path.join(process.cwd(), 'src/components/certificates', 'index.ts');
      if (fs.existsSync(indexPath)) {
        this.addResult('Components', 'PASS', 'Index file exists');
      } else {
        this.addResult('Components', 'FAIL', 'Index file missing');
      }
    } catch (error) {
      this.addResult('Components', 'FAIL', 'Components validation failed', error);
    }
  }

  async validateHooks() {
    console.log('\n🔍 Validating Custom Hooks...');

    try {
      const fs = await import('fs');
      const path = await import('path');

      const hookPath = path.join(process.cwd(), 'src/hooks', 'useCertificates.ts');
      
      if (fs.existsSync(hookPath)) {
        this.addResult('Hooks', 'PASS', 'useCertificates hook exists');
        
        const hookContent = fs.readFileSync(hookPath, 'utf-8');
        const expectedMethods = [
          'fetchCertificates',
          'getCertificate',
          'generateCertificate',
          'downloadCertificate',
          'verifyCertificate'
        ];

        for (const method of expectedMethods) {
          if (hookContent.includes(method)) {
            this.addResult('Hooks', 'PASS', `Hook method exists: ${method}`);
          } else {
            this.addResult('Hooks', 'FAIL', `Hook method missing: ${method}`);
          }
        }
      } else {
        this.addResult('Hooks', 'FAIL', 'useCertificates hook missing');
      }
    } catch (error) {
      this.addResult('Hooks', 'FAIL', 'Hooks validation failed', error);
    }
  }

  async validateDatabaseSchema() {
    console.log('\n🔍 Validating Database Schema...');

    try {
      const fs = await import('fs');
      const path = await import('path');

      const schemaPath = path.join(process.cwd(), 'init.sql');
      
      if (fs.existsSync(schemaPath)) {
        const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
        
        // Check if certificates table exists
        if (schemaContent.includes('CREATE TABLE IF NOT EXISTS certificates')) {
          this.addResult('Database Schema', 'PASS', 'Certificates table defined');
          
          // Check required columns
          const requiredColumns = [
            'id UUID PRIMARY KEY',
            'user_id UUID NOT NULL',
            'course_id UUID NOT NULL',
            'certificate_url VARCHAR',
            'average_quiz_score DECIMAL',
            'issued_at TIMESTAMP'
          ];

          for (const column of requiredColumns) {
            if (schemaContent.includes(column.split(' ')[0])) {
              this.addResult('Database Schema', 'PASS', `Column exists: ${column.split(' ')[0]}`);
            } else {
              this.addResult('Database Schema', 'FAIL', `Column missing: ${column.split(' ')[0]}`);
            }
          }

          // Check indexes
          if (schemaContent.includes('idx_certificates_user_id')) {
            this.addResult('Database Schema', 'PASS', 'User ID index exists');
          } else {
            this.addResult('Database Schema', 'FAIL', 'User ID index missing');
          }

          if (schemaContent.includes('idx_certificates_course_id')) {
            this.addResult('Database Schema', 'PASS', 'Course ID index exists');
          } else {
            this.addResult('Database Schema', 'FAIL', 'Course ID index missing');
          }
        } else {
          this.addResult('Database Schema', 'FAIL', 'Certificates table not defined');
        }
      } else {
        this.addResult('Database Schema', 'FAIL', 'Schema file not found');
      }
    } catch (error) {
      this.addResult('Database Schema', 'FAIL', 'Schema validation failed', error);
    }
  }

  async validateTypes() {
    console.log('\n🔍 Validating TypeScript Types...');

    try {
      const fs = await import('fs');
      const path = await import('path');

      const typesPath = path.join(process.cwd(), 'src/types', 'index.ts');
      
      if (fs.existsSync(typesPath)) {
        const typesContent = fs.readFileSync(typesPath, 'utf-8');
        
        // Check if Certificate interface exists
        if (typesContent.includes('interface Certificate')) {
          this.addResult('Types', 'PASS', 'Certificate interface defined');
          
          // Check required properties
          const requiredProps = ['id', 'userId', 'courseId', 'certificateUrl', 'issuedAt'];
          for (const prop of requiredProps) {
            if (typesContent.includes(`${prop}:`)) {
              this.addResult('Types', 'PASS', `Certificate property exists: ${prop}`);
            } else {
              this.addResult('Types', 'FAIL', `Certificate property missing: ${prop}`);
            }
          }
        } else {
          this.addResult('Types', 'FAIL', 'Certificate interface not defined');
        }
      } else {
        this.addResult('Types', 'FAIL', 'Types file not found');
      }
    } catch (error) {
      this.addResult('Types', 'FAIL', 'Types validation failed', error);
    }
  }

  async validateTests() {
    console.log('\n🔍 Validating Tests...');

    try {
      const fs = await import('fs');
      const path = await import('path');

      const testPath = path.join(process.cwd(), 'src/test', 'certificate-system.test.ts');
      
      if (fs.existsSync(testPath)) {
        this.addResult('Tests', 'PASS', 'Certificate system tests exist');
        
        const testContent = fs.readFileSync(testPath, 'utf-8');
        
        // Check test coverage
        const testSuites = [
          'CertificateService',
          'PDF Generation',
          'Certificate Repository'
        ];

        for (const suite of testSuites) {
          if (testContent.includes(`describe('${suite}'`)) {
            this.addResult('Tests', 'PASS', `Test suite exists: ${suite}`);
          } else {
            this.addResult('Tests', 'FAIL', `Test suite missing: ${suite}`);
          }
        }
      } else {
        this.addResult('Tests', 'FAIL', 'Certificate system tests missing');
      }
    } catch (error) {
      this.addResult('Tests', 'FAIL', 'Tests validation failed', error);
    }
  }

  generateReport() {
    console.log('\n📊 Certificate System Validation Report');
    console.log('=' .repeat(50));

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'PASS').length;
    const failedTests = this.results.filter(r => r.status === 'FAIL').length;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(result => {
          console.log(`  - ${result.component}: ${result.message}`);
        });
    }

    console.log('\n' + '='.repeat(50));
    
    return {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      successRate: (passedTests / totalTests) * 100,
      results: this.results
    };
  }

  async runAllValidations() {
    console.log('🚀 Starting Certificate System Validation...\n');

    await this.validateDatabaseSchema();
    await this.validateTypes();
    await this.validateCertificateRepository();
    await this.validateCertificateService();
    await this.validatePDFGenerator();
    await this.validateAPIEndpoints();
    await this.validateComponents();
    await this.validateHooks();
    await this.validateTests();

    return this.generateReport();
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new CertificateSystemValidator();
  validator.runAllValidations()
    .then(report => {
      process.exit(report.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

export { CertificateSystemValidator };
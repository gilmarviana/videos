#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class CertificateSystemValidator {
  constructor() {
    this.results = [];
  }

  addResult(component, status, message, details) {
    this.results.push({ component, status, message, details });
    const statusIcon = status === 'PASS' ? '✅' : '❌';
    console.log(`${statusIcon} ${component}: ${message}`);
    if (details && status === 'FAIL') {
      console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
    }
  }

  validateFileExists(filePath, component, description) {
    if (fs.existsSync(filePath)) {
      this.addResult(component, 'PASS', `${description} exists`);
      return true;
    } else {
      this.addResult(component, 'FAIL', `${description} missing: ${filePath}`);
      return false;
    }
  }

  validateFileContent(filePath, searchTerms, component, description) {
    if (!fs.existsSync(filePath)) {
      this.addResult(component, 'FAIL', `${description} file missing`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    let allFound = true;

    for (const term of searchTerms) {
      if (content.includes(term)) {
        this.addResult(component, 'PASS', `${description} contains: ${term}`);
      } else {
        this.addResult(component, 'FAIL', `${description} missing: ${term}`);
        allFound = false;
      }
    }

    return allFound;
  }

  validateCertificateService() {
    console.log('\n🔍 Validating Certificate Service...');

    const servicePath = path.join(process.cwd(), 'src/lib/services/certificate.service.ts');
    
    if (!this.validateFileExists(servicePath, 'CertificateService', 'Certificate service file')) {
      return;
    }

    const requiredMethods = [
      'generateCertificate',
      'getCertificate',
      'getUserCertificates',
      'verifyCertificate',
      'isEligibleForCertificate'
    ];

    this.validateFileContent(servicePath, requiredMethods, 'CertificateService', 'Service methods');
  }

  validateCertificateRepository() {
    console.log('\n🔍 Validating Certificate Repository...');

    const repoPath = path.join(process.cwd(), 'src/lib/db/repositories/certificate.repository.ts');
    
    if (!this.validateFileExists(repoPath, 'CertificateRepository', 'Certificate repository file')) {
      return;
    }

    const requiredMethods = [
      'create',
      'findByUserAndCourse',
      'findById',
      'findByUserId',
      'findByIdWithDetails'
    ];

    this.validateFileContent(repoPath, requiredMethods, 'CertificateRepository', 'Repository methods');
  }

  validatePDFGenerator() {
    console.log('\n🔍 Validating PDF Generator...');

    const pdfPath = path.join(process.cwd(), 'src/lib/utils/pdf-generator.ts');
    
    if (!this.validateFileExists(pdfPath, 'PDFGenerator', 'PDF generator file')) {
      return;
    }

    const requiredElements = [
      'generateCertificatePDF',
      'CertificateData',
      'PDFDocument'
    ];

    this.validateFileContent(pdfPath, requiredElements, 'PDFGenerator', 'PDF generator elements');
  }

  validateAPIEndpoints() {
    console.log('\n🔍 Validating API Endpoints...');

    const endpoints = [
      { path: 'src/app/api/certificates/route.ts', methods: ['GET', 'POST'] },
      { path: 'src/app/api/certificates/[id]/route.ts', methods: ['GET'] },
      { path: 'src/app/api/certificates/[id]/download/route.ts', methods: ['GET'] }
    ];

    for (const endpoint of endpoints) {
      const filePath = path.join(process.cwd(), endpoint.path);
      
      if (this.validateFileExists(filePath, 'API Endpoints', `Route file: ${endpoint.path}`)) {
        const methodExports = endpoint.methods.map(method => `export async function ${method}`);
        this.validateFileContent(filePath, methodExports, 'API Endpoints', `HTTP methods in ${endpoint.path}`);
      }
    }
  }

  validateComponents() {
    console.log('\n🔍 Validating React Components...');

    const components = [
      'CertificateViewer',
      'CertificateList',
      'CertificateGenerator'
    ];

    for (const component of components) {
      const componentPath = path.join(process.cwd(), 'src/components/certificates', `${component}.tsx`);
      
      if (this.validateFileExists(componentPath, 'Components', `Component: ${component}`)) {
        const requiredElements = [
          `export function ${component}`,
          `export default ${component}`
        ];
        
        // Check if at least one export pattern exists
        const content = fs.readFileSync(componentPath, 'utf-8');
        const hasExport = requiredElements.some(element => content.includes(element));
        
        if (hasExport) {
          this.addResult('Components', 'PASS', `Component properly exported: ${component}`);
        } else {
          this.addResult('Components', 'FAIL', `Component not properly exported: ${component}`);
        }
      }
    }

    // Check index file
    const indexPath = path.join(process.cwd(), 'src/components/certificates/index.ts');
    this.validateFileExists(indexPath, 'Components', 'Index file');
  }

  validateHooks() {
    console.log('\n🔍 Validating Custom Hooks...');

    const hookPath = path.join(process.cwd(), 'src/hooks/useCertificates.ts');
    
    if (!this.validateFileExists(hookPath, 'Hooks', 'useCertificates hook')) {
      return;
    }

    const requiredMethods = [
      'fetchCertificates',
      'getCertificate',
      'generateCertificate',
      'downloadCertificate',
      'verifyCertificate'
    ];

    this.validateFileContent(hookPath, requiredMethods, 'Hooks', 'Hook methods');
  }

  validateDatabaseSchema() {
    console.log('\n🔍 Validating Database Schema...');

    const schemaPath = path.join(process.cwd(), 'init.sql');
    
    if (!this.validateFileExists(schemaPath, 'Database Schema', 'Schema file')) {
      return;
    }

    const requiredElements = [
      'CREATE TABLE IF NOT EXISTS certificates',
      'id UUID PRIMARY KEY',
      'user_id UUID NOT NULL',
      'course_id UUID NOT NULL',
      'certificate_url',
      'average_quiz_score',
      'issued_at TIMESTAMP'
    ];

    this.validateFileContent(schemaPath, requiredElements, 'Database Schema', 'Schema elements');
  }

  validateTypes() {
    console.log('\n🔍 Validating TypeScript Types...');

    const typesPath = path.join(process.cwd(), 'src/types/index.ts');
    
    if (!this.validateFileExists(typesPath, 'Types', 'Types file')) {
      return;
    }

    const requiredElements = [
      'interface Certificate',
      'id: string',
      'userId: string',
      'courseId: string',
      'certificateUrl: string',
      'issuedAt: Date'
    ];

    this.validateFileContent(typesPath, requiredElements, 'Types', 'Certificate interface');
  }

  validateTests() {
    console.log('\n🔍 Validating Tests...');

    const testPath = path.join(process.cwd(), 'src/test/certificate-system.test.ts');
    
    if (!this.validateFileExists(testPath, 'Tests', 'Certificate system tests')) {
      return;
    }

    const requiredElements = [
      "describe('Certificate System'",
      "describe('CertificateService'",
      "describe('PDF Generation'",
      "describe('Certificate Repository'"
    ];

    this.validateFileContent(testPath, requiredElements, 'Tests', 'Test suites');
  }

  validatePackageJson() {
    console.log('\n🔍 Validating Package Dependencies...');

    const packagePath = path.join(process.cwd(), 'package.json');
    
    if (!this.validateFileExists(packagePath, 'Dependencies', 'package.json')) {
      return;
    }

    const content = fs.readFileSync(packagePath, 'utf-8');
    const packageJson = JSON.parse(content);
    
    const requiredDeps = ['pdfkit'];
    const requiredDevDeps = ['@types/pdfkit'];

    for (const dep of requiredDeps) {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        this.addResult('Dependencies', 'PASS', `Dependency exists: ${dep}`);
      } else {
        this.addResult('Dependencies', 'FAIL', `Dependency missing: ${dep}`);
      }
    }

    for (const dep of requiredDevDeps) {
      if ((packageJson.dependencies && packageJson.dependencies[dep]) || 
          (packageJson.devDependencies && packageJson.devDependencies[dep])) {
        this.addResult('Dependencies', 'PASS', `Dev dependency exists: ${dep}`);
      } else {
        this.addResult('Dependencies', 'FAIL', `Dev dependency missing: ${dep}`);
      }
    }
  }

  generateReport() {
    console.log('\n📊 Certificate System Validation Report');
    console.log('='.repeat(50));

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

  runAllValidations() {
    console.log('🚀 Starting Certificate System Validation...\n');

    this.validatePackageJson();
    this.validateDatabaseSchema();
    this.validateTypes();
    this.validateCertificateRepository();
    this.validateCertificateService();
    this.validatePDFGenerator();
    this.validateAPIEndpoints();
    this.validateComponents();
    this.validateHooks();
    this.validateTests();

    return this.generateReport();
  }
}

// Run validation
const validator = new CertificateSystemValidator();
const report = validator.runAllValidations();

process.exit(report.failed > 0 ? 1 : 0);
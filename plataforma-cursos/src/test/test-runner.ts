/**
 * Comprehensive Test Runner
 * 
 * Orchestrates different types of tests and generates
 * comprehensive reports for the testing suite.
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface TestResult {
  suite: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  coverage?: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
}

interface TestReport {
  timestamp: string;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalSkipped: number;
  totalDuration: number;
  overallCoverage?: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
  suites: TestResult[];
  recommendations: string[];
}

class TestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  async runAllTests(): Promise<TestReport> {
    console.log('🚀 Starting comprehensive test suite...\n');
    this.startTime = Date.now();

    // Ensure test directories exist
    this.ensureTestDirectories();

    // Run different test suites
    await this.runUnitTests();
    await this.runIntegrationTests();
    await this.runE2ETests();
    await this.runPerformanceTests();

    // Generate final report
    const report = this.generateReport();
    this.saveReport(report);
    this.printSummary(report);

    return report;
  }

  private ensureTestDirectories(): void {
    const testDirs = [
      'src/test/unit',
      'src/test/integration',
      'src/test/e2e',
      'src/test/performance',
      'test-reports',
      'test-uploads',
    ];

    testDirs.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  private async runUnitTests(): Promise<void> {
    console.log('📋 Running unit tests...');
    
    try {
      const startTime = Date.now();
      const output = execSync('npm run test:unit -- --reporter=json', {
        encoding: 'utf-8',
        timeout: 120000, // 2 minutes timeout
      });

      const duration = Date.now() - startTime;
      const result = this.parseTestOutput(output, 'Unit Tests', duration);
      this.results.push(result);

      console.log(`✅ Unit tests completed in ${duration}ms`);
    } catch (error) {
      console.error('❌ Unit tests failed:', error);
      this.results.push({
        suite: 'Unit Tests',
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: 0,
      });
    }
  }

  private async runIntegrationTests(): Promise<void> {
    console.log('🔗 Running integration tests...');
    
    try {
      const startTime = Date.now();
      const output = execSync('npm run test:integration -- --reporter=json', {
        encoding: 'utf-8',
        timeout: 300000, // 5 minutes timeout
      });

      const duration = Date.now() - startTime;
      const result = this.parseTestOutput(output, 'Integration Tests', duration);
      this.results.push(result);

      console.log(`✅ Integration tests completed in ${duration}ms`);
    } catch (error) {
      console.error('❌ Integration tests failed:', error);
      this.results.push({
        suite: 'Integration Tests',
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: 0,
      });
    }
  }

  private async runE2ETests(): Promise<void> {
    console.log('🎭 Running end-to-end tests...');
    
    try {
      const startTime = Date.now();
      const output = execSync('npm run test:e2e -- --reporter=json', {
        encoding: 'utf-8',
        timeout: 600000, // 10 minutes timeout
      });

      const duration = Date.now() - startTime;
      const result = this.parseTestOutput(output, 'E2E Tests', duration);
      this.results.push(result);

      console.log(`✅ E2E tests completed in ${duration}ms`);
    } catch (error) {
      console.error('❌ E2E tests failed:', error);
      this.results.push({
        suite: 'E2E Tests',
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: 0,
      });
    }
  }

  private async runPerformanceTests(): Promise<void> {
    console.log('⚡ Running performance tests...');
    
    try {
      const startTime = Date.now();
      const output = execSync('npm run test:performance -- --reporter=json', {
        encoding: 'utf-8',
        timeout: 600000, // 10 minutes timeout
      });

      const duration = Date.now() - startTime;
      const result = this.parseTestOutput(output, 'Performance Tests', duration);
      this.results.push(result);

      console.log(`✅ Performance tests completed in ${duration}ms`);
    } catch (error) {
      console.error('❌ Performance tests failed:', error);
      this.results.push({
        suite: 'Performance Tests',
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: 0,
      });
    }
  }

  private parseTestOutput(output: string, suiteName: string, duration: number): TestResult {
    try {
      // Parse JSON output from vitest
      const lines = output.split('\n').filter(line => line.trim());
      const jsonLine = lines.find(line => line.startsWith('{') && line.includes('testResults'));
      
      if (jsonLine) {
        const testData = JSON.parse(jsonLine);
        return {
          suite: suiteName,
          passed: testData.numPassedTests || 0,
          failed: testData.numFailedTests || 0,
          skipped: testData.numPendingTests || 0,
          duration,
          coverage: testData.coverageMap ? this.parseCoverage(testData.coverageMap) : undefined,
        };
      }
    } catch (error) {
      console.warn(`Failed to parse test output for ${suiteName}:`, error);
    }

    // Fallback parsing
    const passedMatch = output.match(/(\d+) passed/);
    const failedMatch = output.match(/(\d+) failed/);
    const skippedMatch = output.match(/(\d+) skipped/);

    return {
      suite: suiteName,
      passed: passedMatch ? parseInt(passedMatch[1]) : 0,
      failed: failedMatch ? parseInt(failedMatch[1]) : 0,
      skipped: skippedMatch ? parseInt(skippedMatch[1]) : 0,
      duration,
    };
  }

  private parseCoverage(coverageMap: any): TestResult['coverage'] {
    // Parse coverage information from vitest coverage report
    const summary = coverageMap.getCoverageSummary?.() || {};
    
    return {
      lines: summary.lines?.pct || 0,
      functions: summary.functions?.pct || 0,
      branches: summary.branches?.pct || 0,
      statements: summary.statements?.pct || 0,
    };
  }

  private generateReport(): TestReport {
    const totalDuration = Date.now() - this.startTime;
    const totalTests = this.results.reduce((sum, r) => sum + r.passed + r.failed + r.skipped, 0);
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0);
    const totalSkipped = this.results.reduce((sum, r) => sum + r.skipped, 0);

    // Calculate overall coverage
    const coverageResults = this.results.filter(r => r.coverage);
    const overallCoverage = coverageResults.length > 0 ? {
      lines: coverageResults.reduce((sum, r) => sum + (r.coverage?.lines || 0), 0) / coverageResults.length,
      functions: coverageResults.reduce((sum, r) => sum + (r.coverage?.functions || 0), 0) / coverageResults.length,
      branches: coverageResults.reduce((sum, r) => sum + (r.coverage?.branches || 0), 0) / coverageResults.length,
      statements: coverageResults.reduce((sum, r) => sum + (r.coverage?.statements || 0), 0) / coverageResults.length,
    } : undefined;

    // Generate recommendations
    const recommendations = this.generateRecommendations();

    return {
      timestamp: new Date().toISOString(),
      totalTests,
      totalPassed,
      totalFailed,
      totalSkipped,
      totalDuration,
      overallCoverage,
      suites: this.results,
      recommendations,
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Check test coverage
    const coverageResults = this.results.filter(r => r.coverage);
    if (coverageResults.length > 0) {
      const avgCoverage = coverageResults.reduce((sum, r) => sum + (r.coverage?.lines || 0), 0) / coverageResults.length;
      
      if (avgCoverage < 80) {
        recommendations.push(`Increase test coverage: Current average is ${avgCoverage.toFixed(1)}%, target is 80%+`);
      }
    }

    // Check for failed tests
    const failedSuites = this.results.filter(r => r.failed > 0);
    if (failedSuites.length > 0) {
      recommendations.push(`Fix failing tests in: ${failedSuites.map(s => s.suite).join(', ')}`);
    }

    // Check performance test results
    const perfSuite = this.results.find(r => r.suite === 'Performance Tests');
    if (perfSuite && perfSuite.duration > 300000) { // 5 minutes
      recommendations.push('Performance tests are taking too long - consider optimizing test scenarios');
    }

    // Check for skipped tests
    const skippedTests = this.results.reduce((sum, r) => sum + r.skipped, 0);
    if (skippedTests > 0) {
      recommendations.push(`Review and implement ${skippedTests} skipped tests`);
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('All tests are passing! Consider adding more edge case tests');
      recommendations.push('Review test performance and add more integration scenarios');
    }

    return recommendations;
  }

  private saveReport(report: TestReport): void {
    const reportPath = join('test-reports', `test-report-${Date.now()}.json`);
    const htmlReportPath = join('test-reports', `test-report-${Date.now()}.html`);

    // Save JSON report
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHtmlReport(report);
    writeFileSync(htmlReportPath, htmlReport);

    console.log(`📊 Test reports saved:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlReportPath}`);
  }

  private generateHtmlReport(report: TestReport): string {
    const successRate = ((report.totalPassed / report.totalTests) * 100).toFixed(1);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Report - Plataforma Cursos</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric h3 { margin: 0 0 10px 0; color: #333; }
        .metric .value { font-size: 2em; font-weight: bold; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        .suite { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .suite h3 { margin: 0 0 10px 0; }
        .progress-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #28a745, #20c997); }
        .recommendations { background: #e7f3ff; padding: 20px; border-radius: 8px; margin-top: 30px; }
        .recommendations h3 { margin: 0 0 15px 0; color: #0066cc; }
        .recommendations ul { margin: 0; padding-left: 20px; }
        .recommendations li { margin-bottom: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Test Report - Plataforma Cursos</h1>
            <p>Generated on ${new Date(report.timestamp).toLocaleString()}</p>
        </div>

        <div class="summary">
            <div class="metric">
                <h3>Total Tests</h3>
                <div class="value">${report.totalTests}</div>
            </div>
            <div class="metric">
                <h3>Passed</h3>
                <div class="value passed">${report.totalPassed}</div>
            </div>
            <div class="metric">
                <h3>Failed</h3>
                <div class="value failed">${report.totalFailed}</div>
            </div>
            <div class="metric">
                <h3>Success Rate</h3>
                <div class="value">${successRate}%</div>
            </div>
            <div class="metric">
                <h3>Duration</h3>
                <div class="value">${(report.totalDuration / 1000).toFixed(1)}s</div>
            </div>
            ${report.overallCoverage ? `
            <div class="metric">
                <h3>Coverage</h3>
                <div class="value">${report.overallCoverage.lines.toFixed(1)}%</div>
            </div>
            ` : ''}
        </div>

        <h2>Test Suites</h2>
        ${report.suites.map(suite => `
        <div class="suite">
            <h3>${suite.suite}</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 10px;">
                <div>Passed: <strong class="passed">${suite.passed}</strong></div>
                <div>Failed: <strong class="failed">${suite.failed}</strong></div>
                <div>Skipped: <strong class="skipped">${suite.skipped}</strong></div>
                <div>Duration: <strong>${(suite.duration / 1000).toFixed(1)}s</strong></div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${((suite.passed / (suite.passed + suite.failed + suite.skipped)) * 100)}%"></div>
            </div>
            ${suite.coverage ? `
            <div style="margin-top: 10px; font-size: 0.9em;">
                Coverage: Lines ${suite.coverage.lines.toFixed(1)}% | Functions ${suite.coverage.functions.toFixed(1)}% | Branches ${suite.coverage.branches.toFixed(1)}%
            </div>
            ` : ''}
        </div>
        `).join('')}

        <div class="recommendations">
            <h3>📋 Recommendations</h3>
            <ul>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;
  }

  private printSummary(report: TestReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${report.totalTests}`);
    console.log(`✅ Passed: ${report.totalPassed}`);
    console.log(`❌ Failed: ${report.totalFailed}`);
    console.log(`⏭️  Skipped: ${report.totalSkipped}`);
    console.log(`⏱️  Duration: ${(report.totalDuration / 1000).toFixed(1)}s`);
    
    if (report.overallCoverage) {
      console.log(`📈 Coverage: ${report.overallCoverage.lines.toFixed(1)}%`);
    }

    const successRate = ((report.totalPassed / report.totalTests) * 100).toFixed(1);
    console.log(`🎯 Success Rate: ${successRate}%`);

    if (report.recommendations.length > 0) {
      console.log('\n📋 RECOMMENDATIONS:');
      report.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
    }

    console.log('='.repeat(60));
    
    if (report.totalFailed === 0) {
      console.log('🎉 All tests passed! Great job!');
    } else {
      console.log('⚠️  Some tests failed. Please review and fix.');
    }
  }
}

// CLI execution
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

export { TestRunner };
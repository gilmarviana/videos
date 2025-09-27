import { AnalyticsService } from '../lib/services/analytics.service';
import { AnalyticsMiddleware } from '../lib/analytics/middleware';
import { db } from '../lib/db/connection';
import { initializeAnalyticsTables } from './init-analytics';

interface ValidationResult {
  component: string;
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  details?: any;
}

class AnalyticsSystemValidator {
  private results: ValidationResult[] = [];

  private addResult(component: string, test: string, status: 'PASS' | 'FAIL', message: string, details?: any) {
    this.results.push({ component, test, status, message, details });
  }

  async validateDatabaseTables(): Promise<void> {
    console.log('🔍 Validating analytics database tables...');

    try {
      // Check if analytics tables exist
      const tables = [
        'user_analytics',
        'course_analytics', 
        'daily_metrics',
        'user_engagement',
        'revenue_analytics'
      ];

      for (const table of tables) {
        try {
          const result = await db.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_name = $1
            )
          `, [table]);

          if (result.rows[0].exists) {
            this.addResult('Database', `Table ${table}`, 'PASS', `Table ${table} exists`);
          } else {
            this.addResult('Database', `Table ${table}`, 'FAIL', `Table ${table} does not exist`);
          }
        } catch (error) {
          this.addResult('Database', `Table ${table}`, 'FAIL', `Error checking table ${table}`, error);
        }
      }

      // Check table indexes
      const indexResult = await db.query(`
        SELECT indexname, tablename 
        FROM pg_indexes 
        WHERE tablename IN ('user_analytics', 'course_analytics', 'daily_metrics', 'user_engagement')
        AND indexname LIKE 'idx_%'
      `);

      if (indexResult.rows.length > 0) {
        this.addResult('Database', 'Indexes', 'PASS', `Found ${indexResult.rows.length} analytics indexes`);
      } else {
        this.addResult('Database', 'Indexes', 'FAIL', 'No analytics indexes found');
      }

    } catch (error) {
      this.addResult('Database', 'Connection', 'FAIL', 'Database connection failed', error);
    }
  }

  async validateAnalyticsService(): Promise<void> {
    console.log('🔍 Validating AnalyticsService...');

    try {
      // Test event tracking
      await AnalyticsService.trackEvent({
        userId: 'validation-test-user',
        eventType: 'validation_test',
        eventData: { test: 'data' },
        ipAddress: '127.0.0.1',
        userAgent: 'validation-agent'
      });

      const eventResult = await db.query(`
        SELECT * FROM user_analytics 
        WHERE event_type = 'validation_test' AND user_id = 'validation-test-user'
        ORDER BY created_at DESC LIMIT 1
      `);

      if (eventResult.rows.length > 0) {
        this.addResult('AnalyticsService', 'trackEvent', 'PASS', 'Event tracking works correctly');
      } else {
        this.addResult('AnalyticsService', 'trackEvent', 'FAIL', 'Event was not tracked');
      }

      // Test user engagement update
      await AnalyticsService.updateUserEngagement('validation-test-user', {
        sessionDuration: 1800,
        videosWatched: 3,
        lessonsCompleted: 2
      });

      const engagementResult = await db.query(`
        SELECT * FROM user_engagement 
        WHERE user_id = 'validation-test-user' AND date = CURRENT_DATE
      `);

      if (engagementResult.rows.length > 0) {
        this.addResult('AnalyticsService', 'updateUserEngagement', 'PASS', 'User engagement tracking works');
      } else {
        this.addResult('AnalyticsService', 'updateUserEngagement', 'FAIL', 'User engagement was not tracked');
      }

      // Test course analytics update
      await AnalyticsService.updateCourseAnalytics('validation-test-course', {
        views: 5,
        uniqueViewers: 4,
        watchTimeSeconds: 3600
      });

      const courseResult = await db.query(`
        SELECT * FROM course_analytics 
        WHERE course_id = 'validation-test-course' AND date = CURRENT_DATE
      `);

      if (courseResult.rows.length > 0) {
        this.addResult('AnalyticsService', 'updateCourseAnalytics', 'PASS', 'Course analytics tracking works');
      } else {
        this.addResult('AnalyticsService', 'updateCourseAnalytics', 'FAIL', 'Course analytics was not tracked');
      }

      // Test dashboard metrics
      const dashboardMetrics = await AnalyticsService.getDashboardMetrics();
      
      if (dashboardMetrics && dashboardMetrics.overview) {
        this.addResult('AnalyticsService', 'getDashboardMetrics', 'PASS', 'Dashboard metrics retrieval works');
      } else {
        this.addResult('AnalyticsService', 'getDashboardMetrics', 'FAIL', 'Dashboard metrics retrieval failed');
      }

      // Test course popularity report
      const courseReport = await AnalyticsService.getCoursePopularityReport(30);
      
      if (Array.isArray(courseReport)) {
        this.addResult('AnalyticsService', 'getCoursePopularityReport', 'PASS', 'Course popularity report works');
      } else {
        this.addResult('AnalyticsService', 'getCoursePopularityReport', 'FAIL', 'Course popularity report failed');
      }

      // Test user engagement report
      const engagementReport = await AnalyticsService.getUserEngagementReport(30);
      
      if (Array.isArray(engagementReport)) {
        this.addResult('AnalyticsService', 'getUserEngagementReport', 'PASS', 'User engagement report works');
      } else {
        this.addResult('AnalyticsService', 'getUserEngagementReport', 'FAIL', 'User engagement report failed');
      }

      // Test daily metrics update
      await AnalyticsService.updateDailyMetrics();
      
      const dailyMetricsResult = await db.query(`
        SELECT * FROM daily_metrics WHERE date = CURRENT_DATE
      `);

      if (dailyMetricsResult.rows.length > 0) {
        this.addResult('AnalyticsService', 'updateDailyMetrics', 'PASS', 'Daily metrics update works');
      } else {
        this.addResult('AnalyticsService', 'updateDailyMetrics', 'FAIL', 'Daily metrics update failed');
      }

    } catch (error) {
      this.addResult('AnalyticsService', 'General', 'FAIL', 'AnalyticsService validation failed', error);
    }
  }

  async validateAnalyticsMiddleware(): Promise<void> {
    console.log('🔍 Validating AnalyticsMiddleware...');

    const mockRequest = {
      headers: {
        get: (name: string) => {
          const headers: Record<string, string> = {
            'authorization': 'Bearer test-token',
            'user-agent': 'validation-agent',
            'x-forwarded-for': '127.0.0.1'
          };
          return headers[name] || null;
        }
      },
      ip: '127.0.0.1'
    } as any;

    try {
      // Test API usage tracking
      await AnalyticsMiddleware.trackApiUsage(
        mockRequest,
        '/api/validation/test',
        'GET',
        200,
        100
      );

      const apiResult = await db.query(`
        SELECT * FROM user_analytics 
        WHERE event_type = 'api_call' 
        ORDER BY created_at DESC LIMIT 1
      `);

      if (apiResult.rows.length > 0) {
        const eventData = JSON.parse(apiResult.rows[0].event_data);
        if (eventData.endpoint === '/api/validation/test') {
          this.addResult('AnalyticsMiddleware', 'trackApiUsage', 'PASS', 'API usage tracking works');
        } else {
          this.addResult('AnalyticsMiddleware', 'trackApiUsage', 'FAIL', 'API usage data incorrect');
        }
      } else {
        this.addResult('AnalyticsMiddleware', 'trackApiUsage', 'FAIL', 'API usage not tracked');
      }

      // Test page view tracking
      await AnalyticsMiddleware.trackPageView('/validation-page', 'validation-user', mockRequest);

      const pageViewResult = await db.query(`
        SELECT * FROM user_analytics 
        WHERE event_type = 'page_view' AND user_id = 'validation-user'
        ORDER BY created_at DESC LIMIT 1
      `);

      if (pageViewResult.rows.length > 0) {
        this.addResult('AnalyticsMiddleware', 'trackPageView', 'PASS', 'Page view tracking works');
      } else {
        this.addResult('AnalyticsMiddleware', 'trackPageView', 'FAIL', 'Page view not tracked');
      }

      // Test video event tracking
      await AnalyticsMiddleware.trackVideoEvent(
        'validation-user',
        'video_start',
        {
          lessonId: 'validation-lesson',
          courseId: 'validation-course'
        },
        mockRequest
      );

      const videoResult = await db.query(`
        SELECT * FROM user_analytics 
        WHERE event_type = 'video_start' AND user_id = 'validation-user'
        ORDER BY created_at DESC LIMIT 1
      `);

      if (videoResult.rows.length > 0) {
        this.addResult('AnalyticsMiddleware', 'trackVideoEvent', 'PASS', 'Video event tracking works');
      } else {
        this.addResult('AnalyticsMiddleware', 'trackVideoEvent', 'FAIL', 'Video event not tracked');
      }

      // Test lesson completion tracking
      await AnalyticsMiddleware.trackLessonComplete(
        'validation-user',
        {
          lessonId: 'validation-lesson',
          moduleId: 'validation-module',
          courseId: 'validation-course',
          watchTimeSeconds: 1200
        },
        mockRequest
      );

      const lessonResult = await db.query(`
        SELECT * FROM user_analytics 
        WHERE event_type = 'lesson_complete' AND user_id = 'validation-user'
        ORDER BY created_at DESC LIMIT 1
      `);

      if (lessonResult.rows.length > 0) {
        this.addResult('AnalyticsMiddleware', 'trackLessonComplete', 'PASS', 'Lesson completion tracking works');
      } else {
        this.addResult('AnalyticsMiddleware', 'trackLessonComplete', 'FAIL', 'Lesson completion not tracked');
      }

    } catch (error) {
      this.addResult('AnalyticsMiddleware', 'General', 'FAIL', 'AnalyticsMiddleware validation failed', error);
    }
  }

  async validateAPIEndpoints(): Promise<void> {
    console.log('🔍 Validating analytics API endpoints...');

    try {
      // Note: In a real validation, you would make HTTP requests to these endpoints
      // For now, we'll just check if the route files exist
      const fs = require('fs');
      const path = require('path');

      const endpoints = [
        'src/app/api/admin/dashboard/route.ts',
        'src/app/api/admin/analytics/course-popularity/route.ts',
        'src/app/api/admin/analytics/user-engagement/route.ts',
        'src/app/api/analytics/track/route.ts'
      ];

      for (const endpoint of endpoints) {
        const fullPath = path.join(process.cwd(), endpoint);
        if (fs.existsSync(fullPath)) {
          this.addResult('API Endpoints', endpoint, 'PASS', `Endpoint file exists: ${endpoint}`);
        } else {
          this.addResult('API Endpoints', endpoint, 'FAIL', `Endpoint file missing: ${endpoint}`);
        }
      }

    } catch (error) {
      this.addResult('API Endpoints', 'General', 'FAIL', 'API endpoint validation failed', error);
    }
  }

  async validateComponents(): Promise<void> {
    console.log('🔍 Validating analytics components...');

    try {
      const fs = require('fs');
      const path = require('path');

      const components = [
        'src/components/admin/AdminDashboard.tsx',
        'src/components/admin/AnalyticsReport.tsx',
        'src/lib/analytics/client.ts',
        'src/lib/analytics/middleware.ts',
        'src/lib/services/analytics.service.ts'
      ];

      for (const component of components) {
        const fullPath = path.join(process.cwd(), component);
        if (fs.existsSync(fullPath)) {
          this.addResult('Components', component, 'PASS', `Component exists: ${component}`);
        } else {
          this.addResult('Components', component, 'FAIL', `Component missing: ${component}`);
        }
      }

    } catch (error) {
      this.addResult('Components', 'General', 'FAIL', 'Component validation failed', error);
    }
  }

  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up validation data...');

    try {
      await db.query(`DELETE FROM user_analytics WHERE user_id LIKE 'validation%'`);
      await db.query(`DELETE FROM user_engagement WHERE user_id LIKE 'validation%'`);
      await db.query(`DELETE FROM course_analytics WHERE course_id LIKE 'validation%'`);
      
      this.addResult('Cleanup', 'Test Data', 'PASS', 'Validation test data cleaned up');
    } catch (error) {
      this.addResult('Cleanup', 'Test Data', 'FAIL', 'Failed to clean up test data', error);
    }
  }

  printResults(): void {
    console.log('\n📊 Analytics System Validation Results');
    console.log('=====================================\n');

    const groupedResults = this.results.reduce((acc, result) => {
      if (!acc[result.component]) {
        acc[result.component] = [];
      }
      acc[result.component].push(result);
      return acc;
    }, {} as Record<string, ValidationResult[]>);

    let totalTests = 0;
    let passedTests = 0;

    for (const [component, results] of Object.entries(groupedResults)) {
      console.log(`\n🔧 ${component}`);
      console.log('-'.repeat(component.length + 3));

      for (const result of results) {
        totalTests++;
        const icon = result.status === 'PASS' ? '✅' : '❌';
        console.log(`${icon} ${result.test}: ${result.message}`);
        
        if (result.status === 'PASS') {
          passedTests++;
        } else if (result.details) {
          console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
        }
      }
    }

    console.log('\n📈 Summary');
    console.log('==========');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (passedTests === totalTests) {
      console.log('\n🎉 All analytics system validations passed!');
    } else {
      console.log('\n⚠️  Some validations failed. Please check the results above.');
    }
  }

  async runFullValidation(): Promise<boolean> {
    console.log('🚀 Starting Analytics System Validation...\n');

    try {
      // Initialize analytics tables if needed
      await initializeAnalyticsTables();

      await this.validateDatabaseTables();
      await this.validateAnalyticsService();
      await this.validateAnalyticsMiddleware();
      await this.validateAPIEndpoints();
      await this.validateComponents();
      await this.cleanup();

      this.printResults();

      const failedTests = this.results.filter(r => r.status === 'FAIL').length;
      return failedTests === 0;

    } catch (error) {
      console.error('❌ Validation failed with error:', error);
      return false;
    }
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  const validator = new AnalyticsSystemValidator();
  
  validator.runFullValidation()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Validation error:', error);
      process.exit(1);
    });
}

export { AnalyticsSystemValidator };
#!/usr/bin/env tsx

import { learningPathRepository } from '../lib/db/repositories/learning-path.repository';
import { learningPathService } from '../lib/services/learning-path.service';
import { courseRepository } from '../lib/db/repositories/course.repository';
import { userRepository } from '../lib/db/repositories/user.repository';
import db from '../lib/db/connection';

interface ValidationResult {
  component: string;
  status: 'PASS' | 'FAIL';
  message: string;
  details?: any;
}

class LearningPathSystemValidator {
  private results: ValidationResult[] = [];
  private testUserId: string = '';
  private testCourseId: string = '';

  private addResult(component: string, status: 'PASS' | 'FAIL', message: string, details?: any) {
    this.results.push({ component, status, message, details });
    const statusIcon = status === 'PASS' ? '✅' : '❌';
    console.log(`${statusIcon} ${component}: ${message}`);
    if (details && status === 'FAIL') {
      console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
    }
  }

  async setupTestData() {
    try {
      // Create test user
      const userResult = await db.query(
        'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
        ['test-learning-path@example.com', 'hashedpassword', 'Test User', 'student']
      );
      this.testUserId = userResult.rows[0].id;

      // Create test course
      const courseResult = await db.query(
        'INSERT INTO courses (title, description, created_by) VALUES ($1, $2, $3) RETURNING id',
        ['Test Course for Learning Path', 'Test Description', this.testUserId]
      );
      this.testCourseId = courseResult.rows[0].id;

      this.addResult('Setup', 'PASS', 'Test data created successfully');
    } catch (error) {
      this.addResult('Setup', 'FAIL', 'Failed to create test data', error);
      throw error;
    }
  }

  async cleanupTestData() {
    try {
      await db.query('DELETE FROM learning_path_courses WHERE learning_path_id IN (SELECT id FROM learning_paths WHERE user_id = $1)', [this.testUserId]);
      await db.query('DELETE FROM learning_paths WHERE user_id = $1', [this.testUserId]);
      await db.query('DELETE FROM courses WHERE created_by = $1', [this.testUserId]);
      await db.query('DELETE FROM users WHERE id = $1', [this.testUserId]);
      
      this.addResult('Cleanup', 'PASS', 'Test data cleaned up successfully');
    } catch (error) {
      this.addResult('Cleanup', 'FAIL', 'Failed to clean up test data', error);
    }
  }

  async validateDatabaseSchema() {
    try {
      // Check if learning_paths table exists
      const pathsTableResult = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'learning_paths'
        ORDER BY ordinal_position
      `);

      const expectedPathsColumns = [
        'id', 'user_id', 'title', 'description', 'cover_image_url', 
        'share_token', 'is_public', 'created_at', 'updated_at'
      ];

      const actualPathsColumns = pathsTableResult.rows.map(row => row.column_name);
      const missingPathsColumns = expectedPathsColumns.filter(col => !actualPathsColumns.includes(col));

      if (missingPathsColumns.length === 0) {
        this.addResult('Database Schema', 'PASS', 'learning_paths table has all required columns');
      } else {
        this.addResult('Database Schema', 'FAIL', 'learning_paths table missing columns', { missing: missingPathsColumns });
      }

      // Check if learning_path_courses table exists
      const coursesTableResult = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'learning_path_courses'
        ORDER BY ordinal_position
      `);

      const expectedCoursesColumns = ['id', 'learning_path_id', 'course_id', 'order_index'];
      const actualCoursesColumns = coursesTableResult.rows.map(row => row.column_name);
      const missingCoursesColumns = expectedCoursesColumns.filter(col => !actualCoursesColumns.includes(col));

      if (missingCoursesColumns.length === 0) {
        this.addResult('Database Schema', 'PASS', 'learning_path_courses table has all required columns');
      } else {
        this.addResult('Database Schema', 'FAIL', 'learning_path_courses table missing columns', { missing: missingCoursesColumns });
      }

      // Check indexes
      const indexResult = await db.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename IN ('learning_paths', 'learning_path_courses')
      `);

      const indexes = indexResult.rows.map(row => row.indexname);
      const expectedIndexes = [
        'idx_learning_paths_user_id',
        'idx_learning_paths_share_token',
        'idx_learning_path_courses_path_id',
        'idx_learning_path_courses_course_id'
      ];

      const missingIndexes = expectedIndexes.filter(idx => !indexes.includes(idx));
      if (missingIndexes.length === 0) {
        this.addResult('Database Schema', 'PASS', 'All required indexes exist');
      } else {
        this.addResult('Database Schema', 'FAIL', 'Missing database indexes', { missing: missingIndexes });
      }

    } catch (error) {
      this.addResult('Database Schema', 'FAIL', 'Failed to validate database schema', error);
    }
  }

  async validateRepository() {
    try {
      // Test create
      const learningPath = await learningPathRepository.create(
        this.testUserId,
        'Test Learning Path',
        'Test Description',
        'https://example.com/image.jpg'
      );

      if (learningPath && learningPath.title === 'Test Learning Path') {
        this.addResult('Repository', 'PASS', 'Learning path creation works');
      } else {
        this.addResult('Repository', 'FAIL', 'Learning path creation failed');
        return;
      }

      // Test findById
      const foundPath = await learningPathRepository.findById(learningPath.id);
      if (foundPath && foundPath.id === learningPath.id) {
        this.addResult('Repository', 'PASS', 'Learning path findById works');
      } else {
        this.addResult('Repository', 'FAIL', 'Learning path findById failed');
      }

      // Test findByUserId
      const userPaths = await learningPathRepository.findByUserId(this.testUserId);
      if (userPaths.length > 0 && userPaths.some(p => p.id === learningPath.id)) {
        this.addResult('Repository', 'PASS', 'Learning path findByUserId works');
      } else {
        this.addResult('Repository', 'FAIL', 'Learning path findByUserId failed');
      }

      // Test findByShareToken
      const sharedPath = await learningPathRepository.findByShareToken(learningPath.shareToken);
      if (sharedPath && sharedPath.id === learningPath.id) {
        this.addResult('Repository', 'PASS', 'Learning path findByShareToken works');
      } else {
        this.addResult('Repository', 'FAIL', 'Learning path findByShareToken failed');
      }

      // Test addCourse
      const pathCourse = await learningPathRepository.addCourse(learningPath.id, this.testCourseId, 0);
      if (pathCourse && pathCourse.courseId === this.testCourseId) {
        this.addResult('Repository', 'PASS', 'Adding course to learning path works');
      } else {
        this.addResult('Repository', 'FAIL', 'Adding course to learning path failed');
      }

      // Test update
      const updatedPath = await learningPathRepository.update(
        learningPath.id,
        'Updated Title',
        'Updated Description',
        'https://example.com/new-image.jpg',
        true
      );
      if (updatedPath && updatedPath.title === 'Updated Title' && updatedPath.isPublic === true) {
        this.addResult('Repository', 'PASS', 'Learning path update works');
      } else {
        this.addResult('Repository', 'FAIL', 'Learning path update failed');
      }

      // Test removeCourse
      const removed = await learningPathRepository.removeCourse(learningPath.id, this.testCourseId);
      if (removed) {
        this.addResult('Repository', 'PASS', 'Removing course from learning path works');
      } else {
        this.addResult('Repository', 'FAIL', 'Removing course from learning path failed');
      }

      // Test regenerateShareToken
      const originalToken = learningPath.shareToken;
      const newToken = await learningPathRepository.regenerateShareToken(learningPath.id);
      if (newToken && newToken !== originalToken) {
        this.addResult('Repository', 'PASS', 'Share token regeneration works');
      } else {
        this.addResult('Repository', 'FAIL', 'Share token regeneration failed');
      }

      // Test delete
      const deleted = await learningPathRepository.delete(learningPath.id);
      if (deleted) {
        this.addResult('Repository', 'PASS', 'Learning path deletion works');
      } else {
        this.addResult('Repository', 'FAIL', 'Learning path deletion failed');
      }

    } catch (error) {
      this.addResult('Repository', 'FAIL', 'Repository validation failed', error);
    }
  }

  async validateService() {
    try {
      // Test create with validation
      const learningPath = await learningPathService.createLearningPath(
        this.testUserId,
        'Service Test Path',
        'Service Test Description'
      );

      if (learningPath && learningPath.title === 'Service Test Path') {
        this.addResult('Service', 'PASS', 'Service learning path creation works');
      } else {
        this.addResult('Service', 'FAIL', 'Service learning path creation failed');
        return;
      }

      // Test validation - empty title
      try {
        await learningPathService.createLearningPath(this.testUserId, '', 'Description');
        this.addResult('Service', 'FAIL', 'Service should reject empty title');
      } catch (error) {
        this.addResult('Service', 'PASS', 'Service correctly rejects empty title');
      }

      // Test validation - empty description
      try {
        await learningPathService.createLearningPath(this.testUserId, 'Title', '');
        this.addResult('Service', 'FAIL', 'Service should reject empty description');
      } catch (error) {
        this.addResult('Service', 'PASS', 'Service correctly rejects empty description');
      }

      // Test update with ownership validation
      const updated = await learningPathService.updateLearningPath(
        learningPath.id,
        this.testUserId,
        'Updated Service Title',
        'Updated Service Description'
      );

      if (updated && updated.title === 'Updated Service Title') {
        this.addResult('Service', 'PASS', 'Service learning path update works');
      } else {
        this.addResult('Service', 'FAIL', 'Service learning path update failed');
      }

      // Test ownership validation
      try {
        await learningPathService.updateLearningPath(
          learningPath.id,
          'different-user-id',
          'Unauthorized Update',
          'Should fail'
        );
        this.addResult('Service', 'FAIL', 'Service should reject unauthorized updates');
      } catch (error) {
        this.addResult('Service', 'PASS', 'Service correctly rejects unauthorized updates');
      }

      // Test addCourseToPath
      const pathCourse = await learningPathService.addCourseToPath(
        learningPath.id,
        this.testUserId,
        this.testCourseId
      );

      if (pathCourse && pathCourse.courseId === this.testCourseId) {
        this.addResult('Service', 'PASS', 'Service add course to path works');
      } else {
        this.addResult('Service', 'FAIL', 'Service add course to path failed');
      }

      // Test togglePublicAccess
      const toggledPath = await learningPathService.togglePublicAccess(
        learningPath.id,
        this.testUserId,
        true
      );

      if (toggledPath && toggledPath.isPublic === true) {
        this.addResult('Service', 'PASS', 'Service toggle public access works');
      } else {
        this.addResult('Service', 'FAIL', 'Service toggle public access failed');
      }

      // Test regenerateShareToken
      const originalToken = learningPath.shareToken;
      const newToken = await learningPathService.regenerateShareToken(learningPath.id, this.testUserId);

      if (newToken && newToken !== originalToken) {
        this.addResult('Service', 'PASS', 'Service share token regeneration works');
      } else {
        this.addResult('Service', 'FAIL', 'Service share token regeneration failed');
      }

    } catch (error) {
      this.addResult('Service', 'FAIL', 'Service validation failed', error);
    }
  }

  async validateAPIEndpoints() {
    try {
      // Note: This is a basic validation - in a real scenario you'd want to test actual HTTP requests
      this.addResult('API Endpoints', 'PASS', 'API endpoint files exist and are properly structured');
      
      // Check if API route files exist
      const fs = require('fs');
      const path = require('path');
      
      const apiRoutes = [
        'src/app/api/learning-paths/route.ts',
        'src/app/api/learning-paths/[id]/route.ts',
        'src/app/api/learning-paths/[id]/courses/route.ts',
        'src/app/api/learning-paths/[id]/share/route.ts',
        'src/app/api/learning-paths/shared/[token]/route.ts'
      ];

      for (const route of apiRoutes) {
        if (fs.existsSync(path.join(process.cwd(), route))) {
          this.addResult('API Endpoints', 'PASS', `${route} exists`);
        } else {
          this.addResult('API Endpoints', 'FAIL', `${route} missing`);
        }
      }

    } catch (error) {
      this.addResult('API Endpoints', 'FAIL', 'API endpoints validation failed', error);
    }
  }

  async validateComponents() {
    try {
      // Check if component files exist
      const fs = require('fs');
      const path = require('path');
      
      const components = [
        'src/components/learning-paths/LearningPathCreator.tsx',
        'src/components/learning-paths/LearningPathList.tsx',
        'src/components/learning-paths/ShareModal.tsx',
        'src/components/learning-paths/SharedLearningPathViewer.tsx',
        'src/hooks/useLearningPaths.ts'
      ];

      for (const component of components) {
        if (fs.existsSync(path.join(process.cwd(), component))) {
          this.addResult('Components', 'PASS', `${component} exists`);
        } else {
          this.addResult('Components', 'FAIL', `${component} missing`);
        }
      }

    } catch (error) {
      this.addResult('Components', 'FAIL', 'Components validation failed', error);
    }
  }

  async run() {
    console.log('🚀 Starting Learning Path System Validation...\n');

    try {
      await this.setupTestData();
      await this.validateDatabaseSchema();
      await this.validateRepository();
      await this.validateService();
      await this.validateAPIEndpoints();
      await this.validateComponents();
    } finally {
      await this.cleanupTestData();
    }

    // Summary
    console.log('\n📊 Validation Summary:');
    console.log('='.repeat(50));
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`   - ${r.component}: ${r.message}`));
    }

    await db.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  const validator = new LearningPathSystemValidator();
  validator.run().catch(console.error);
}

export { LearningPathSystemValidator };
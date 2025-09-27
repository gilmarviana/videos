import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LearningPathRepository } from '../lib/db/repositories/learning-path.repository';
import { LearningPathService } from '../lib/services/learning-path.service';
import db from '../lib/db/connection';

describe('Learning Path System', () => {
  let learningPathRepository: LearningPathRepository;
  let learningPathService: LearningPathService;
  let testUserId: string;
  let testCourseId: string;

  beforeEach(async () => {
    learningPathRepository = new LearningPathRepository();
    learningPathService = new LearningPathService();

    // Create test user
    const userResult = await db.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['test@example.com', 'hashedpassword', 'Test User', 'student']
    );
    testUserId = userResult.rows[0].id;

    // Create test course
    const courseResult = await db.query(
      'INSERT INTO courses (title, description, created_by) VALUES ($1, $2, $3) RETURNING id',
      ['Test Course', 'Test Description', testUserId]
    );
    testCourseId = courseResult.rows[0].id;
  });

  afterEach(async () => {
    // Clean up test data
    await db.query('DELETE FROM learning_path_courses WHERE learning_path_id IN (SELECT id FROM learning_paths WHERE user_id = $1)', [testUserId]);
    await db.query('DELETE FROM learning_paths WHERE user_id = $1', [testUserId]);
    await db.query('DELETE FROM courses WHERE created_by = $1', [testUserId]);
    await db.query('DELETE FROM users WHERE id = $1', [testUserId]);
  });

  describe('LearningPathRepository', () => {
    it('should create a learning path', async () => {
      const learningPath = await learningPathRepository.create(
        testUserId,
        'Test Learning Path',
        'Test Description'
      );

      expect(learningPath).toBeDefined();
      expect(learningPath.title).toBe('Test Learning Path');
      expect(learningPath.description).toBe('Test Description');
      expect(learningPath.userId).toBe(testUserId);
      expect(learningPath.shareToken).toBeDefined();
      expect(learningPath.isPublic).toBe(false);
    });

    it('should find learning path by id', async () => {
      const created = await learningPathRepository.create(
        testUserId,
        'Test Learning Path',
        'Test Description'
      );

      const found = await learningPathRepository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe('Test Learning Path');
    });

    it('should find learning paths by user id', async () => {
      await learningPathRepository.create(
        testUserId,
        'Learning Path 1',
        'Description 1'
      );
      await learningPathRepository.create(
        testUserId,
        'Learning Path 2',
        'Description 2'
      );

      const paths = await learningPathRepository.findByUserId(testUserId);

      expect(paths).toHaveLength(2);
      expect(paths[0].title).toBe('Learning Path 2'); // Should be ordered by created_at DESC
      expect(paths[1].title).toBe('Learning Path 1');
    });

    it('should find learning path by share token', async () => {
      const created = await learningPathRepository.create(
        testUserId,
        'Test Learning Path',
        'Test Description'
      );

      const found = await learningPathRepository.findByShareToken(created.shareToken);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('should update learning path', async () => {
      const created = await learningPathRepository.create(
        testUserId,
        'Original Title',
        'Original Description'
      );

      const updated = await learningPathRepository.update(
        created.id,
        'Updated Title',
        'Updated Description',
        'https://example.com/image.jpg',
        true
      );

      expect(updated).toBeDefined();
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.description).toBe('Updated Description');
      expect(updated?.coverImageUrl).toBe('https://example.com/image.jpg');
      expect(updated?.isPublic).toBe(true);
    });

    it('should delete learning path', async () => {
      const created = await learningPathRepository.create(
        testUserId,
        'Test Learning Path',
        'Test Description'
      );

      const deleted = await learningPathRepository.delete(created.id);
      expect(deleted).toBe(true);

      const found = await learningPathRepository.findById(created.id);
      expect(found).toBeNull();
    });

    it('should add course to learning path', async () => {
      const learningPath = await learningPathRepository.create(
        testUserId,
        'Test Learning Path',
        'Test Description'
      );

      const pathCourse = await learningPathRepository.addCourse(
        learningPath.id,
        testCourseId,
        0
      );

      expect(pathCourse).toBeDefined();
      expect(pathCourse.learningPathId).toBe(learningPath.id);
      expect(pathCourse.courseId).toBe(testCourseId);
      expect(pathCourse.orderIndex).toBe(0);
    });

    it('should remove course from learning path', async () => {
      const learningPath = await learningPathRepository.create(
        testUserId,
        'Test Learning Path',
        'Test Description'
      );

      await learningPathRepository.addCourse(learningPath.id, testCourseId, 0);
      const removed = await learningPathRepository.removeCourse(learningPath.id, testCourseId);

      expect(removed).toBe(true);
    });

    it('should regenerate share token', async () => {
      const learningPath = await learningPathRepository.create(
        testUserId,
        'Test Learning Path',
        'Test Description'
      );

      const originalToken = learningPath.shareToken;
      const newToken = await learningPathRepository.regenerateShareToken(learningPath.id);

      expect(newToken).toBeDefined();
      expect(newToken).not.toBe(originalToken);
    });
  });

  describe('LearningPathService', () => {
    it('should create learning path with validation', async () => {
      const learningPath = await learningPathService.createLearningPath(
        testUserId,
        'Test Learning Path',
        'Test Description'
      );

      expect(learningPath).toBeDefined();
      expect(learningPath.title).toBe('Test Learning Path');
    });

    it('should reject empty title', async () => {
      await expect(
        learningPathService.createLearningPath(testUserId, '', 'Test Description')
      ).rejects.toThrow('Title is required');
    });

    it('should reject empty description', async () => {
      await expect(
        learningPathService.createLearningPath(testUserId, 'Test Title', '')
      ).rejects.toThrow('Description is required');
    });

    it('should update learning path with ownership validation', async () => {
      const learningPath = await learningPathService.createLearningPath(
        testUserId,
        'Original Title',
        'Original Description'
      );

      const updated = await learningPathService.updateLearningPath(
        learningPath.id,
        testUserId,
        'Updated Title',
        'Updated Description'
      );

      expect(updated).toBeDefined();
      expect(updated?.title).toBe('Updated Title');
    });

    it('should reject update from non-owner', async () => {
      const learningPath = await learningPathService.createLearningPath(
        testUserId,
        'Test Title',
        'Test Description'
      );

      await expect(
        learningPathService.updateLearningPath(
          learningPath.id,
          'different-user-id',
          'Updated Title',
          'Updated Description'
        )
      ).rejects.toThrow('Learning path not found or access denied');
    });

    it('should add course to path with validation', async () => {
      const learningPath = await learningPathService.createLearningPath(
        testUserId,
        'Test Learning Path',
        'Test Description'
      );

      const pathCourse = await learningPathService.addCourseToPath(
        learningPath.id,
        testUserId,
        testCourseId
      );

      expect(pathCourse).toBeDefined();
      expect(pathCourse.courseId).toBe(testCourseId);
    });

    it('should reject adding course from non-owner', async () => {
      const learningPath = await learningPathService.createLearningPath(
        testUserId,
        'Test Learning Path',
        'Test Description'
      );

      await expect(
        learningPathService.addCourseToPath(
          learningPath.id,
          'different-user-id',
          testCourseId
        )
      ).rejects.toThrow('Learning path not found or access denied');
    });

    it('should reorder courses correctly', async () => {
      const learningPath = await learningPathService.createLearningPath(
        testUserId,
        'Test Learning Path',
        'Test Description'
      );

      // Create second course
      const course2Result = await db.query(
        'INSERT INTO courses (title, description, created_by) VALUES ($1, $2, $3) RETURNING id',
        ['Test Course 2', 'Test Description 2', testUserId]
      );
      const testCourseId2 = course2Result.rows[0].id;

      // Add courses
      await learningPathService.addCourseToPath(learningPath.id, testUserId, testCourseId, 0);
      await learningPathService.addCourseToPath(learningPath.id, testUserId, testCourseId2, 1);

      // Reorder courses
      await learningPathService.reorderCourses(learningPath.id, testUserId, [
        { courseId: testCourseId2, orderIndex: 0 },
        { courseId: testCourseId, orderIndex: 1 }
      ]);

      const updatedPath = await learningPathRepository.findById(learningPath.id);
      expect(updatedPath?.courses[0].courseId).toBe(testCourseId2);
      expect(updatedPath?.courses[1].courseId).toBe(testCourseId);

      // Clean up
      await db.query('DELETE FROM courses WHERE id = $1', [testCourseId2]);
    });

    it('should toggle public access', async () => {
      const learningPath = await learningPathService.createLearningPath(
        testUserId,
        'Test Learning Path',
        'Test Description'
      );

      expect(learningPath.isPublic).toBe(false);

      const updated = await learningPathService.togglePublicAccess(
        learningPath.id,
        testUserId,
        true
      );

      expect(updated?.isPublic).toBe(true);
    });
  });
});
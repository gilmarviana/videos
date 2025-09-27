/**
 * Course Service Unit Tests
 * 
 * Tests for course management service functions including
 * course creation, module management, lesson handling, and video validation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CourseService } from '../../lib/services/course.service';
import { courseRepository } from '../../lib/db/repositories/course.repository';
import { moduleRepository } from '../../lib/db/repositories/module.repository';
import { lessonRepository } from '../../lib/db/repositories/lesson.repository';

// Mock dependencies
vi.mock('../../lib/db/repositories/course.repository');
vi.mock('../../lib/db/repositories/module.repository');
vi.mock('../../lib/db/repositories/lesson.repository');

describe('CourseService', () => {
  let courseService: CourseService;
  const mockCourseRepository = vi.mocked(courseRepository);
  const mockModuleRepository = vi.mocked(moduleRepository);
  const mockLessonRepository = vi.mocked(lessonRepository);

  beforeEach(() => {
    courseService = new CourseService();
    vi.clearAllMocks();
  });

  describe('createCourse', () => {
    it('should create a course successfully', async () => {
      const courseData = {
        title: 'Test Course',
        description: 'Test course description',
        coverImageUrl: 'https://example.com/cover.jpg',
        price: 30.00,
        createdBy: 'admin-id',
      };

      const mockCourse = testUtils.createMockCourse(courseData);
      mockCourseRepository.create.mockResolvedValue(mockCourse);

      const result = await courseService.createCourse(courseData);

      expect(mockCourseRepository.create).toHaveBeenCalledWith({
        ...courseData,
        isActive: true,
      });
      expect(result.success).toBe(true);
      expect(result.course).toEqual(mockCourse);
    });

    it('should validate required fields', async () => {
      const invalidCourseData = {
        title: '',
        description: 'Test course description',
        createdBy: 'admin-id',
      };

      const result = await courseService.createCourse(invalidCourseData as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Title is required');
      expect(mockCourseRepository.create).not.toHaveBeenCalled();
    });

    it('should validate price format', async () => {
      const courseData = {
        title: 'Test Course',
        description: 'Test course description',
        price: -10,
        createdBy: 'admin-id',
      };

      const result = await courseService.createCourse(courseData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Price must be a positive number');
    });
  });

  describe('getCourse', () => {
    it('should get course by id successfully', async () => {
      const courseId = 'course-id';
      const mockCourse = testUtils.createMockCourse({ id: courseId });

      mockCourseRepository.findById.mockResolvedValue(mockCourse);

      const result = await courseService.getCourse(courseId);

      expect(mockCourseRepository.findById).toHaveBeenCalledWith(courseId);
      expect(result.success).toBe(true);
      expect(result.course).toEqual(mockCourse);
    });

    it('should fail if course not found', async () => {
      const courseId = 'nonexistent-id';

      mockCourseRepository.findById.mockResolvedValue(null);

      const result = await courseService.getCourse(courseId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Course not found');
    });
  });

  describe('updateCourse', () => {
    it('should update course successfully', async () => {
      const courseId = 'course-id';
      const updateData = {
        title: 'Updated Course Title',
        description: 'Updated description',
      };

      const mockCourse = testUtils.createMockCourse({ id: courseId });
      mockCourseRepository.findById.mockResolvedValue(mockCourse);
      mockCourseRepository.update.mockResolvedValue({ ...mockCourse, ...updateData });

      const result = await courseService.updateCourse(courseId, updateData);

      expect(mockCourseRepository.findById).toHaveBeenCalledWith(courseId);
      expect(mockCourseRepository.update).toHaveBeenCalledWith(courseId, updateData);
      expect(result.success).toBe(true);
    });

    it('should fail if course not found', async () => {
      const courseId = 'nonexistent-id';
      const updateData = { title: 'Updated Title' };

      mockCourseRepository.findById.mockResolvedValue(null);

      const result = await courseService.updateCourse(courseId, updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Course not found');
      expect(mockCourseRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteCourse', () => {
    it('should delete course successfully', async () => {
      const courseId = 'course-id';
      const mockCourse = testUtils.createMockCourse({ id: courseId });

      mockCourseRepository.findById.mockResolvedValue(mockCourse);
      mockCourseRepository.delete.mockResolvedValue(true);

      const result = await courseService.deleteCourse(courseId);

      expect(mockCourseRepository.findById).toHaveBeenCalledWith(courseId);
      expect(mockCourseRepository.delete).toHaveBeenCalledWith(courseId);
      expect(result.success).toBe(true);
    });

    it('should fail if course not found', async () => {
      const courseId = 'nonexistent-id';

      mockCourseRepository.findById.mockResolvedValue(null);

      const result = await courseService.deleteCourse(courseId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Course not found');
      expect(mockCourseRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('createModule', () => {
    it('should create module successfully', async () => {
      const courseId = 'course-id';
      const moduleData = {
        title: 'Test Module',
        description: 'Test module description',
      };

      const mockCourse = testUtils.createMockCourse({ id: courseId });
      const mockModule = testUtils.createMockModule({ courseId, ...moduleData });

      mockCourseRepository.findById.mockResolvedValue(mockCourse);
      mockModuleRepository.getNextOrderIndex.mockResolvedValue(1);
      mockModuleRepository.create.mockResolvedValue(mockModule);

      const result = await courseService.createModule(courseId, moduleData);

      expect(mockCourseRepository.findById).toHaveBeenCalledWith(courseId);
      expect(mockModuleRepository.getNextOrderIndex).toHaveBeenCalledWith(courseId);
      expect(mockModuleRepository.create).toHaveBeenCalledWith({
        ...moduleData,
        courseId,
        orderIndex: 1,
      });
      expect(result.success).toBe(true);
      expect(result.module).toEqual(mockModule);
    });

    it('should fail if course not found', async () => {
      const courseId = 'nonexistent-id';
      const moduleData = {
        title: 'Test Module',
        description: 'Test module description',
      };

      mockCourseRepository.findById.mockResolvedValue(null);

      const result = await courseService.createModule(courseId, moduleData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Course not found');
      expect(mockModuleRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('createLesson', () => {
    it('should create lesson successfully', async () => {
      const moduleId = 'module-id';
      const lessonData = {
        title: 'Test Lesson',
        description: 'Test lesson description',
        videoUrl: 'https://example.com/video.mp4',
        videoSource: 'direct' as const,
        videoFormat: 'mp4' as const,
        durationSeconds: 600,
      };

      const mockModule = testUtils.createMockModule({ id: moduleId });
      const mockLesson = testUtils.createMockLesson({ moduleId, ...lessonData });

      mockModuleRepository.findById.mockResolvedValue(mockModule);
      mockLessonRepository.getNextOrderIndex.mockResolvedValue(1);
      mockLessonRepository.create.mockResolvedValue(mockLesson);

      const result = await courseService.createLesson(moduleId, lessonData);

      expect(mockModuleRepository.findById).toHaveBeenCalledWith(moduleId);
      expect(mockLessonRepository.getNextOrderIndex).toHaveBeenCalledWith(moduleId);
      expect(mockLessonRepository.create).toHaveBeenCalledWith({
        ...lessonData,
        moduleId,
        orderIndex: 1,
        materials: [],
      });
      expect(result.success).toBe(true);
      expect(result.lesson).toEqual(mockLesson);
    });

    it('should fail if module not found', async () => {
      const moduleId = 'nonexistent-id';
      const lessonData = {
        title: 'Test Lesson',
        description: 'Test lesson description',
        videoUrl: 'https://example.com/video.mp4',
        videoSource: 'direct' as const,
        videoFormat: 'mp4' as const,
        durationSeconds: 600,
      };

      mockModuleRepository.findById.mockResolvedValue(null);

      const result = await courseService.createLesson(moduleId, lessonData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Module not found');
      expect(mockLessonRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('validateVideoUrl', () => {
    it('should validate Google Drive URLs correctly', async () => {
      const validUrls = [
        'https://drive.google.com/file/d/1234567890abcdef/view',
        'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
      ];

      const invalidUrls = [
        'https://invalid-url.com/video.mp4',
        'https://youtube.com/watch?v=123',
        'not-a-url',
      ];

      for (const url of validUrls) {
        const result = await courseService.validateVideoUrl(url, 'google_drive');
        expect(result.isValid).toBe(true);
      }

      for (const url of invalidUrls) {
        const result = await courseService.validateVideoUrl(url, 'google_drive');
        expect(result.isValid).toBe(false);
      }
    });

    it('should validate OneDrive URLs correctly', async () => {
      const validUrls = [
        'https://company.sharepoint.com/sites/test/video.mp4',
        'https://company-my.sharepoint.com/personal/user_company_com/Documents/video.mp4',
      ];

      const invalidUrls = [
        'https://invalid-url.com/video.mp4',
        'https://google.com/file.mp4',
      ];

      for (const url of validUrls) {
        const result = await courseService.validateVideoUrl(url, 'onedrive');
        expect(result.isValid).toBe(true);
      }

      for (const url of invalidUrls) {
        const result = await courseService.validateVideoUrl(url, 'onedrive');
        expect(result.isValid).toBe(false);
      }
    });

    it('should validate direct video URLs correctly', async () => {
      const validUrls = [
        'https://example.com/video.mp4',
        'https://cdn.example.com/videos/lesson1.avi',
        'https://storage.example.com/content/video.mov',
      ];

      const invalidUrls = [
        'https://example.com/document.pdf',
        'https://example.com/image.jpg',
        'not-a-url',
      ];

      for (const url of validUrls) {
        const result = await courseService.validateVideoUrl(url, 'direct');
        expect(result.isValid).toBe(true);
      }

      for (const url of invalidUrls) {
        const result = await courseService.validateVideoUrl(url, 'direct');
        expect(result.isValid).toBe(false);
      }
    });
  });

  describe('getCourseModules', () => {
    it('should get course modules successfully', async () => {
      const courseId = 'course-id';
      const mockModules = [
        testUtils.createMockModule({ courseId, orderIndex: 1 }),
        testUtils.createMockModule({ courseId, orderIndex: 2 }),
      ];

      mockModuleRepository.findByCourseId.mockResolvedValue(mockModules);

      const result = await courseService.getCourseModules(courseId);

      expect(mockModuleRepository.findByCourseId).toHaveBeenCalledWith(courseId);
      expect(result.success).toBe(true);
      expect(result.modules).toEqual(mockModules);
    });
  });

  describe('getModuleLessons', () => {
    it('should get module lessons successfully', async () => {
      const moduleId = 'module-id';
      const mockLessons = [
        testUtils.createMockLesson({ moduleId, orderIndex: 1 }),
        testUtils.createMockLesson({ moduleId, orderIndex: 2 }),
      ];

      mockLessonRepository.findByModuleId.mockResolvedValue(mockLessons);

      const result = await courseService.getModuleLessons(moduleId);

      expect(mockLessonRepository.findByModuleId).toHaveBeenCalledWith(moduleId);
      expect(result.success).toBe(true);
      expect(result.lessons).toEqual(mockLessons);
    });
  });

  describe('addLessonMaterial', () => {
    it('should add lesson material successfully', async () => {
      const lessonId = 'lesson-id';
      const material = {
        id: 'material-id',
        name: 'test-document.pdf',
        type: 'pdf' as const,
        url: '/uploads/test-document.pdf',
        size: 1024,
      };

      const mockLesson = testUtils.createMockLesson({ id: lessonId });
      mockLessonRepository.findById.mockResolvedValue(mockLesson);
      mockLessonRepository.addMaterial.mockResolvedValue(true);

      const result = await courseService.addLessonMaterial(lessonId, material);

      expect(mockLessonRepository.findById).toHaveBeenCalledWith(lessonId);
      expect(mockLessonRepository.addMaterial).toHaveBeenCalledWith(lessonId, material);
      expect(result.success).toBe(true);
    });

    it('should fail if lesson not found', async () => {
      const lessonId = 'nonexistent-id';
      const material = {
        id: 'material-id',
        name: 'test-document.pdf',
        type: 'pdf' as const,
        url: '/uploads/test-document.pdf',
        size: 1024,
      };

      mockLessonRepository.findById.mockResolvedValue(null);

      const result = await courseService.addLessonMaterial(lessonId, material);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Lesson not found');
      expect(mockLessonRepository.addMaterial).not.toHaveBeenCalled();
    });
  });
});
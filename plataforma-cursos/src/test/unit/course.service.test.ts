/**
 * Course Service Unit Tests
 * 
 * Comprehensive tests for all course service functions including
 * course, module, and lesson operations with video validation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CourseService } from '../../lib/services/course.service';
import { courseRepository } from '../../lib/db/repositories/course.repository';
import { moduleRepository } from '../../lib/db/repositories/module.repository';
import { lessonRepository } from '../../lib/db/repositories/lesson.repository';
import { videoService } from '../../lib/services/video.service';

// Mock dependencies
vi.mock('../../lib/db/repositories/course.repository');
vi.mock('../../lib/db/repositories/module.repository');
vi.mock('../../lib/db/repositories/lesson.repository');
vi.mock('../../lib/services/video.service');

describe('CourseService', () => {
  let courseService: CourseService;
  const mockCourseRepository = vi.mocked(courseRepository);
  const mockModuleRepository = vi.mocked(moduleRepository);
  const mockLessonRepository = vi.mocked(lessonRepository);
  const mockVideoService = vi.mocked(videoService);

  beforeEach(() => {
    courseService = new CourseService();
    vi.clearAllMocks();
  });

  describe('Course Operations', () => {
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
          title: courseData.title,
          description: courseData.description,
          coverImageUrl: courseData.coverImageUrl,
          price: courseData.price,
          isActive: true,
          createdBy: courseData.createdBy,
        });
        expect(result).toEqual(mockCourse);
      });

      it('should create course with default values', async () => {
        const courseData = {
          title: 'Test Course',
          description: 'Test course description',
          createdBy: 'admin-id',
        };

        const mockCourse = testUtils.createMockCourse(courseData);
        mockCourseRepository.create.mockResolvedValue(mockCourse);

        await courseService.createCourse(courseData);

        expect(mockCourseRepository.create).toHaveBeenCalledWith({
          title: courseData.title,
          description: courseData.description,
          coverImageUrl: '',
          price: undefined,
          isActive: true,
          createdBy: courseData.createdBy,
        });
      });
    });

    describe('getCourseById', () => {
      it('should return course by id', async () => {
        const courseId = 'course-id';
        const mockCourse = testUtils.createMockCourse({ id: courseId });
        mockCourseRepository.findById.mockResolvedValue(mockCourse);

        const result = await courseService.getCourseById(courseId);

        expect(mockCourseRepository.findById).toHaveBeenCalledWith(courseId);
        expect(result).toEqual(mockCourse);
      });

      it('should return null for non-existent course', async () => {
        const courseId = 'non-existent-id';
        mockCourseRepository.findById.mockResolvedValue(null);

        const result = await courseService.getCourseById(courseId);

        expect(result).toBeNull();
      });
    });

    describe('updateCourse', () => {
      it('should update course successfully', async () => {
        const courseId = 'course-id';
        const updateData = {
          title: 'Updated Course Title',
          price: 50.00,
        };

        const mockUpdatedCourse = testUtils.createMockCourse({ ...updateData, id: courseId });
        mockCourseRepository.update.mockResolvedValue(mockUpdatedCourse);

        const result = await courseService.updateCourse(courseId, updateData);

        expect(mockCourseRepository.update).toHaveBeenCalledWith(courseId, updateData);
        expect(result).toEqual(mockUpdatedCourse);
      });
    });

    describe('deleteCourse', () => {
      it('should delete course successfully', async () => {
        const courseId = 'course-id';
        mockCourseRepository.delete.mockResolvedValue(true);

        const result = await courseService.deleteCourse(courseId);

        expect(mockCourseRepository.delete).toHaveBeenCalledWith(courseId);
        expect(result).toBe(true);
      });
    });
  });

  describe('Module Operations', () => {
    describe('createModule', () => {
      it('should create module with auto-generated order index', async () => {
        const moduleData = {
          courseId: 'course-id',
          title: 'Test Module',
          description: 'Test module description',
        };

        const mockModule = testUtils.createMockModule(moduleData);
        mockModuleRepository.getNextOrderIndex.mockResolvedValue(1);
        mockModuleRepository.create.mockResolvedValue(mockModule);

        const result = await courseService.createModule(moduleData);

        expect(mockModuleRepository.getNextOrderIndex).toHaveBeenCalledWith(moduleData.courseId);
        expect(mockModuleRepository.create).toHaveBeenCalledWith({
          ...moduleData,
          orderIndex: 1,
        });
        expect(result).toEqual(mockModule);
      });

      it('should create module with specified order index', async () => {
        const moduleData = {
          courseId: 'course-id',
          title: 'Test Module',
          description: 'Test module description',
          orderIndex: 5,
        };

        const mockModule = testUtils.createMockModule(moduleData);
        mockModuleRepository.create.mockResolvedValue(mockModule);

        await courseService.createModule(moduleData);

        expect(mockModuleRepository.getNextOrderIndex).not.toHaveBeenCalled();
        expect(mockModuleRepository.create).toHaveBeenCalledWith(moduleData);
      });
    });

    describe('reorderModules', () => {
      it('should reorder modules successfully', async () => {
        const courseId = 'course-id';
        const moduleOrders = [
          { id: 'module-1', orderIndex: 2 },
          { id: 'module-2', orderIndex: 1 },
        ];

        mockModuleRepository.reorderModules.mockResolvedValue();

        await courseService.reorderModules(courseId, moduleOrders);

        expect(mockModuleRepository.reorderModules).toHaveBeenCalledWith(courseId, moduleOrders);
      });
    });
  });

  describe('Lesson Operations', () => {
    describe('createLesson', () => {
      it('should create lesson with default values', async () => {
        const lessonData = {
          moduleId: 'module-id',
          title: 'Test Lesson',
          description: 'Test lesson description',
        };

        const mockLesson = testUtils.createMockLesson(lessonData);
        mockLessonRepository.getNextOrderIndex.mockResolvedValue(1);
        mockLessonRepository.create.mockResolvedValue(mockLesson);

        const result = await courseService.createLesson(lessonData);

        expect(mockLessonRepository.create).toHaveBeenCalledWith({
          ...lessonData,
          videoUrl: '',
          videoSource: 'direct',
          videoFormat: 'mp4',
          durationSeconds: 0,
          orderIndex: 1,
          materials: [],
        });
        expect(result).toEqual(mockLesson);
      });

      it('should create lesson with video data', async () => {
        const lessonData = {
          moduleId: 'module-id',
          title: 'Test Lesson',
          description: 'Test lesson description',
          videoUrl: 'https://example.com/video.mp4',
          videoSource: 'direct' as const,
          videoFormat: 'mp4' as const,
          durationSeconds: 600,
          materials: [{ id: '1', name: 'Material 1', type: 'pdf', url: 'https://example.com/material.pdf' }],
        };

        const mockLesson = testUtils.createMockLesson(lessonData);
        mockLessonRepository.getNextOrderIndex.mockResolvedValue(1);
        mockLessonRepository.create.mockResolvedValue(mockLesson);

        const result = await courseService.createLesson(lessonData);

        expect(mockLessonRepository.create).toHaveBeenCalledWith({
          ...lessonData,
          orderIndex: 1,
        });
        expect(result).toEqual(mockLesson);
      });
    });

    describe('createLessonWithVideo', () => {
      it('should create lesson with video validation', async () => {
        const lessonData = {
          moduleId: 'module-id',
          title: 'Test Lesson',
          description: 'Test lesson description',
          videoUrl: 'https://drive.google.com/file/d/123/view',
          videoSource: 'google_drive' as const,
        };

        const mockValidation = {
          isValid: true,
          metadata: {
            format: 'mp4',
            durationSeconds: 600,
            resolution: '1080p',
          },
        };

        const mockLesson = testUtils.createMockLesson({
          ...lessonData,
          videoFormat: 'mp4',
          durationSeconds: 600,
        });

        mockVideoService.validateVideoUrl.mockResolvedValue(mockValidation);
        mockLessonRepository.getNextOrderIndex.mockResolvedValue(1);
        mockLessonRepository.create.mockResolvedValue(mockLesson);

        const result = await courseService.createLessonWithVideo(lessonData);

        expect(mockVideoService.validateVideoUrl).toHaveBeenCalledWith(
          lessonData.videoUrl,
          lessonData.videoSource
        );
        expect(mockLessonRepository.create).toHaveBeenCalledWith({
          ...lessonData,
          videoFormat: 'mp4',
          durationSeconds: 600,
          orderIndex: 1,
          materials: [],
        });
        expect(result.lesson).toEqual(mockLesson);
        expect(result.validation).toEqual(mockValidation);
      });

      it('should throw error for invalid video', async () => {
        const lessonData = {
          moduleId: 'module-id',
          title: 'Test Lesson',
          description: 'Test lesson description',
          videoUrl: 'invalid-url',
          videoSource: 'direct' as const,
        };

        const mockValidation = {
          isValid: false,
          error: 'Invalid video URL format',
        };

        mockVideoService.validateVideoUrl.mockResolvedValue(mockValidation);

        await expect(courseService.createLessonWithVideo(lessonData)).rejects.toThrow(
          'Invalid video URL format'
        );

        expect(mockLessonRepository.create).not.toHaveBeenCalled();
      });
    });

    describe('updateLessonVideo', () => {
      it('should update lesson video with validation', async () => {
        const lessonId = 'lesson-id';
        const videoData = {
          videoUrl: 'https://onedrive.live.com/embed?cid=123',
          videoSource: 'onedrive' as const,
        };

        const mockValidation = {
          isValid: true,
          metadata: {
            format: 'mp4',
            durationSeconds: 900,
          },
        };

        const mockUpdatedLesson = testUtils.createMockLesson({
          id: lessonId,
          ...videoData,
          videoFormat: 'mp4',
          durationSeconds: 900,
        });

        mockVideoService.validateVideoUrl.mockResolvedValue(mockValidation);
        mockLessonRepository.update.mockResolvedValue(mockUpdatedLesson);

        const result = await courseService.updateLessonVideo(lessonId, videoData);

        expect(mockVideoService.validateVideoUrl).toHaveBeenCalledWith(
          videoData.videoUrl,
          videoData.videoSource
        );
        expect(mockLessonRepository.update).toHaveBeenCalledWith(lessonId, {
          ...videoData,
          videoFormat: 'mp4',
          durationSeconds: 900,
        });
        expect(result.lesson).toEqual(mockUpdatedLesson);
        expect(result.validation).toEqual(mockValidation);
      });
    });

    describe('addMaterialToLesson', () => {
      it('should add material to lesson', async () => {
        const lessonId = 'lesson-id';
        const material = {
          id: '1',
          name: 'Test Material',
          type: 'pdf' as const,
          url: 'https://example.com/material.pdf',
        };

        const mockUpdatedLesson = testUtils.createMockLesson({
          id: lessonId,
          materials: [material],
        });

        mockLessonRepository.addMaterial.mockResolvedValue(mockUpdatedLesson);

        const result = await courseService.addMaterialToLesson(lessonId, material);

        expect(mockLessonRepository.addMaterial).toHaveBeenCalledWith(lessonId, material);
        expect(result).toEqual(mockUpdatedLesson);
      });
    });
  });

  describe('Course Structure Validation', () => {
    describe('validateCourseStructure', () => {
      it('should validate complete course structure', async () => {
        const courseId = 'course-id';
        const mockCourse = testUtils.createMockCourse({
          id: courseId,
          modules: [
            {
              ...testUtils.createMockModule(),
              lessons: [
                testUtils.createMockLesson({ videoUrl: 'https://example.com/video1.mp4' }),
                testUtils.createMockLesson({ videoUrl: 'https://example.com/video2.mp4' }),
              ],
            },
          ],
        });

        mockCourseRepository.findById.mockResolvedValue(mockCourse);

        const result = await courseService.validateCourseStructure(courseId);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });

      it('should detect course without modules', async () => {
        const courseId = 'course-id';
        const mockCourse = testUtils.createMockCourse({
          id: courseId,
          modules: [],
        });

        mockCourseRepository.findById.mockResolvedValue(mockCourse);

        const result = await courseService.validateCourseStructure(courseId);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain('Course has no modules');
      });

      it('should detect modules without lessons', async () => {
        const courseId = 'course-id';
        const mockCourse = testUtils.createMockCourse({
          id: courseId,
          modules: [
            {
              ...testUtils.createMockModule({ title: 'Empty Module' }),
              lessons: [],
            },
          ],
        });

        mockCourseRepository.findById.mockResolvedValue(mockCourse);

        const result = await courseService.validateCourseStructure(courseId);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain('Module "Empty Module" has no lessons');
      });

      it('should detect lessons without video URLs', async () => {
        const courseId = 'course-id';
        const mockCourse = testUtils.createMockCourse({
          id: courseId,
          modules: [
            {
              ...testUtils.createMockModule(),
              lessons: [
                testUtils.createMockLesson({ title: 'Lesson Without Video', videoUrl: '' }),
              ],
            },
          ],
        });

        mockCourseRepository.findById.mockResolvedValue(mockCourse);

        const result = await courseService.validateCourseStructure(courseId);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain('Lesson "Lesson Without Video" has no video URL');
      });

      it('should return error for non-existent course', async () => {
        const courseId = 'non-existent-id';
        mockCourseRepository.findById.mockResolvedValue(null);

        const result = await courseService.validateCourseStructure(courseId);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Course not found');
      });
    });
  });
});
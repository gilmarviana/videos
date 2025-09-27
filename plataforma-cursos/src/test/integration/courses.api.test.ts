/**
 * Courses API Integration Tests
 * 
 * Tests for course management API endpoints including
 * course CRUD operations, module management, and lesson handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Import API handlers
import { GET as getCoursesHandler, POST as createCourseHandler } from '../../app/api/courses/route';
import { GET as getCourseHandler, PUT as updateCourseHandler, DELETE as deleteCourseHandler } from '../../app/api/courses/[id]/route';
import { GET as getModulesHandler, POST as createModuleHandler } from '../../app/api/courses/[id]/modules/route';
import { GET as getLessonsHandler, POST as createLessonHandler } from '../../app/api/modules/[id]/lessons/route';

// Mock dependencies
vi.mock('../../lib/services/course.service');
vi.mock('../../lib/auth/middleware');

describe('Courses API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/courses', () => {
    it('should return list of courses', async () => {
      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'GET',
      });

      // Mock course service
      const mockCourseService = await import('../../lib/services/course.service');
      vi.mocked(mockCourseService.CourseService.prototype.getAllCourses).mockResolvedValue({
        success: true,
        courses: [
          testUtils.createMockCourse({ title: 'Course 1' }),
          testUtils.createMockCourse({ title: 'Course 2' }),
        ],
      });

      const response = await getCoursesHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.courses).toHaveLength(2);
    });

    it('should handle empty course list', async () => {
      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'GET',
      });

      // Mock empty course list
      const mockCourseService = await import('../../lib/services/course.service');
      vi.mocked(mockCourseService.CourseService.prototype.getAllCourses).mockResolvedValue({
        success: true,
        courses: [],
      });

      const response = await getCoursesHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.courses).toHaveLength(0);
    });
  });

  describe('POST /api/courses', () => {
    it('should create course successfully (admin only)', async () => {
      const requestBody = {
        title: 'New Course',
        description: 'Course description',
        coverImageUrl: 'https://example.com/cover.jpg',
        price: 30.00,
      };

      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token',
        },
      });

      // Mock admin authentication
      const mockAuthMiddleware = await import('../../lib/auth/middleware');
      vi.mocked(mockAuthMiddleware.requireAuth).mockResolvedValue({
        success: true,
        user: testUtils.createMockUser({ role: 'admin' }),
      });

      // Mock course creation
      const mockCourseService = await import('../../lib/services/course.service');
      vi.mocked(mockCourseService.CourseService.prototype.createCourse).mockResolvedValue({
        success: true,
        course: testUtils.createMockCourse(requestBody),
      });

      const response = await createCourseHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.success).toBe(true);
      expect(responseData.course.title).toBe(requestBody.title);
    });

    it('should return 403 for non-admin users', async () => {
      const requestBody = {
        title: 'New Course',
        description: 'Course description',
      };

      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer student-token',
        },
      });

      // Mock student authentication
      const mockAuthMiddleware = await import('../../lib/auth/middleware');
      vi.mocked(mockAuthMiddleware.requireAuth).mockResolvedValue({
        success: true,
        user: testUtils.createMockUser({ role: 'student' }),
      });

      const response = await createCourseHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('admin');
    });

    it('should return 400 for invalid course data', async () => {
      const requestBody = {
        // Missing required title
        description: 'Course description',
      };

      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token',
        },
      });

      // Mock admin authentication
      const mockAuthMiddleware = await import('../../lib/auth/middleware');
      vi.mocked(mockAuthMiddleware.requireAuth).mockResolvedValue({
        success: true,
        user: testUtils.createMockUser({ role: 'admin' }),
      });

      const response = await createCourseHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });
  });

  describe('GET /api/courses/[id]', () => {
    it('should return course by id', async () => {
      const courseId = 'course-123';
      const request = new NextRequest(`http://localhost:3000/api/courses/${courseId}`, {
        method: 'GET',
      });

      // Mock course service
      const mockCourseService = await import('../../lib/services/course.service');
      vi.mocked(mockCourseService.CourseService.prototype.getCourse).mockResolvedValue({
        success: true,
        course: testUtils.createMockCourse({ id: courseId }),
      });

      const response = await getCourseHandler(request, { params: { id: courseId } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.course.id).toBe(courseId);
    });

    it('should return 404 for non-existent course', async () => {
      const courseId = 'nonexistent-course';
      const request = new NextRequest(`http://localhost:3000/api/courses/${courseId}`, {
        method: 'GET',
      });

      // Mock course not found
      const mockCourseService = await import('../../lib/services/course.service');
      vi.mocked(mockCourseService.CourseService.prototype.getCourse).mockResolvedValue({
        success: false,
        error: 'Course not found',
      });

      const response = await getCourseHandler(request, { params: { id: courseId } });
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.success).toBe(false);
    });
  });

  describe('PUT /api/courses/[id]', () => {
    it('should update course successfully (admin only)', async () => {
      const courseId = 'course-123';
      const updateData = {
        title: 'Updated Course Title',
        description: 'Updated description',
      };

      const request = new NextRequest(`http://localhost:3000/api/courses/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token',
        },
      });

      // Mock admin authentication
      const mockAuthMiddleware = await import('../../lib/auth/middleware');
      vi.mocked(mockAuthMiddleware.requireAuth).mockResolvedValue({
        success: true,
        user: testUtils.createMockUser({ role: 'admin' }),
      });

      // Mock course update
      const mockCourseService = await import('../../lib/services/course.service');
      vi.mocked(mockCourseService.CourseService.prototype.updateCourse).mockResolvedValue({
        success: true,
        course: testUtils.createMockCourse({ id: courseId, ...updateData }),
      });

      const response = await updateCourseHandler(request, { params: { id: courseId } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.course.title).toBe(updateData.title);
    });
  });

  describe('DELETE /api/courses/[id]', () => {
    it('should delete course successfully (admin only)', async () => {
      const courseId = 'course-123';
      const request = new NextRequest(`http://localhost:3000/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer admin-token',
        },
      });

      // Mock admin authentication
      const mockAuthMiddleware = await import('../../lib/auth/middleware');
      vi.mocked(mockAuthMiddleware.requireAuth).mockResolvedValue({
        success: true,
        user: testUtils.createMockUser({ role: 'admin' }),
      });

      // Mock course deletion
      const mockCourseService = await import('../../lib/services/course.service');
      vi.mocked(mockCourseService.CourseService.prototype.deleteCourse).mockResolvedValue({
        success: true,
      });

      const response = await deleteCourseHandler(request, { params: { id: courseId } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
    });
  });

  describe('GET /api/courses/[id]/modules', () => {
    it('should return course modules', async () => {
      const courseId = 'course-123';
      const request = new NextRequest(`http://localhost:3000/api/courses/${courseId}/modules`, {
        method: 'GET',
      });

      // Mock course modules
      const mockCourseService = await import('../../lib/services/course.service');
      vi.mocked(mockCourseService.CourseService.prototype.getCourseModules).mockResolvedValue({
        success: true,
        modules: [
          testUtils.createMockModule({ courseId, orderIndex: 1 }),
          testUtils.createMockModule({ courseId, orderIndex: 2 }),
        ],
      });

      const response = await getModulesHandler(request, { params: { id: courseId } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.modules).toHaveLength(2);
    });
  });

  describe('POST /api/courses/[id]/modules', () => {
    it('should create module successfully (admin only)', async () => {
      const courseId = 'course-123';
      const moduleData = {
        title: 'New Module',
        description: 'Module description',
      };

      const request = new NextRequest(`http://localhost:3000/api/courses/${courseId}/modules`, {
        method: 'POST',
        body: JSON.stringify(moduleData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token',
        },
      });

      // Mock admin authentication
      const mockAuthMiddleware = await import('../../lib/auth/middleware');
      vi.mocked(mockAuthMiddleware.requireAuth).mockResolvedValue({
        success: true,
        user: testUtils.createMockUser({ role: 'admin' }),
      });

      // Mock module creation
      const mockCourseService = await import('../../lib/services/course.service');
      vi.mocked(mockCourseService.CourseService.prototype.createModule).mockResolvedValue({
        success: true,
        module: testUtils.createMockModule({ courseId, ...moduleData }),
      });

      const response = await createModuleHandler(request, { params: { id: courseId } });
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.success).toBe(true);
      expect(responseData.module.title).toBe(moduleData.title);
    });
  });

  describe('GET /api/modules/[id]/lessons', () => {
    it('should return module lessons', async () => {
      const moduleId = 'module-123';
      const request = new NextRequest(`http://localhost:3000/api/modules/${moduleId}/lessons`, {
        method: 'GET',
      });

      // Mock module lessons
      const mockCourseService = await import('../../lib/services/course.service');
      vi.mocked(mockCourseService.CourseService.prototype.getModuleLessons).mockResolvedValue({
        success: true,
        lessons: [
          testUtils.createMockLesson({ moduleId, orderIndex: 1 }),
          testUtils.createMockLesson({ moduleId, orderIndex: 2 }),
        ],
      });

      const response = await getLessonsHandler(request, { params: { id: moduleId } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.lessons).toHaveLength(2);
    });
  });

  describe('POST /api/modules/[id]/lessons', () => {
    it('should create lesson successfully (admin only)', async () => {
      const moduleId = 'module-123';
      const lessonData = {
        title: 'New Lesson',
        description: 'Lesson description',
        videoUrl: 'https://example.com/video.mp4',
        videoSource: 'direct' as const,
        videoFormat: 'mp4' as const,
        durationSeconds: 600,
      };

      const request = new NextRequest(`http://localhost:3000/api/modules/${moduleId}/lessons`, {
        method: 'POST',
        body: JSON.stringify(lessonData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token',
        },
      });

      // Mock admin authentication
      const mockAuthMiddleware = await import('../../lib/auth/middleware');
      vi.mocked(mockAuthMiddleware.requireAuth).mockResolvedValue({
        success: true,
        user: testUtils.createMockUser({ role: 'admin' }),
      });

      // Mock lesson creation
      const mockCourseService = await import('../../lib/services/course.service');
      vi.mocked(mockCourseService.CourseService.prototype.createLesson).mockResolvedValue({
        success: true,
        lesson: testUtils.createMockLesson({ moduleId, ...lessonData }),
      });

      const response = await createLessonHandler(request, { params: { id: moduleId } });
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.success).toBe(true);
      expect(responseData.lesson.title).toBe(lessonData.title);
    });

    it('should validate video URL format', async () => {
      const moduleId = 'module-123';
      const lessonData = {
        title: 'New Lesson',
        description: 'Lesson description',
        videoUrl: 'invalid-url',
        videoSource: 'direct' as const,
        videoFormat: 'mp4' as const,
        durationSeconds: 600,
      };

      const request = new NextRequest(`http://localhost:3000/api/modules/${moduleId}/lessons`, {
        method: 'POST',
        body: JSON.stringify(lessonData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token',
        },
      });

      // Mock admin authentication
      const mockAuthMiddleware = await import('../../lib/auth/middleware');
      vi.mocked(mockAuthMiddleware.requireAuth).mockResolvedValue({
        success: true,
        user: testUtils.createMockUser({ role: 'admin' }),
      });

      const response = await createLessonHandler(request, { params: { id: moduleId } });
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('video');
    });
  });
});
import { Course, Module, Lesson, LessonMaterial, VideoValidationResult } from '../../types';
import { courseRepository } from '../db/repositories/course.repository';
import { moduleRepository } from '../db/repositories/module.repository';
import { lessonRepository } from '../db/repositories/lesson.repository';
import { videoService } from './video.service';

export class CourseService {
  // Course operations
  async createCourse(courseData: {
    title: string;
    description: string;
    coverImageUrl?: string;
    price?: number;
    isActive?: boolean;
    createdBy: string;
  }): Promise<Course> {
    return courseRepository.create({
      title: courseData.title,
      description: courseData.description,
      coverImageUrl: courseData.coverImageUrl || '',
      price: courseData.price,
      isActive: courseData.isActive ?? true,
      createdBy: courseData.createdBy
    });
  }

  async getCourseById(id: string): Promise<Course | null> {
    return courseRepository.findById(id);
  }

  async getAllCourses(isActive?: boolean): Promise<Course[]> {
    return courseRepository.findAll(isActive);
  }

  async getCoursesByCreator(createdBy: string): Promise<Course[]> {
    return courseRepository.findByCreatedBy(createdBy);
  }

  async updateCourse(id: string, courseData: {
    title?: string;
    description?: string;
    coverImageUrl?: string;
    price?: number;
    isActive?: boolean;
  }): Promise<Course | null> {
    return courseRepository.update(id, courseData);
  }

  async deleteCourse(id: string): Promise<boolean> {
    return courseRepository.delete(id);
  }

  // Module operations
  async createModule(moduleData: {
    courseId: string;
    title: string;
    description: string;
    orderIndex?: number;
  }): Promise<Module> {
    const orderIndex = moduleData.orderIndex ?? await moduleRepository.getNextOrderIndex(moduleData.courseId);
    
    return moduleRepository.create({
      courseId: moduleData.courseId,
      title: moduleData.title,
      description: moduleData.description,
      orderIndex
    });
  }

  async getModuleById(id: string): Promise<Module | null> {
    return moduleRepository.findById(id);
  }

  async getModulesByCourse(courseId: string): Promise<Module[]> {
    return moduleRepository.findByCourseId(courseId);
  }

  async updateModule(id: string, moduleData: {
    title?: string;
    description?: string;
    orderIndex?: number;
  }): Promise<Module | null> {
    return moduleRepository.update(id, moduleData);
  }

  async deleteModule(id: string): Promise<boolean> {
    return moduleRepository.delete(id);
  }

  async reorderModules(courseId: string, moduleOrders: { id: string; orderIndex: number }[]): Promise<void> {
    return moduleRepository.reorderModules(courseId, moduleOrders);
  }

  // Lesson operations
  async createLesson(lessonData: {
    moduleId: string;
    title: string;
    description: string;
    videoUrl?: string;
    videoSource?: 'google_drive' | 'onedrive' | 'direct';
    videoFormat?: 'mp4' | 'avi' | 'mov' | 'mkv' | 'ts' | 'webm';
    durationSeconds?: number;
    orderIndex?: number;
    materials?: LessonMaterial[];
  }): Promise<Lesson> {
    const orderIndex = lessonData.orderIndex ?? await lessonRepository.getNextOrderIndex(lessonData.moduleId);
    
    return lessonRepository.create({
      moduleId: lessonData.moduleId,
      title: lessonData.title,
      description: lessonData.description,
      videoUrl: lessonData.videoUrl || '',
      videoSource: lessonData.videoSource || 'direct',
      videoFormat: lessonData.videoFormat || 'mp4',
      durationSeconds: lessonData.durationSeconds || 0,
      orderIndex,
      materials: lessonData.materials || []
    });
  }

  async getLessonById(id: string): Promise<Lesson | null> {
    return lessonRepository.findById(id);
  }

  async getLessonsByModule(moduleId: string): Promise<Lesson[]> {
    return lessonRepository.findByModuleId(moduleId);
  }

  async updateLesson(id: string, lessonData: {
    title?: string;
    description?: string;
    videoUrl?: string;
    videoSource?: 'google_drive' | 'onedrive' | 'direct';
    videoFormat?: 'mp4' | 'avi' | 'mov' | 'mkv' | 'ts' | 'webm';
    durationSeconds?: number;
    orderIndex?: number;
    materials?: LessonMaterial[];
  }): Promise<Lesson | null> {
    return lessonRepository.update(id, lessonData);
  }

  async deleteLesson(id: string): Promise<boolean> {
    return lessonRepository.delete(id);
  }

  async reorderLessons(moduleId: string, lessonOrders: { id: string; orderIndex: number }[]): Promise<void> {
    return lessonRepository.reorderLessons(moduleId, lessonOrders);
  }

  // Material operations
  async addMaterialToLesson(lessonId: string, material: LessonMaterial): Promise<Lesson | null> {
    return lessonRepository.addMaterial(lessonId, material);
  }

  async removeMaterialFromLesson(lessonId: string, materialId: string): Promise<Lesson | null> {
    return lessonRepository.removeMaterial(lessonId, materialId);
  }

  async updateLessonMaterial(lessonId: string, materialId: string, materialData: Partial<LessonMaterial>): Promise<Lesson | null> {
    return lessonRepository.updateMaterial(lessonId, materialId, materialData);
  }

  // Video validation helpers
  async validateVideoUrl(url: string, source: 'google_drive' | 'onedrive' | 'direct'): Promise<VideoValidationResult> {
    return videoService.validateVideoUrl(url, source);
  }

  // Enhanced lesson creation with video validation
  async createLessonWithVideo(lessonData: {
    moduleId: string;
    title: string;
    description: string;
    videoUrl: string;
    videoSource: 'google_drive' | 'onedrive' | 'direct';
    orderIndex?: number;
    materials?: LessonMaterial[];
  }): Promise<{ lesson: Lesson; validation: VideoValidationResult }> {
    // Validate video first
    const validation = await this.validateVideoUrl(lessonData.videoUrl, lessonData.videoSource);
    
    if (!validation.isValid) {
      throw new Error(validation.error || 'Video validation failed');
    }

    // Extract format and duration from validation
    const videoFormat = validation.metadata?.format as any || 'mp4';
    const durationSeconds = validation.metadata?.durationSeconds || 0;

    const orderIndex = lessonData.orderIndex ?? await lessonRepository.getNextOrderIndex(lessonData.moduleId);
    
    const lesson = await lessonRepository.create({
      moduleId: lessonData.moduleId,
      title: lessonData.title,
      description: lessonData.description,
      videoUrl: lessonData.videoUrl,
      videoSource: lessonData.videoSource,
      videoFormat,
      durationSeconds,
      orderIndex,
      materials: lessonData.materials || []
    });

    return { lesson, validation };
  }

  // Update lesson with video validation
  async updateLessonVideo(lessonId: string, videoData: {
    videoUrl: string;
    videoSource: 'google_drive' | 'onedrive' | 'direct';
  }): Promise<{ lesson: Lesson | null; validation: VideoValidationResult }> {
    // Validate video first
    const validation = await this.validateVideoUrl(videoData.videoUrl, videoData.videoSource);
    
    if (!validation.isValid) {
      throw new Error(validation.error || 'Video validation failed');
    }

    // Extract format and duration from validation
    const videoFormat = validation.metadata?.format as any || 'mp4';
    const durationSeconds = validation.metadata?.durationSeconds || 0;

    const lesson = await lessonRepository.update(lessonId, {
      videoUrl: videoData.videoUrl,
      videoSource: videoData.videoSource,
      videoFormat,
      durationSeconds
    });

    return { lesson, validation };
  }

  // Course structure validation
  async validateCourseStructure(courseId: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const course = await this.getCourseById(courseId);
    if (!course) {
      errors.push('Course not found');
      return { isValid: false, errors, warnings };
    }

    if (!course.modules || course.modules.length === 0) {
      warnings.push('Course has no modules');
    }

    for (const module of course.modules) {
      if (!module.lessons || module.lessons.length === 0) {
        warnings.push(`Module "${module.title}" has no lessons`);
      }

      for (const lesson of module.lessons) {
        if (!lesson.videoUrl) {
          warnings.push(`Lesson "${lesson.title}" has no video URL`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const courseService = new CourseService();
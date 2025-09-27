import { LearningPath, LearningPathCourse } from '../../types';
import { learningPathRepository } from '../db/repositories/learning-path.repository';
import { courseRepository } from '../db/repositories/course.repository';

export class LearningPathService {
  async createLearningPath(
    userId: string,
    title: string,
    description: string,
    coverImageUrl?: string
  ): Promise<LearningPath> {
    if (!title.trim()) {
      throw new Error('Title is required');
    }

    if (!description.trim()) {
      throw new Error('Description is required');
    }

    return learningPathRepository.create(userId, title.trim(), description.trim(), coverImageUrl);
  }

  async getLearningPath(id: string): Promise<LearningPath | null> {
    return learningPathRepository.findById(id);
  }

  async getUserLearningPaths(userId: string): Promise<LearningPath[]> {
    return learningPathRepository.findByUserId(userId);
  }

  async getSharedLearningPath(shareToken: string): Promise<LearningPath | null> {
    return learningPathRepository.findByShareToken(shareToken);
  }

  async updateLearningPath(
    id: string,
    userId: string,
    title: string,
    description: string,
    coverImageUrl?: string,
    isPublic?: boolean
  ): Promise<LearningPath | null> {
    // Verify ownership
    const existingPath = await learningPathRepository.findById(id);
    if (!existingPath || existingPath.userId !== userId) {
      throw new Error('Learning path not found or access denied');
    }

    if (!title.trim()) {
      throw new Error('Title is required');
    }

    if (!description.trim()) {
      throw new Error('Description is required');
    }

    return learningPathRepository.update(id, title.trim(), description.trim(), coverImageUrl, isPublic);
  }

  async deleteLearningPath(id: string, userId: string): Promise<boolean> {
    // Verify ownership
    const existingPath = await learningPathRepository.findById(id);
    if (!existingPath || existingPath.userId !== userId) {
      throw new Error('Learning path not found or access denied');
    }

    return learningPathRepository.delete(id);
  }

  async addCourseToPath(
    learningPathId: string,
    userId: string,
    courseId: string,
    orderIndex?: number
  ): Promise<LearningPathCourse> {
    // Verify ownership
    const existingPath = await learningPathRepository.findById(learningPathId);
    if (!existingPath || existingPath.userId !== userId) {
      throw new Error('Learning path not found or access denied');
    }

    // Verify course exists and is active
    const course = await courseRepository.findById(courseId);
    if (!course || !course.isActive) {
      throw new Error('Course not found or inactive');
    }

    // If no order index provided, add to the end
    if (orderIndex === undefined) {
      orderIndex = existingPath.courses.length;
    }

    return learningPathRepository.addCourse(learningPathId, courseId, orderIndex);
  }

  async removeCourseFromPath(
    learningPathId: string,
    userId: string,
    courseId: string
  ): Promise<boolean> {
    // Verify ownership
    const existingPath = await learningPathRepository.findById(learningPathId);
    if (!existingPath || existingPath.userId !== userId) {
      throw new Error('Learning path not found or access denied');
    }

    const result = await learningPathRepository.removeCourse(learningPathId, courseId);
    
    // Reorder remaining courses to fill gaps
    if (result) {
      const updatedPath = await learningPathRepository.findById(learningPathId);
      if (updatedPath) {
        const reorderedCourses = updatedPath.courses
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((course, index) => ({
            courseId: course.courseId,
            orderIndex: index
          }));
        
        if (reorderedCourses.length > 0) {
          await learningPathRepository.updateCourseOrder(learningPathId, reorderedCourses);
        }
      }
    }

    return result;
  }

  async reorderCourses(
    learningPathId: string,
    userId: string,
    courseOrders: { courseId: string; orderIndex: number }[]
  ): Promise<void> {
    // Verify ownership
    const existingPath = await learningPathRepository.findById(learningPathId);
    if (!existingPath || existingPath.userId !== userId) {
      throw new Error('Learning path not found or access denied');
    }

    // Validate that all courses belong to this learning path
    const pathCourseIds = existingPath.courses.map(c => c.courseId);
    const providedCourseIds = courseOrders.map(c => c.courseId);
    
    const invalidCourses = providedCourseIds.filter(id => !pathCourseIds.includes(id));
    if (invalidCourses.length > 0) {
      throw new Error('Some courses do not belong to this learning path');
    }

    // Validate order indices are sequential starting from 0
    const sortedOrders = courseOrders.sort((a, b) => a.orderIndex - b.orderIndex);
    for (let i = 0; i < sortedOrders.length; i++) {
      if (sortedOrders[i].orderIndex !== i) {
        throw new Error('Order indices must be sequential starting from 0');
      }
    }

    await learningPathRepository.updateCourseOrder(learningPathId, courseOrders);
  }

  async regenerateShareToken(id: string, userId: string): Promise<string> {
    // Verify ownership
    const existingPath = await learningPathRepository.findById(id);
    if (!existingPath || existingPath.userId !== userId) {
      throw new Error('Learning path not found or access denied');
    }

    return learningPathRepository.regenerateShareToken(id);
  }

  async togglePublicAccess(id: string, userId: string, isPublic: boolean): Promise<LearningPath | null> {
    // Verify ownership
    const existingPath = await learningPathRepository.findById(id);
    if (!existingPath || existingPath.userId !== userId) {
      throw new Error('Learning path not found or access denied');
    }

    return learningPathRepository.update(
      id,
      existingPath.title,
      existingPath.description,
      existingPath.coverImageUrl,
      isPublic
    );
  }
}

export const learningPathService = new LearningPathService();
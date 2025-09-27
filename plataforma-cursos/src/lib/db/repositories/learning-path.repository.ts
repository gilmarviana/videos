import { PoolClient } from 'pg';
import { LearningPath, LearningPathCourse, Course } from '../../../types';
import db from '../connection';
import { v4 as uuidv4 } from 'uuid';

export class LearningPathRepository {
  async create(
    userId: string,
    title: string,
    description: string,
    coverImageUrl?: string
  ): Promise<LearningPath> {
    const shareToken = this.generateShareToken();
    
    const query = `
      INSERT INTO learning_paths (user_id, title, description, cover_image_url, share_token)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await db.query(query, [userId, title, description, coverImageUrl, shareToken]);
    const row = result.rows[0];
    
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      coverImageUrl: row.cover_image_url,
      shareToken: row.share_token,
      isPublic: row.is_public,
      courses: [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async findById(id: string): Promise<LearningPath | null> {
    const query = `
      SELECT lp.*, 
             json_agg(
               json_build_object(
                 'id', lpc.id,
                 'learningPathId', lpc.learning_path_id,
                 'courseId', lpc.course_id,
                 'orderIndex', lpc.order_index,
                 'course', json_build_object(
                   'id', c.id,
                   'title', c.title,
                   'description', c.description,
                   'coverImageUrl', c.cover_image_url,
                   'price', c.price,
                   'isActive', c.is_active,
                   'createdBy', c.created_by,
                   'createdAt', c.created_at,
                   'updatedAt', c.updated_at
                 )
               ) ORDER BY lpc.order_index
             ) FILTER (WHERE lpc.id IS NOT NULL) as courses
      FROM learning_paths lp
      LEFT JOIN learning_path_courses lpc ON lp.id = lpc.learning_path_id
      LEFT JOIN courses c ON lpc.course_id = c.id
      WHERE lp.id = $1
      GROUP BY lp.id
    `;
    
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return this.mapRowToLearningPath(row);
  }

  async findByUserId(userId: string): Promise<LearningPath[]> {
    const query = `
      SELECT lp.*, 
             json_agg(
               json_build_object(
                 'id', lpc.id,
                 'learningPathId', lpc.learning_path_id,
                 'courseId', lpc.course_id,
                 'orderIndex', lpc.order_index,
                 'course', json_build_object(
                   'id', c.id,
                   'title', c.title,
                   'description', c.description,
                   'coverImageUrl', c.cover_image_url,
                   'price', c.price,
                   'isActive', c.is_active,
                   'createdBy', c.created_by,
                   'createdAt', c.created_at,
                   'updatedAt', c.updated_at
                 )
               ) ORDER BY lpc.order_index
             ) FILTER (WHERE lpc.id IS NOT NULL) as courses
      FROM learning_paths lp
      LEFT JOIN learning_path_courses lpc ON lp.id = lpc.learning_path_id
      LEFT JOIN courses c ON lpc.course_id = c.id
      WHERE lp.user_id = $1
      GROUP BY lp.id
      ORDER BY lp.created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows.map(row => this.mapRowToLearningPath(row));
  }

  async findByShareToken(shareToken: string): Promise<LearningPath | null> {
    const query = `
      SELECT lp.*, 
             json_agg(
               json_build_object(
                 'id', lpc.id,
                 'learningPathId', lpc.learning_path_id,
                 'courseId', lpc.course_id,
                 'orderIndex', lpc.order_index,
                 'course', json_build_object(
                   'id', c.id,
                   'title', c.title,
                   'description', c.description,
                   'coverImageUrl', c.cover_image_url,
                   'price', c.price,
                   'isActive', c.is_active,
                   'createdBy', c.created_by,
                   'createdAt', c.created_at,
                   'updatedAt', c.updated_at
                 )
               ) ORDER BY lpc.order_index
             ) FILTER (WHERE lpc.id IS NOT NULL) as courses
      FROM learning_paths lp
      LEFT JOIN learning_path_courses lpc ON lp.id = lpc.learning_path_id
      LEFT JOIN courses c ON lpc.course_id = c.id
      WHERE lp.share_token = $1
      GROUP BY lp.id
    `;
    
    const result = await db.query(query, [shareToken]);
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return this.mapRowToLearningPath(row);
  }

  async update(
    id: string,
    title: string,
    description: string,
    coverImageUrl?: string,
    isPublic?: boolean
  ): Promise<LearningPath | null> {
    const query = `
      UPDATE learning_paths 
      SET title = $2, description = $3, cover_image_url = $4, is_public = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await db.query(query, [id, title, description, coverImageUrl, isPublic]);
    if (result.rows.length === 0) return null;
    
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM learning_paths WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  }

  async addCourse(learningPathId: string, courseId: string, orderIndex: number): Promise<LearningPathCourse> {
    const query = `
      INSERT INTO learning_path_courses (learning_path_id, course_id, order_index)
      VALUES ($1, $2, $3)
      ON CONFLICT (learning_path_id, course_id) 
      DO UPDATE SET order_index = $3
      RETURNING *
    `;
    
    const result = await db.query(query, [learningPathId, courseId, orderIndex]);
    const row = result.rows[0];
    
    return {
      id: row.id,
      learningPathId: row.learning_path_id,
      courseId: row.course_id,
      orderIndex: row.order_index
    };
  }

  async removeCourse(learningPathId: string, courseId: string): Promise<boolean> {
    const query = 'DELETE FROM learning_path_courses WHERE learning_path_id = $1 AND course_id = $2';
    const result = await db.query(query, [learningPathId, courseId]);
    return result.rowCount > 0;
  }

  async updateCourseOrder(learningPathId: string, courseOrders: { courseId: string; orderIndex: number }[]): Promise<void> {
    await db.transaction(async (client: PoolClient) => {
      for (const { courseId, orderIndex } of courseOrders) {
        await client.query(
          'UPDATE learning_path_courses SET order_index = $3 WHERE learning_path_id = $1 AND course_id = $2',
          [learningPathId, courseId, orderIndex]
        );
      }
    });
  }

  async regenerateShareToken(id: string): Promise<string> {
    const newToken = this.generateShareToken();
    const query = 'UPDATE learning_paths SET share_token = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1';
    await db.query(query, [id, newToken]);
    return newToken;
  }

  private generateShareToken(): string {
    return uuidv4().replace(/-/g, '').substring(0, 16);
  }

  private mapRowToLearningPath(row: any): LearningPath {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      coverImageUrl: row.cover_image_url,
      shareToken: row.share_token,
      isPublic: row.is_public,
      courses: row.courses || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export const learningPathRepository = new LearningPathRepository();
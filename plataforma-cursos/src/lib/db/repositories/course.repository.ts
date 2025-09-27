import { PoolClient } from 'pg';
import { Course, Module, Lesson, LessonMaterial } from '../../../types';
import { db } from '../connection';

export class CourseRepository {
  async create(courseData: Omit<Course, 'id' | 'modules' | 'createdAt' | 'updatedAt'>): Promise<Course> {
    const query = `
      INSERT INTO courses (title, description, cover_image_url, price, is_active, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      courseData.title,
      courseData.description,
      courseData.coverImageUrl,
      courseData.price,
      courseData.isActive,
      courseData.createdBy
    ];

    const result = await db.query(query, values);
    const course = result.rows[0];
    
    return {
      ...course,
      modules: [],
      createdAt: course.created_at,
      updatedAt: course.updated_at,
      isActive: course.is_active,
      coverImageUrl: course.cover_image_url,
      createdBy: course.created_by
    };
  }

  async findById(id: string): Promise<Course | null> {
    const query = `
      SELECT c.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', m.id,
                   'courseId', m.course_id,
                   'title', m.title,
                   'description', m.description,
                   'orderIndex', m.order_index,
                   'createdAt', m.created_at,
                   'updatedAt', m.updated_at,
                   'lessons', COALESCE(m.lessons, '[]'::json)
                 ) ORDER BY m.order_index
               ) FILTER (WHERE m.id IS NOT NULL), 
               '[]'::json
             ) as modules
      FROM courses c
      LEFT JOIN (
        SELECT m.*,
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', l.id,
                     'moduleId', l.module_id,
                     'title', l.title,
                     'description', l.description,
                     'videoUrl', l.video_url,
                     'videoSource', l.video_source,
                     'videoFormat', l.video_format,
                     'durationSeconds', l.duration_seconds,
                     'orderIndex', l.order_index,
                     'materials', l.materials,
                     'createdAt', l.created_at,
                     'updatedAt', l.updated_at
                   ) ORDER BY l.order_index
                 ) FILTER (WHERE l.id IS NOT NULL),
                 '[]'::json
               ) as lessons
        FROM modules m
        LEFT JOIN lessons l ON m.id = l.module_id
        GROUP BY m.id, m.course_id, m.title, m.description, m.order_index, m.created_at, m.updated_at
      ) m ON c.id = m.course_id
      WHERE c.id = $1
      GROUP BY c.id, c.title, c.description, c.cover_image_url, c.price, c.is_active, c.created_by, c.created_at, c.updated_at
    `;

    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const course = result.rows[0];
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      coverImageUrl: course.cover_image_url,
      price: course.price,
      isActive: course.is_active,
      createdBy: course.created_by,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
      modules: course.modules || []
    };
  }

  async findAll(isActive?: boolean): Promise<Course[]> {
    let query = `
      SELECT c.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', m.id,
                   'courseId', m.course_id,
                   'title', m.title,
                   'description', m.description,
                   'orderIndex', m.order_index,
                   'createdAt', m.created_at,
                   'updatedAt', m.updated_at,
                   'lessons', COALESCE(m.lessons, '[]'::json)
                 ) ORDER BY m.order_index
               ) FILTER (WHERE m.id IS NOT NULL), 
               '[]'::json
             ) as modules
      FROM courses c
      LEFT JOIN (
        SELECT m.*,
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', l.id,
                     'moduleId', l.module_id,
                     'title', l.title,
                     'description', l.description,
                     'videoUrl', l.video_url,
                     'videoSource', l.video_source,
                     'videoFormat', l.video_format,
                     'durationSeconds', l.duration_seconds,
                     'orderIndex', l.order_index,
                     'materials', l.materials,
                     'createdAt', l.created_at,
                     'updatedAt', l.updated_at
                   ) ORDER BY l.order_index
                 ) FILTER (WHERE l.id IS NOT NULL),
                 '[]'::json
               ) as lessons
        FROM modules m
        LEFT JOIN lessons l ON m.id = l.module_id
        GROUP BY m.id, m.course_id, m.title, m.description, m.order_index, m.created_at, m.updated_at
      ) m ON c.id = m.course_id
    `;

    const values: any[] = [];
    if (isActive !== undefined) {
      query += ' WHERE c.is_active = $1';
      values.push(isActive);
    }

    query += ' GROUP BY c.id, c.title, c.description, c.cover_image_url, c.price, c.is_active, c.created_by, c.created_at, c.updated_at ORDER BY c.created_at DESC';

    const result = await db.query(query, values);
    
    return result.rows.map((course: any) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      coverImageUrl: course.cover_image_url,
      price: course.price,
      isActive: course.is_active,
      createdBy: course.created_by,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
      modules: course.modules || []
    }));
  }

  async update(id: string, courseData: Partial<Omit<Course, 'id' | 'modules' | 'createdAt' | 'updatedAt'>>): Promise<Course | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (courseData.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(courseData.title);
    }
    if (courseData.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(courseData.description);
    }
    if (courseData.coverImageUrl !== undefined) {
      fields.push(`cover_image_url = $${paramCount++}`);
      values.push(courseData.coverImageUrl);
    }
    if (courseData.price !== undefined) {
      fields.push(`price = $${paramCount++}`);
      values.push(courseData.price);
    }
    if (courseData.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(courseData.isActive);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE courses 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM courses WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  }

  async findByCreatedBy(createdBy: string): Promise<Course[]> {
    const query = `
      SELECT c.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', m.id,
                   'courseId', m.course_id,
                   'title', m.title,
                   'description', m.description,
                   'orderIndex', m.order_index,
                   'createdAt', m.created_at,
                   'updatedAt', m.updated_at,
                   'lessons', COALESCE(m.lessons, '[]'::json)
                 ) ORDER BY m.order_index
               ) FILTER (WHERE m.id IS NOT NULL), 
               '[]'::json
             ) as modules
      FROM courses c
      LEFT JOIN (
        SELECT m.*,
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', l.id,
                     'moduleId', l.module_id,
                     'title', l.title,
                     'description', l.description,
                     'videoUrl', l.video_url,
                     'videoSource', l.video_source,
                     'videoFormat', l.video_format,
                     'durationSeconds', l.duration_seconds,
                     'orderIndex', l.order_index,
                     'materials', l.materials,
                     'createdAt', l.created_at,
                     'updatedAt', l.updated_at
                   ) ORDER BY l.order_index
                 ) FILTER (WHERE l.id IS NOT NULL),
                 '[]'::json
               ) as lessons
        FROM modules m
        LEFT JOIN lessons l ON m.id = l.module_id
        GROUP BY m.id, m.course_id, m.title, m.description, m.order_index, m.created_at, m.updated_at
      ) m ON c.id = m.course_id
      WHERE c.created_by = $1
      GROUP BY c.id, c.title, c.description, c.cover_image_url, c.price, c.is_active, c.created_by, c.created_at, c.updated_at
      ORDER BY c.created_at DESC
    `;

    const result = await db.query(query, [createdBy]);
    
    return result.rows.map((course: any) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      coverImageUrl: course.cover_image_url,
      price: course.price,
      isActive: course.is_active,
      createdBy: course.created_by,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
      modules: course.modules || []
    }));
  }

  async getPopularCourses(limit: number = 6): Promise<Course[]> {
    const query = `
      SELECT c.id, c.title, c.description, c.cover_image_url, c.price, c.is_active, 
             c.created_by, c.created_at, c.updated_at,
             COUNT(DISTINCT up.user_id) as student_count
      FROM courses c
      LEFT JOIN modules m ON c.id = m.course_id
      LEFT JOIN lessons l ON m.id = l.module_id
      LEFT JOIN user_progress up ON l.id = up.lesson_id
      WHERE c.is_active = true
      GROUP BY c.id, c.title, c.description, c.cover_image_url, c.price, c.is_active, 
               c.created_by, c.created_at, c.updated_at
      ORDER BY student_count DESC, c.created_at DESC
      LIMIT $1
    `;

    const result = await db.query(query, [limit]);
    
    return result.rows.map((course: any) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      coverImageUrl: course.cover_image_url,
      price: course.price,
      isActive: course.is_active,
      createdBy: course.created_by,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
      modules: []
    }));
  }

  async getLatestCourses(limit: number = 6): Promise<Course[]> {
    const query = `
      SELECT c.id, c.title, c.description, c.cover_image_url, c.price, c.is_active, 
             c.created_by, c.created_at, c.updated_at
      FROM courses c
      WHERE c.is_active = true
      ORDER BY c.created_at DESC
      LIMIT $1
    `;

    const result = await db.query(query, [limit]);
    
    return result.rows.map((course: any) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      coverImageUrl: course.cover_image_url,
      price: course.price,
      isActive: course.is_active,
      createdBy: course.created_by,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
      modules: []
    }));
  }
}

export const courseRepository = new CourseRepository();
import { PoolClient } from 'pg';
import { Module, Lesson } from '../../../types';
import { db } from '../connection';

export class ModuleRepository {
  async create(moduleData: Omit<Module, 'id' | 'lessons' | 'createdAt' | 'updatedAt'>): Promise<Module> {
    const query = `
      INSERT INTO modules (course_id, title, description, order_index)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [
      moduleData.courseId,
      moduleData.title,
      moduleData.description,
      moduleData.orderIndex
    ];

    const result = await db.query(query, values);
    const module = result.rows[0];
    
    return {
      id: module.id,
      courseId: module.course_id,
      title: module.title,
      description: module.description,
      orderIndex: module.order_index,
      lessons: [],
      createdAt: module.created_at,
      updatedAt: module.updated_at
    };
  }

  async findById(id: string): Promise<Module | null> {
    const query = `
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
      WHERE m.id = $1
      GROUP BY m.id, m.course_id, m.title, m.description, m.order_index, m.created_at, m.updated_at
    `;

    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const module = result.rows[0];
    return {
      id: module.id,
      courseId: module.course_id,
      title: module.title,
      description: module.description,
      orderIndex: module.order_index,
      lessons: module.lessons || [],
      createdAt: module.created_at,
      updatedAt: module.updated_at
    };
  }

  async findByCourseId(courseId: string): Promise<Module[]> {
    const query = `
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
      WHERE m.course_id = $1
      GROUP BY m.id, m.course_id, m.title, m.description, m.order_index, m.created_at, m.updated_at
      ORDER BY m.order_index
    `;

    const result = await db.query(query, [courseId]);
    
    return result.rows.map((module: any) => ({
      id: module.id,
      courseId: module.course_id,
      title: module.title,
      description: module.description,
      orderIndex: module.order_index,
      lessons: module.lessons || [],
      createdAt: module.created_at,
      updatedAt: module.updated_at
    }));
  }

  async update(id: string, moduleData: Partial<Omit<Module, 'id' | 'courseId' | 'lessons' | 'createdAt' | 'updatedAt'>>): Promise<Module | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (moduleData.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(moduleData.title);
    }
    if (moduleData.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(moduleData.description);
    }
    if (moduleData.orderIndex !== undefined) {
      fields.push(`order_index = $${paramCount++}`);
      values.push(moduleData.orderIndex);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE modules 
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
    const query = 'DELETE FROM modules WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  }

  async reorderModules(courseId: string, moduleOrders: { id: string; orderIndex: number }[]): Promise<void> {
    await db.transaction(async (client: PoolClient) => {
      for (const { id, orderIndex } of moduleOrders) {
        await client.query(
          'UPDATE modules SET order_index = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND course_id = $3',
          [orderIndex, id, courseId]
        );
      }
    });
  }

  async getNextOrderIndex(courseId: string): Promise<number> {
    const query = 'SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM modules WHERE course_id = $1';
    const result = await db.query(query, [courseId]);
    return result.rows[0].next_order;
  }
}

export const moduleRepository = new ModuleRepository();
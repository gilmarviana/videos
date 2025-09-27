import { PoolClient } from 'pg';
import { Lesson, LessonMaterial } from '../../../types';
import { db } from '../connection';

export class LessonRepository {
  async create(lessonData: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lesson> {
    const query = `
      INSERT INTO lessons (module_id, title, description, video_url, video_source, video_format, duration_seconds, order_index, materials)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      lessonData.moduleId,
      lessonData.title,
      lessonData.description,
      lessonData.videoUrl,
      lessonData.videoSource,
      lessonData.videoFormat,
      lessonData.durationSeconds,
      lessonData.orderIndex,
      JSON.stringify(lessonData.materials || [])
    ];

    const result = await db.query(query, values);
    const lesson = result.rows[0];
    
    return {
      id: lesson.id,
      moduleId: lesson.module_id,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.video_url,
      videoSource: lesson.video_source,
      videoFormat: lesson.video_format,
      durationSeconds: lesson.duration_seconds,
      orderIndex: lesson.order_index,
      materials: lesson.materials || [],
      createdAt: lesson.created_at,
      updatedAt: lesson.updated_at
    };
  }

  async findById(id: string): Promise<Lesson | null> {
    const query = 'SELECT * FROM lessons WHERE id = $1';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const lesson = result.rows[0];
    return {
      id: lesson.id,
      moduleId: lesson.module_id,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.video_url,
      videoSource: lesson.video_source,
      videoFormat: lesson.video_format,
      durationSeconds: lesson.duration_seconds,
      orderIndex: lesson.order_index,
      materials: lesson.materials || [],
      createdAt: lesson.created_at,
      updatedAt: lesson.updated_at
    };
  }

  async findByModuleId(moduleId: string): Promise<Lesson[]> {
    const query = 'SELECT * FROM lessons WHERE module_id = $1 ORDER BY order_index';
    const result = await db.query(query, [moduleId]);
    
    return result.rows.map((lesson: any) => ({
      id: lesson.id,
      moduleId: lesson.module_id,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.video_url,
      videoSource: lesson.video_source,
      videoFormat: lesson.video_format,
      durationSeconds: lesson.duration_seconds,
      orderIndex: lesson.order_index,
      materials: lesson.materials || [],
      createdAt: lesson.created_at,
      updatedAt: lesson.updated_at
    }));
  }

  async update(id: string, lessonData: Partial<Omit<Lesson, 'id' | 'moduleId' | 'createdAt' | 'updatedAt'>>): Promise<Lesson | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (lessonData.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(lessonData.title);
    }
    if (lessonData.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(lessonData.description);
    }
    if (lessonData.videoUrl !== undefined) {
      fields.push(`video_url = $${paramCount++}`);
      values.push(lessonData.videoUrl);
    }
    if (lessonData.videoSource !== undefined) {
      fields.push(`video_source = $${paramCount++}`);
      values.push(lessonData.videoSource);
    }
    if (lessonData.videoFormat !== undefined) {
      fields.push(`video_format = $${paramCount++}`);
      values.push(lessonData.videoFormat);
    }
    if (lessonData.durationSeconds !== undefined) {
      fields.push(`duration_seconds = $${paramCount++}`);
      values.push(lessonData.durationSeconds);
    }
    if (lessonData.orderIndex !== undefined) {
      fields.push(`order_index = $${paramCount++}`);
      values.push(lessonData.orderIndex);
    }
    if (lessonData.materials !== undefined) {
      fields.push(`materials = $${paramCount++}`);
      values.push(JSON.stringify(lessonData.materials));
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE lessons 
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
    const query = 'DELETE FROM lessons WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  }

  async reorderLessons(moduleId: string, lessonOrders: { id: string; orderIndex: number }[]): Promise<void> {
    await db.transaction(async (client: PoolClient) => {
      for (const { id, orderIndex } of lessonOrders) {
        await client.query(
          'UPDATE lessons SET order_index = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND module_id = $3',
          [orderIndex, id, moduleId]
        );
      }
    });
  }

  async getNextOrderIndex(moduleId: string): Promise<number> {
    const query = 'SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM lessons WHERE module_id = $1';
    const result = await db.query(query, [moduleId]);
    return result.rows[0].next_order;
  }

  async addMaterial(lessonId: string, material: LessonMaterial): Promise<Lesson | null> {
    const lesson = await this.findById(lessonId);
    if (!lesson) return null;

    const updatedMaterials = [...lesson.materials, material];
    return this.update(lessonId, { materials: updatedMaterials });
  }

  async removeMaterial(lessonId: string, materialId: string): Promise<Lesson | null> {
    const lesson = await this.findById(lessonId);
    if (!lesson) return null;

    const updatedMaterials = lesson.materials.filter(m => m.id !== materialId);
    return this.update(lessonId, { materials: updatedMaterials });
  }

  async updateMaterial(lessonId: string, materialId: string, materialData: Partial<LessonMaterial>): Promise<Lesson | null> {
    const lesson = await this.findById(lessonId);
    if (!lesson) return null;

    const updatedMaterials = lesson.materials.map(m => 
      m.id === materialId ? { ...m, ...materialData } : m
    );
    return this.update(lessonId, { materials: updatedMaterials });
  }
}

export const lessonRepository = new LessonRepository();
import { Pool } from 'pg';
import { Quiz, QuizAttempt } from '../../../types';

export class QuizRepository {
  constructor(private db: Pool) {}

  async create(data: {
    lessonId?: string;
    moduleId?: string;
    courseId?: string;
    type: 'lesson' | 'module' | 'course';
    questions: any[];
  }): Promise<Quiz> {
    const { lessonId, moduleId, courseId, type, questions } = data;

    const query = `
      INSERT INTO quizzes (lesson_id, module_id, course_id, quiz_type, questions, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, lesson_id, module_id, course_id, quiz_type as type, questions, is_active, created_at
    `;

    const values = [
      lessonId || null,
      moduleId || null,
      courseId || null,
      type,
      JSON.stringify(questions),
      true
    ];

    const result = await this.db.query(query, values);
    return this.mapQuizRow(result.rows[0]);
  }

  async findByTarget(targetId: string, type: 'lesson' | 'module' | 'course'): Promise<Quiz | null> {
    const columnMap = {
      lesson: 'lesson_id',
      module: 'module_id',
      course: 'course_id'
    };

    const query = `
      SELECT id, lesson_id, module_id, course_id, quiz_type as type, questions, is_active, created_at
      FROM quizzes
      WHERE ${columnMap[type]} = $1 AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await this.db.query(query, [targetId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapQuizRow(result.rows[0]);
  }

  async findById(id: string): Promise<Quiz | null> {
    const query = `
      SELECT id, lesson_id, module_id, course_id, quiz_type as type, questions, is_active, created_at
      FROM quizzes
      WHERE id = $1 AND is_active = true
    `;

    const result = await this.db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapQuizRow(result.rows[0]);
  }

  async update(id: string, questions: any[]): Promise<Quiz> {
    const query = `
      UPDATE quizzes 
      SET questions = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND is_active = true
      RETURNING id, lesson_id, module_id, course_id, quiz_type as type, questions, is_active, created_at
    `;

    const result = await this.db.query(query, [JSON.stringify(questions), id]);
    
    if (result.rows.length === 0) {
      throw new Error('Quiz not found');
    }

    return this.mapQuizRow(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const query = `
      UPDATE quizzes SET is_active = false WHERE id = $1
    `;

    await this.db.query(query, [id]);
  }

  async createAttempt(data: {
    userId: string;
    quizId: string;
    answers: number[];
    score: number;
  }): Promise<QuizAttempt> {
    const query = `
      INSERT INTO quiz_attempts (user_id, quiz_id, answers, score)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, quiz_id, answers, score, completed_at
    `;

    const result = await this.db.query(query, [
      data.userId,
      data.quizId,
      JSON.stringify(data.answers),
      data.score
    ]);

    return this.mapAttemptRow(result.rows[0]);
  }

  async findAttemptsByUser(userId: string, quizId: string): Promise<QuizAttempt[]> {
    const query = `
      SELECT id, user_id, quiz_id, answers, score, completed_at
      FROM quiz_attempts
      WHERE user_id = $1 AND quiz_id = $2
      ORDER BY completed_at DESC
    `;

    const result = await this.db.query(query, [userId, quizId]);

    return result.rows.map(row => this.mapAttemptRow(row));
  }

  async getAverageScoreForCourse(userId: string, courseId: string): Promise<number> {
    const query = `
      SELECT AVG(qa.score) as average_score
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.user_id = $1 AND q.course_id = $2
    `;

    const result = await this.db.query(query, [userId, courseId]);
    return result.rows[0]?.average_score || 0;
  }

  async getLessonDetails(lessonId: string): Promise<{
    title: string;
    description: string;
    materials: any[];
    moduleTitle: string;
    courseTitle: string;
  } | null> {
    const query = `
      SELECT l.title, l.description, l.materials, m.title as module_title, c.title as course_title
      FROM lessons l
      JOIN modules m ON l.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE l.id = $1
    `;

    const result = await this.db.query(query, [lessonId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      title: row.title,
      description: row.description,
      materials: row.materials || [],
      moduleTitle: row.module_title,
      courseTitle: row.course_title,
    };
  }

  async getModuleDetails(moduleId: string): Promise<{
    title: string;
    description: string;
    lessonTitles: string[];
  } | null> {
    const query = `
      SELECT m.title, m.description, 
             array_agg(l.title ORDER BY l.order_index) as lesson_titles
      FROM modules m
      LEFT JOIN lessons l ON m.id = l.module_id
      WHERE m.id = $1
      GROUP BY m.id, m.title, m.description
    `;

    const result = await this.db.query(query, [moduleId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      title: row.title,
      description: row.description,
      lessonTitles: row.lesson_titles || [],
    };
  }

  async getCourseDetails(courseId: string): Promise<{
    title: string;
    description: string;
    modulesData: { title: string; lessons: string[] }[];
  } | null> {
    const query = `
      SELECT c.title, c.description,
             json_agg(
               json_build_object(
                 'title', m.title,
                 'lessons', m.lesson_titles
               ) ORDER BY m.order_index
             ) as modules_data
      FROM courses c
      LEFT JOIN (
        SELECT m.id, m.course_id, m.title, m.order_index,
               array_agg(l.title ORDER BY l.order_index) as lesson_titles
        FROM modules m
        LEFT JOIN lessons l ON m.id = l.module_id
        GROUP BY m.id, m.course_id, m.title, m.order_index
      ) m ON c.id = m.course_id
      WHERE c.id = $1
      GROUP BY c.id, c.title, c.description
    `;

    const result = await this.db.query(query, [courseId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      title: row.title,
      description: row.description,
      modulesData: row.modules_data || [],
    };
  }

  private mapQuizRow(row: any): Quiz {
    return {
      id: row.id,
      lessonId: row.lesson_id,
      moduleId: row.module_id,
      courseId: row.course_id,
      type: row.type,
      questions: row.questions,
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }

  private mapAttemptRow(row: any): QuizAttempt {
    return {
      id: row.id,
      userId: row.user_id,
      quizId: row.quiz_id,
      answers: row.answers,
      score: row.score,
      completedAt: row.completed_at,
    };
  }
}
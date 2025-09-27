import { db } from '@/lib/db/connection';
import { Certificate } from '@/types';

export class CertificateRepository {
  /**
   * Create a new certificate
   */
  static async create(data: {
    userId: string;
    courseId: string;
    certificateUrl: string;
    averageQuizScore?: number | null;
  }): Promise<Certificate> {
    const result = await db.query(
      `INSERT INTO certificates (user_id, course_id, certificate_url, average_quiz_score)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, course_id, certificate_url, average_quiz_score, issued_at`,
      [data.userId, data.courseId, data.certificateUrl, data.averageQuizScore]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      courseId: row.course_id,
      certificateUrl: row.certificate_url,
      averageQuizScore: row.average_quiz_score,
      issuedAt: new Date(row.issued_at)
    };
  }

  /**
   * Find certificate by user and course
   */
  static async findByUserAndCourse(userId: string, courseId: string): Promise<Certificate | null> {
    const result = await db.query(
      `SELECT id, user_id, course_id, certificate_url, average_quiz_score, issued_at
       FROM certificates 
       WHERE user_id = $1 AND course_id = $2`,
      [userId, courseId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      courseId: row.course_id,
      certificateUrl: row.certificate_url,
      averageQuizScore: row.average_quiz_score,
      issuedAt: new Date(row.issued_at)
    };
  }

  /**
   * Find certificate by ID
   */
  static async findById(id: string): Promise<Certificate | null> {
    const result = await db.query(
      `SELECT id, user_id, course_id, certificate_url, average_quiz_score, issued_at
       FROM certificates 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      courseId: row.course_id,
      certificateUrl: row.certificate_url,
      averageQuizScore: row.average_quiz_score,
      issuedAt: new Date(row.issued_at)
    };
  }

  /**
   * Find all certificates for a user
   */
  static async findByUserId(userId: string): Promise<Certificate[]> {
    const result = await db.query(
      `SELECT c.id, c.user_id, c.course_id, c.certificate_url, 
              c.average_quiz_score, c.issued_at, co.title as course_title
       FROM certificates c
       JOIN courses co ON c.course_id = co.id
       WHERE c.user_id = $1
       ORDER BY c.issued_at DESC`,
      [userId]
    );

    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      courseId: row.course_id,
      certificateUrl: row.certificate_url,
      averageQuizScore: row.average_quiz_score,
      issuedAt: new Date(row.issued_at)
    }));
  }

  /**
   * Find certificate with user and course details
   */
  static async findByIdWithDetails(id: string): Promise<{
    certificate: Certificate;
    userName: string;
    courseName: string;
  } | null> {
    const result = await db.query(
      `SELECT c.id, c.user_id, c.course_id, c.certificate_url, 
              c.average_quiz_score, c.issued_at,
              u.name as user_name, co.title as course_name
       FROM certificates c
       JOIN users u ON c.user_id = u.id
       JOIN courses co ON c.course_id = co.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      certificate: {
        id: row.id,
        userId: row.user_id,
        courseId: row.course_id,
        certificateUrl: row.certificate_url,
        averageQuizScore: row.average_quiz_score,
        issuedAt: new Date(row.issued_at)
      },
      userName: row.user_name,
      courseName: row.course_name
    };
  }

  /**
   * Update certificate URL
   */
  static async updateCertificateUrl(id: string, certificateUrl: string): Promise<Certificate | null> {
    const result = await db.query(
      `UPDATE certificates 
       SET certificate_url = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, user_id, course_id, certificate_url, average_quiz_score, issued_at`,
      [id, certificateUrl]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      courseId: row.course_id,
      certificateUrl: row.certificate_url,
      averageQuizScore: row.average_quiz_score,
      issuedAt: new Date(row.issued_at)
    };
  }

  /**
   * Delete certificate
   */
  static async delete(id: string): Promise<boolean> {
    const result = await db.query(
      'DELETE FROM certificates WHERE id = $1',
      [id]
    );

    return result.rowCount > 0;
  }

  /**
   * Count certificates by course
   */
  static async countByCourse(courseId: string): Promise<number> {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM certificates WHERE course_id = $1',
      [courseId]
    );

    return parseInt(result.rows[0].count);
  }

  /**
   * Count certificates by user
   */
  static async countByUser(userId: string): Promise<number> {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM certificates WHERE user_id = $1',
      [userId]
    );

    return parseInt(result.rows[0].count);
  }

  /**
   * Get certificate statistics
   */
  static async getStatistics(): Promise<{
    totalCertificates: number;
    certificatesThisMonth: number;
    averageScore: number;
  }> {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_certificates,
        COUNT(CASE WHEN issued_at >= date_trunc('month', CURRENT_DATE) THEN 1 END) as certificates_this_month,
        AVG(average_quiz_score) as average_score
      FROM certificates
    `);

    const row = result.rows[0];
    return {
      totalCertificates: parseInt(row.total_certificates),
      certificatesThisMonth: parseInt(row.certificates_this_month),
      averageScore: parseFloat(row.average_score) || 0
    };
  }
}
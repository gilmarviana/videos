import { Certificate, Course, User } from '@/types';
import { db } from '@/lib/db/connection';
import { generateCertificatePDF } from '@/lib/utils/pdf-generator';
import { FileUploadService } from '@/lib/services/file-upload.service';
import { CertificateRepository } from '@/lib/db/repositories/certificate.repository';
import { NotificationService } from './notification.service';
import { WebhookService } from './webhook.service';

export class CertificateService {
  /**
   * Generate certificate for a user upon course completion
   */
  static async generateCertificate(
    userId: string, 
    courseId: string
  ): Promise<Certificate> {
    try {
      // Check if certificate already exists
      const existingCertificate = await this.getCertificate(userId, courseId);
      if (existingCertificate) {
        return existingCertificate;
      }

      // Get user and course information
      const [user, course] = await Promise.all([
        this.getUserById(userId),
        this.getCourseById(courseId)
      ]);

      if (!user || !course) {
        throw new Error('User or course not found');
      }

      // Calculate average quiz score if user took quizzes
      const averageQuizScore = await this.calculateAverageQuizScore(userId, courseId);

      // Generate PDF certificate
      const certificateBuffer = await generateCertificatePDF({
        userName: user.name,
        courseName: course.title,
        completionDate: new Date(),
        averageScore: averageQuizScore,
        certificateId: `CERT-${Date.now()}-${userId.slice(0, 8)}`
      });

      // Upload certificate to storage
      const certificateUrl = await FileUploadService.uploadFile(
        certificateBuffer,
        `certificates/${userId}/${courseId}.pdf`,
        'application/pdf'
      );

      // Save certificate to database
      const certificate = await this.saveCertificate({
        userId,
        courseId,
        certificateUrl,
        averageQuizScore
      });

      // Send certificate generation notification
      await NotificationService.processNotification({
        type: 'certificate_generated',
        userId,
        data: {
          userId,
          courseTitle: course.title,
          certificateId: certificate.id
        }
      });

      // Trigger webhook for certificate generation
      const webhookService = new WebhookService();
      await webhookService.triggerCertificateGenerated({
        userId,
        userEmail: user.email,
        courseId,
        courseName: course.title,
        certificateId: certificate.id,
        certificateUrl,
        averageQuizScore,
        issuedAt: new Date().toISOString()
      });

      return certificate;
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw new Error('Failed to generate certificate');
    }
  }

  /**
   * Get certificate for a user and course
   */
  static async getCertificate(userId: string, courseId: string): Promise<Certificate | null> {
    try {
      return await CertificateRepository.findByUserAndCourse(userId, courseId);
    } catch (error) {
      console.error('Error getting certificate:', error);
      throw new Error('Failed to get certificate');
    }
  }

  /**
   * Get all certificates for a user
   */
  static async getUserCertificates(userId: string): Promise<Certificate[]> {
    try {
      return await CertificateRepository.findByUserId(userId);
    } catch (error) {
      console.error('Error getting user certificates:', error);
      throw new Error('Failed to get user certificates');
    }
  }

  /**
   * Verify certificate authenticity
   */
  static async verifyCertificate(certificateId: string): Promise<{
    isValid: boolean;
    certificate?: Certificate & { userName: string; courseName: string };
  }> {
    try {
      const result = await CertificateRepository.findByIdWithDetails(certificateId);

      if (!result) {
        return { isValid: false };
      }

      return {
        isValid: true,
        certificate: {
          ...result.certificate,
          userName: result.userName,
          courseName: result.courseName
        }
      };
    } catch (error) {
      console.error('Error verifying certificate:', error);
      throw new Error('Failed to verify certificate');
    }
  }

  /**
   * Check if user has completed course and is eligible for certificate
   */
  static async isEligibleForCertificate(userId: string, courseId: string): Promise<boolean> {
    try {
      // Check if course is completed
      const completionResult = await db.query(
        `SELECT id FROM course_completions 
         WHERE user_id = $1 AND course_id = $2`,
        [userId, courseId]
      );

      return completionResult.rows.length > 0;
    } catch (error) {
      console.error('Error checking certificate eligibility:', error);
      return false;
    }
  }

  /**
   * Private helper methods
   */
  private static async getUserById(userId: string): Promise<User | null> {
    const result = await db.query(
      'SELECT id, email, name, role FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      passwordHash: '',
      trialStartTime: null,
      trialMinutesUsed: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private static async getCourseById(courseId: string): Promise<Course | null> {
    const result = await db.query(
      'SELECT id, title, description FROM courses WHERE id = $1',
      [courseId]
    );
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      coverImageUrl: '',
      isActive: true,
      modules: [],
      createdBy: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private static async calculateAverageQuizScore(userId: string, courseId: string): Promise<number | null> {
    try {
      const result = await db.query(
        `SELECT AVG(qa.score) as average_score
         FROM quiz_attempts qa
         JOIN quizzes q ON qa.quiz_id = q.id
         WHERE qa.user_id = $1 AND (
           q.course_id = $2 OR 
           q.module_id IN (SELECT id FROM modules WHERE course_id = $2) OR
           q.lesson_id IN (
             SELECT l.id FROM lessons l 
             JOIN modules m ON l.module_id = m.id 
             WHERE m.course_id = $2
           )
         )`,
        [userId, courseId]
      );

      const averageScore = result.rows[0]?.average_score;
      return averageScore ? parseFloat(averageScore) : null;
    } catch (error) {
      console.error('Error calculating average quiz score:', error);
      return null;
    }
  }

  private static async saveCertificate(data: {
    userId: string;
    courseId: string;
    certificateUrl: string;
    averageQuizScore: number | null;
  }): Promise<Certificate> {
    return await CertificateRepository.create(data);
  }
}
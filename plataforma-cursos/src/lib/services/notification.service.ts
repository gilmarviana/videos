import { EmailService } from './email.service';
import { UserRepository } from '../db/repositories/user.repository';
import { config } from '../config';

export interface NotificationEvent {
  type: 'user_registered' | 'trial_warning' | 'trial_expired' | 'payment_confirmed' | 'payment_failed' | 'subscription_cancelled' | 'course_completed' | 'certificate_generated' | 'admin_alert';
  userId?: string;
  data: any;
}

export interface AdminNotificationData {
  type: 'new_user' | 'payment_failure' | 'system_error' | 'high_trial_usage' | 'subscription_milestone';
  message: string;
  details?: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export class NotificationService {
  
  /**
   * Process notification events and send appropriate emails
   */
  static async processNotification(event: NotificationEvent): Promise<void> {
    try {
      switch (event.type) {
        case 'user_registered':
          await this.handleUserRegistered(event.data);
          break;
        case 'trial_warning':
          await this.handleTrialWarning(event.data);
          break;
        case 'trial_expired':
          await this.handleTrialExpired(event.data);
          break;
        case 'payment_confirmed':
          await this.handlePaymentConfirmed(event.data);
          break;
        case 'payment_failed':
          await this.handlePaymentFailed(event.data);
          break;
        case 'subscription_cancelled':
          await this.handleSubscriptionCancelled(event.data);
          break;
        case 'course_completed':
          await this.handleCourseCompleted(event.data);
          break;
        case 'certificate_generated':
          await this.handleCertificateGenerated(event.data);
          break;
        case 'admin_alert':
          await this.handleAdminAlert(event.data);
          break;
        default:
          console.warn(`Unknown notification type: ${event.type}`);
      }
    } catch (error) {
      console.error(`Failed to process notification ${event.type}:`, error);
      // Don't throw - notifications should not break the main flow
    }
  }

  /**
   * Send welcome email to new users
   */
  private static async handleUserRegistered(data: { email: string; name: string }): Promise<void> {
    await EmailService.sendWelcomeEmail(data.email, data.name);
    
    // Also notify admin about new user
    await this.sendAdminNotification({
      type: 'new_user',
      message: `Novo usuário cadastrado: ${data.name} (${data.email})`,
      severity: 'info',
      details: { email: data.email, name: data.name }
    });
  }

  /**
   * Send trial expiration warning
   */
  private static async handleTrialWarning(data: { userId: string; minutesRemaining: number }): Promise<void> {
    const user = await UserRepository.findById(data.userId);
    if (!user) return;

    await EmailService.sendTrialExpirationWarning(user.email, user.name, data.minutesRemaining);
  }

  /**
   * Handle trial expiration
   */
  private static async handleTrialExpired(data: { userId: string }): Promise<void> {
    const user = await UserRepository.findById(data.userId);
    if (!user) return;

    const subject = 'Seu teste gratuito expirou';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc3545;">Teste Gratuito Expirado</h1>
        <p>Olá, ${user.name}!</p>
        <p>Seu teste gratuito de ${config.app.trialHours} horas chegou ao fim.</p>
        <p>Para continuar acessando nossos cursos, assine nossa plataforma:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.app.nextAuthUrl}/subscription" 
             style="background-color: #28a745; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Assinar por R$ ${config.app.subscriptionPrice}/mês
          </a>
        </div>
        <p>Com a assinatura, você terá acesso ilimitado a:</p>
        <ul>
          <li>Todos os cursos da plataforma</li>
          <li>Quizzes interativos</li>
          <li>Certificados de conclusão</li>
          <li>Suporte prioritário</li>
        </ul>
        <p>Esperamos você de volta em breve!</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Este é um email automático, por favor não responda.
        </p>
      </div>
    `;

    await EmailService.sendEmail({ to: user.email, subject, html });
  }

  /**
   * Handle payment confirmation
   */
  private static async handlePaymentConfirmed(data: { userId: string; amount: number; currency: string }): Promise<void> {
    const user = await UserRepository.findById(data.userId);
    if (!user) return;

    await EmailService.sendPaymentConfirmation(user.email, user.name, data.amount, data.currency);
  }

  /**
   * Handle payment failure
   */
  private static async handlePaymentFailed(data: { userId: string; reason?: string }): Promise<void> {
    const user = await UserRepository.findById(data.userId);
    if (!user) return;

    await EmailService.sendPaymentFailed(user.email, user.name);
    
    // Notify admin about payment failure
    await this.sendAdminNotification({
      type: 'payment_failure',
      message: `Falha no pagamento do usuário ${user.name} (${user.email})`,
      severity: 'warning',
      details: { userId: data.userId, reason: data.reason }
    });
  }

  /**
   * Handle subscription cancellation
   */
  private static async handleSubscriptionCancelled(data: { userId: string; periodEnd: Date }): Promise<void> {
    const user = await UserRepository.findById(data.userId);
    if (!user) return;

    await EmailService.sendSubscriptionCancelled(user.email, user.name, data.periodEnd);
  }

  /**
   * Handle course completion
   */
  private static async handleCourseCompleted(data: { userId: string; courseTitle: string }): Promise<void> {
    const user = await UserRepository.findById(data.userId);
    if (!user) return;

    const subject = 'Parabéns! Curso concluído';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #28a745;">🎉 Parabéns!</h1>
        <p>Olá, ${user.name}!</p>
        <p>Você concluiu com sucesso o curso: <strong>${data.courseTitle}</strong></p>
        <p>Isso é uma grande conquista! Continue aprendendo e explorando novos conhecimentos.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.app.nextAuthUrl}/certificates" 
             style="background-color: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Ver Certificados
          </a>
        </div>
        <p>Explore outros cursos da plataforma e continue sua jornada de aprendizado!</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Este é um email automático, por favor não responda.
        </p>
      </div>
    `;

    await EmailService.sendEmail({ to: user.email, subject, html });
  }

  /**
   * Handle certificate generation
   */
  private static async handleCertificateGenerated(data: { userId: string; courseTitle: string; certificateId: string }): Promise<void> {
    const user = await UserRepository.findById(data.userId);
    if (!user) return;

    const subject = 'Seu certificado está pronto!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #28a745;">🏆 Certificado Gerado!</h1>
        <p>Olá, ${user.name}!</p>
        <p>Seu certificado de conclusão do curso <strong>${data.courseTitle}</strong> foi gerado com sucesso!</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.app.nextAuthUrl}/certificates/${data.certificateId}/download" 
             style="background-color: #28a745; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Baixar Certificado
          </a>
        </div>
        <p>Você pode usar este certificado para comprovar seus conhecimentos e habilidades.</p>
        <p>Continue aprendendo e conquistando novos certificados!</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Este é um email automático, por favor não responda.
        </p>
      </div>
    `;

    await EmailService.sendEmail({ to: user.email, subject, html });
  }

  /**
   * Handle admin alerts
   */
  private static async handleAdminAlert(data: AdminNotificationData): Promise<void> {
    // Get admin email from config
    const adminEmail = config.email.adminEmail;
    
    const severityColors = {
      info: '#17a2b8',
      warning: '#ffc107',
      error: '#dc3545',
      critical: '#721c24'
    };

    const subject = `[${data.severity.toUpperCase()}] ${data.type.replace('_', ' ').toUpperCase()} - Plataforma de Cursos`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${severityColors[data.severity]}; color: white; padding: 15px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 18px;">Notificação Administrativa</h1>
        </div>
        <div style="border: 1px solid #ddd; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
          <p><strong>Tipo:</strong> ${data.type.replace('_', ' ')}</p>
          <p><strong>Severidade:</strong> ${data.severity}</p>
          <p><strong>Mensagem:</strong> ${data.message}</p>
          ${data.details ? `
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
              <strong>Detalhes:</strong>
              <pre style="margin: 10px 0; font-size: 12px; overflow-x: auto;">${JSON.stringify(data.details, null, 2)}</pre>
            </div>
          ` : ''}
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Timestamp: ${new Date().toISOString()}
          </p>
        </div>
      </div>
    `;

    await EmailService.sendEmail({ to: adminEmail, subject, html });
  }

  /**
   * Send admin notification
   */
  static async sendAdminNotification(data: AdminNotificationData): Promise<void> {
    await this.processNotification({
      type: 'admin_alert',
      data
    });
  }

  /**
   * Check trial status and send warnings if needed
   */
  static async checkTrialWarnings(): Promise<void> {
    try {
      // Get users in trial with less than 60 minutes remaining
      const usersNearExpiration = await UserRepository.findUsersNearTrialExpiration(60);
      
      for (const user of usersNearExpiration) {
        const minutesRemaining = (config.app.trialHours * 60) - user.trialMinutesUsed;
        
        // Send warning at 30 minutes and 10 minutes remaining
        if (minutesRemaining <= 30 && minutesRemaining > 25) {
          await this.processNotification({
            type: 'trial_warning',
            userId: user.id,
            data: { userId: user.id, minutesRemaining }
          });
        } else if (minutesRemaining <= 10 && minutesRemaining > 5) {
          await this.processNotification({
            type: 'trial_warning',
            userId: user.id,
            data: { userId: user.id, minutesRemaining }
          });
        }
      }
    } catch (error) {
      console.error('Failed to check trial warnings:', error);
    }
  }

  /**
   * Send daily admin summary
   */
  static async sendDailyAdminSummary(): Promise<void> {
    try {
      const stats = await this.getDailyStats();
      
      await this.sendAdminNotification({
        type: 'subscription_milestone',
        message: 'Resumo diário da plataforma',
        severity: 'info',
        details: stats
      });
    } catch (error) {
      console.error('Failed to send daily admin summary:', error);
    }
  }

  /**
   * Get daily statistics for admin summary
   */
  private static async getDailyStats(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // This would typically query the database for daily stats
    // For now, return a placeholder structure
    return {
      date: today.toISOString().split('T')[0],
      newUsers: 0, // Would be calculated from database
      activeTrials: 0, // Would be calculated from database
      newSubscriptions: 0, // Would be calculated from database
      revenue: 0, // Would be calculated from database
      coursesCompleted: 0, // Would be calculated from database
      certificatesGenerated: 0 // Would be calculated from database
    };
  }
}
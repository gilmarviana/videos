import nodemailer from 'nodemailer';
import { config } from '../config';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: config.email.smtp.host,
    port: config.email.smtp.port,
    secure: config.email.smtp.port === 465,
    auth: {
      user: config.email.smtp.user,
      pass: config.email.smtp.pass,
    },
  });

  static async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  static async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = 'Bem-vindo à Plataforma de Cursos!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Bem-vindo, ${name}!</h1>
        <p>Obrigado por se cadastrar na nossa plataforma de cursos online.</p>
        <p>Você agora tem acesso ao seu teste gratuito de ${config.app.trialHours} horas para explorar nossos cursos.</p>
        <p>Para começar, faça login na plataforma e explore nosso catálogo de cursos.</p>
        <p>Se tiver alguma dúvida, não hesite em entrar em contato conosco.</p>
        <p>Bons estudos!</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Este é um email automático, por favor não responda.
        </p>
      </div>
    `;

    await this.sendEmail({ to, subject, html });
  }

  static async sendPasswordResetEmail(to: string, name: string, resetToken: string): Promise<void> {
    const resetUrl = `${config.app.nextAuthUrl}/reset-password?token=${resetToken}`;
    const subject = 'Redefinição de Senha - Plataforma de Cursos';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Redefinição de Senha</h1>
        <p>Olá, ${name}!</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Redefinir Senha
          </a>
        </div>
        <p>Ou copie e cole este link no seu navegador:</p>
        <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
        <p><strong>Este link expira em 1 hora.</strong></p>
        <p>Se você não solicitou esta redefinição, ignore este email. Sua senha permanecerá inalterada.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Este é um email automático, por favor não responda.
        </p>
      </div>
    `;

    await this.sendEmail({ to, subject, html });
  }

  static async sendTrialExpirationWarning(to: string, name: string, minutesRemaining: number): Promise<void> {
    const subject = 'Seu teste gratuito está acabando!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff6b35;">Seu teste gratuito está acabando!</h1>
        <p>Olá, ${name}!</p>
        <p>Você ainda tem <strong>${minutesRemaining} minutos</strong> restantes do seu teste gratuito.</p>
        <p>Para continuar acessando nossos cursos, assine nossa plataforma por apenas R$ ${config.app.subscriptionPrice}/mês.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.app.nextAuthUrl}/subscription" 
             style="background-color: #28a745; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Assinar Agora
          </a>
        </div>
        <p>Com a assinatura, você terá acesso ilimitado a todos os cursos, quizzes e certificados.</p>
        <p>Não perca essa oportunidade de continuar aprendendo!</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Este é um email automático, por favor não responda.
        </p>
      </div>
    `;

    await this.sendEmail({ to, subject, html });
  }

  static async sendPaymentConfirmation(to: string, name: string, amount: number, currency: string): Promise<void> {
    const subject = 'Pagamento Confirmado - Plataforma de Cursos';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #28a745;">Pagamento Confirmado!</h1>
        <p>Olá, ${name}!</p>
        <p>Seu pagamento foi processado com sucesso!</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Detalhes do Pagamento:</h3>
          <p style="margin: 5px 0;"><strong>Valor:</strong> ${currency} ${amount.toFixed(2)}</p>
          <p style="margin: 5px 0;"><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> Confirmado</p>
        </div>
        <p>Sua assinatura está ativa e você agora tem acesso completo a todos os cursos da plataforma.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.app.nextAuthUrl}/dashboard" 
             style="background-color: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Acessar Cursos
          </a>
        </div>
        <p>Obrigado por escolher nossa plataforma!</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Este é um email automático, por favor não responda.
        </p>
      </div>
    `;

    await this.sendEmail({ to, subject, html });
  }

  static async sendPaymentFailed(to: string, name: string): Promise<void> {
    const subject = 'Problema com seu Pagamento - Plataforma de Cursos';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc3545;">Problema com seu Pagamento</h1>
        <p>Olá, ${name}!</p>
        <p>Infelizmente, não conseguimos processar seu último pagamento.</p>
        <p>Isso pode ter acontecido por diversos motivos:</p>
        <ul>
          <li>Cartão de crédito expirado</li>
          <li>Limite insuficiente</li>
          <li>Dados de pagamento desatualizados</li>
        </ul>
        <p><strong>Para manter seu acesso ativo, atualize suas informações de pagamento:</strong></p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.app.nextAuthUrl}/subscription/update-payment" 
             style="background-color: #dc3545; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Atualizar Pagamento
          </a>
        </div>
        <p>Se não atualizarmos suas informações de pagamento em breve, seu acesso à plataforma será suspenso.</p>
        <p>Se você tiver dúvidas, entre em contato conosco.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Este é um email automático, por favor não responda.
        </p>
      </div>
    `;

    await this.sendEmail({ to, subject, html });
  }

  static async sendSubscriptionCancelled(to: string, name: string, periodEnd: Date): Promise<void> {
    const subject = 'Assinatura Cancelada - Plataforma de Cursos';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6c757d;">Assinatura Cancelada</h1>
        <p>Olá, ${name}!</p>
        <p>Confirmamos o cancelamento da sua assinatura.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Informações Importantes:</h3>
          <p style="margin: 5px 0;">• Você manterá acesso até: <strong>${periodEnd.toLocaleDateString('pt-BR')}</strong></p>
          <p style="margin: 5px 0;">• Não haverá mais cobranças automáticas</p>
          <p style="margin: 5px 0;">• Seus dados e progresso serão mantidos</p>
        </div>
        <p>Você pode reativar sua assinatura a qualquer momento antes da data de expiração.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.app.nextAuthUrl}/subscription/reactivate" 
             style="background-color: #28a745; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Reativar Assinatura
          </a>
        </div>
        <p>Sentiremos sua falta! Se mudou de ideia, estaremos aqui quando quiser voltar.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Este é um email automático, por favor não responda.
        </p>
      </div>
    `;

    await this.sendEmail({ to, subject, html });
  }

  // Instance methods for compatibility with PaymentService
  async sendPaymentConfirmation(to: string, name: string, amount: number, currency: string): Promise<void> {
    return EmailService.sendPaymentConfirmation(to, name, amount, currency);
  }

  async sendPaymentFailed(to: string, name: string): Promise<void> {
    return EmailService.sendPaymentFailed(to, name);
  }

  async sendSubscriptionCancelled(to: string, name: string, periodEnd: Date): Promise<void> {
    return EmailService.sendSubscriptionCancelled(to, name, periodEnd);
  }
}
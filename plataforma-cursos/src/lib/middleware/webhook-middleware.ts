import { NextRequest } from 'next/server';
import { WebhookService } from '../services/webhook.service';

export class WebhookMiddleware {
  private static webhookService = new WebhookService();

  /**
   * Trigger site visit webhook for page visits
   */
  static async triggerSiteVisit(request: NextRequest): Promise<void> {
    try {
      // Only trigger for GET requests to avoid duplicate triggers
      if (request.method !== 'GET') {
        return;
      }

      // Skip API routes and static files
      const pathname = new URL(request.url).pathname;
      if (
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_next/') ||
        pathname.includes('.') // Skip files with extensions
      ) {
        return;
      }

      // Extract visitor information
      const userAgent = request.headers.get('user-agent') || undefined;
      const forwardedFor = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      const ip = forwardedFor?.split(',')[0] || realIp || undefined;

      // Trigger webhook (async, don't wait)
      this.webhookService.triggerSiteVisit({
        userAgent,
        ip,
        path: pathname
      }).catch(error => {
        console.error('Error triggering site visit webhook:', error);
      });
    } catch (error) {
      console.error('Error in webhook middleware:', error);
    }
  }
}
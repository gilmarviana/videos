# Notification System

A comprehensive notification system for the online course platform that handles email notifications for users and administrators.

## Features

### User Notifications
- **Welcome Email**: Sent automatically when users register
- **Trial Expiration Warnings**: Sent when trial time is running low (30 min and 10 min remaining)
- **Trial Expired**: Sent when trial period ends
- **Payment Confirmations**: Sent when subscription payments are successful
- **Payment Failures**: Sent when subscription payments fail
- **Subscription Cancellation**: Sent when users cancel their subscription
- **Course Completion**: Sent when users complete a course
- **Certificate Generation**: Sent when certificates are generated

### Admin Notifications
- **New User Registrations**: Notifies admin of new user signups
- **Payment Failures**: Alerts admin when user payments fail
- **System Errors**: Critical system error notifications
- **Daily Summary**: Daily statistics and platform overview

### Background Jobs
- **Trial Warning Checker**: Runs every 5 minutes to check for users near trial expiration
- **Daily Admin Summary**: Runs daily at 9 AM to send platform statistics

## Architecture

### Core Components

#### NotificationService
Main service that processes all notification events and routes them to appropriate handlers.

```typescript
// Send a notification
await NotificationService.processNotification({
  type: 'user_registered',
  userId: 'user123',
  data: { email: 'user@example.com', name: 'John Doe' }
});

// Send admin alert
await NotificationService.sendAdminNotification({
  type: 'system_error',
  message: 'Database connection failed',
  severity: 'critical',
  details: { error: 'Connection timeout' }
});
```

#### EmailService
Handles actual email sending with SMTP configuration and email templates.

```typescript
// Send welcome email
await EmailService.sendWelcomeEmail('user@example.com', 'John Doe');

// Send custom email
await EmailService.sendEmail({
  to: 'user@example.com',
  subject: 'Custom Subject',
  html: '<h1>Custom HTML content</h1>'
});
```

#### CronService
Manages background jobs and scheduled tasks.

```typescript
// Start all cron jobs
CronService.startAll();

// Stop all cron jobs
CronService.stopAll();

// Manually trigger checks
await CronService.triggerTrialWarningCheck();
await CronService.triggerDailyAdminSummary();
```

## Configuration

### Environment Variables

```bash
# Email Configuration
EMAIL_FROM="noreply@plataforma-cursos.com"
ADMIN_EMAIL="admin@plataforma-cursos.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# App Configuration
TRIAL_HOURS=4
SUBSCRIPTION_PRICE=30.00
SUBSCRIPTION_CURRENCY="BRL"
```

### SMTP Providers

The system supports various SMTP providers:

#### Gmail
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-gmail@gmail.com"
SMTP_PASS="your-app-password"  # Use App Password, not regular password
```

#### SendGrid
```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
```

#### AWS SES
```bash
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_USER="your-aws-smtp-username"
SMTP_PASS="your-aws-smtp-password"
```

## Integration

### User Registration
```typescript
// In registration endpoint
import { NotificationService } from '../lib/services/notification.service';

// After successful registration
await NotificationService.processNotification({
  type: 'user_registered',
  userId: user.id,
  data: { email: user.email, name: user.name }
});
```

### Payment Processing
```typescript
// In payment webhook handler
await NotificationService.processNotification({
  type: 'payment_confirmed',
  userId: userId,
  data: { userId, amount: 30.00, currency: 'BRL' }
});
```

### Course Completion
```typescript
// When user completes a course
await NotificationService.processNotification({
  type: 'course_completed',
  userId: user.id,
  data: { userId: user.id, courseTitle: 'JavaScript Fundamentals' }
});
```

### Certificate Generation
```typescript
// When certificate is generated
await NotificationService.processNotification({
  type: 'certificate_generated',
  userId: user.id,
  data: { 
    userId: user.id, 
    courseTitle: course.title, 
    certificateId: certificate.id 
  }
});
```

## API Endpoints

### Admin Notification Management
```
POST /api/admin/notifications
GET  /api/admin/notifications
```

#### Trigger Trial Warning Check
```bash
curl -X POST /api/admin/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"action": "trigger_trial_warnings"}'
```

#### Trigger Daily Summary
```bash
curl -X POST /api/admin/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"action": "trigger_daily_summary"}'
```

#### Send Custom Notification
```bash
curl -X POST /api/admin/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "action": "send_notification",
    "type": "course_completed",
    "data": {
      "userId": "user123",
      "courseTitle": "Advanced JavaScript"
    }
  }'
```

#### Send Admin Alert
```bash
curl -X POST /api/admin/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "action": "send_admin_alert",
    "data": {
      "type": "system_error",
      "message": "High memory usage detected",
      "severity": "warning",
      "details": {"usage": "85%"}
    }
  }'
```

## Email Templates

All email templates are responsive and include:
- Professional styling with inline CSS
- Platform branding
- Clear call-to-action buttons
- Unsubscribe information
- Mobile-friendly design

### Template Structure
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #333;">Email Title</h1>
  <p>Email content...</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="..." style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
      Call to Action
    </a>
  </div>
  <hr style="margin: 20px 0;">
  <p style="color: #666; font-size: 12px;">
    Este é um email automático, por favor não responda.
  </p>
</div>
```

## Error Handling

The notification system includes comprehensive error handling:

- **Non-blocking**: Notification failures don't break main application flow
- **Logging**: All errors are logged with context
- **Graceful degradation**: System continues working even if email service fails
- **Retry logic**: Built-in retry for transient failures

```typescript
// Notifications are sent asynchronously and don't block the main flow
NotificationService.processNotification({
  type: 'user_registered',
  data: userData
}).catch(error => {
  console.error('Failed to send notification:', error);
  // Application continues normally
});
```

## Testing

### Unit Tests
```bash
npm test src/test/notification-system.test.ts
```

### Validation Script
```bash
npm run validate:notifications
# or
tsx src/scripts/validate-notification-system.ts
```

### Manual Testing
```bash
# Test trial warning check
curl -X POST /api/admin/notifications \
  -d '{"action": "trigger_trial_warnings"}'

# Test daily summary
curl -X POST /api/admin/notifications \
  -d '{"action": "trigger_daily_summary"}'
```

## Monitoring

### Logs
All notification activities are logged:
```
✅ Trial warning checker started (runs every 5 minutes)
✅ Daily admin summary started (runs at 9 AM daily)
📧 Sending welcome email to user@example.com
⚠️  Failed to send notification: SMTP connection failed
```

### Admin Dashboard
The admin dashboard shows notification statistics:
- Emails sent today
- Failed notifications
- Trial warnings sent
- System alerts generated

## Troubleshooting

### Common Issues

#### SMTP Authentication Failed
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solution**: Use App Password for Gmail, not regular password

#### Connection Timeout
```
Error: Connection timeout
```
**Solution**: Check SMTP host and port configuration

#### Rate Limiting
```
Error: 550 Daily sending quota exceeded
```
**Solution**: Implement rate limiting or upgrade email service plan

### Debug Mode
Enable debug logging:
```bash
DEBUG=notification:* npm start
```

## Security

- **Input Validation**: All notification data is validated
- **Rate Limiting**: Prevents spam and abuse
- **Authentication**: Admin endpoints require authentication
- **Data Sanitization**: Email content is sanitized to prevent XSS
- **Secure SMTP**: Uses TLS/SSL for email transmission

## Performance

- **Async Processing**: Notifications don't block main application
- **Queue System**: Can be extended with Redis queue for high volume
- **Template Caching**: Email templates are cached for performance
- **Batch Processing**: Multiple notifications can be batched

## Future Enhancements

- **Push Notifications**: Mobile push notification support
- **SMS Notifications**: SMS integration for critical alerts
- **Webhook Notifications**: HTTP webhook support for external systems
- **Template Editor**: Admin interface for editing email templates
- **A/B Testing**: Email template A/B testing capabilities
- **Analytics**: Email open rates and click tracking
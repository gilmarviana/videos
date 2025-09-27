# Webhook System

The webhook system allows external integrations to receive real-time notifications about important events happening in the platform. This system provides a robust, reliable way to trigger external services when specific events occur.

## Features

- **Event-based triggers**: Automatically trigger webhooks for key platform events
- **Retry logic**: Built-in retry mechanism with exponential backoff for failed webhook calls
- **Logging**: Comprehensive logging of all webhook calls and responses
- **Admin management**: Full admin interface for managing webhooks
- **Testing functionality**: Built-in webhook testing capabilities
- **Multiple event types**: Support for various event types with structured payloads

## Supported Event Types

### 1. Site Visit (`site_visit`)
Triggered when a user visits the platform (excluding API calls and static files).

**Payload:**
```json
{
  "eventType": "site_visit",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "data": {
    "userAgent": "Mozilla/5.0...",
    "ip": "192.168.1.1",
    "path": "/courses"
  }
}
```

### 2. Trial Generated (`trial_generated`)
Triggered when a new user registers and their trial period begins.

**Payload:**
```json
{
  "eventType": "trial_generated",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "data": {
    "userId": "uuid",
    "userEmail": "user@example.com",
    "trialStartTime": "2023-01-01T00:00:00.000Z"
  }
}
```

### 3. Module Completed (`module_completed`)
Triggered when a user completes all lessons in a module.

**Payload:**
```json
{
  "eventType": "module_completed",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "data": {
    "userId": "uuid",
    "userEmail": "user@example.com",
    "moduleId": "uuid",
    "moduleName": "Introduction to Programming",
    "courseId": "uuid",
    "courseName": "Complete Programming Course",
    "completedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 4. Certificate Generated (`certificate_generated`)
Triggered when a certificate is automatically generated for a user upon course completion.

**Payload:**
```json
{
  "eventType": "certificate_generated",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "data": {
    "userId": "uuid",
    "userEmail": "user@example.com",
    "courseId": "uuid",
    "courseName": "Complete Programming Course",
    "certificateId": "uuid",
    "certificateUrl": "https://example.com/certificates/cert.pdf",
    "averageQuizScore": 85.5,
    "issuedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

## Database Schema

### Webhooks Table
```sql
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('site_visit', 'trial_generated', 'module_completed', 'certificate_generated')),
    headers JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Webhook Logs Table
```sql
CREATE TABLE webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Webhook Management (Admin Only)

#### Get All Webhooks
```
GET /api/webhooks
```

#### Create Webhook
```
POST /api/webhooks
Content-Type: application/json

{
  "name": "My Webhook",
  "url": "https://example.com/webhook",
  "eventType": "site_visit",
  "headers": {
    "Authorization": "Bearer token",
    "X-Custom-Header": "value"
  },
  "isActive": true
}
```

#### Get Webhook by ID
```
GET /api/webhooks/{id}
```

#### Update Webhook
```
PUT /api/webhooks/{id}
Content-Type: application/json

{
  "name": "Updated Webhook",
  "isActive": false
}
```

#### Delete Webhook
```
DELETE /api/webhooks/{id}
```

#### Test Webhook
```
POST /api/webhooks/{id}/test
```

#### Get Webhook Logs
```
GET /api/webhooks/{id}/logs?limit=50
GET /api/webhooks/logs?limit=100
```

### Webhook Triggering

#### Manual Trigger (Internal Use)
```
POST /api/webhooks/trigger
Content-Type: application/json

{
  "eventType": "site_visit",
  "data": {
    "userAgent": "Test Agent",
    "ip": "127.0.0.1",
    "path": "/test"
  }
}
```

## Usage Examples

### Creating a Webhook

```typescript
import { WebhookService } from '@/lib/services/webhook.service';

const webhookService = new WebhookService();

const webhook = await webhookService.createWebhook({
  name: 'Slack Notification',
  url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
  eventType: 'certificate_generated',
  headers: {
    'Content-Type': 'application/json'
  },
  isActive: true
});
```

### Testing a Webhook

```typescript
const testResult = await webhookService.testWebhook(webhook.id);

if (testResult.success) {
  console.log('Webhook test successful:', testResult.status, testResult.body);
} else {
  console.error('Webhook test failed:', testResult.error);
}
```

### Manual Event Triggering

```typescript
// Trigger site visit
await webhookService.triggerSiteVisit({
  userAgent: 'Mozilla/5.0...',
  ip: '192.168.1.1',
  path: '/courses'
});

// Trigger trial generated
await webhookService.triggerTrialGenerated({
  userId: 'user-123',
  userEmail: 'user@example.com',
  trialStartTime: new Date().toISOString()
});

// Trigger module completed
await webhookService.triggerModuleCompleted({
  userId: 'user-123',
  userEmail: 'user@example.com',
  moduleId: 'module-123',
  moduleName: 'Introduction',
  courseId: 'course-123',
  courseName: 'Programming Course',
  completedAt: new Date().toISOString()
});

// Trigger certificate generated
await webhookService.triggerCertificateGenerated({
  userId: 'user-123',
  userEmail: 'user@example.com',
  courseId: 'course-123',
  courseName: 'Programming Course',
  certificateId: 'cert-123',
  certificateUrl: 'https://example.com/cert.pdf',
  averageQuizScore: 85.5,
  issuedAt: new Date().toISOString()
});
```

## Admin Interface

The webhook management interface is available at `/admin/webhooks` and provides:

- **Webhook List**: View all configured webhooks with their status
- **Create/Edit Forms**: Add new webhooks or modify existing ones
- **Test Functionality**: Test webhooks directly from the interface
- **Logs Viewer**: View webhook call logs and responses
- **Status Management**: Enable/disable webhooks as needed

## Retry Logic

The webhook system includes robust retry logic:

- **Maximum Retries**: 3 attempts per webhook call
- **Exponential Backoff**: Delay increases with each retry (1s, 2s, 4s)
- **Timeout**: 30-second timeout per request
- **Logging**: All attempts are logged for debugging

## Security Considerations

- **Admin Only**: Webhook management is restricted to admin users
- **HTTPS Recommended**: Use HTTPS URLs for webhook endpoints
- **Custom Headers**: Support for authentication headers (API keys, tokens)
- **Input Validation**: URL format validation and event type validation
- **Rate Limiting**: Consider implementing rate limiting for webhook triggers

## Integration Points

The webhook system is automatically integrated into:

1. **User Registration** → `trial_generated` event
2. **Module Completion** → `module_completed` event  
3. **Certificate Generation** → `certificate_generated` event
4. **Site Navigation** → `site_visit` event (via middleware)

## Monitoring and Maintenance

### Log Cleanup
```typescript
// Clean up logs older than 30 days
const deletedCount = await webhookService.cleanupOldLogs(30);
```

### Health Checks
- Monitor webhook response times and success rates
- Set up alerts for consistently failing webhooks
- Regular testing of critical webhooks

## Troubleshooting

### Common Issues

1. **Webhook Not Triggering**
   - Check if webhook is active (`is_active = true`)
   - Verify event type matches the triggered event
   - Check webhook logs for error messages

2. **Webhook Failing**
   - Verify the webhook URL is accessible
   - Check authentication headers
   - Review response status and body in logs

3. **Slow Webhook Response**
   - Webhook endpoints should respond quickly (< 5 seconds)
   - Consider implementing async processing on the receiving end

### Debugging

1. **Check Webhook Logs**:
   ```sql
   SELECT * FROM webhook_logs 
   WHERE webhook_id = 'your-webhook-id' 
   ORDER BY triggered_at DESC;
   ```

2. **Test Webhook Manually**:
   Use the admin interface or API to test webhooks

3. **Monitor Database**:
   Check for webhook creation and trigger patterns

## Testing

Run the webhook system tests:

```bash
npm test src/test/webhook-system.test.ts
```

Run the validation script:

```bash
npm run validate:webhook-system
```

## Performance Considerations

- Webhook calls are non-blocking and don't affect user experience
- Failed webhooks are retried asynchronously
- Consider webhook endpoint performance to avoid timeouts
- Monitor webhook logs table size and implement regular cleanup
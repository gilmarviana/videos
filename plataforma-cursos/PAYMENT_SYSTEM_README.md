# Payment System Documentation

## Overview

The payment system provides comprehensive subscription management with Stripe integration, supporting recurring monthly billing, trial access control, and automated payment processing.

## Features

- ✅ Stripe integration for secure payment processing
- ✅ Monthly recurring subscriptions (R$ 30,00/month)
- ✅ Automatic access control based on subscription status
- ✅ Trial system integration with payment fallback
- ✅ Webhook handling for payment events
- ✅ Email notifications for payment events
- ✅ Subscription management (cancel, reactivate)
- ✅ Admin dashboard with payment analytics
- ✅ Automatic access blocking for failed payments

## Architecture

### Core Components

1. **PaymentService** - Main service for payment operations
2. **SubscriptionRepository** - Database operations for subscriptions
3. **Stripe Configuration** - Stripe SDK setup and configuration
4. **Subscription Middleware** - Access control based on subscription status
5. **Email Notifications** - Payment-related email communications
6. **React Components** - UI for subscription management

### Database Schema

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due')),
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    payment_gateway_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Configuration

### Environment Variables

```bash
# Stripe Configuration
STRIPE_PUBLIC_KEY="pk_test_your_stripe_public_key"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Subscription Settings
SUBSCRIPTION_PRICE="30.00"
SUBSCRIPTION_CURRENCY="BRL"
```

### Stripe Webhook Configuration

Configure the following webhook events in your Stripe dashboard:

- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Webhook endpoint: `https://yourdomain.com/api/payments/webhook`

## API Endpoints

### Create Subscription
```http
POST /api/payments/create-subscription
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethodId": "pm_1234567890"
}
```

### Cancel Subscription
```http
POST /api/payments/cancel-subscription
Authorization: Bearer <token>
```

### Get Subscription Status
```http
GET /api/payments/subscription-status
Authorization: Bearer <token>
```

### Webhook Handler
```http
POST /api/payments/webhook
Stripe-Signature: <stripe_signature>
```

## Usage Examples

### Creating a Subscription

```typescript
import { PaymentService } from '@/lib/payments/payment.service';

const paymentService = new PaymentService();

const result = await paymentService.createSubscription({
  userId: 'user_123',
  paymentMethodId: 'pm_1234567890',
  customerEmail: 'user@example.com',
  customerName: 'John Doe'
});

console.log('Subscription created:', result.subscription.id);
```

### Checking User Access

```typescript
import { checkUserAccess } from '@/lib/auth/subscription-middleware';

const accessCheck = await checkUserAccess('user_123');

if (accessCheck.hasAccess) {
  console.log('User has access:', accessCheck.reason);
} else {
  console.log('Access denied:', accessCheck.reason);
}
```

### Using Subscription Card Component

```tsx
import { SubscriptionCard } from '@/components/payments/SubscriptionCard';

function UserProfile() {
  return (
    <div>
      <h1>My Profile</h1>
      <SubscriptionCard />
    </div>
  );
}
```

## Access Control

The system implements automatic access control based on subscription status:

### Access Levels

1. **Active Subscription** - Full access to all content
2. **Trial Period** - Limited access based on time usage
3. **Expired Trial** - No access, redirect to subscription page
4. **Past Due** - Temporary access suspension until payment resolved

### Middleware Integration

```typescript
import { withSubscriptionAccess } from '@/lib/auth/subscription-middleware';

export const GET = withSubscriptionAccess(async (request: NextRequest) => {
  // This handler only runs if user has valid access
  return NextResponse.json({ message: 'Protected content' });
});
```

## Email Notifications

### Automatic Notifications

- **Payment Confirmation** - Sent when payment succeeds
- **Payment Failed** - Sent when payment fails
- **Subscription Cancelled** - Sent when user cancels subscription

### Email Templates

All emails are responsive and include:
- Clear subject lines in Portuguese
- Professional branding
- Action buttons for relevant next steps
- Important information highlighted
- Unsubscribe compliance

## Error Handling

### Error Codes

- `PAY_001` - Payment processing failure
- `PAY_002` - Card declined
- `PAY_003` - Subscription not found
- `PAY_004` - Invalid webhook
- `AUTH_004` - Trial expired
- `AUTH_005` - Subscription inactive

### Error Response Format

```json
{
  "error": {
    "code": "PAY_001",
    "message": "Falha no processamento do pagamento",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Testing

### Running Tests

```bash
# Run payment system tests
npm run test payment-system.test.ts

# Run validation script
npm run ts-node src/scripts/validate-payment-system.ts
```

### Test Coverage

- ✅ Payment service methods
- ✅ Subscription repository operations
- ✅ Access control logic
- ✅ Webhook event handling
- ✅ Email notification sending
- ✅ Error scenarios

### Mock Data

```typescript
// Test subscription data
const mockSubscription = {
  userId: 'user_123',
  amount: 30.00,
  currency: 'BRL',
  status: 'active',
  currentPeriodStart: new Date(),
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  paymentGatewayId: 'sub_stripe_123'
};
```

## Security Considerations

### Payment Security

- All payment data processed through Stripe (PCI compliant)
- No sensitive payment information stored locally
- Webhook signature verification required
- JWT authentication for all payment endpoints

### Access Control Security

- Token-based authentication required
- User role verification for admin functions
- Subscription status checked on every protected request
- Trial time tracking to prevent abuse

## Monitoring and Analytics

### Key Metrics Tracked

- Monthly recurring revenue (MRR)
- Subscription conversion rate
- Churn rate and cancellations
- Payment failure rates
- Trial to subscription conversion

### Admin Dashboard

The admin dashboard displays:
- Total active subscriptions
- Monthly revenue
- Recent payment activity
- Subscription status breakdown
- Conversion funnel metrics

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Verify webhook URL in Stripe dashboard
   - Check webhook secret configuration
   - Ensure endpoint is publicly accessible

2. **Payment failures**
   - Check Stripe logs for detailed error messages
   - Verify card details and limits
   - Ensure proper error handling in frontend

3. **Access control issues**
   - Verify JWT token validity
   - Check subscription status in database
   - Ensure trial time calculations are correct

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=payment:*
```

## Deployment Checklist

- [ ] Configure production Stripe keys
- [ ] Set up webhook endpoints
- [ ] Test payment flows end-to-end
- [ ] Verify email notifications work
- [ ] Configure monitoring and alerts
- [ ] Set up backup payment methods
- [ ] Test subscription cancellation flows
- [ ] Verify access control works correctly

## Support and Maintenance

### Regular Tasks

- Monitor payment failure rates
- Review subscription analytics
- Update payment method reminders
- Handle customer payment issues
- Monitor webhook delivery success

### Stripe Dashboard Monitoring

Regular checks in Stripe dashboard:
- Payment success/failure rates
- Subscription churn metrics
- Webhook delivery status
- Customer payment method health

## Integration with Other Systems

### Trial System Integration

The payment system seamlessly integrates with the existing trial system:
- Users start with 4-hour trial
- When trial expires, payment system takes over
- Subscription grants unlimited access
- Trial time tracking continues for analytics

### Analytics Integration

Payment events are tracked in the analytics system:
- Subscription creation events
- Payment success/failure events
- Cancellation events
- Revenue tracking

### Email System Integration

Payment notifications use the existing email service:
- Consistent branding and templates
- Reliable delivery through configured SMTP
- Proper error handling and retries
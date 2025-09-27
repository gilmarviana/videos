# Trial System Implementation

This document describes the comprehensive trial system implementation for the online course platform.

## Overview

The trial system provides users with 4 hours of free access to course content. It includes:

- **Time tracking**: Accurate tracking of user activity time
- **Session management**: Automatic session start/stop based on user activity
- **Content access control**: Middleware to protect content endpoints
- **Frontend components**: UI components for trial status display
- **Automatic cleanup**: Session cleanup for inactive users

## Architecture

### Backend Components

#### 1. Trial Middleware (`src/lib/auth/trial-middleware.ts`)

Core middleware for trial session management and access control.

**Key Features:**
- In-memory session tracking with automatic cleanup
- Activity-based time counting (prevents idle time counting)
- Content access validation
- Session lifecycle management

**Main Methods:**
```typescript
// Start tracking trial usage for a user session
TrialMiddleware.startTrialSession(userId: string): Promise<void>

// Update trial session activity (called on each request)
TrialMiddleware.updateTrialActivity(userId: string): Promise<void>

// End trial session and save accumulated time to database
TrialMiddleware.endTrialSession(userId: string): Promise<void>

// Check if user has valid trial or subscription access
TrialMiddleware.checkTrialAccess(payload: JWTPayload): Promise<AccessResult>

// Middleware to track trial usage and check access for content endpoints
TrialMiddleware.requireTrialOrSubscription(payload: JWTPayload): Promise<void>
```

#### 2. Trial Session Service (`src/lib/services/trial-session.service.ts`)

High-level service for managing trial sessions.

**Key Features:**
- Session information retrieval
- Content access checking
- Activity updates (heartbeat)

**Main Methods:**
```typescript
// Start a new trial session
TrialSessionService.startSession(userId: string): Promise<TrialSessionInfo>

// End current trial session
TrialSessionService.endSession(userId: string): Promise<void>

// Get comprehensive session information
TrialSessionService.getSessionInfo(userId: string): Promise<TrialSessionInfo>

// Check if user can access content
TrialSessionService.checkContentAccess(userId: string): Promise<AccessCheck>
```

#### 3. Enhanced Auth Middleware (`src/lib/auth/middleware.ts`)

Updated authentication middleware with trial integration.

**New Methods:**
```typescript
// Require content access with trial tracking
AuthMiddleware.requireContentAccess(request: NextRequest): Promise<JWTPayload>

// Enhanced subscription/trial checking
AuthMiddleware.requireActiveSubscriptionOrTrial(request: NextRequest): Promise<JWTPayload>
```

#### 4. Trial Status API (`src/app/api/auth/trial-status/route.ts`)

Enhanced API endpoint for trial management.

**Endpoints:**
- `GET /api/auth/trial-status` - Get comprehensive trial status
- `POST /api/auth/trial-status` - Perform trial actions

**Supported Actions:**
- `start_session` - Start a new trial session
- `end_session` - End current trial session
- `heartbeat` - Update activity timestamp
- `update_usage` - Manually update trial usage

### Frontend Components

#### 1. TrialTimer (`src/components/trial/TrialTimer.tsx`)

Real-time countdown timer showing remaining trial time.

**Features:**
- Live countdown with seconds precision
- Color-coded warnings (green → yellow → red)
- Progress bar visualization
- Automatic expiration handling

#### 2. TrialStatusBanner (`src/components/trial/TrialStatusBanner.tsx`)

Informational banner showing trial status.

**Features:**
- Context-aware messaging
- Dismissible banner
- Call-to-action button for subscription
- Color-coded based on remaining time

#### 3. TrialExpiredModal (`src/components/trial/TrialExpiredModal.tsx`)

Modal dialog shown when trial expires.

**Features:**
- Subscription promotion
- Usage statistics display
- Smooth animations
- Action buttons (close/subscribe)

#### 4. TrialManager (`src/components/trial/TrialManager.tsx`)

Comprehensive trial management component.

**Features:**
- Combines all trial components
- Automatic session management
- Event handling for trial expiration
- Debug information (development mode)

#### 5. useTrialStatus Hook (`src/hooks/useTrialStatus.ts`)

React hook for trial state management.

**Features:**
- Real-time trial status updates
- Automatic heartbeat sending
- Session lifecycle management
- Page visibility handling
- Cleanup on page unload

## Usage Examples

### Backend - Protecting Content Endpoints

```typescript
// In your content API routes
import { AuthMiddleware } from '../../../lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // This will track trial usage and check access
    await AuthMiddleware.requireContentAccess(request);
    
    // Your content logic here
    const content = await getContent();
    return NextResponse.json({ success: true, data: content });
    
  } catch (error: any) {
    // Handle trial/auth errors
    if (error.message.includes('Trial') || error.message.includes('subscription')) {
      return createAuthErrorResponse(error.message, 403);
    }
    // Handle other errors...
  }
}
```

### Frontend - Using Trial Components

```tsx
import { TrialManager } from '../components/trial';

function CoursePage() {
  const handleSubscribe = () => {
    // Navigate to subscription page
    router.push('/subscribe');
  };

  const handleTrialExpired = () => {
    // Handle trial expiration
    console.log('Trial expired!');
  };

  return (
    <div>
      <TrialManager
        onSubscribeClick={handleSubscribe}
        onTrialExpired={handleTrialExpired}
        showTimer={true}
        showBanner={true}
        autoStartSession={true}
      />
      
      {/* Your course content */}
    </div>
  );
}
```

### Frontend - Using the Hook

```tsx
import { useTrialStatus } from '../hooks/useTrialStatus';

function MyComponent() {
  const {
    trialStatus,
    sessionInfo,
    canAccessContent,
    isLoading,
    error,
    startSession,
    endSession,
    sendHeartbeat,
    refreshStatus,
  } = useTrialStatus();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!canAccessContent) return <div>Access denied</div>;

  return (
    <div>
      <p>Trial time remaining: {trialStatus?.minutesRemaining} minutes</p>
      <p>Session active: {sessionInfo?.isActive ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

## Configuration

### Environment Variables

The trial system uses the following configuration from `.env.local`:

```bash
# Trial duration in hours
TRIAL_HOURS=4

# Subscription settings
SUBSCRIPTION_PRICE=30.00
SUBSCRIPTION_CURRENCY="BRL"
```

### Database Schema

The trial system uses existing user table fields:

```sql
-- Users table (already exists)
CREATE TABLE users (
    -- ... other fields
    trial_start_time TIMESTAMP,
    trial_minutes_used INTEGER DEFAULT 0,
    -- ... other fields
);
```

## Security Considerations

1. **Server-side validation**: All trial checks are performed server-side
2. **Token-based authentication**: Uses JWT tokens for user identification
3. **Activity-based tracking**: Only counts active time, prevents idle time abuse
4. **Session cleanup**: Automatic cleanup of inactive sessions
5. **Rate limiting**: Built-in protection against rapid API calls

## Monitoring and Debugging

### Development Mode

In development mode, the `TrialManager` component shows debug information:

```tsx
// Debug info panel (only in development)
{process.env.NODE_ENV === 'development' && (
  <div className="debug-panel">
    <details>
      <summary>Debug Info</summary>
      <div>Trial Active: {trialStatus.isActive ? 'Yes' : 'No'}</div>
      <div>Minutes Used: {trialStatus.minutesUsed}</div>
      <div>Minutes Remaining: {trialStatus.minutesRemaining}</div>
      <div>Can Access Content: {canAccessContent ? 'Yes' : 'No'}</div>
      <div>Session Active: {sessionInfo?.isActive ? 'Yes' : 'No'}</div>
    </details>
  </div>
)}
```

### Logging

The system includes comprehensive logging:

```typescript
// Trial middleware logs
console.log('Trial session started for user:', userId);
console.log('Trial session ended, time saved:', totalMinutes);

// API endpoint logs
console.error('Get trial status error:', error);
console.error('Trial status action error:', error);
```

## Testing

### Validation Script

Run the validation script to ensure all components are properly implemented:

```bash
npx tsx src/scripts/validate-trial-system.ts
```

### Manual Testing

1. **Register a new user** - Trial should start automatically
2. **Access content** - Should work within trial limits
3. **Wait for expiration** - Should block access after 4 hours
4. **Check session management** - Should track time accurately
5. **Test page visibility** - Should pause/resume on tab switching

## Performance Considerations

1. **In-memory sessions**: Fast access but requires Redis in production
2. **Heartbeat frequency**: 30-second intervals balance accuracy and performance
3. **Cleanup intervals**: 10-minute cleanup prevents memory leaks
4. **Database updates**: Batched updates reduce database load

## Production Deployment

### Redis Integration

For production, replace in-memory session storage with Redis:

```typescript
// In trial-middleware.ts
import { redis } from '../redis/client';

// Replace Map with Redis operations
const SESSION_KEY = (userId: string) => `trial:session:${userId}`;

static async startTrialSession(userId: string): Promise<void> {
  const session = {
    userId,
    sessionStart: new Date(),
    lastActivity: new Date(),
    accumulatedMinutes: 0,
  };
  
  await redis.setex(SESSION_KEY(userId), 3600, JSON.stringify(session));
}
```

### Monitoring

Set up monitoring for:
- Trial conversion rates
- Session duration statistics
- API endpoint performance
- Error rates and types

## Troubleshooting

### Common Issues

1. **Sessions not starting**: Check authentication tokens
2. **Time not tracking**: Verify heartbeat requests
3. **Access denied errors**: Check trial status and subscription
4. **Memory leaks**: Ensure session cleanup is running

### Debug Commands

```bash
# Check trial status for a user
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/auth/trial-status

# Start a trial session
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"action": "start_session"}' \
  http://localhost:3000/api/auth/trial-status

# Send heartbeat
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"action": "heartbeat"}' \
  http://localhost:3000/api/auth/trial-status
```

## Requirements Fulfilled

This implementation fulfills the following requirements from the specification:

- **4.3**: ✅ Trial automatically activated on registration with 4-hour limit
- **4.4**: ✅ Login starts time counting with accumulative usage tracking
- **4.5**: ✅ Trial expiration blocks access and redirects to payment page

### Task Completion

- ✅ **Trial tracking middleware to count usage time**
- ✅ **Trial status checking for content access**
- ✅ **Trial expiration logic and content blocking**
- ✅ **Trial timer component for frontend display**

All sub-tasks have been completed successfully with comprehensive implementation including session management, frontend components, and proper access control.
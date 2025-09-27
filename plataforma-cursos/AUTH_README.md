# Authentication System

This document describes the authentication system implemented for the online course platform.

## Overview

The authentication system provides secure user registration, login, password management, and role-based access control with JWT tokens and trial system integration.

## Features

- ✅ User registration with email validation
- ✅ Secure password hashing (bcrypt with 12 rounds)
- ✅ JWT-based authentication with access and refresh tokens
- ✅ Role-based access control (admin/student)
- ✅ Password reset via email
- ✅ Trial system integration (4-hour free trial)
- ✅ Password strength validation
- ✅ Account activation/deactivation
- ✅ Token refresh mechanism

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Confirm password reset | No |
| GET | `/api/auth/reset-password` | Validate reset token | No |
| POST | `/api/auth/change-password` | Change password | Yes |
| GET | `/api/auth/trial-status` | Get trial status | Yes |
| POST | `/api/auth/trial-status` | Update trial usage | Yes |

## Usage Examples

### User Registration

```typescript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123!'
  })
});

const { data } = await response.json();
// data.user - User information
// data.tokens - Access and refresh tokens
```

### User Login

```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'SecurePass123!'
  })
});

const { data } = await response.json();
// Store tokens for subsequent requests
localStorage.setItem('accessToken', data.tokens.accessToken);
localStorage.setItem('refreshToken', data.tokens.refreshToken);
```

### Authenticated Requests

```typescript
const response = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Token Refresh

```typescript
const response = await fetch('/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refreshToken: localStorage.getItem('refreshToken')
  })
});

const { data } = await response.json();
localStorage.setItem('accessToken', data.tokens.accessToken);
localStorage.setItem('refreshToken', data.tokens.refreshToken);
```

### Password Reset

```typescript
// Request reset
await fetch('/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'john@example.com' })
});

// Confirm reset (from email link)
await fetch('/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'reset-token-from-email',
    newPassword: 'NewSecurePass123!'
  })
});
```

## Middleware Usage

### Protect Routes

```typescript
import { AuthMiddleware } from '../lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await AuthMiddleware.authenticate(request);
    
    // Your protected logic here
    return NextResponse.json({ data: 'Protected data' });
  } catch (error) {
    return createAuthErrorResponse(error.message, 401);
  }
}
```

### Require Admin Role

```typescript
export async function POST(request: NextRequest) {
  try {
    // Require admin role
    const user = await AuthMiddleware.requireAdmin(request);
    
    // Admin-only logic here
    return NextResponse.json({ data: 'Admin data' });
  } catch (error) {
    return createAuthErrorResponse(error.message, 403);
  }
}
```

### Require Active Subscription or Trial

```typescript
export async function GET(request: NextRequest) {
  try {
    // Require active subscription or trial
    const user = await AuthMiddleware.requireActiveSubscriptionOrTrial(request);
    
    // Premium content logic here
    return NextResponse.json({ data: 'Premium content' });
  } catch (error) {
    return createAuthErrorResponse(error.message, 402);
  }
}
```

## Password Requirements

Passwords must meet the following criteria:
- At least 8 characters long
- Less than 128 characters
- Contains at least one lowercase letter
- Contains at least one uppercase letter
- Contains at least one number
- Contains at least one special character

## Trial System Integration

New users automatically receive a 4-hour trial period:
- Trial starts when user registers
- Time is tracked cumulatively (not continuous)
- Access is blocked when trial expires
- Users can upgrade to subscription at any time

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Security**: Separate secrets for access and refresh tokens
- **Token Expiry**: Access tokens expire in 15 minutes, refresh tokens in 7 days
- **Email Enumeration Protection**: Password reset doesn't reveal if email exists
- **Rate Limiting**: Should be implemented at reverse proxy level
- **Input Validation**: All inputs are validated and sanitized

## Error Codes

| Code | Description |
|------|-------------|
| AUTH_001 | Invalid or expired token |
| AUTH_002 | Invalid credentials |
| AUTH_003 | User not found |
| AUTH_004 | Access denied - trial expired |
| AUTH_005 | Access denied - subscription inactive |
| AUTH_006 | Invalid password format |
| AUTH_007 | Email already registered |
| AUTH_008 | Failed to start trial |
| AUTH_009 | Account deactivated |
| AUTH_010 | Invalid input data |
| AUTH_011 | Invalid name format |
| AUTH_012 | Password reset failed |

## Environment Variables

Required environment variables for authentication:

```env
# JWT Configuration
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Redis (for password reset tokens)
REDIS_URL=redis://localhost:6379

# Email Configuration
EMAIL_FROM=noreply@yourplatform.com
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# App Configuration
TRIAL_HOURS=4
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

## Testing

Run authentication tests:

```bash
# Run validation script
npm run validate-auth

# Run unit tests
npm test auth.test.ts
```

## Database Schema

The authentication system uses the following database tables:

### users
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `password_hash` (VARCHAR)
- `name` (VARCHAR)
- `role` (ENUM: 'admin', 'student')
- `trial_start_time` (TIMESTAMP)
- `trial_minutes_used` (INTEGER)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### subscriptions
- Links to users table for subscription management
- Used by trial system to check if user has active subscription

## Implementation Status

✅ **Completed Features:**
- User model with role-based access control
- JWT authentication with refresh tokens
- Registration endpoint with email validation
- Login/logout functionality
- Password reset functionality via email
- Password strength validation
- Trial system integration
- Comprehensive error handling
- API documentation
- Unit tests

The authentication system is fully implemented and ready for use. All requirements from task 2 have been satisfied.
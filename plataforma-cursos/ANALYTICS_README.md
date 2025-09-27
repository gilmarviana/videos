# Analytics and Reporting System

## Overview

The analytics and reporting system provides comprehensive tracking and analysis of user behavior, course popularity, engagement metrics, and conversion rates. This system is designed to give administrators detailed insights into platform performance and user engagement.

## Features Implemented

### 1. Analytics Data Collection
- **User Behavior Tracking**: Tracks login, logout, video interactions, lesson completion, course progress
- **API Usage Monitoring**: Tracks all API endpoint usage with response times and status codes
- **Page View Analytics**: Tracks page visits and user navigation patterns
- **Session Management**: Tracks user session duration and activity patterns

### 2. Dashboard Metrics
- **Overview Metrics**:
  - Total active users
  - Trial users count
  - Subscribed users count
  - Monthly revenue
  - New users this month
  - Conversion rate (trial to subscription)
  - Average watch time
  - Course completion rate

- **Engagement Metrics**:
  - Daily active users
  - Weekly active users
  - Monthly active users
  - Average session duration

- **Conversion Funnel**:
  - Visitors → Signups → Trial Starts → Subscriptions
  - Conversion rates at each stage

### 3. Course Popularity Tracking
- **Course Analytics**:
  - Total views per course
  - Unique viewers
  - Total watch time
  - Completion rates
  - Enrolled users count

- **Popularity Reports**:
  - Most viewed courses
  - Highest completion rates
  - Average watch time per course
  - Course performance over time

### 4. User Engagement Metrics
- **Daily Engagement Tracking**:
  - Session duration per user
  - Videos watched count
  - Lessons completed count
  - Courses started/completed
  - Quiz attempts

- **Engagement Reports**:
  - Daily active user trends
  - Average session duration trends
  - Content consumption patterns
  - User retention metrics

### 5. Revenue and Conversion Analytics
- **Conversion Tracking**:
  - Trial to subscription conversion rate
  - Conversion funnel analysis
  - User journey tracking

- **Revenue Metrics**:
  - Monthly recurring revenue (MRR)
  - New subscriptions
  - Cancelled subscriptions
  - Churn rate analysis

## Database Schema

### Analytics Tables

#### user_analytics
Tracks all user events and interactions:
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to users)
- session_id: VARCHAR(255)
- event_type: VARCHAR(50) (login, video_start, lesson_complete, etc.)
- event_data: JSONB (additional event details)
- ip_address: INET
- user_agent: TEXT
- created_at: TIMESTAMP
```

#### course_analytics
Daily aggregated course metrics:
```sql
- id: UUID (Primary Key)
- course_id: UUID (Foreign Key to courses)
- date: DATE
- views: INTEGER
- unique_viewers: INTEGER
- total_watch_time_seconds: INTEGER
- completion_rate: DECIMAL(5,2)
- average_rating: DECIMAL(3,2)
```

#### user_engagement
Daily user engagement metrics:
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to users)
- date: DATE
- session_duration_seconds: INTEGER
- videos_watched: INTEGER
- lessons_completed: INTEGER
- courses_started: INTEGER
- courses_completed: INTEGER
- quiz_attempts: INTEGER
```

#### daily_metrics
Platform-wide daily metrics:
```sql
- id: UUID (Primary Key)
- date: DATE
- total_users: INTEGER
- active_users: INTEGER
- trial_users: INTEGER
- subscribed_users: INTEGER
- new_registrations: INTEGER
- trial_conversions: INTEGER
- revenue: DECIMAL(10,2)
- total_watch_time_seconds: INTEGER
```

#### revenue_analytics
Revenue and subscription analytics:
```sql
- id: UUID (Primary Key)
- date: DATE
- subscription_revenue: DECIMAL(10,2)
- new_subscriptions: INTEGER
- cancelled_subscriptions: INTEGER
- churn_rate: DECIMAL(5,2)
- mrr: DECIMAL(10,2)
- arr: DECIMAL(10,2)
```

## API Endpoints

### Admin Analytics Endpoints

#### GET /api/admin/dashboard
Returns comprehensive dashboard metrics including:
- Overview statistics
- Recent activity data
- Subscription breakdown
- Top courses with metrics
- Conversion funnel data
- Engagement metrics

#### GET /api/admin/analytics/course-popularity?days=30
Returns course popularity report with:
- Course views and unique viewers
- Total watch time per course
- Completion rates
- Enrolled users count
- Performance trends

#### GET /api/admin/analytics/user-engagement?days=30
Returns user engagement report with:
- Daily active users
- Average session duration
- Content consumption metrics
- User activity trends

### Public Analytics Endpoint

#### POST /api/analytics/track
Accepts event tracking data from client-side:
- Event type and data
- User identification (if authenticated)
- Session tracking
- Anonymous event tracking support

## Services and Components

### AnalyticsService
Core service for analytics data management:
- `trackEvent()`: Track individual user events
- `updateUserEngagement()`: Update daily user engagement metrics
- `updateCourseAnalytics()`: Update course performance metrics
- `getDashboardMetrics()`: Get comprehensive dashboard data
- `getCoursePopularityReport()`: Generate course popularity reports
- `getUserEngagementReport()`: Generate user engagement reports
- `updateDailyMetrics()`: Calculate and store daily platform metrics

### AnalyticsMiddleware
Middleware for automatic event tracking:
- `trackApiUsage()`: Track API endpoint usage
- `trackLogin()`: Track user login events
- `trackRegistration()`: Track user registration
- `trackTrialStart()`: Track trial activation
- `trackVideoEvent()`: Track video interactions
- `trackLessonComplete()`: Track lesson completion
- `trackCourseStart/Complete()`: Track course progress
- `trackQuizAttempt()`: Track quiz interactions

### Client-side Analytics
Browser-based tracking utility:
- Automatic page view tracking
- Video player event tracking
- User interaction tracking
- Session management
- Error tracking
- Custom event tracking

### Admin Components

#### AdminDashboard
Enhanced dashboard with:
- Overview metrics cards
- Engagement metrics display
- Conversion funnel visualization
- Recent activity timeline
- Top courses table with detailed metrics

#### AnalyticsReport
Detailed analytics reporting interface:
- Course popularity reports
- User engagement analysis
- Configurable time periods
- Data export capabilities
- Visual progress indicators

## Usage Examples

### Server-side Event Tracking
```typescript
import { AnalyticsService } from '../lib/services/analytics.service';

// Track a custom event
await AnalyticsService.trackEvent({
  userId: 'user-123',
  eventType: 'course_purchased',
  eventData: { courseId: 'course-456', amount: 30.00 },
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...'
});

// Update user engagement
await AnalyticsService.updateUserEngagement('user-123', {
  sessionDuration: 3600,
  videosWatched: 5,
  lessonsCompleted: 2
});
```

### Client-side Event Tracking
```typescript
import { analytics } from '../lib/analytics/client';

// Track video events
analytics.trackVideoStart('lesson-123', 'course-456');
analytics.trackVideoComplete('lesson-123', 'course-456', 1800);

// Track custom events
analytics.trackCustomEvent('feature_used', { feature: 'search' });

// Track user interactions
analytics.trackButtonClick('subscribe_button', 'pricing_page');
```

### Middleware Integration
```typescript
import { AnalyticsMiddleware } from '../lib/analytics/middleware';

// In API routes
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // ... API logic ...
    
    await AnalyticsMiddleware.trackApiUsage(
      request, 
      '/api/courses', 
      'POST', 
      200, 
      Date.now() - startTime
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    await AnalyticsMiddleware.trackApiUsage(
      request, 
      '/api/courses', 
      'POST', 
      500, 
      Date.now() - startTime
    );
    throw error;
  }
}
```

## Setup and Installation

### 1. Initialize Analytics Tables
```bash
npx tsx src/scripts/init-analytics.ts
```

### 2. Environment Variables
No additional environment variables required - uses existing database connection.

### 3. Client Integration
The analytics client automatically starts tracking when imported:
```typescript
// In your main layout or app component
import '../lib/analytics/client';
```

### 4. Validation
Run the analytics system validation:
```bash
npx tsx src/scripts/validate-analytics-system.ts
```

## Data Privacy and Performance

### Privacy Considerations
- IP addresses are stored for analytics but can be anonymized
- User agents are stored for device/browser analytics
- All tracking respects user authentication state
- Anonymous tracking supported for non-authenticated users

### Performance Optimizations
- Asynchronous event tracking (non-blocking)
- Batch processing for high-volume events
- Database indexes on frequently queried columns
- Graceful error handling (analytics failures don't break main functionality)
- Configurable data retention policies

### Data Retention
- Raw events: 90 days (configurable)
- Aggregated daily metrics: 2 years
- Course analytics: Indefinite (for historical analysis)
- User engagement: 1 year

## Monitoring and Maintenance

### Daily Tasks (Automated)
- Update daily metrics aggregation
- Calculate course completion rates
- Update revenue analytics
- Clean up old raw events

### Weekly Tasks
- Generate engagement reports
- Analyze conversion trends
- Monitor system performance
- Review data quality

### Monthly Tasks
- Archive old data
- Update analytics indexes
- Performance optimization review
- Generate executive reports

## Requirements Satisfied

This implementation satisfies all requirements from the specification:

**Requirement 3.1**: ✅ Total active users tracking and reporting
**Requirement 3.2**: ✅ Trial users count and monitoring
**Requirement 3.3**: ✅ Monthly revenue calculation and tracking
**Requirement 3.4**: ✅ Course popularity tracking and most watched courses
**Requirement 3.5**: ✅ Trial to subscription conversion rate tracking
**Requirement 3.6**: ✅ Average watch time per user and engagement metrics

The system provides comprehensive analytics capabilities that enable data-driven decision making for platform optimization and business growth.
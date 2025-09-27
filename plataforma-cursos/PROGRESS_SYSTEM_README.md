# User Progress Tracking System

This document describes the implementation of the user progress tracking system for the online course platform.

## Overview

The progress tracking system allows users to:
- Track their progress through lessons and courses
- Resume lessons from where they left off
- Mark courses as favorites
- Automatically track course completion
- View comprehensive progress statistics

## Database Schema

### Tables

#### `user_progress`
Tracks individual lesson progress for each user.

```sql
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    watched_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);
```

#### `user_favorites`
Stores user's favorite courses.

```sql
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);
```

#### `course_completions`
Tracks course completion status and percentage.

```sql
CREATE TABLE course_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_percentage DECIMAL(5,2) DEFAULT 100.00,
    UNIQUE(user_id, course_id)
);
```

## API Endpoints

### Lesson Progress

#### `GET /api/lessons/[id]/progress`
Get user progress for a specific lesson.

**Query Parameters:**
- `userId` (optional): User ID (defaults to authenticated user)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "lessonId": "uuid",
    "watchedSeconds": 300,
    "completed": false,
    "lastWatchedAt": "2024-01-01T12:00:00Z",
    "completedAt": null
  }
}
```

#### `PUT /api/lessons/[id]/progress`
Update user progress for a lesson.

**Request Body:**
```json
{
  "userId": "uuid",
  "watchedSeconds": 300,
  "completed": false
}
```

#### `POST /api/lessons/[id]/complete`
Mark a lesson as completed.

**Request Body:**
```json
{
  "userId": "uuid"
}
```

### Course Progress

#### `GET /api/courses/[id]/progress`
Get comprehensive progress for an entire course.

**Response:**
```json
{
  "success": true,
  "data": {
    "courseId": "uuid",
    "totalLessons": 10,
    "completedLessons": 7,
    "progressPercentage": 70,
    "lessons": [...],
    "isFavorite": true,
    "isCompleted": false
  }
}
```

#### `GET /api/courses/[id]/next-lesson`
Get the next lesson to watch in a course.

**Response:**
```json
{
  "success": true,
  "data": {
    "moduleId": "uuid",
    "lessonId": "uuid",
    "title": "Lesson Title",
    "progress": {...}
  }
}
```

### Module Progress

#### `GET /api/modules/[id]/progress`
Get progress for all lessons in a module.

### Favorites

#### `GET /api/users/favorites`
Get user's favorite courses.

#### `POST /api/users/favorites`
Add a course to favorites.

**Request Body:**
```json
{
  "courseId": "uuid"
}
```

#### `DELETE /api/users/favorites?courseId=uuid`
Remove a course from favorites.

### Course Completion

#### `GET /api/users/completed-courses`
Get user's completed courses.

#### `POST /api/users/completed-courses`
Mark a course as completed.

**Request Body:**
```json
{
  "courseId": "uuid",
  "completionPercentage": 95
}
```

## Components

### Hooks

#### `useVideoProgress`
Manages video progress tracking with auto-save functionality.

```typescript
const {
  progress,
  loading,
  saving,
  error,
  updateProgress,
  manualSave,
  markCompleted,
  getResumeTime,
  getProgressPercentage,
  isCompleted
} = useVideoProgress({
  userId,
  lessonId,
  autoSave: true,
  saveInterval: 10
});
```

#### `useCourseProgress`
Manages course-level progress tracking and completion.

```typescript
const {
  courseProgress,
  completedCourses,
  loading,
  error,
  markCourseCompleted,
  getNextLesson,
  isCourseCompleted,
  getCompletionPercentage,
  areAllLessonsWatched,
  refreshProgress
} = useCourseProgress({ userId, courseId });
```

#### `useFavorites`
Manages course favorites functionality.

```typescript
const {
  favorites,
  loading,
  error,
  addToFavorites,
  removeFromFavorites,
  isFavorite,
  toggleFavorite
} = useFavorites();
```

### Components

#### `EnhancedVideoPlayer`
Enhanced video player with progress tracking and auto-completion.

```typescript
<EnhancedVideoPlayer
  lessonId={lessonId}
  userId={userId}
  courseId={courseId}
  title={title}
  onLessonComplete={() => console.log('Lesson completed')}
  onCourseComplete={() => console.log('Course completed')}
/>
```

#### `CourseProgressCard`
Displays course progress with favorite toggle and continue button.

```typescript
<CourseProgressCard
  courseId={courseId}
  courseTitle={title}
  courseProgress={progress}
  onContinue={() => navigateToNextLesson()}
/>
```

## Services

### `ProgressService`
Client-side service for progress-related API calls.

**Key Methods:**
- `saveProgress(userId, lessonId, watchedSeconds, duration)`
- `getProgress(userId, lessonId)`
- `getCourseProgress(userId, courseId)`
- `markLessonCompleted(userId, lessonId)`
- `addToFavorites(courseId)`
- `removeFromFavorites(courseId)`
- `markCourseCompleted(courseId, completionPercentage)`

### `ProgressRepository`
Server-side repository for database operations.

**Key Methods:**
- `findByUserAndLesson(userId, lessonId)`
- `upsertProgress(userId, lessonId, data)`
- `findCourseProgress(userId, courseId)`
- `addToFavorites(userId, courseId)`
- `markCourseCompleted(userId, courseId, percentage)`
- `getNextLesson(userId, courseId)`
- `checkAndMarkCourseCompletion(userId, courseId)`

## Features

### 1. Lesson Progress Tracking
- **Watch Time Tracking**: Automatically saves the current playback position every 10 seconds
- **Resume Functionality**: Users can resume lessons from where they left off
- **Completion Detection**: Lessons are automatically marked as completed when 90% is watched
- **Manual Completion**: Users can manually mark lessons as completed

### 2. Course Progress Tracking
- **Overall Progress**: Shows percentage of lessons completed in a course
- **Lesson Count**: Displays completed vs total lessons
- **Auto-Completion**: Courses are automatically marked as completed when all lessons are finished
- **Progress Persistence**: All progress is saved to the database

### 3. Favorites System
- **Add/Remove Favorites**: Users can favorite and unfavorite courses
- **Favorite Status**: Course cards show favorite status with heart icon
- **Favorites List**: Users can view all their favorite courses

### 4. Course Completion
- **Completion Tracking**: Tracks when courses are completed and completion percentage
- **Completion History**: Users can view their completed courses
- **Certificates**: Integration ready for certificate generation upon completion

### 5. Resume Functionality
- **Smart Resume**: Videos automatically resume from the last watched position
- **Resume Notification**: Users see a notification when resuming a lesson
- **Progress Indicators**: Visual progress bars show completion status

## Auto-Save Behavior

The system implements intelligent auto-save with the following features:

1. **Debounced Saving**: Progress is saved 2 seconds after the last update to avoid excessive API calls
2. **Interval Checking**: Only saves if the time has changed by more than the configured interval (default: 10 seconds)
3. **Completion Detection**: Automatically detects and marks lessons as completed at 90% watch time
4. **Error Handling**: Gracefully handles network errors and retries failed saves

## Testing

### Validation Script
Run the progress system validation:

```bash
npm run validate:progress
```

### Unit Tests
Run the test suite:

```bash
npm test progress-system.test.ts
```

## Requirements Satisfied

This implementation satisfies the following requirements from the specification:

- **5.3**: Users can save progress during video playback and resume from saved position
- **5.4**: System tracks lesson completion and course progress
- **5.7**: Users can mark courses as favorites and completed

## Integration Points

### Video Player Integration
The `EnhancedVideoPlayer` component integrates progress tracking with video playback:
- Tracks watch time automatically
- Handles resume functionality
- Manages completion detection
- Provides visual progress indicators

### Course Management Integration
Progress data integrates with the course management system:
- Course listings show progress status
- Next lesson recommendations
- Completion certificates (ready for implementation)
- Learning path progress tracking

### Analytics Integration
Progress data can be used for analytics:
- User engagement metrics
- Course completion rates
- Popular content identification
- Learning pattern analysis

## Performance Considerations

1. **Database Indexing**: Proper indexes on user_id and lesson_id for fast queries
2. **Debounced Updates**: Prevents excessive database writes during video playback
3. **Batch Operations**: Course progress calculations are optimized with single queries
4. **Caching**: Progress data can be cached on the client side for better UX

## Security

1. **User Authorization**: Users can only access their own progress data
2. **Admin Override**: Administrators can view any user's progress
3. **Input Validation**: All progress data is validated before saving
4. **SQL Injection Protection**: All queries use parameterized statements

## Future Enhancements

1. **Offline Support**: Cache progress locally and sync when online
2. **Progress Sharing**: Allow users to share their learning progress
3. **Achievements**: Gamification features based on progress milestones
4. **Advanced Analytics**: Detailed learning pattern analysis
5. **Mobile App Sync**: Synchronize progress across web and mobile platforms
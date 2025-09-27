# Video System Implementation

This document describes the comprehensive video system implementation for the online course platform, supporting multiple video sources, progress tracking, and advanced playback controls.

## 🎯 Overview

The video system provides a complete solution for video content delivery with support for:
- Multiple video sources (Google Drive, OneDrive, Direct URLs)
- Advanced video player with custom controls
- Progress tracking and resume functionality
- Playback speed controls (0.5x, 1x, 1.5x, 2x)
- Automatic video validation and metadata extraction

## 📁 File Structure

```
src/
├── lib/services/
│   ├── video.service.ts          # Video validation and streaming
│   └── progress.service.ts       # Progress tracking service
├── components/video/
│   ├── VideoPlayer.tsx           # Core video player component
│   ├── EnhancedVideoPlayer.tsx   # Player with progress integration
│   └── index.ts                  # Component exports
├── hooks/
│   └── useVideoProgress.ts       # Progress tracking hook
├── app/api/
│   ├── videos/
│   │   ├── validate/route.ts     # Video URL validation
│   │   ├── stream/[id]/route.ts  # Video streaming
│   │   └── metadata/[id]/route.ts # Video metadata
│   └── lessons/[id]/
│       ├── progress/route.ts     # Progress tracking
│       └── complete/route.ts     # Mark completion
└── types/index.ts                # Video-related types
```

## 🔧 Core Components

### 1. Video Service (`video.service.ts`)

Handles video URL validation and streaming for multiple sources:

```typescript
// Validate video URL
const validation = await videoService.validateVideoUrl(url, source);

// Get streamable URL
const streamUrl = await videoService.getStreamableUrl(video);

// Get supported formats
const formats = videoService.getSupportedFormats();
```

**Supported Sources:**
- **Google Drive**: `https://drive.google.com/file/d/{fileId}/view`
- **OneDrive**: `https://1drv.ms/{shortId}` or SharePoint URLs
- **Direct URLs**: Direct links to video files

**Supported Formats:**
- MP4, AVI, MOV, MKV, TS, WebM, M4V, FLV, WMV

### 2. Progress Service (`progress.service.ts`)

Manages user progress tracking:

```typescript
// Save progress
await progressService.saveProgress(userId, lessonId, currentTime, duration);

// Get progress
const progress = await progressService.getProgress(userId, lessonId);

// Mark as completed
await progressService.markLessonCompleted(userId, lessonId);
```

### 3. Video Player Components

#### Basic Video Player (`VideoPlayer.tsx`)
- Custom video controls
- Playback speed selection (0.5x, 1x, 1.5x, 2x)
- Volume control with mute
- Progress bar with seeking
- Fullscreen support
- Auto-hiding controls

#### Enhanced Video Player (`EnhancedVideoPlayer.tsx`)
- Includes all basic player features
- Integrated progress tracking
- Auto-save functionality
- Resume from saved position
- Completion detection

### 4. Progress Tracking Hook (`useVideoProgress.ts`)

React hook for video progress management:

```typescript
const {
  progress,
  loading,
  saving,
  updateProgress,
  manualSave,
  markCompleted,
  getResumeTime
} = useVideoProgress({
  userId,
  lessonId,
  autoSave: true,
  saveInterval: 10
});
```

## 🚀 Usage Examples

### Basic Video Player

```tsx
import { VideoPlayer } from '@/components/video';

<VideoPlayer
  lessonId="lesson-123"
  title="Introduction to React"
  onProgressUpdate={(currentTime, duration) => {
    console.log(`Progress: ${currentTime}/${duration}`);
  }}
  onVideoEnd={() => {
    console.log('Video completed');
  }}
  initialProgress={150} // Resume from 2:30
/>
```

### Enhanced Video Player with Progress Tracking

```tsx
import { EnhancedVideoPlayer } from '@/components/video';

<EnhancedVideoPlayer
  lessonId="lesson-123"
  userId="user-456"
  title="Introduction to React"
  onLessonComplete={() => {
    // Handle lesson completion
    router.push('/next-lesson');
  }}
/>
```

### Video URL Validation

```typescript
import { videoService } from '@/lib/services/video.service';

// Validate Google Drive URL
const result = await videoService.validateVideoUrl(
  'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
  'google_drive'
);

if (result.isValid) {
  console.log('Video is valid:', result.metadata);
  console.log('Stream URL:', result.streamUrl);
} else {
  console.error('Validation failed:', result.error);
}
```

## 🔌 API Endpoints

### Video Management

#### `POST /api/videos/validate`
Validate video URL and extract metadata.

**Request:**
```json
{
  "url": "https://drive.google.com/file/d/...",
  "source": "google_drive"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "metadata": {
      "format": "mp4",
      "durationSeconds": 300,
      "size": 5000000,
      "resolution": "1080p"
    },
    "streamUrl": "https://drive.google.com/uc?export=download&id=..."
  }
}
```

#### `GET /api/videos/stream/[id]`
Get streamable URL for a lesson video.

#### `GET /api/videos/metadata/[id]`
Get video metadata for a lesson.

### Progress Tracking

#### `GET /api/lessons/[id]/progress?userId={userId}`
Get user progress for a lesson.

#### `PUT /api/lessons/[id]/progress`
Update user progress for a lesson.

**Request:**
```json
{
  "userId": "user-123",
  "watchedSeconds": 150,
  "completed": false
}
```

#### `POST /api/lessons/[id]/complete`
Mark lesson as completed.

## 🎮 Video Player Features

### Playback Controls
- **Play/Pause**: Click video or use spacebar
- **Volume**: Slider control with mute toggle
- **Speed**: Dropdown with 0.5x, 1x, 1.5x, 2x options
- **Seeking**: Click progress bar to jump to position
- **Fullscreen**: Toggle fullscreen mode

### Progress Features
- **Auto-save**: Progress saved every 10 seconds
- **Resume**: Automatically resume from last position
- **Completion**: Auto-complete at 90% watched
- **Visual feedback**: Progress indicator and saving status

### User Experience
- **Auto-hide controls**: Controls fade after 3 seconds of inactivity
- **Responsive design**: Adapts to different screen sizes
- **Loading states**: Proper loading and error handling
- **Keyboard shortcuts**: Standard video player shortcuts

## 🔒 Security & Access Control

### Authentication
- All video endpoints require user authentication
- Progress tracking is user-specific
- Admin-only access for video management

### Trial System Integration
- Video access respects trial time limits
- Subscription validation for content access
- Time tracking for trial users

### Content Protection
- Streamable URLs are generated on-demand
- No direct file access without authentication
- Video validation prevents unauthorized content

## 📊 Progress Tracking Logic

### Completion Criteria
- Lesson considered completed at 90% watched
- Manual completion option available
- Completion triggers certificate generation (if enabled)

### Auto-save Behavior
- Progress saved every 10 seconds during playback
- Debounced to prevent excessive API calls
- Manual save option for immediate persistence

### Resume Logic
- Resume from last saved position for incomplete lessons
- Start from beginning for completed lessons
- Handle edge cases (corrupted progress, etc.)

## 🧪 Testing

### Validation Script
Run the video system validation:

```bash
npx tsx src/scripts/validate-video-system.ts
```

### Test Coverage
- Video URL validation for all sources
- Progress tracking functionality
- API endpoint responses
- Component rendering and interactions

## 🔧 Configuration

### Environment Variables
```env
# Video processing (if needed)
VIDEO_PROCESSING_ENABLED=false

# External API keys (for enhanced metadata)
GOOGLE_DRIVE_API_KEY=your_key_here
MICROSOFT_GRAPH_API_KEY=your_key_here
```

### Supported Video Sources
Configure in `video.service.ts`:
- Google Drive: File sharing permissions required
- OneDrive: Public sharing or API access
- Direct URLs: CORS-enabled video hosting

## 🚀 Deployment Considerations

### Performance
- Video streaming uses direct URLs when possible
- Progress tracking is debounced to reduce server load
- Metadata caching for frequently accessed videos

### Scalability
- Stateless progress tracking service
- Database-backed progress storage (when implemented)
- CDN integration for direct video URLs

### Monitoring
- Video validation success rates
- Progress tracking accuracy
- User engagement metrics

## 📋 Requirements Fulfilled

✅ **Requirement 5.3**: Video playback with speed controls (0.5x, 1x, 1.5x, 2x)
✅ **Requirement 5.4**: Progress tracking and resume functionality  
✅ **Requirement 5.5**: Multiple video source support (Google Drive, OneDrive, Direct)

## 🔄 Future Enhancements

- **Video transcoding**: Automatic format conversion
- **Adaptive streaming**: Quality adjustment based on bandwidth
- **Offline viewing**: Download for offline access
- **Video analytics**: Detailed viewing statistics
- **Subtitle support**: Multiple language subtitles
- **Video chapters**: Navigate to specific sections
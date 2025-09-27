# Course Management System Implementation

This document describes the implementation of Task 4: "Create course management system" for the online course platform.

## 📋 Task Requirements Completed

### ✅ 1.1 - Course CRUD operations (admin only)
- **Course Repository**: Full CRUD operations with PostgreSQL
- **Course Service**: Business logic layer with validation
- **API Endpoints**: RESTful endpoints for course management
  - `GET /api/courses` - List all courses
  - `POST /api/courses` - Create new course (admin only)
  - `GET /api/courses/[id]` - Get course by ID
  - `PUT /api/courses/[id]` - Update course (admin only)
  - `DELETE /api/courses/[id]` - Delete course (admin only)

### ✅ 1.2 - Module creation within courses
- **Module Repository**: CRUD operations with automatic ordering
- **API Endpoints**: Module management within courses
  - `GET /api/courses/[id]/modules` - List modules for a course
  - `POST /api/courses/[id]/modules` - Create new module (admin only)
  - `GET /api/modules/[id]` - Get module by ID
  - `PUT /api/modules/[id]` - Update module (admin only)
  - `DELETE /api/modules/[id]` - Delete module (admin only)

### ✅ 1.3 - Lesson creation with video URL support
- **Lesson Repository**: Full CRUD with video metadata support
- **Video Validation**: Support for Google Drive, OneDrive, and direct URLs
- **API Endpoints**: Lesson management with video support
  - `GET /api/modules/[id]/lessons` - List lessons for a module
  - `POST /api/modules/[id]/lessons` - Create new lesson (admin only)
  - `GET /api/lessons/[id]` - Get lesson by ID
  - `PUT /api/lessons/[id]` - Update lesson (admin only)
  - `DELETE /api/lessons/[id]` - Delete lesson (admin only)
  - `POST /api/videos/validate` - Validate video URLs

### ✅ 1.4 - File upload system for materials (PDFs, audio)
- **File Upload Service**: Secure file handling with validation
- **Material Management**: Attach files to lessons
- **API Endpoints**: File upload and management
  - `POST /api/lessons/[id]/materials` - Upload material (admin only)
  - `GET /api/lessons/[id]/materials` - List lesson materials
  - `PUT /api/lessons/[id]/materials/[materialId]` - Update material metadata
  - `DELETE /api/lessons/[id]/materials/[materialId]` - Delete material
  - `GET /api/uploads/[...path]` - Serve uploaded files

## 🏗️ Architecture

### Database Layer
- **PostgreSQL Schema**: Complete database schema with proper relationships
- **Connection Management**: Pool-based connection handling
- **Repositories**: Data access layer with transaction support

### Service Layer
- **Course Service**: Business logic for course management
- **File Upload Service**: Secure file handling and validation

### API Layer
- **RESTful Endpoints**: Complete CRUD operations
- **Error Handling**: Structured error responses
- **Validation**: Input validation and business rule enforcement

## 📁 File Structure

```
src/
├── lib/
│   ├── db/
│   │   ├── connection.ts              # Database connection
│   │   └── repositories/
│   │       ├── course.repository.ts   # Course data access
│   │       ├── module.repository.ts   # Module data access
│   │       └── lesson.repository.ts   # Lesson data access
│   ├── services/
│   │   ├── course.service.ts          # Course business logic
│   │   └── file-upload.service.ts     # File handling
│   └── config.ts                      # Configuration management
├── app/api/
│   ├── courses/                       # Course endpoints
│   ├── modules/                       # Module endpoints
│   ├── lessons/                       # Lesson endpoints
│   ├── videos/                        # Video validation
│   └── uploads/                       # File serving
├── types/
│   └── index.ts                       # TypeScript definitions
└── test/
    └── course-management.test.ts      # Test suite
```

## 🗄️ Database Schema

### Tables Created
- **courses**: Course information and metadata
- **modules**: Course modules with ordering
- **lessons**: Individual lessons with video support
- **user_progress**: Progress tracking (for future use)

### Key Features
- UUID primary keys for security
- Proper foreign key relationships
- Automatic timestamps
- JSON support for materials
- Indexing for performance

## 🔧 Configuration

### Environment Variables
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/plataforma_cursos"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-jwt-secret"
# ... other configuration
```

### File Upload Configuration
- **Max File Size**: 50MB
- **Allowed Types**: PDF, Audio (MP3, WAV, OGG), Documents
- **Storage**: Local filesystem with secure path validation

## 🎯 Video Support

### Supported Sources
1. **Google Drive**: Private file links with validation
2. **OneDrive**: SharePoint and OneDrive links
3. **Direct URLs**: Direct video file URLs

### Supported Formats
- MP4, AVI, MOV, MKV, TS, WebM

## 🔒 Security Features

- **Path Validation**: Prevents directory traversal attacks
- **File Type Validation**: Only allows safe file types
- **Size Limits**: Prevents large file uploads
- **Admin-Only Operations**: CRUD operations restricted to admins

## 🧪 Testing

### Test Coverage
- Unit tests for services and utilities
- Integration test structure
- Validation scripts for implementation verification

### Running Tests
```bash
# Validate implementation
node validate-implementation.js

# Run tests (when database is available)
npm test
```

## 🚀 Usage Examples

### Creating a Course
```javascript
POST /api/courses
{
  "title": "JavaScript Fundamentals",
  "description": "Learn the basics of JavaScript",
  "coverImageUrl": "https://example.com/cover.jpg",
  "price": 99.99,
  "isActive": true
}
```

### Adding a Module
```javascript
POST /api/courses/{courseId}/modules
{
  "title": "Variables and Data Types",
  "description": "Understanding JavaScript variables",
  "orderIndex": 1
}
```

### Creating a Lesson with Video
```javascript
POST /api/modules/{moduleId}/lessons
{
  "title": "Introduction to Variables",
  "description": "Learn about var, let, and const",
  "videoUrl": "https://drive.google.com/file/d/abc123/view",
  "videoSource": "google_drive",
  "videoFormat": "mp4",
  "durationSeconds": 600
}
```

### Uploading Materials
```javascript
POST /api/lessons/{lessonId}/materials
Content-Type: multipart/form-data

file: [PDF or audio file]
```

## 📈 Performance Considerations

- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connection management
- **File Caching**: Static file serving with cache headers
- **Lazy Loading**: Nested data loaded on demand

## 🔄 Future Enhancements

- **Cloud Storage**: AWS S3 integration for file storage
- **Video Processing**: Automatic video format conversion
- **CDN Integration**: Content delivery network for better performance
- **Batch Operations**: Bulk course/module/lesson operations

## ✅ Implementation Status

**Task 4 - Course Management System: COMPLETED**

All requirements have been successfully implemented:
- ✅ Course, Module, and Lesson models
- ✅ CRUD operations for courses (admin only)
- ✅ Module creation within courses
- ✅ Lesson creation with video URL support
- ✅ File upload system for materials (PDFs, audio)

The implementation is ready for integration with the authentication system (Task 2) and trial system (Task 3).
# Learning Path System

The Learning Path System allows users to create personalized learning journeys by organizing courses in a specific order. Users can share their learning paths with others, and non-subscribers can view shared paths as previews.

## Features

### Core Functionality
- ✅ Create custom learning paths with title, description, and cover image
- ✅ Add and remove courses from learning paths
- ✅ Reorder courses within learning paths
- ✅ Share learning paths via unique tokens
- ✅ Public/private learning path visibility
- ✅ View shared learning paths without authentication

### User Experience
- ✅ Intuitive drag-and-drop course ordering
- ✅ Course selection interface with search and filtering
- ✅ Share modal with copy-to-clipboard functionality
- ✅ Responsive design for all devices
- ✅ Preview mode for non-subscribers

## Architecture

### Database Schema

#### learning_paths table
```sql
CREATE TABLE learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url VARCHAR(500),
    share_token VARCHAR(255) UNIQUE NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### learning_path_courses table
```sql
CREATE TABLE learning_path_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    UNIQUE(learning_path_id, course_id)
);
```

### API Endpoints

#### Learning Path Management
- `GET /api/learning-paths` - Get user's learning paths
- `POST /api/learning-paths` - Create new learning path
- `GET /api/learning-paths/[id]` - Get specific learning path
- `PUT /api/learning-paths/[id]` - Update learning path
- `DELETE /api/learning-paths/[id]` - Delete learning path

#### Course Management
- `POST /api/learning-paths/[id]/courses` - Add course to learning path
- `PUT /api/learning-paths/[id]/courses` - Reorder courses in learning path
- `DELETE /api/learning-paths/[id]/courses?courseId=X` - Remove course from learning path

#### Sharing
- `POST /api/learning-paths/[id]/share` - Regenerate share token
- `PUT /api/learning-paths/[id]/share` - Toggle public/private access
- `GET /api/learning-paths/shared/[token]` - Get shared learning path (public)

## Components

### LearningPathCreator
Interactive component for creating and editing learning paths:
- Form for basic information (title, description, cover image)
- Course selection interface with available/selected lists
- Drag-and-drop reordering functionality
- Public/private visibility toggle

### LearningPathList
Dashboard component showing user's learning paths:
- Grid layout with learning path cards
- Quick actions (edit, share, delete, toggle visibility)
- Course count and creation date display
- Search and filtering capabilities

### ShareModal
Modal for sharing learning paths:
- Share URL generation and display
- Copy-to-clipboard functionality
- Share token regeneration
- Public/private status indicator

### SharedLearningPathViewer
Public viewer for shared learning paths:
- Clean, read-only interface
- Course preview with subscription prompts
- Call-to-action for non-subscribers
- Responsive design for sharing on social media

## Usage Examples

### Creating a Learning Path

```typescript
import { useLearningPaths } from '../hooks/useLearningPaths';

function CreateLearningPath() {
  const { createLearningPath } = useLearningPaths();
  
  const handleCreate = async () => {
    const learningPath = await createLearningPath(
      'Full Stack Development',
      'Complete journey from frontend to backend',
      'https://example.com/cover.jpg'
    );
    
    if (learningPath) {
      console.log('Learning path created:', learningPath.id);
    }
  };
}
```

### Adding Courses to Path

```typescript
const { addCourseToPath } = useLearningPaths();

const handleAddCourse = async (pathId: string, courseId: string) => {
  const pathCourse = await addCourseToPath(pathId, courseId, 0);
  if (pathCourse) {
    console.log('Course added to learning path');
  }
};
```

### Sharing a Learning Path

```typescript
const { regenerateShareToken } = useLearningPaths();

const handleShare = async (pathId: string) => {
  const newToken = await regenerateShareToken(pathId);
  if (newToken) {
    const shareUrl = `${window.location.origin}/shared/learning-path/${newToken}`;
    navigator.clipboard.writeText(shareUrl);
  }
};
```

## Requirements Mapping

This implementation addresses the following requirements from the specification:

### Requirement 10.1 ✅
**User Story:** As a student, I want to create and share my personalized learning path, so that I can organize my studies and inspire other users.

**Implementation:**
- LearningPathCreator component allows course selection and ordering
- Share functionality generates unique tokens for public access
- Public/private visibility controls

### Requirement 10.2 ✅
**User Story:** As a student, I want to create learning path, so that I can select courses and define order.

**Implementation:**
- Interactive course selection interface
- Drag-and-drop reordering functionality
- Order index management in database

### Requirement 10.3 ✅
**User Story:** As a student, I want to finalize creation, so that the system generates unique link for sharing.

**Implementation:**
- Automatic share token generation on creation
- Unique token validation in database
- Share URL generation and display

### Requirement 10.4 ✅
**User Story:** As a user, I want to access shared link, so that I can view the complete learning path.

**Implementation:**
- Public shared learning path viewer
- No authentication required for viewing
- Complete course list with descriptions

### Requirement 10.5 ✅
**User Story:** As a non-subscriber user, I want to view shared learning path, so that the system shows content but blocks reproduction.

**Implementation:**
- SharedLearningPathViewer shows full content
- Subscription prompts for video access
- Call-to-action for registration/subscription

### Requirement 10.6 ✅
**User Story:** As a non-subscriber user, I want to try to watch, so that the system redirects to registration/subscription page.

**Implementation:**
- Click handlers on course items check subscription status
- Automatic redirect to registration for non-subscribers
- Clear messaging about subscription requirements

### Requirement 10.7 ✅
**User Story:** As a learning path owner, I want to edit path, so that the system automatically updates for all who access the link.

**Implementation:**
- Real-time updates through shared tokens
- Edit functionality preserves share URLs
- Automatic propagation of changes to shared viewers

## Testing

### Unit Tests
Run the learning path system tests:
```bash
npm run test src/test/learning-path-system.test.ts
```

### Integration Tests
Validate the complete system:
```bash
npm run validate:learning-path-system
```

### Manual Testing Checklist

#### Learning Path Creation
- [ ] Create learning path with valid data
- [ ] Validate required fields (title, description)
- [ ] Upload cover image
- [ ] Set public/private visibility

#### Course Management
- [ ] Add courses to learning path
- [ ] Remove courses from learning path
- [ ] Reorder courses using drag-and-drop
- [ ] Validate course selection limits

#### Sharing Functionality
- [ ] Generate share URL
- [ ] Copy share URL to clipboard
- [ ] Regenerate share token
- [ ] Toggle public/private access

#### Shared Viewer
- [ ] Access shared learning path via URL
- [ ] View course list and descriptions
- [ ] Test subscription prompts for non-subscribers
- [ ] Verify responsive design on mobile

## Security Considerations

### Access Control
- Learning paths can only be modified by their owners
- Share tokens are cryptographically secure (UUID-based)
- Public/private visibility is enforced at the API level

### Data Validation
- Input sanitization for all user-provided content
- Course ownership validation before adding to paths
- Order index validation to prevent manipulation

### Privacy
- User IDs are not exposed in shared learning paths
- Private learning paths require authentication to access
- Share tokens can be regenerated to revoke access

## Performance Optimizations

### Database
- Indexed queries on user_id, share_token, and learning_path_id
- Efficient JOIN queries for course data retrieval
- Pagination support for large learning path lists

### Frontend
- Lazy loading of course selection interface
- Optimistic updates for better user experience
- Debounced search and filtering

### Caching
- Share token validation caching
- Course data caching for selection interface
- Learning path metadata caching

## Future Enhancements

### Planned Features
- Learning path templates and categories
- Collaborative learning paths (multiple owners)
- Learning path analytics and progress tracking
- Social features (likes, comments, ratings)
- Learning path recommendations based on user behavior

### Technical Improvements
- Real-time collaboration using WebSockets
- Advanced search and filtering options
- Bulk operations for course management
- Export/import functionality for learning paths

## Troubleshooting

### Common Issues

#### Share Token Not Working
- Verify token exists in database
- Check if learning path is public (for non-authenticated access)
- Ensure share URL format is correct

#### Course Not Adding to Path
- Verify course exists and is active
- Check user ownership of learning path
- Validate course is not already in path

#### Permission Denied Errors
- Confirm user authentication
- Verify learning path ownership
- Check if learning path exists

### Debug Commands

```bash
# Check learning path data
npm run db:query "SELECT * FROM learning_paths WHERE user_id = 'USER_ID'"

# Verify course relationships
npm run db:query "SELECT * FROM learning_path_courses WHERE learning_path_id = 'PATH_ID'"

# Test share token
npm run db:query "SELECT * FROM learning_paths WHERE share_token = 'TOKEN'"
```

## Support

For issues related to the Learning Path System:

1. Check the troubleshooting section above
2. Run the validation script: `npm run validate:learning-path-system`
3. Review the test results: `npm run test src/test/learning-path-system.test.ts`
4. Check the application logs for detailed error messages

The Learning Path System is designed to be robust and user-friendly, providing a complete solution for personalized learning journey creation and sharing.
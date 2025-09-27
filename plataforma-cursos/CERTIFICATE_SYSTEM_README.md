# Certificate Generation System

## Overview

The Certificate Generation System provides automatic certificate generation for students who complete courses. It includes PDF generation, certificate verification, and download functionality.

## Features

### Core Functionality
- ✅ Automatic certificate generation on course completion
- ✅ PDF certificate generation with custom design
- ✅ Certificate verification system
- ✅ Certificate download functionality
- ✅ Quiz score integration (if available)
- ✅ Certificate management for users and admins

### Components
- ✅ Certificate Service for business logic
- ✅ Certificate Repository for data access
- ✅ PDF Generator utility
- ✅ React components for UI
- ✅ Custom hooks for state management
- ✅ API endpoints for certificate operations

## Architecture

### Database Schema
```sql
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    certificate_url VARCHAR(500),
    average_quiz_score DECIMAL(5,2),
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);
```

### API Endpoints

#### Get Certificates
```
GET /api/certificates
GET /api/certificates?courseId={courseId}
```
Returns user's certificates or specific certificate for a course.

#### Generate Certificate
```
POST /api/certificates
Body: { courseId: string }
```
Generates a new certificate for the specified course.

#### Verify Certificate
```
GET /api/certificates/{id}
```
Verifies certificate authenticity and returns certificate details.

#### Download Certificate
```
GET /api/certificates/{id}/download
```
Returns download URL for the certificate PDF.

## Usage

### Frontend Components

#### Certificate List
```tsx
import { CertificateList } from '@/components/certificates';

function MyPage() {
  return (
    <CertificateList 
      onDownload={(certificateId) => {
        console.log('Downloaded:', certificateId);
      }}
    />
  );
}
```

#### Certificate Generator
```tsx
import { CertificateGenerator } from '@/components/certificates';

function CoursePage({ courseId, courseName, isCompleted }) {
  return (
    <CertificateGenerator
      courseId={courseId}
      courseName={courseName}
      isEligible={isCompleted}
      onGenerate={(certificate) => {
        console.log('Generated:', certificate);
      }}
    />
  );
}
```

#### Certificate Viewer
```tsx
import { CertificateViewer } from '@/components/certificates';

function CertificatePage({ certificate }) {
  return (
    <CertificateViewer
      certificate={certificate}
      userName="John Doe"
      courseName="React Fundamentals"
      onDownload={(id) => downloadCertificate(id)}
    />
  );
}
```

### Custom Hook
```tsx
import { useCertificates } from '@/hooks/useCertificates';

function MyComponent() {
  const {
    certificates,
    isLoading,
    error,
    generateCertificate,
    downloadCertificate,
    verifyCertificate
  } = useCertificates();

  const handleGenerate = async (courseId: string) => {
    try {
      const certificate = await generateCertificate(courseId);
      console.log('Certificate generated:', certificate);
    } catch (error) {
      console.error('Failed to generate certificate:', error);
    }
  };

  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
}
```

### Service Layer
```typescript
import { CertificateService } from '@/lib/services/certificate.service';

// Generate certificate
const certificate = await CertificateService.generateCertificate(userId, courseId);

// Get user certificates
const certificates = await CertificateService.getUserCertificates(userId);

// Verify certificate
const verification = await CertificateService.verifyCertificate(certificateId);

// Check eligibility
const isEligible = await CertificateService.isEligibleForCertificate(userId, courseId);
```

## Certificate Design

The PDF certificates include:
- **Header**: "CERTIFICADO DE CONCLUSÃO" with decorative elements
- **Student Name**: Prominently displayed
- **Course Name**: Course title
- **Completion Date**: Formatted in Portuguese
- **Quiz Score**: Average score if quizzes were taken
- **Certificate ID**: Unique identifier for verification
- **Verification Note**: Instructions for certificate verification

### Design Elements
- Professional blue color scheme (#2563eb)
- Landscape A4 format
- Decorative borders and elements
- Clean typography with proper hierarchy
- Verification information at the bottom

## Security Features

### Certificate Verification
- Each certificate has a unique ID
- Verification endpoint checks authenticity
- Certificates are linked to specific users and courses
- Tamper-proof PDF generation

### Access Control
- Users can only download their own certificates
- Admin users can view all certificates
- Authentication required for all operations
- Course completion verification before generation

## Error Handling

### Common Error Codes
- `CERT_001`: Certificate not found
- `CERT_002`: Failed to get certificates
- `CERT_003`: Course ID is required
- `CERT_004`: User not eligible for certificate
- `CERT_005`: Failed to generate certificate
- `CERT_006`: Certificate ID is required
- `CERT_007`: Certificate not found or invalid
- `CERT_008`: Failed to verify certificate
- `CERT_009`: Certificate ID is required for download
- `CERT_010`: Certificate not found for download
- `CERT_011`: Access denied to certificate
- `CERT_012`: Certificate file not available
- `CERT_013`: Failed to download certificate

## Testing

### Run Tests
```bash
npm test certificate-system.test.ts
```

### Validation Script
```bash
npm run validate:certificates
# or
tsx src/scripts/validate-certificate-system.ts
```

### Test Coverage
- Certificate Service methods
- PDF generation functionality
- Repository operations
- API endpoint responses
- Component rendering
- Hook functionality

## Dependencies

### Required Packages
- `pdfkit`: PDF generation
- `@types/pdfkit`: TypeScript definitions

### Installation
```bash
npm install pdfkit @types/pdfkit
```

## Configuration

### Environment Variables
```env
# File upload configuration (for certificate storage)
UPLOAD_PROVIDER=local|aws|cloudflare
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### File Storage
Certificates are stored using the file upload service. Configure your preferred storage provider in the environment variables.

## Integration Points

### Course Completion
The certificate system integrates with the course progress system to determine eligibility:
- Checks `course_completions` table
- Requires 100% course completion
- Automatically triggered when course is marked complete

### Quiz System
If quizzes are available:
- Calculates average quiz score across all course quizzes
- Includes score in certificate PDF
- Stores score in certificate record

### Progress System
Works with the progress tracking system:
- Monitors lesson completion
- Tracks course completion status
- Triggers certificate generation eligibility

## Monitoring and Analytics

### Certificate Statistics
- Total certificates issued
- Certificates issued this month
- Average quiz scores
- Most popular courses (by certificates)

### Admin Dashboard Integration
Certificate metrics are available in the admin dashboard:
- Certificate generation trends
- User engagement with certificates
- Course completion rates

## Future Enhancements

### Planned Features
- [ ] Custom certificate templates per course
- [ ] Bulk certificate generation for admins
- [ ] Certificate expiration dates
- [ ] Digital signatures
- [ ] Certificate sharing on social media
- [ ] Certificate blockchain verification
- [ ] Multi-language certificate support
- [ ] Certificate analytics and insights

### API Improvements
- [ ] Batch certificate operations
- [ ] Certificate template management
- [ ] Advanced filtering and search
- [ ] Certificate export formats (PNG, JPG)

## Troubleshooting

### Common Issues

#### PDF Generation Fails
- Check PDFKit installation
- Verify file upload service configuration
- Check available disk space
- Review error logs for specific issues

#### Certificate Not Generated
- Verify course completion status
- Check user eligibility
- Ensure course exists and is active
- Review database constraints

#### Download Issues
- Verify certificate URL is accessible
- Check file storage service status
- Ensure user has permission to download
- Review authentication status

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=certificate:*
```

## Support

For issues related to the certificate system:
1. Check the validation script output
2. Review error logs
3. Verify database schema
4. Test with the provided test suite
5. Check integration with course completion system

## Requirements Compliance

This implementation satisfies the following requirements:

### Requirement 12.5
✅ **WHEN o aluno completa curso inteiro THEN o sistema SHALL gerar certificado de conclusão**
- Automatic certificate generation on course completion
- Integration with course completion tracking
- Eligibility verification before generation

### Requirement 12.6
✅ **IF o aluno fez quizzes THEN o certificado SHALL incluir pontuação média obtida**
- Quiz score calculation and integration
- Average score display in certificate
- Score storage in certificate record

### Requirement 12.7
✅ **WHEN o certificado é gerado THEN o sistema SHALL permitir download em PDF**
- PDF generation with professional design
- Download functionality via API
- Secure access control for downloads
- Certificate verification system
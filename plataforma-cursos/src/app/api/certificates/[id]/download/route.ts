import { NextRequest, NextResponse } from 'next/server';
import { CertificateService } from '@/lib/services/certificate.service';
import { authMiddleware } from '@/lib/auth/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: { code: 'AUTH_001', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const certificateId = params.id;

    if (!certificateId) {
      return NextResponse.json(
        { error: { code: 'CERT_009', message: 'Certificate ID is required' } },
        { status: 400 }
      );
    }

    // Get certificate details
    const verification = await CertificateService.verifyCertificate(certificateId);

    if (!verification.isValid || !verification.certificate) {
      return NextResponse.json(
        { error: { code: 'CERT_010', message: 'Certificate not found' } },
        { status: 404 }
      );
    }

    // Check if user owns this certificate
    if (verification.certificate.userId !== authResult.user.id) {
      return NextResponse.json(
        { error: { code: 'CERT_011', message: 'Access denied' } },
        { status: 403 }
      );
    }

    // Redirect to certificate URL for download
    const certificateUrl = verification.certificate.certificateUrl;
    
    if (!certificateUrl) {
      return NextResponse.json(
        { error: { code: 'CERT_012', message: 'Certificate file not available' } },
        { status: 404 }
      );
    }

    // For direct download, we could fetch the file and return it
    // For now, we'll return the URL for the frontend to handle
    return NextResponse.json({
      success: true,
      data: {
        downloadUrl: certificateUrl,
        fileName: `certificate-${verification.certificate.courseName.replace(/\s+/g, '-').toLowerCase()}.pdf`
      }
    });
  } catch (error) {
    console.error('Error in GET /api/certificates/[id]/download:', error);
    return NextResponse.json(
      { error: { code: 'CERT_013', message: 'Failed to download certificate' } },
      { status: 500 }
    );
  }
}
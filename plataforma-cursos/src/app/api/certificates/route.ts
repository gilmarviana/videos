import { NextRequest, NextResponse } from 'next/server';
import { CertificateService } from '@/lib/services/certificate.service';
import { authMiddleware } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: { code: 'AUTH_001', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (courseId) {
      // Get specific certificate for user and course
      const certificate = await CertificateService.getCertificate(authResult.user.id, courseId);
      
      if (!certificate) {
        return NextResponse.json(
          { error: { code: 'CERT_001', message: 'Certificate not found' } },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: certificate
      });
    } else {
      // Get all certificates for user
      const certificates = await CertificateService.getUserCertificates(authResult.user.id);
      
      return NextResponse.json({
        success: true,
        data: certificates
      });
    }
  } catch (error) {
    console.error('Error in GET /api/certificates:', error);
    return NextResponse.json(
      { error: { code: 'CERT_002', message: 'Failed to get certificates' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: { code: 'AUTH_001', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: { code: 'CERT_003', message: 'Course ID is required' } },
        { status: 400 }
      );
    }

    // Check if user is eligible for certificate
    const isEligible = await CertificateService.isEligibleForCertificate(
      authResult.user.id, 
      courseId
    );

    if (!isEligible) {
      return NextResponse.json(
        { error: { code: 'CERT_004', message: 'User is not eligible for certificate. Course must be completed.' } },
        { status: 400 }
      );
    }

    // Generate certificate
    const certificate = await CertificateService.generateCertificate(
      authResult.user.id,
      courseId
    );

    return NextResponse.json({
      success: true,
      data: certificate
    });
  } catch (error) {
    console.error('Error in POST /api/certificates:', error);
    return NextResponse.json(
      { error: { code: 'CERT_005', message: 'Failed to generate certificate' } },
      { status: 500 }
    );
  }
}
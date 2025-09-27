import { NextRequest, NextResponse } from 'next/server';
import { CertificateService } from '@/lib/services/certificate.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const certificateId = params.id;

    if (!certificateId) {
      return NextResponse.json(
        { error: { code: 'CERT_006', message: 'Certificate ID is required' } },
        { status: 400 }
      );
    }

    // Verify certificate
    const verification = await CertificateService.verifyCertificate(certificateId);

    if (!verification.isValid) {
      return NextResponse.json(
        { error: { code: 'CERT_007', message: 'Certificate not found or invalid' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        isValid: true,
        certificate: verification.certificate
      }
    });
  } catch (error) {
    console.error('Error in GET /api/certificates/[id]:', error);
    return NextResponse.json(
      { error: { code: 'CERT_008', message: 'Failed to verify certificate' } },
      { status: 500 }
    );
  }
}
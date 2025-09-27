import { NextRequest, NextResponse } from 'next/server';
import { LandingPageService } from '@/lib/services/landing-page.service';
import { verifyAuth } from '@/lib/auth/middleware';

const landingPageService = new LandingPageService();

export async function GET(
  request: NextRequest,
  { params }: { params: { section: string } }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success || authResult.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Admin access required' } },
        { status: 401 }
      );
    }

    const section = await landingPageService.getSectionByName(params.section);
    if (!section) {
      return NextResponse.json(
        { success: false, error: { code: 'SECTION_NOT_FOUND', message: 'Section not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: section });
  } catch (error) {
    console.error('Error fetching landing page section:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to fetch landing page section' 
        } 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { section: string } }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success || authResult.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Admin access required' } },
        { status: 401 }
      );
    }

    const { isActive } = await request.json();

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_DATA', message: 'isActive must be a boolean' } },
        { status: 400 }
      );
    }

    const updatedSection = await landingPageService.toggleSectionStatus(params.section, isActive);
    if (!updatedSection) {
      return NextResponse.json(
        { success: false, error: { code: 'SECTION_NOT_FOUND', message: 'Section not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedSection });
  } catch (error) {
    console.error('Error updating landing page section status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to update landing page section status' 
        } 
      },
      { status: 500 }
    );
  }
}
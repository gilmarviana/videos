import { NextRequest, NextResponse } from 'next/server';
import { LandingPageService } from '@/lib/services/landing-page.service';
import { verifyAuth } from '@/lib/auth/middleware';

const landingPageService = new LandingPageService();

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success || authResult.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Admin access required' } },
        { status: 401 }
      );
    }

    const sections = await landingPageService.getAllSections();
    return NextResponse.json({ success: true, data: sections });
  } catch (error) {
    console.error('Error fetching landing page sections:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to fetch landing page sections' 
        } 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success || authResult.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Admin access required' } },
        { status: 401 }
      );
    }

    const { section, content } = await request.json();

    if (!section || !content) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_DATA', message: 'Section and content are required' } },
        { status: 400 }
      );
    }

    let updatedSection;

    switch (section) {
      case 'hero':
        updatedSection = await landingPageService.updateHeroSection(content);
        break;
      case 'features':
        updatedSection = await landingPageService.updateFeaturesSection(content);
        break;
      case 'testimonials':
        updatedSection = await landingPageService.updateTestimonialsSection(content);
        break;
      case 'pricing':
        updatedSection = await landingPageService.updatePricingSection(content);
        break;
      case 'faq':
        updatedSection = await landingPageService.updateFAQSection(content);
        break;
      case 'about':
        updatedSection = await landingPageService.updateAboutSection(content);
        break;
      default:
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_SECTION', message: 'Invalid section type' } },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data: updatedSection });
  } catch (error) {
    console.error('Error updating landing page section:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: error instanceof Error ? error.message : 'Failed to update landing page section' 
        } 
      },
      { status: 500 }
    );
  }
}
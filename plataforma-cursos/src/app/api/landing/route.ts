import { NextRequest, NextResponse } from 'next/server';
import { LandingPageService } from '@/lib/services/landing-page.service';

const landingPageService = new LandingPageService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    if (section) {
      const sectionData = await landingPageService.getSectionByName(section);
      if (!sectionData) {
        return NextResponse.json(
          { success: false, error: { code: 'SECTION_NOT_FOUND', message: 'Section not found' } },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: sectionData });
    }

    const data = await landingPageService.getLandingPageData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching landing page data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to fetch landing page data' 
        } 
      },
      { status: 500 }
    );
  }
}
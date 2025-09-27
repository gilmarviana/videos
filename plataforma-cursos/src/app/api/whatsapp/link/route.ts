import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/lib/services/whatsapp.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { optionId, customMessage } = body;

    const config = await whatsappService.getActiveConfig();
    
    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFIG_NOT_FOUND',
            message: 'WhatsApp configuration not found'
          }
        },
        { status: 404 }
      );
    }

    let whatsappLink: string;

    if (optionId) {
      // Generate link for specific menu option
      whatsappLink = whatsappService.generateMenuOptionLink(config, optionId);
    } else if (customMessage) {
      // Generate link with custom message
      whatsappLink = whatsappService.generateWhatsAppLink(config.phoneNumber, customMessage);
    } else {
      // Generate link with welcome message
      whatsappLink = whatsappService.generateWhatsAppLink(config.phoneNumber, config.welcomeMessage);
    }

    return NextResponse.json({
      success: true,
      data: {
        link: whatsappLink,
        phoneNumber: config.phoneNumber
      }
    });
  } catch (error) {
    console.error('Error generating WhatsApp link:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'WHATSAPP_LINK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to generate WhatsApp link'
        }
      },
      { status: 500 }
    );
  }
}
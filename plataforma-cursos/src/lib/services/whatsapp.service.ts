import { WhatsAppRepository } from '@/lib/db/repositories/whatsapp.repository';
import { WhatsAppConfig, WhatsAppMenuOption } from '@/types';
import { db } from '@/lib/db/connection';

export class WhatsAppService {
  private whatsappRepository: WhatsAppRepository;

  constructor() {
    this.whatsappRepository = new WhatsAppRepository(db);
  }

  async getActiveConfig(): Promise<WhatsAppConfig | null> {
    try {
      return await this.whatsappRepository.getActiveConfig();
    } catch (error) {
      console.error('Error getting active WhatsApp config:', error);
      throw new Error('Failed to get WhatsApp configuration');
    }
  }

  async getConfig(id: string): Promise<WhatsAppConfig | null> {
    try {
      return await this.whatsappRepository.getConfig(id);
    } catch (error) {
      console.error('Error getting WhatsApp config:', error);
      throw new Error('Failed to get WhatsApp configuration');
    }
  }

  async createConfig(configData: {
    phoneNumber: string;
    welcomeMessage: string;
    menuOptions: WhatsAppMenuOption[];
    isActive?: boolean;
  }): Promise<WhatsAppConfig> {
    try {
      // Validate phone number format
      if (!this.isValidPhoneNumber(configData.phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      // Validate menu options
      this.validateMenuOptions(configData.menuOptions);

      const config: Omit<WhatsAppConfig, 'id' | 'updatedAt'> = {
        phoneNumber: this.formatPhoneNumber(configData.phoneNumber),
        welcomeMessage: configData.welcomeMessage.trim(),
        menuOptions: configData.menuOptions.map((option, index) => ({
          ...option,
          order: index
        })),
        isActive: configData.isActive ?? true
      };

      return await this.whatsappRepository.createConfig(config);
    } catch (error) {
      console.error('Error creating WhatsApp config:', error);
      throw error;
    }
  }

  async updateConfig(id: string, updates: {
    phoneNumber?: string;
    welcomeMessage?: string;
    menuOptions?: WhatsAppMenuOption[];
    isActive?: boolean;
  }): Promise<WhatsAppConfig | null> {
    try {
      const updateData: Partial<Omit<WhatsAppConfig, 'id' | 'updatedAt'>> = {};

      if (updates.phoneNumber !== undefined) {
        if (!this.isValidPhoneNumber(updates.phoneNumber)) {
          throw new Error('Invalid phone number format');
        }
        updateData.phoneNumber = this.formatPhoneNumber(updates.phoneNumber);
      }

      if (updates.welcomeMessage !== undefined) {
        updateData.welcomeMessage = updates.welcomeMessage.trim();
      }

      if (updates.menuOptions !== undefined) {
        this.validateMenuOptions(updates.menuOptions);
        updateData.menuOptions = updates.menuOptions.map((option, index) => ({
          ...option,
          order: index
        }));
      }

      if (updates.isActive !== undefined) {
        updateData.isActive = updates.isActive;
      }

      return await this.whatsappRepository.updateConfig(id, updateData);
    } catch (error) {
      console.error('Error updating WhatsApp config:', error);
      throw error;
    }
  }

  async deleteConfig(id: string): Promise<boolean> {
    try {
      return await this.whatsappRepository.deleteConfig(id);
    } catch (error) {
      console.error('Error deleting WhatsApp config:', error);
      throw new Error('Failed to delete WhatsApp configuration');
    }
  }

  async getAllConfigs(): Promise<WhatsAppConfig[]> {
    try {
      return await this.whatsappRepository.getAllConfigs();
    } catch (error) {
      console.error('Error getting all WhatsApp configs:', error);
      throw new Error('Failed to get WhatsApp configurations');
    }
  }

  generateWhatsAppLink(phoneNumber: string, message: string): string {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  }

  generateMenuOptionLink(config: WhatsAppConfig, optionId: string): string {
    const option = config.menuOptions.find(opt => opt.id === optionId);
    if (!option) {
      throw new Error('Menu option not found');
    }

    return this.generateWhatsAppLink(config.phoneNumber, option.message);
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a valid Brazilian phone number (11 digits with country code 55)
    // or international format (10-15 digits)
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it's a Brazilian number without country code, add it
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `55${cleaned}`;
    }
    
    // If it's a Brazilian number with area code but no country code
    if (cleaned.length === 10 || cleaned.length === 11) {
      return `55${cleaned}`;
    }
    
    return cleaned;
  }

  private validateMenuOptions(menuOptions: WhatsAppMenuOption[]): void {
    if (menuOptions.length === 0) {
      throw new Error('At least one menu option is required');
    }

    if (menuOptions.length > 10) {
      throw new Error('Maximum 10 menu options allowed');
    }

    for (const option of menuOptions) {
      if (!option.title || option.title.trim().length === 0) {
        throw new Error('Menu option title is required');
      }

      if (!option.message || option.message.trim().length === 0) {
        throw new Error('Menu option message is required');
      }

      if (option.title.length > 50) {
        throw new Error('Menu option title must be 50 characters or less');
      }

      if (option.message.length > 500) {
        throw new Error('Menu option message must be 500 characters or less');
      }
    }

    // Check for duplicate titles
    const titles = menuOptions.map(opt => opt.title.toLowerCase());
    const uniqueTitles = new Set(titles);
    if (titles.length !== uniqueTitles.size) {
      throw new Error('Menu option titles must be unique');
    }
  }
}

export const whatsappService = new WhatsAppService();
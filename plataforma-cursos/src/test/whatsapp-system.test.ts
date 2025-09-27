import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { whatsappService } from '../lib/services/whatsapp.service';
import { WhatsAppConfig } from '../types';

describe('WhatsApp Integration System', () => {
  let testConfigId: string | null = null;

  afterEach(async () => {
    // Clean up test data
    if (testConfigId) {
      try {
        await whatsappService.deleteConfig(testConfigId);
      } catch (error) {
        // Ignore cleanup errors
      }
      testConfigId = null;
    }
  });

  describe('WhatsApp Configuration Management', () => {
    it('should create a new WhatsApp configuration', async () => {
      const configData = {
        phoneNumber: '5511999999999',
        welcomeMessage: 'Olá! Como podemos ajudar você hoje?',
        menuOptions: [
          {
            id: 'support',
            title: 'Suporte Técnico',
            message: 'Olá! Preciso de ajuda com suporte técnico.',
            icon: '🛠️',
            order: 0
          }
        ],
        isActive: true
      };

      const config = await whatsappService.createConfig(configData);
      testConfigId = config.id;

      expect(config).toBeDefined();
      expect(config.phoneNumber).toBe('5511999999999');
      expect(config.welcomeMessage).toBe(configData.welcomeMessage);
      expect(config.menuOptions).toHaveLength(1);
      expect(config.isActive).toBe(true);
    });

    it('should get active configuration', async () => {
      // Create a test config first
      const config = await whatsappService.createConfig({
        phoneNumber: '5511999999999',
        welcomeMessage: 'Test message',
        menuOptions: [],
        isActive: true
      });
      testConfigId = config.id;

      const activeConfig = await whatsappService.getActiveConfig();
      expect(activeConfig).toBeDefined();
      expect(activeConfig?.id).toBe(config.id);
      expect(activeConfig?.isActive).toBe(true);
    });

    it('should update configuration', async () => {
      // Create a test config first
      const config = await whatsappService.createConfig({
        phoneNumber: '5511999999999',
        welcomeMessage: 'Original message',
        menuOptions: [],
        isActive: true
      });
      testConfigId = config.id;

      const updatedConfig = await whatsappService.updateConfig(config.id, {
        welcomeMessage: 'Updated message',
        isActive: false
      });

      expect(updatedConfig).toBeDefined();
      expect(updatedConfig?.welcomeMessage).toBe('Updated message');
      expect(updatedConfig?.isActive).toBe(false);
    });

    it('should delete configuration', async () => {
      // Create a test config first
      const config = await whatsappService.createConfig({
        phoneNumber: '5511999999999',
        welcomeMessage: 'Test message',
        menuOptions: [],
        isActive: true
      });

      const deleted = await whatsappService.deleteConfig(config.id);
      expect(deleted).toBe(true);

      const deletedConfig = await whatsappService.getConfig(config.id);
      expect(deletedConfig).toBeNull();
    });
  });

  describe('Phone Number Validation', () => {
    it('should accept valid Brazilian phone numbers', async () => {
      const config = await whatsappService.createConfig({
        phoneNumber: '5511999999999',
        welcomeMessage: 'Test message',
        menuOptions: [],
        isActive: true
      });
      testConfigId = config.id;

      expect(config.phoneNumber).toBe('5511999999999');
    });

    it('should format phone numbers correctly', async () => {
      const config = await whatsappService.createConfig({
        phoneNumber: '11999999999', // Without country code
        welcomeMessage: 'Test message',
        menuOptions: [],
        isActive: true
      });
      testConfigId = config.id;

      expect(config.phoneNumber).toBe('5511999999999'); // Should add country code
    });

    it('should reject invalid phone numbers', async () => {
      await expect(
        whatsappService.createConfig({
          phoneNumber: 'invalid-phone',
          welcomeMessage: 'Test message',
          menuOptions: [],
          isActive: true
        })
      ).rejects.toThrow('Invalid phone number format');
    });
  });

  describe('Menu Options Validation', () => {
    it('should validate menu option titles', async () => {
      await expect(
        whatsappService.createConfig({
          phoneNumber: '5511999999999',
          welcomeMessage: 'Test message',
          menuOptions: [
            {
              id: 'test',
              title: '', // Empty title
              message: 'Test message',
              icon: '📱',
              order: 0
            }
          ],
          isActive: true
        })
      ).rejects.toThrow('Menu option title is required');
    });

    it('should validate menu option messages', async () => {
      await expect(
        whatsappService.createConfig({
          phoneNumber: '5511999999999',
          welcomeMessage: 'Test message',
          menuOptions: [
            {
              id: 'test',
              title: 'Test Title',
              message: '', // Empty message
              icon: '📱',
              order: 0
            }
          ],
          isActive: true
        })
      ).rejects.toThrow('Menu option message is required');
    });

    it('should enforce maximum menu options limit', async () => {
      const menuOptions = Array.from({ length: 11 }, (_, i) => ({
        id: `option_${i}`,
        title: `Option ${i}`,
        message: `Message ${i}`,
        icon: '📱',
        order: i
      }));

      await expect(
        whatsappService.createConfig({
          phoneNumber: '5511999999999',
          welcomeMessage: 'Test message',
          menuOptions,
          isActive: true
        })
      ).rejects.toThrow('Maximum 10 menu options allowed');
    });

    it('should enforce unique menu option titles', async () => {
      await expect(
        whatsappService.createConfig({
          phoneNumber: '5511999999999',
          welcomeMessage: 'Test message',
          menuOptions: [
            {
              id: 'test1',
              title: 'Duplicate Title',
              message: 'Message 1',
              icon: '📱',
              order: 0
            },
            {
              id: 'test2',
              title: 'Duplicate Title', // Duplicate title
              message: 'Message 2',
              icon: '📱',
              order: 1
            }
          ],
          isActive: true
        })
      ).rejects.toThrow('Menu option titles must be unique');
    });
  });

  describe('WhatsApp Link Generation', () => {
    it('should generate WhatsApp link with message', () => {
      const phoneNumber = '5511999999999';
      const message = 'Hello, World!';
      
      const link = whatsappService.generateWhatsAppLink(phoneNumber, message);
      
      expect(link).toBe(`https://wa.me/5511999999999?text=${encodeURIComponent(message)}`);
    });

    it('should generate menu option link', async () => {
      const config = await whatsappService.createConfig({
        phoneNumber: '5511999999999',
        welcomeMessage: 'Welcome',
        menuOptions: [
          {
            id: 'support',
            title: 'Support',
            message: 'I need support',
            icon: '🛠️',
            order: 0
          }
        ],
        isActive: true
      });
      testConfigId = config.id;

      const link = whatsappService.generateMenuOptionLink(config, 'support');
      
      expect(link).toBe(`https://wa.me/5511999999999?text=${encodeURIComponent('I need support')}`);
    });

    it('should throw error for non-existent menu option', async () => {
      const config = await whatsappService.createConfig({
        phoneNumber: '5511999999999',
        welcomeMessage: 'Welcome',
        menuOptions: [],
        isActive: true
      });
      testConfigId = config.id;

      expect(() => {
        whatsappService.generateMenuOptionLink(config, 'non-existent');
      }).toThrow('Menu option not found');
    });
  });
});
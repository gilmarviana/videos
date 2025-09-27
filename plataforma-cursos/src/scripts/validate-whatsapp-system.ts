#!/usr/bin/env tsx

import { whatsappService } from '../lib/services/whatsapp.service';

async function validateWhatsAppSystem() {
  console.log('🔍 Validating WhatsApp Integration System...\n');

  try {
    // Test 1: Create WhatsApp configuration
    console.log('1. Testing WhatsApp configuration creation...');
    const testConfig = await whatsappService.createConfig({
      phoneNumber: '5511999999999',
      welcomeMessage: 'Olá! Como podemos ajudar você hoje?',
      menuOptions: [
        {
          id: 'support',
          title: 'Suporte Técnico',
          message: 'Olá! Preciso de ajuda com suporte técnico.',
          icon: '🛠️',
          order: 0
        },
        {
          id: 'sales',
          title: 'Vendas',
          message: 'Olá! Gostaria de saber mais sobre os cursos.',
          icon: '💰',
          order: 1
        }
      ],
      isActive: true
    });
    console.log('✅ WhatsApp configuration created successfully');

    // Test 2: Get active configuration
    console.log('\n2. Testing get active configuration...');
    const activeConfig = await whatsappService.getActiveConfig();
    if (!activeConfig) {
      throw new Error('Active configuration not found');
    }
    console.log('✅ Active configuration retrieved successfully');

    // Test 3: Update configuration
    console.log('\n3. Testing configuration update...');
    const updatedConfig = await whatsappService.updateConfig(testConfig.id, {
      welcomeMessage: 'Olá! Como podemos ajudar você hoje? (Atualizado)',
      menuOptions: [
        ...testConfig.menuOptions,
        {
          id: 'info',
          title: 'Informações',
          message: 'Olá! Gostaria de mais informações sobre a plataforma.',
          icon: 'ℹ️',
          order: 2
        }
      ]
    });
    if (!updatedConfig) {
      throw new Error('Configuration update failed');
    }
    console.log('✅ Configuration updated successfully');

    // Test 4: Generate WhatsApp links
    console.log('\n4. Testing WhatsApp link generation...');
    const welcomeLink = whatsappService.generateWhatsAppLink(
      activeConfig.phoneNumber,
      activeConfig.welcomeMessage
    );
    console.log(`✅ Welcome link generated: ${welcomeLink}`);

    const menuOptionLink = whatsappService.generateMenuOptionLink(activeConfig, 'support');
    console.log(`✅ Menu option link generated: ${menuOptionLink}`);

    // Test 5: Validate phone number formatting
    console.log('\n5. Testing phone number validation...');
    try {
      await whatsappService.createConfig({
        phoneNumber: 'invalid-phone',
        welcomeMessage: 'Test',
        menuOptions: [],
        isActive: false
      });
      throw new Error('Should have failed with invalid phone number');
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid phone number')) {
        console.log('✅ Phone number validation working correctly');
      } else {
        throw error;
      }
    }

    // Test 6: Validate menu options
    console.log('\n6. Testing menu options validation...');
    try {
      await whatsappService.createConfig({
        phoneNumber: '5511999999999',
        welcomeMessage: 'Test',
        menuOptions: [
          {
            id: 'test',
            title: '', // Empty title should fail
            message: 'Test message',
            icon: '📱',
            order: 0
          }
        ],
        isActive: false
      });
      throw new Error('Should have failed with empty menu option title');
    } catch (error) {
      if (error instanceof Error && error.message.includes('title is required')) {
        console.log('✅ Menu options validation working correctly');
      } else {
        throw error;
      }
    }

    // Test 7: Test configuration deactivation
    console.log('\n7. Testing configuration deactivation...');
    await whatsappService.updateConfig(testConfig.id, { isActive: false });
    const deactivatedConfig = await whatsappService.getConfig(testConfig.id);
    if (deactivatedConfig?.isActive) {
      throw new Error('Configuration should be deactivated');
    }
    console.log('✅ Configuration deactivated successfully');

    // Test 8: Clean up
    console.log('\n8. Cleaning up test data...');
    await whatsappService.deleteConfig(testConfig.id);
    console.log('✅ Test data cleaned up successfully');

    console.log('\n🎉 All WhatsApp system tests passed!');
    console.log('\nWhatsApp Integration System Features:');
    console.log('- ✅ WhatsApp configuration management');
    console.log('- ✅ Phone number validation and formatting');
    console.log('- ✅ Menu options with custom messages');
    console.log('- ✅ WhatsApp link generation');
    console.log('- ✅ Configuration activation/deactivation');
    console.log('- ✅ Data validation and error handling');

  } catch (error) {
    console.error('❌ WhatsApp system validation failed:', error);
    process.exit(1);
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateWhatsAppSystem().catch(console.error);
}

export { validateWhatsAppSystem };